import OpenAI from 'openai'
export default class AI {
	openai
	language: string;
	constructor(apiKey: string, language: string) {
		this.openai = new OpenAI({
			apiKey,
			dangerouslyAllowBrowser: true
		})
		this.language = language
	}

	async transcribe(file: File, model = 'whisper-1') {
		const transcription = await this.openai.audio.transcriptions.create({
			file,
			model
		});

		return transcription.text
	}

	async generateSummary(text: string, prompt: string, format: string) {
		const response = await this.openai.responses.create({
			model: "gpt-4o",
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
			model: "gpt-4o",
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
			model: "gpt-4o",
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
			model: "gpt-4o",
			input: `${prompt.replace('{{ transcription }}', text)}
			Using this format: "${format}"
			Today is: ${new Date().toLocaleDateString()}.
			Output should be in ${this.language} language. Except the format, it should be in English.`,
		});

		return response.output_text;
	}

}
