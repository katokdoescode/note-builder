import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import AI from './src/openai';
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	openaiApiKey: string;
	recordingDirectory: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	openaiApiKey: '',
	recordingDirectory: '',
}

export default class NoteBuilder extends Plugin {
	settings: MyPluginSettings;
	ai: AI;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		// const ribbonIconEl = this.addRibbonIcon('mic', 'Note Builder', (evt: MouseEvent) => {
		// 	// Called when the user clicks the icon.
		// });
		// Perform additional things with the ribbon
		// ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		this.addCommand({
      id: 'start-recording',
      name: 'Start recording',
			hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'r' }],
      callback: async () => {

				const recordingModal = new RecordingModal(this.app, this.settings, this.ai);
				recordingModal.open();
      },
    });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.ai = new AI(this.settings.openaiApiKey);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


class RecordingModal extends Modal {
    private recordingButton: HTMLButtonElement;
		private saveButton: HTMLButtonElement;
    private mediaRecorder: MediaRecorder | null = null;
    private chunks: Blob[] = [];
		private settings: MyPluginSettings;
		private textField: HTMLTextAreaElement;
		private recordingFile: File | null = null;
		private arrayBuffer: ArrayBuffer | null = null;

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
				const glowingWrapper = container.createEl('div', { cls: 'glowing-wrapper'});
        this.recordingButton = glowingWrapper.createEl(
						'button',
						{
							cls: 'recording-button start',
							attr: { 'aria-label': 'Start recording' }
						}
					);
				this.textField = container.createEl(
					'textarea',
					{
						cls: 'recording-textfield',
						attr: { 'aria-label': 'Transcription' }
					}
				);

				const controlsPanel = wrapper.createEl('div', { cls: 'recording-controls' });

				this.saveButton = controlsPanel.createEl('button', {
					cls: 'recording-button save',
					text: 'Save',
				});

        this.recordingButton.onclick = async () => {
					if(this.recordingButton.classList.contains('start')) {
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
										}
                };

                this.mediaRecorder.start();
								this.recordingButton.classList.replace('start', 'stop');
            } catch (error) {
                console.error('Error accessing media devices.', error);
            }
					} else {
						if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
							this.mediaRecorder.stop();
							this.recordingButton.classList.replace('stop', 'start');
						}
					}
        };

				this.saveButton.onclick = async () => {
					const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

					if (activeView) {
						const transcriptionText = this.textField.value + `\n`;

						const directory = this.app.vault.getAbstractFileByPath(this.settings.recordingDirectory);
						if (!directory) {
							await this.app.vault.createFolder(this.settings.recordingDirectory);
						}

						if(!this.recordingFile || !this.arrayBuffer) return

						const file = await this.app.vault.createBinary(this.settings.recordingDirectory + '/' + this.recordingFile.name, this.arrayBuffer);

						if (activeView) {
							const editor = activeView.editor;
							editor.replaceSelection(`![](${file.path})\n`);
							editor.replaceSelection(transcriptionText + `\n`);
						}
						new Notice('Transcription saved to the current note.');
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
		const {containerEl} = this;

		containerEl.empty();

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
				.setName('Recording directory')
				.setDesc('Enter the directory where recordings will be saved')
				.addText(text => text
					.setPlaceholder('Directory')
					.setValue(this.plugin.settings.recordingDirectory)
					.onChange(async (value) => {
						this.plugin.settings.recordingDirectory = value;
						await this.plugin.saveSettings();
					}));
	}
}
