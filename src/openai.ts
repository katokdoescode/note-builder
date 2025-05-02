import OpenAI from 'openai'
export interface ModelSettings {
	transcribeModel: string,
	summaryModel: string,
	mergingMemoModel: string
	tasksModel: string,
	reflexModel: string,
}

export const defaultModelSettings = {
	transcribeModel: 'whisper-1',
	summaryModel: 'gpt-4o',
	mergingMemoModel: 'gpt-4o',
	tasksModel: 'gpt-4o',
	reflexModel: 'gpt-4o',
} as const as ModelSettings;

export default class AI {
	openai
	language: string;
	modelSettings: ModelSettings
	constructor(apiKey: string, language: string, modelSettings?: ModelSettings) {
		this.openai = new OpenAI({
			apiKey,
			dangerouslyAllowBrowser: true
		})
		this.language = language
		this.modelSettings = modelSettings ?? defaultModelSettings
	}

	async transcribe(file: File) {
		const transcription = await this.openai.audio.transcriptions.create({
			file,
			model: this.modelSettings.transcribeModel
		});

		return transcription.text
	}

	async generateSummary(text: string, prompt: string, format: string) {
		const response = await this.openai.responses.create({
			model: this.modelSettings.summaryModel,
			input: `${prompt}
			Using this format: "${format}"
			The text: "${text}"
			Today is: ${new Date().toLocaleDateString()}, so if you need the date, use it, and calculate new dates.
			Output should be in ${this.language} language.`
		});

		return response.output_text;
	}

	async mergeMemo(oldText: string, newText: string) {
		const response = await this.openai.responses.create({
			model: this.modelSettings.mergingMemoModel,
			input: `Merge these two memos:

			Old memo: "${oldText}";
			New memo: "${newText}";

			Output should be in ${this.language} language.
			Keep the style of the old memo, also as original text of the old memo.`
		});

		return response.output_text;
	}

	async generateTasks(text: string, prompt: string, format: string) {
		const response = await this.openai.responses.create({
			model: this.modelSettings.tasksModel,
			input: `${prompt};
			The text: "${text}";
			Using this format: "${format}";
			Today is: ${new Date().toLocaleDateString()}, so if you need the date, use it, and calculate new dates.
			Output should be in ${this.language} language. Except the format, it should be in English.`,
		});

		return response.output_text;
	}

	async generateReflex(text: string, prompt: string, format: string) {
		const response = await this.openai.responses.create({
			model: this.modelSettings.reflexModel,
			input: `${prompt.replace('{{ transcription }}', text)}
			Using this format: "${format}"
			Today is: ${new Date().toLocaleDateString()}.
			Output should be in ${this.language} language. Except the format, it should be in English.`,
		});

		return response.output_text;
	}

}
