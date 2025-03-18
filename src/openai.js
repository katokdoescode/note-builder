import OpenAI from 'openai'
export default class AI {
	openai
	constructor(apiKey) {
		this.openai = new OpenAI({
			apiKey,
			dangerouslyAllowBrowser: true
		})
	}

	async transcribe(file, model = 'whisper-1') {
		const transcription = await this.openai.audio.transcriptions.create({
			file,
			model
		  });

		  return transcription.text
	}
}
