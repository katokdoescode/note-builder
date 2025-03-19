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
}
