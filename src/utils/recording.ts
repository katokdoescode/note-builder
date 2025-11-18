export class AudioRecorder {
	private mediaRecorder: MediaRecorder | null;
	private chunks: Blob[] = [];
	private stream: MediaStream;

	async init() {
		this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		this.mediaRecorder = new MediaRecorder(this.stream);
		this.mediaRecorder.ondataavailable = (event) => {
			this.chunks.push(event.data);
		};
	}

	startRecording() {
		if (this.mediaRecorder) {
			this.mediaRecorder.start();
		}
	}

	stopRecording(): Promise<{ audioFile: File; arrayBuffer: ArrayBuffer }> {
		return new Promise((resolve, reject) => {
			if (this.mediaRecorder) {
				this.mediaRecorder.onstop = async () => {
					const blob = new Blob(this.chunks, { type: 'audio/wav' });
					const arrayBuffer = await blob.arrayBuffer();
					const audioFile = new File([blob], 'recording.wav', { type: 'audio/wav' });

					// Stop all tracks in the stream
					this.stream.getTracks().forEach(track => track.stop());

					// Clear the chunks
					this.chunks = [];

					// Remove the media recorder
					this.mediaRecorder = null;

					resolve({ audioFile, arrayBuffer });
				};

				this.mediaRecorder.stop();

				this.mediaRecorder.onerror = (event: ErrorEvent) => {
					reject(new Error(event.error?.message || 'Recording error occurred'));
				};
			}
		});
	}

	stopAfterTimeout(timeout: number) {
		if (this.mediaRecorder) {
			setTimeout(() => this.mediaRecorder?.stop(), timeout);
		}
	}
}
