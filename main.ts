import { App, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import AI, { defaultModelSettings, ModelSettings } from './src/openai';
import { saveFile } from 'src/utils/files';
import { AudioRecorder } from 'src/utils/recording';
import { DEFAULT_SUMMARY_PROMPT, DEFAULT_SUMMARY_FORMAT } from './src/prompts/summary';
import { DEFAULT_TASKS_FORMAT, DEFAULT_TASKS_PROMPT } from 'src/prompts/tasks';
import { DEFAULT_REFLEX_PROMPT, DEFAULT_REFLEX_FORMAT } from 'src/prompts/reflex';

interface NoteBuilderPluginSettings {
	openaiApiKey: string;
	writeRecordingsIntoAFolder: boolean;
	recordingDirectory: string;
	language: string;
	summaryCustomPrompt: string;
	summaryOutputFormat: string;
	tasksCustomPrompt: string;
	tasksOutputFormat: string;
	reflexCustomPrompt: string;
	reflexOutputFormat: string;
	modelSettings: ModelSettings;

}

const DEFAULT_SETTINGS: NoteBuilderPluginSettings = {
	openaiApiKey: '',
	writeRecordingsIntoAFolder: true,
	recordingDirectory: '',
	language: 'English',
	summaryCustomPrompt: DEFAULT_SUMMARY_PROMPT,
	summaryOutputFormat: DEFAULT_SUMMARY_FORMAT,
	tasksCustomPrompt: DEFAULT_TASKS_PROMPT,
	tasksOutputFormat: DEFAULT_TASKS_FORMAT,
	reflexCustomPrompt: DEFAULT_REFLEX_PROMPT,
	reflexOutputFormat: DEFAULT_REFLEX_FORMAT,
	modelSettings: defaultModelSettings
}

export default class NoteBuilder extends Plugin {
	settings: NoteBuilderPluginSettings;
	ai: AI;
	recorder: AudioRecorder | null = null;

	async onload() {
		await this.loadSettings();

		/**
		 * Commands
		 */
		this.addCommand({
			id: 'create-memo',
			name: 'Create memo',
			callback: () => {
				const memoModal = new MemoModal(this.app, this.settings, this.ai);
				memoModal.open();
			},
		});

		this.addCommand({
			id: 'custom-prompt',
			name: 'Custom prompt',
			callback: () => {
				const customCommandModal = new CustomCommandModal(this.app, this.settings, this.ai);
				customCommandModal.open();
			},
		});

		this.addSettingTab(new NoteBuilderSettingTab(this.app, this));
	}

	onunload() {
		this.recorder = null;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.ai = new AI(this.settings.openaiApiKey, this.settings.language, this.settings.modelSettings);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


class MemoModal extends Modal {
	private recordingButton: HTMLButtonElement;
	private saveButton: HTMLButtonElement;
	private summaryButton: HTMLButtonElement;
	private tasksButton: HTMLButtonElement;
	private reflexButton: HTMLButtonElement;
	private mergeToggle: HTMLInputElement;
	private saveVoiceCheckbox: HTMLInputElement;
	private audioRecorder: AudioRecorder | null = null;
	private settings: NoteBuilderPluginSettings;
	private textField: HTMLTextAreaElement;
	private summaryField: HTMLTextAreaElement;
	private tasksField: HTMLTextAreaElement;
	private reflexField: HTMLTextAreaElement;
	private recordingFile: File | null = null;
	private arrayBuffer: ArrayBuffer | null = null;
	private selectedText: string | undefined = undefined;
	private ai: AI;

	// Upload state
	private uploadedFile: File | null = null;
	private uploadedArrayBuffer: ArrayBuffer | null = null;
	private uploadedFileNameEl: HTMLElement | null = null;

	constructor(app: App, settings: NoteBuilderPluginSettings, ai: AI) {
		super(app);
		this.settings = settings;
		this.ai = ai;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// Modal-wide drop overlay
		const dropOverlay = contentEl.createEl('div', { cls: 'modal-drop-overlay' });
		dropOverlay.appendChild(
			contentEl.createDiv({ cls: 'drop-message', text: 'Drop audio file to upload' })
		);

		let dragCounter = 0;
		const showOverlay = () => { dropOverlay.classList.add('active'); };
		const hideOverlay = () => { dropOverlay.classList.remove('active'); };

		contentEl.ondragenter = (e) => {
			e.preventDefault();
			dragCounter++;
			showOverlay();
		};

		contentEl.ondragleave = (e) => {
			dragCounter--;
			if (dragCounter <= 0) {
				hideOverlay();
				dragCounter = 0;
			}
		};

		contentEl.ondragover = (e) => {
			e.preventDefault();
		};

		dropOverlay.ondrop = (e) => {
			e.preventDefault();
			hideOverlay();
			dragCounter = 0;
			if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
				handleFile(e.dataTransfer.files[0]);
			}
		};

		const wrapper = contentEl.createEl('div', { cls: 'recording-wrapper' });
		const titleSection = wrapper.createEl('div', { cls: 'recording-title-section' });

		titleSection.createEl('h3', { text: 'Note Builder', cls: 'recording-title' });
		titleSection.createEl('p', { text: 'Record your notes, transcribe, or upload audio for transcription', cls: 'recording-subtitle' });

		const container = wrapper.createEl('div', { cls: 'recording-container' });

		const buttonSection = container.createEl('div', { cls: 'recording-button-section col' });
		const glowingWrapper = buttonSection.createEl('div', { cls: 'glowing-wrapper' });

		this.recordingButton = glowingWrapper.createEl(
			'button',
			{
				cls: 'recording-button start',
				attr: { 'aria-label': 'Start recording' }
			}
		);

		const uploadButton = buttonSection.createEl('button', {
			cls: 'recording-button upload-button',
			attr: { 'aria-label': 'Upload audio file' }
		});

		// --- Upload UI ---
		const uploadSection = wrapper.createEl('div', { cls: 'recording-upload-section' });
		const uploadInput = uploadSection.createEl('input', { type: 'file', attr: { accept: '.mp3,.wav,.m4a,audio/*' }, cls: 'recording-upload-input' });
		this.uploadedFileNameEl = uploadSection.createEl('span', { cls: 'recording-upload-filename' });

		const handleFile = async (file: File) => {
			const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/m4a', 'audio/x-m4a'];
			const maxSize = 100 * 1024 * 1024; // 100MB
			if (!validTypes.includes(file.type) && !['mp3', 'wav', 'm4a'].some(ext => file.name.toLowerCase().endsWith(ext))) {
				new Notice('Unsupported audio format. Please upload mp3, wav, or m4a.');
				return;
			}
			if (file.size > maxSize) {
				new Notice('File is too large. Maximum size is 100MB.');
				return;
			}
			this.uploadedFile = file;
			this.uploadedArrayBuffer = await file.arrayBuffer();
			if (this.uploadedFileNameEl) this.uploadedFileNameEl.textContent = `Selected: ${file.name}`;
			// Auto-transcribe on upload
			try {
				this.textField.classList.add('inner-glowing');
				const result = await this.ai.transcribe(file);
				this.textField.value = result;
				this.recordingFile = file;
				this.arrayBuffer = this.uploadedArrayBuffer;
			} catch (error) {
				new Notice(error);
				console.error('Transcription error:', error);
			} finally {
				this.textField.classList.remove('inner-glowing');
			}
		};
		uploadButton.onclick = () => uploadInput.click();
		uploadInput.onchange = async (e: Event) => {
			const files = (e.target as HTMLInputElement).files;
			if (files && files.length > 0) {
				handleFile(files[0]);
			}
		};

		const editorsWrapper = container.createEl('div', { cls: 'recording-editors' });
		this.textField = editorsWrapper.createEl(
			'textarea',
			{
				cls: 'recording-textfield',
				attr: { 'aria-label': 'Transcription' }
			}
		);

		const controlsPanel = wrapper.createEl('div', { cls: 'recording-controls' });
		const options = controlsPanel.createEl('div', { cls: 'recording-options' });
		const actions = controlsPanel.createEl('div', { cls: 'recording-actions' });

		this.selectedText = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor.getSelection();

		const mergeLabel = options.createEl('label', { cls: 'recording-merge-label', attr: { 'for': 'recording-merge-toggle' } });
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

		const saveVoiceLabel = options.createEl('label', { cls: 'recording-merge-label', attr: { 'for': 'save-voice-checkbox' } });
		saveVoiceLabel.createEl('span', { text: 'Save voice memo to file and attach link' });
		this.saveVoiceCheckbox = saveVoiceLabel.createEl('input', {
			cls: 'save-voice-checkbox',
			type: 'checkbox',
			attr: {
				'id': 'save-voice-checkbox',
				'aria-label': 'Save voice memo to file and attach link'
			}
		});

		this.saveButton = actions.createEl('button', {
			cls: 'recording-button save',
			text: 'Save',
		});

		this.summaryButton = actions.createEl('button', {
			cls: 'summary-button',
			text: 'Summary',
		});

		this.tasksButton = actions.createEl('button', {
			cls: 'tasks-button',
			text: 'Tasks',
		});

		this.reflexButton = actions.createEl('button', {
			cls: 'reflex-button',
			text: 'Reflex',
		});

		this.recordingButton.onclick = async () => {
			if (this.recordingButton.classList.contains('start')) {
				this.recordingButton.classList.replace('start', 'stop');
				this.recordingButton.ariaLabel = 'Stop recording';
				this.audioRecorder = new AudioRecorder();
				await this.audioRecorder.init();
				this.audioRecorder.startRecording();
			} else if (this.audioRecorder) {
				try {
					const { audioFile, arrayBuffer } = await this.audioRecorder.stopRecording();
					try {
						this.textField.classList.add('inner-glowing');
						const result = await this.ai.transcribe(audioFile);
						this.textField.value = result;
						this.recordingFile = audioFile;
						this.arrayBuffer = arrayBuffer;
					} catch (error) {
						new Notice(error);
						console.error('Transcription error:', error);
					}
				} catch (error) {
					new Notice(`Recording error: ${error.message}`);
					console.error('Recording error:', error);
				} finally {
					this.textField.classList.remove('inner-glowing');
					this.recordingButton.classList.replace('stop', 'start');
					this.recordingButton.ariaLabel = 'Start recording';
				}
			}
		};

		this.summaryButton.onclick = async () => {
			if (!this.summaryField) {
				const pre = editorsWrapper.createEl('pre', { cls: 'recording-summary-pre' });
				this.summaryField = pre.createEl(
					'textarea',
					{
						cls: 'recording-summary-textfield',
						attr: { 'aria-label': 'Summary' }
					}
				);
			}

			this.summaryField.classList.add('inner-glowing');
			try {
				const summary = await this.ai.generateSummary(this.textField.value, this.settings.summaryCustomPrompt, this.settings.summaryOutputFormat);
				this.summaryField.value = summary;
			} catch (error) {
				new Notice(error);
				console.error('Summary error:', error);
			} finally {
				this.summaryField.classList.remove('inner-glowing');
			}
		}

		this.tasksButton.onclick = async () => {
			if (!this.tasksField) {
				const pre = editorsWrapper.createEl('pre', { cls: 'recording-tasks-pre' });
				this.tasksField = pre.createEl('textarea', { cls: 'recording-tasks-textfield', attr: { 'aria-label': 'Tasks' } });
			}

			this.tasksField.classList.add('inner-glowing');
			try {
				const tasks = await this.ai.generateTasks(this.textField.value, this.settings.tasksCustomPrompt, this.settings.tasksOutputFormat);
				this.tasksField.value = tasks;
			} catch (error) {
				new Notice(error);
				console.error('Tasks error:', error);
			} finally {
				this.tasksField.classList.remove('inner-glowing');
			}
		}

		this.reflexButton.onclick = async () => {
			if (!this.reflexField) {
				const pre = editorsWrapper.createEl('pre', { cls: 'recording-reflex-pre' });
				this.reflexField = pre.createEl('textarea', { cls: 'recording-reflex-textfield', attr: { 'aria-label': 'Reflex' } });
			}

			this.reflexField.classList.add('inner-glowing');
			try {
				const reflex = await this.ai.generateReflex(this.textField.value, this.settings.reflexCustomPrompt, this.settings.reflexOutputFormat);
				this.reflexField.value = reflex;
			} catch (error) {
				new Notice(error);
				console.error('Reflex error:', error);
			} finally {
				this.reflexField.classList.remove('inner-glowing');
			}
		}

		this.saveButton.onclick = async () => {
			if (!this.textField.value) this.close();
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

			if (activeView) {
				const transcriptionText = this.textField.value + `\n`;
				const summaryText = this.summaryField?.value || null;
				const tasksText = this.tasksField?.value || null;
				const reflexText = this.reflexField?.value || null;
				let file: TFile | null = null;
				let fileLink: string | null = null;

				// Only save voice if checkbox is checked and we have a recording
				if (this.saveVoiceCheckbox.checked && this.recordingFile && this.arrayBuffer) {
					try {
						file = await saveFile(
							this.app,
							this.settings.recordingDirectory,
							this.arrayBuffer,
							this.recordingFile.name.split('.').pop() || 'wav',
							'voice-memo-',
						);
						fileLink = file ? `![](${file.path})\n` : null;
						new Notice(`Recording saved to ${file?.path}!`);
					} catch (error) {
						new Notice(`Recording failed: ${error.message}`);
						console.error('Recording failed:', error);
					}
				}

				if (activeView) {
					const editor = activeView.editor;
					const oldMemo = editor.getSelection();

					// Insert summary with file link at the top if applicable
					if (summaryText) {
						if (this.mergeToggle.checked && oldMemo) {
							this.saveButton.classList.add('outer-glowing');
							try {
								const mergedText = await this.ai.mergeMemo(oldMemo, summaryText);
								editor.replaceSelection(mergedText + `\n`);
							} catch (error) {
								new Notice(`Merge error: ${error.message}`);
								console.error('Merge error:', error);
							} finally {
								this.saveButton.classList.remove('outer-glowing');
							}
						} else {
							editor.replaceSelection(summaryText + `\n`);
						}
					}

					if (tasksText) editor.replaceSelection(tasksText + `\n\n`);
					if (reflexText) editor.replaceSelection(reflexText + `\n`);
					// Insert file link after summary
					if (this.saveVoiceCheckbox.checked && fileLink) editor.replaceSelection(fileLink + `\n`);
					// Always insert transcription after summary
					if (transcriptionText) editor.replaceSelection(transcriptionText + `\n`);
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
		this.audioRecorder?.stopRecording();
		this.audioRecorder = null;
		this.uploadedFile = null;
		this.uploadedArrayBuffer = null;
		if (this.uploadedFileNameEl) this.uploadedFileNameEl.textContent = '';
		if (this.saveVoiceCheckbox) this.saveVoiceCheckbox.checked = false;
	}
}

class CustomCommandModal extends Modal {
	private recordingButton: HTMLButtonElement;
	private processButton: HTMLButtonElement;
	private insertButton: HTMLButtonElement;
	private audioRecorder: AudioRecorder | null = null;
	private settings: NoteBuilderPluginSettings;
	private transcriptionField: HTMLTextAreaElement;
	private customPromptField: HTMLTextAreaElement;
	private resultField: HTMLTextAreaElement;
	private recordingFile: File | null = null;
	private arrayBuffer: ArrayBuffer | null = null;
	private ai: AI;

	// Upload state
	private uploadedFile: File | null = null;
	private uploadedArrayBuffer: ArrayBuffer | null = null;
	private uploadedFileNameEl: HTMLElement | null = null;

	constructor(app: App, settings: NoteBuilderPluginSettings, ai: AI) {
		super(app);
		this.settings = settings;
		this.ai = ai;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		// Modal-wide drop overlay
		const dropOverlay = contentEl.createEl('div', { cls: 'modal-drop-overlay' });
		dropOverlay.appendChild(
			contentEl.createDiv({ cls: 'drop-message', text: 'Drop audio file to upload' })
		);

		let dragCounter = 0;
		const showOverlay = () => { dropOverlay.classList.add('active'); };
		const hideOverlay = () => { dropOverlay.classList.remove('active'); };

		contentEl.ondragenter = (e) => {
			e.preventDefault();
			dragCounter++;
			showOverlay();
		};

		contentEl.ondragleave = (e) => {
			dragCounter--;
			if (dragCounter <= 0) {
				hideOverlay();
				dragCounter = 0;
			}
		};

		contentEl.ondragover = (e) => {
			e.preventDefault();
		};

		dropOverlay.ondrop = (e) => {
			e.preventDefault();
			hideOverlay();
			dragCounter = 0;
			if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
				handleFile(e.dataTransfer.files[0]);
			}
		};

		const wrapper = contentEl.createEl('div', { cls: 'recording-wrapper' });
		const titleSection = wrapper.createEl('div', { cls: 'recording-title-section' });

		titleSection.createEl('h3', { text: 'Custom command', cls: 'recording-title' });
		titleSection.createEl('p', { text: 'Record or upload audio, then use a custom prompt to process the transcription', cls: 'recording-subtitle' });

		const container = wrapper.createEl('div', { cls: 'recording-container' });

		const buttonSection = container.createEl('div', { cls: 'recording-button-section col' });
		const glowingWrapper = buttonSection.createEl('div', { cls: 'glowing-wrapper' });

		this.recordingButton = glowingWrapper.createEl(
			'button',
			{
				cls: 'recording-button start',
				attr: { 'aria-label': 'Start recording' }
			}
		);

		const uploadButton = buttonSection.createEl('button', {
			cls: 'recording-button upload-button',
			attr: { 'aria-label': 'Upload audio file' }
		});

		// --- Upload UI ---
		const uploadSection = wrapper.createEl('div', { cls: 'recording-upload-section' });
		const uploadInput = uploadSection.createEl('input', { type: 'file', attr: { accept: '.mp3,.wav,.m4a,audio/*' }, cls: 'recording-upload-input' });
		this.uploadedFileNameEl = uploadSection.createEl('span', { cls: 'recording-upload-filename' });

		const handleFile = async (file: File) => {
			const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/m4a', 'audio/x-m4a'];
			const maxSize = 100 * 1024 * 1024; // 100MB
			if (!validTypes.includes(file.type) && !['mp3', 'wav', 'm4a'].some(ext => file.name.toLowerCase().endsWith(ext))) {
				new Notice('Unsupported audio format. Please upload mp3, wav, or m4a.');
				return;
			}
			if (file.size > maxSize) {
				new Notice('File is too large. Maximum size is 100MB.');
				return;
			}
			this.uploadedFile = file;
			this.uploadedArrayBuffer = await file.arrayBuffer();
			if (this.uploadedFileNameEl) this.uploadedFileNameEl.textContent = `Selected: ${file.name}`;
			// Auto-transcribe on upload
			try {
				this.transcriptionField.classList.add('inner-glowing');
				const result = await this.ai.transcribe(file);
				this.transcriptionField.value = result;
				this.recordingFile = file;
				this.arrayBuffer = this.uploadedArrayBuffer;
			} catch (error) {
				new Notice(error);
				console.error('Transcription error:', error);
			} finally {
				this.transcriptionField.classList.remove('inner-glowing');
			}
		};
		uploadButton.onclick = () => uploadInput.click();
		uploadInput.onchange = async (e: Event) => {
			const files = (e.target as HTMLInputElement).files;
			if (files && files.length > 0) {
				handleFile(files[0]);
			}
		};

		const editorsWrapper = container.createEl('div', { cls: 'recording-editors' });

		// Transcription field
		const transcriptionSection = editorsWrapper.createEl('div', { cls: 'custom-command-section' });
		transcriptionSection.createEl('h4', { text: 'Transcription', cls: 'custom-command-label' });
		this.transcriptionField = transcriptionSection.createEl(
			'textarea',
			{
				cls: 'recording-textfield',
				attr: { 'aria-label': 'Transcription', 'placeholder': 'Transcription will appear here...' }
			}
		);

		// Custom prompt field
		const promptSection = editorsWrapper.createEl('div', { cls: 'custom-command-section' });
		promptSection.createEl('h4', { text: 'Custom prompt', cls: 'custom-command-label' });
		this.customPromptField = promptSection.createEl(
			'textarea',
			{
				cls: 'recording-textfield custom-prompt-field',
				attr: { 'aria-label': 'Custom prompt', 'placeholder': 'Enter your custom prompt here...' }
			}
		);

		// Result field
		const resultSection = editorsWrapper.createEl('div', { cls: 'custom-command-section' });
		resultSection.createEl('h4', { text: 'Result preview', cls: 'custom-command-label' });
		this.resultField = resultSection.createEl(
			'textarea',
			{
				cls: 'recording-textfield result-field',
				attr: { 'aria-label': 'Result preview', 'placeholder': 'Processing result will appear here...' }
			}
		);

		const controlsPanel = wrapper.createEl('div', { cls: 'recording-controls' });
		const actions = controlsPanel.createEl('div', { cls: 'recording-actions' });

		this.processButton = actions.createEl('button', {
			cls: 'recording-button process',
			text: 'Process',
		});

		this.insertButton = actions.createEl('button', {
			cls: 'recording-button insert',
			text: 'Insert to note',
		});
		this.insertButton.disabled = true; // Initially disabled until we have a result

		this.recordingButton.onclick = async () => {
			if (this.recordingButton.classList.contains('start')) {
				this.recordingButton.classList.replace('start', 'stop');
				this.recordingButton.ariaLabel = 'Stop recording';
				this.audioRecorder = new AudioRecorder();
				await this.audioRecorder.init();
				this.audioRecorder.startRecording();
			} else if (this.audioRecorder) {
				try {
					const { audioFile, arrayBuffer } = await this.audioRecorder.stopRecording();
					try {
						this.transcriptionField.classList.add('inner-glowing');
						const result = await this.ai.transcribe(audioFile);
						this.transcriptionField.value = result;
						this.recordingFile = audioFile;
						this.arrayBuffer = arrayBuffer;
					} catch (error) {
						new Notice(error);
						console.error('Transcription error:', error);
					}
				} catch (error) {
					new Notice(`Recording error: ${error.message}`);
					console.error('Recording error:', error);
				} finally {
					this.transcriptionField.classList.remove('inner-glowing');
					this.recordingButton.classList.replace('stop', 'start');
					this.recordingButton.ariaLabel = 'Start recording';
				}
			}
		};

		this.processButton.onclick = async () => {
			if (!this.transcriptionField.value.trim()) {
				new Notice('Please record or upload audio first to get transcription.');
				return;
			}
			if (!this.customPromptField.value.trim()) {
				new Notice('Please enter a custom prompt.');
				return;
			}

			this.processButton.classList.add('outer-glowing');
			this.resultField.classList.add('inner-glowing');
			try {
				const result = await this.ai.generateCustomResponse(
					this.transcriptionField.value,
					this.customPromptField.value
				);

				this.resultField.value = result;
				this.insertButton.disabled = false; // Enable insert button
				new Notice('Processing completed! Preview the result and click "Insert to Note" when ready.');
			} catch (error) {
				new Notice(`Processing error: ${error.message}`);
				console.error('Processing error:', error);
			} finally {
				this.processButton.classList.remove('outer-glowing');
				this.resultField.classList.remove('inner-glowing');
			}
		};

		this.insertButton.onclick = async () => {
			if (!this.resultField.value.trim()) {
				new Notice('No result to insert. Please process first.');
				return;
			}

			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!activeView) {
				new Notice('No active note to insert the result.');
				return;
			}

			try {
				const editor = activeView.editor;
				editor.replaceSelection(this.resultField.value + '\n');
				new Notice('Custom command result inserted to the current note.');
				this.close();
			} catch (error) {
				new Notice(`Insert error: ${error.message}`);
				console.error('Insert error:', error);
			}
		};
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
		this.audioRecorder?.stopRecording();
		this.audioRecorder = null;
		this.uploadedFile = null;
		this.uploadedArrayBuffer = null;
		if (this.uploadedFileNameEl) this.uploadedFileNameEl.textContent = '';
	}
}

class NoteBuilderSettingTab extends PluginSettingTab {
	plugin: NoteBuilder;

	constructor(app: App, plugin: NoteBuilder) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

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

		new Setting(containerEl)
			.setName('Audio memo')
			.setHeading();

		new Setting(containerEl)
			.setName('Transcription model')
			.setDesc('Enter a model name, or leave empty to yse "whisper-1" by default')
			.addText(text => text
				.setPlaceholder('whisper-1, etc.')
				.setValue(this.plugin.settings.modelSettings.transcribeModel)
				.onChange(async (value) => {
					this.plugin.settings.modelSettings.transcribeModel = value;
					await this.plugin.saveSettings();
				})
			)

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

		new Setting(containerEl)
			.setName('Summary model')
			.setDesc('Enter a model name, or leave empty to yse "gpt-4o" by default')
			.addText(text => text
				.setPlaceholder('gpt-4o, etc.')
				.setValue(this.plugin.settings.modelSettings.summaryModel)
				.onChange(async (value) => {
					this.plugin.settings.modelSettings.summaryModel = value;
					await this.plugin.saveSettings();
				})
			)

		new Setting(containerEl)
			.setName('Merging model')
			.setDesc('Enter a model name, or leave empty to yse "gpt-4o" by default')
			.addText(text => text
				.setPlaceholder('gpt-4o, etc.')
				.setValue(this.plugin.settings.modelSettings.mergingMemoModel)
				.onChange(async (value) => {
					this.plugin.settings.modelSettings.mergingMemoModel = value;
					await this.plugin.saveSettings();
				})
			)

		new Setting(containerEl)
			.setName('Tasks custom prompt')
			.setDesc('Enter a custom prompt for the tasks, or leave empty for default')
			.addTextArea(text => text
				.setValue(this.plugin.settings.tasksCustomPrompt)
				.onChange(async (value) => {
					this.plugin.settings.tasksCustomPrompt = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Tasks output format')
			.addTextArea(text => text
				.setValue(this.plugin.settings.tasksOutputFormat)
				.onChange(async (value) => {
					this.plugin.settings.tasksOutputFormat = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Tasks model')
			.setDesc('Enter a model name, or leave empty to yse "gpt-4o" by default')
			.addText(text => text
				.setPlaceholder('gpt-4o, etc')
				.setValue(this.plugin.settings.modelSettings.tasksModel)
				.onChange(async (value) => {
					this.plugin.settings.modelSettings.tasksModel = value;
					await this.plugin.saveSettings();
				})
			)

		new Setting(containerEl)
			.setName('Reflex custom prompt')
			.setDesc('Enter a custom prompt for the reflex, or leave empty for default')
			.addTextArea(text => text
				.setValue(this.plugin.settings.reflexCustomPrompt)
				.onChange(async (value) => {
					this.plugin.settings.reflexCustomPrompt = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Reflex model')
			.setDesc('Enter a model name, or leave empty to yse "gpt-4o" by default')
			.addText(text => text
				.setPlaceholder('gpt-4o, etc.')
				.setValue(this.plugin.settings.modelSettings.reflexModel)
				.onChange(async (value) => {
					this.plugin.settings.modelSettings.reflexModel = value;
					await this.plugin.saveSettings();
				})
			)

		new Setting(containerEl)
			.setName('Custom response model')
			.setDesc('Enter a model name, or leave empty to yse "gpt-4o" by default')
			.addText(text => text
				.setPlaceholder('gpt-4o, etc.')
				.setValue(this.plugin.settings.modelSettings.customResponseModel)
				.onChange(async (value) => {
					this.plugin.settings.modelSettings.customResponseModel = value;
					await this.plugin.saveSettings();
				})
			)
	}
}
