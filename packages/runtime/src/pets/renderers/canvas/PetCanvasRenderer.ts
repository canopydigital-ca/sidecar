
import { IPetRenderer, PetSettings } from '../../core/types';

export class PetCanvasRenderer implements IPetRenderer {
  private container: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationId: number | null = null;

  mount(container: HTMLElement) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 100;
    this.canvas.height = 100;
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.globalCompositeOperation = 'source-over';
    this.startAnimation();
  }

  unmount() {
    this.stopAnimation();
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }
    this.container = null;
  }

  update(settings: PetSettings) {
    // React to settings change
  }

  pause() {
    this.stopAnimation();
  }

  resume() {
    this.startAnimation();
  }

  private startAnimation() {
    if (this.animationId) return;
    const draw = () => {
      if (!this.ctx || !this.canvas) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw a simple placeholder pet
      this.ctx.fillStyle = 'orange';
      this.ctx.beginPath();
      this.ctx.arc(50, 50, 20, 0, Math.PI * 2);
      this.ctx.fill();

      this.animationId = requestAnimationFrame(draw);
    };
    draw();
  }

  private stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}
