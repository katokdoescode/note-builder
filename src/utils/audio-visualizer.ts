// AudioVisualizer.ts
// Utility class for microphone audio visualization in Obsidian modals

export class AudioVisualizer {
  private canvas: HTMLCanvasElement;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animationId: number | null = null;
  private mediaStream: MediaStream | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  async start() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyser);
      this.visualize();
      return true;
    } catch (err) {
      this.drawError('Microphone access denied or unavailable.');
      return false;
    }
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  drawError(message: string) {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#ff5555';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
  }

  private visualize() {
    const canvas = this.canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx || !this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      this.analyser!.getByteFrequencyData(dataArray);

      // Responsive canvas
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth * dpr;
      const height = canvas.clientHeight * dpr;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, width, height);

      // Gradient for columns
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#00eaff');
      grad.addColorStop(0.5, '#0077ff');
      grad.addColorStop(1, '#0a1a2f');

      const columnCount = Math.floor(width / 16);
      const spacing = 4 * dpr;
      const colWidth = (width / columnCount) - spacing;
      const maxColHeight = height * 0.8;
      const minColHeight = 4 * dpr;
      const radius = colWidth / 2;

      for (let i = 0; i < columnCount; i++) {
        const dataIdx = Math.floor(i * bufferLength / columnCount);
        const value = dataArray[dataIdx] || 0;
        const colHeight = Math.max(minColHeight, (value / 255) * maxColHeight);
        const x = i * (colWidth + spacing);
        const y = height - colHeight;

        // Draw rounded column
        if ((ctx as any).roundRect) {
          ctx.beginPath();
          (ctx as any).roundRect(x, y, colWidth, colHeight, radius);
          ctx.fillStyle = grad;
          ctx.fill();
        } else {
          // Fallback for browsers without roundRect
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + colWidth - radius, y);
          ctx.quadraticCurveTo(x + colWidth, y, x + colWidth, y + radius);
          ctx.lineTo(x + colWidth, y + colHeight - radius);
          ctx.quadraticCurveTo(x + colWidth, y + colHeight, x + colWidth - radius, y + colHeight);
          ctx.lineTo(x + radius, y + colHeight);
          ctx.quadraticCurveTo(x, y + colHeight, x, y + colHeight - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }

      this.animationId = requestAnimationFrame(draw);
    };
    draw();
  }
}
