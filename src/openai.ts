import OpenAI from 'openai'
import { getDate } from 'src/utils/dates';
export interface ModelSettings {
	transcribeModel: string,
	summaryModel: string,
	mergingMemoModel: string
	tasksModel: string,
	reflexModel: string,
	customResponseModel: string,
	smartMemoModel: string,
}

export const defaultModelSettings = {
	transcribeModel: 'whisper-1',
	summaryModel: 'gpt-4o',
	mergingMemoModel: 'gpt-4o',
	tasksModel: 'gpt-4o',
	reflexModel: 'gpt-4o',
	customResponseModel: 'gpt-4o',
	smartMemoModel: 'gpt-4o-mini',
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
		const otherInformation = `
		Today is: "${getDate()}", so if you need the date, use it, and calculate new dates.
		Output should be in "${this.language}" language.`;

		const input = prompt.replace('{{ transcription }}', text)
			.replace('{{ format }}', format)
			.replace('{{ otherInformation }}', otherInformation);

		const response = await this.openai.responses.create({
			model: this.modelSettings.summaryModel,
			input
		});

		return response.output_text;
	}

	async mergeMemo(oldText: string, newText: string) {
		const response = await this.openai.responses.create({
			model: this.modelSettings.mergingMemoModel,
			input: `I need you to merge these two memos:

			Old memo: "${oldText}";
			New memo: "${newText}";

			Output should be in ${this.language} language.
			Do not rewrite the text, your goal is to merge the both texts into one memo.`
		});

		return response.output_text;
	}

	async generateTasks(text: string, prompt: string, format: string) {
		const otherInformation = `
		Today is: "${getDate()}", so if you need the date, use it, and calculate new dates.
		Output should be in "${this.language}" language.`;

		const input = prompt
			.replace('{{ transcription }}', text)
			.replace('{{ format }}', format)
			.replace('{{ otherInformation }}', otherInformation);

		const response = await this.openai.responses.create({
			model: this.modelSettings.tasksModel,
			input,
		});

		return response.output_text;
	}

	async generateReflex(text: string, prompt: string, format: string) {
		const otherInformation = `
		Today is: "${getDate()}", so if you need the date, use it, and calculate new dates.
		Output should be in "${this.language}" language.`;

		const input = prompt.replace('{{ transcription }}', text)
			.replace('{{ format }}', format)
			.replace('{{ otherInformation }}', otherInformation);

		const response = await this.openai.responses.create({
			model: this.modelSettings.reflexModel,
			input
		});

		return response.output_text;
	}

	async generateCustomResponse(text: string, prompt: string) {
		const otherInformation = `
		Today is: "${getDate()}", so if you need the date, use it, and calculate new dates.
		Output should be in "${this.language}" language.`;

		const input = `
		You are a helpful assistant.
		You are given a transcription of a voice message and a custom prompt.
		You need to generate a custom response based on the transcription and the custom prompt.

		**TRANSCRIPTION**
		"${text}"

		**CUSTOM PROMPT**
		"${prompt}"

		**OTHER INFORMATION**
		"${otherInformation}"

		**OUTPUT FORMAT**
		In the output provide only the raw result text, nothing else.
		`;

		const response = await this.openai.responses.create({
			model: this.modelSettings.customResponseModel,
			input
		});

		return response.output_text;
	}

	async generateSmartMemo(text: string, prompt: string, format: string) {
		const otherInformation = `
		Today is: "${getDate()}", so if you need the date, use it, and calculate new dates.
		Output should be in "${this.language}" language.`;

		const input = prompt.replace('{{ transcription }}', text)
			.replace('{{ format }}', format)
			.replace('{{ otherInformation }}', otherInformation);

		const response = await this.openai.responses.create({
			model: this.modelSettings.smartMemoModel,
			input
		});

		return response.output_text;
	}
}
