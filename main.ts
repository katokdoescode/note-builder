import { App, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import AI from './src/openai';
import { DEFAULT_SUMMARY_PROMPT, DEFAULT_SUMMARY_FORMAT } from './src/prompts/summary';

interface MyPluginSettings {
	openaiApiKey: string;
	writeRecordingsIntoAFolder: boolean;
	recordingDirectory: string;
	language: string;
	summaryCustomPrompt: string;
	summaryOutputFormat: string;

}

const DEFAULT_SETTINGS: MyPluginSettings = {
	openaiApiKey: '',
	writeRecordingsIntoAFolder: true,
	recordingDirectory: '',
	language: 'English',
	summaryCustomPrompt: DEFAULT_SUMMARY_PROMPT,
	summaryOutputFormat: DEFAULT_SUMMARY_FORMAT,
}

export default class NoteBuilder extends Plugin {
	settings: MyPluginSettings;
	ai: AI;

	async onload() {
		await this.loadSettings();

		/**
		 * Commands
		 */
		this.addCommand({
			id: 'create-memo',
			name: 'Create memo',
			hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'm' }],
			callback: () => {
				const recordingModal = new RecordingModal(this.app, this.settings, this.ai);
				recordingModal.open();
			},
		});

		this.addSettingTab(new SampleSettingTab(this.app, this));
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.ai = new AI(this.settings.openaiApiKey, this.settings.language);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


class RecordingModal extends Modal {
	private recordingButton: HTMLButtonElement;
	private saveButton: HTMLButtonElement;
	private summaryButton: HTMLButtonElement;
	private mergeToggle: HTMLInputElement;
	private mediaRecorder: MediaRecorder | null = null;
	private chunks: Blob[] = [];
	private settings: MyPluginSettings;
	private textField: HTMLTextAreaElement;
	private summaryField: HTMLTextAreaElement;
	private recordingFile: File | null = null;
	private arrayBuffer: ArrayBuffer | null = null;
	private selectedText: string | undefined = undefined;
	private ai: AI;

	constructor(app: App, settings: MyPluginSettings, ai: AI) {
		super(app);
		this.settings = settings;
		this.ai = ai;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		const wrapper = contentEl.createEl('div', { cls: 'recording-wrapper' });
		const titleSection = wrapper.createEl('div', { cls: 'recording-title-section' });

		titleSection.createEl('h3', { text: 'Note Builder', cls: 'recording-title' });
		titleSection.createEl('p', { text: 'Record your notes and transcribe them into markdown', cls: 'recording-subtitle' });

		const container = wrapper.createEl('div', { cls: 'recording-container' });
		const glowingWrapper = container.createEl('div', { cls: 'glowing-wrapper' });

		this.recordingButton = glowingWrapper.createEl(
			'button',
			{
				cls: 'recording-button start',
				attr: { 'aria-label': 'Start recording' }
			}
		);
		const editorsWrapper = container.createEl('div', { cls: 'recording-editors' });
		this.textField = editorsWrapper.createEl(
			'textarea',
			{
				cls: 'recording-textfield',
				attr: { 'aria-label': 'Transcription' }
			}
		);
		this.summaryField = editorsWrapper.createEl(
			'textarea',
			{
				cls: 'recording-summary-textfield',
				attr: { 'aria-label': 'Summary' }
			}
		);

		const controlsPanel = wrapper.createEl('div', { cls: 'recording-controls' });

		this.selectedText = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor.getSelection();

		const mergeLabel = controlsPanel.createEl('label', { cls: 'recording-merge-label', attr: { 'for': 'recording-merge-toggle' } });
		mergeLabel.createEl('span', { text: 'Merge with existing memo' })
		this.mergeToggle = mergeLabel.createEl('input', {
			cls: 'recording-merge-toggle',
			type: 'checkbox',
			attr: {
				'id': 'recording-merge-toggle',
				...!this.selectedText ? { disabled: true } : {},
				'aria-label': `${this.selectedText ? 'Merge with existing memo' : 'No memo selected'}`
			}
		});

		this.saveButton = controlsPanel.createEl('button', {
			cls: 'recording-button save',
			text: 'Save',
		});

		this.summaryButton = controlsPanel.createEl('button', {
			cls: 'summary-button',
			text: 'Summary',
		});

		this.recordingButton.onclick = async () => {
			if (this.recordingButton.classList.contains('start')) {
				try {
					const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
					this.mediaRecorder = new MediaRecorder(stream);
					this.chunks = [];

					this.mediaRecorder.ondataavailable = (event) => {
						if (event.data.size > 0) {
							this.chunks.push(event.data);
						}
					};

					this.mediaRecorder.onstop = async () => {
						this.textField.classList.add('inner-glowing');
						const blob = new Blob(this.chunks, { type: 'audio/wav' });
						const dateOptions: Intl.DateTimeFormatOptions = {
							year: 'numeric',
							month: 'numeric',
							day: 'numeric',
							hour: 'numeric',
							minute: 'numeric',
							second: 'numeric'
						};

						const date = new Date().toLocaleString(undefined, dateOptions).replace(/[\s,\/:;]/g, '-');
						const audioFile = new File([blob], `ai-recording-${date}.wav`, { type: 'audio/wav' })


						try {
							const result = await this.ai.transcribe(audioFile)
							const arrayBuffer = await blob.arrayBuffer();

							this.textField.value = result;
							this.recordingFile = audioFile;
							this.arrayBuffer = arrayBuffer;
						} catch (error) {
							new Notice(error);
							console.error(error);
						} finally {
							this.textField.classList.remove('inner-glowing');

							if (this.mediaRecorder) {
								this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
								this.mediaRecorder = null;
							}
						}
					};

					this.mediaRecorder.start();
					this.recordingButton.classList.replace('start', 'stop');
					this.recordingButton.ariaLabel = 'Stop recording';
				} catch (error) {
					console.error('Error accessing media devices.', error);
				}
			} else {
				if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
					this.recordingButton.classList.replace('stop', 'start');
					this.recordingButton.ariaLabel = 'Start recording';
					this.mediaRecorder.stop();
				}
			}
		};

		this.summaryButton.onclick = async () => {
			this.summaryField.classList.add('inner-glowing');
			try {
				const summary = await this.ai.generateSummary(this.textField.value, this.settings.summaryCustomPrompt, this.settings.summaryOutputFormat);
				this.summaryField.value = summary;
			} catch (error) {
				new Notice(error);
				console.error(error);
			} finally {
				this.summaryField.classList.remove('inner-glowing');
			}
		}

		this.saveButton.onclick = async () => {
			if (!this.textField.value) this.close();
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

			if (activeView) {
				const transcriptionText = this.textField.value + `\n`;
				const summaryText = this.summaryField.value;
				let file: TFile | null = null;

				if (this.settings.writeRecordingsIntoAFolder) {
					const directory = this.app.vault.getAbstractFileByPath(this.settings.recordingDirectory);

					if (!directory) {
						await this.app.vault.createFolder(this.settings.recordingDirectory);
					}

					if (!this.recordingFile || !this.arrayBuffer) return

					file = await this.app.vault.createBinary(
						this.settings.recordingDirectory
						+ '/'
						+ this.recordingFile.name, this.arrayBuffer
					);
				}

				if (activeView) {
					const editor = activeView.editor;
					const oldMemo = editor.getSelection();
					if (file) editor.replaceSelection(`![](${file.path})\n`);
					editor.replaceSelection(transcriptionText + `\n`);

					if (summaryText && this.mergeToggle.checked && oldMemo) {
						this.saveButton.classList.add('outer-glowing');
						try {
							const mergedText = await this.ai.mergeMemo(oldMemo, summaryText);
							editor.replaceSelection(mergedText + `\n`);
						} catch (error) {
							new Notice(error);
							console.error(error);
						} finally {
							this.saveButton.classList.remove('outer-glowing');
						}
					} else if (summaryText) {
						editor.replaceSelection(summaryText + `\n`);
					}
				}
				if (transcriptionText) new Notice('Transcription saved to the current note.');
				this.close();
			} else {
				new Notice('No active note to save the transcription.');
			}
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: NoteBuilder;

	constructor(app: App, plugin: NoteBuilder) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl('h3', { text: 'General Settings' });

		new Setting(containerEl)
			.setName('Open AI API key')
			.setDesc('Enter your Open AI API key')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.openaiApiKey)
				.onChange(async (value) => {
					this.plugin.settings.openaiApiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Language')
			.setDesc('Enter your the language for LLM')
			.addText(text => text
				.setPlaceholder('Language')
				.setValue(this.plugin.settings.language)
				.onChange(async (value) => {
					this.plugin.settings.language = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Write recordings into a folder')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.writeRecordingsIntoAFolder)
				.onChange(async (value) => {
					this.plugin.settings.writeRecordingsIntoAFolder = value;
					await this.plugin.saveSettings();
					this.display()
				}));

		if (this.plugin.settings.writeRecordingsIntoAFolder) {
			new Setting(containerEl)
				.setName('Recordings directory')
				.setDesc('Enter the directory where recordings will be saved')
				.addText(text => text
					.setPlaceholder('Directory name')
					.setValue(this.plugin.settings.recordingDirectory)
					.onChange(async (value) => {
						this.plugin.settings.recordingDirectory = value;
						await this.plugin.saveSettings();
					}));
		}

		containerEl.createEl('h3', { text: 'Audio Memo Settings' }).style.marginTop = '1.5rem';

		new Setting(containerEl)
			.setName('Summary custom prompt')
			.setDesc('Enter a custom prompt for the summary, or leave empty for default')
			.addTextArea(text => text
				.setValue(this.plugin.settings.summaryCustomPrompt)
				.onChange(async (value) => {
					this.plugin.settings.summaryCustomPrompt = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Summary output format')
			.addTextArea(text => text
				.setValue(this.plugin.settings.summaryOutputFormat)
				.onChange(async (value) => {
					this.plugin.settings.summaryOutputFormat = value;
					await this.plugin.saveSettings();
				}));
	}
}
