export interface ParticleOptions {
  count: number;
  speed: number;
  interactionRadius: number;
  color: string;
}

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  alpha: number;

  constructor(w: number, h: number, speed: number) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    const angle = Math.random() * Math.PI * 2;
    // varied speed
    const s = speed * (0.5 + Math.random());
    this.vx = Math.cos(angle) * s;
    this.vy = Math.sin(angle) * s;

    this.size = Math.random() * 2 + 0.5;
    this.baseAlpha = Math.random() * 0.6 + 0.2; // Increased brightness (0.2 to 0.8)
    this.alpha = this.baseAlpha;
  }

  update(w: number, h: number, mx: number, my: number, radius: number) {
    // Apply velocity
    this.x += this.vx;
    this.y += this.vy;

    // Wrap around logic
    if (this.x < -this.size) this.x = w + this.size;
    if (this.x > w + this.size) this.x = -this.size;
    if (this.y < -this.size) this.y = h + this.size;
    if (this.y > h + this.size) this.y = -this.size;

    // Interaction
    if (mx !== -1 && my !== -1) {
      const dx = this.x - mx;
      const dy = this.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        // Push away slightly or pull? "field force"
        // Let's do a slight push + alpha boost
        const force = (radius - dist) / radius;
        const angle = Math.atan2(dy, dx);

        // Push
        this.vx += Math.cos(angle) * force * 0.02;
        this.vy += Math.sin(angle) * force * 0.02;

        // Brighten
        this.alpha = Math.min(1, this.baseAlpha + force * 0.5);
      } else {
        // Return to base alpha slowly
        if (this.alpha > this.baseAlpha) {
          this.alpha -= 0.01;
        }
      }
    } else {
      if (this.alpha > this.baseAlpha) {
        this.alpha -= 0.01;
      }
    }

    // Drag / Speed limit
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > 2) {
      this.vx *= 0.95;
      this.vy *= 0.95;
    }
  }

  draw(ctx: CanvasRenderingContext2D, color: string) {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export class ParticleSystem {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  particles: Particle[] = [];
  width: number = 0;
  height: number = 0;
  options: ParticleOptions;
  animationId: number = 0;
  mouseX: number = -1;
  mouseY: number = -1;
  destroyed: boolean = false;
  isRunning: boolean = false;

  constructor(canvas: HTMLCanvasElement, options: Partial<ParticleOptions> = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    this.ctx = ctx;

    this.options = {
      count: 60,
      speed: 0.2,
      interactionRadius: 200,
      color: 'rgba(52, 211, 153, 1)', // emerald-400
      ...options
    };

    this.resize();
    this.initParticles();
    this.loop = this.loop.bind(this);
  }

  resize() {
    // Use window dimensions if we want full screen fixed particles
    // Or check if the canvas is fixed?
    // Let's assume full screen for now as requested ("always go")
    // But we need to handle cases where it's not full screen?
    // The user explicitly asked for "sticky positioning behavior... preventing them from moving with the page content"
    // This implies full viewport coverage.
    
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.options.count; i++) {
      this.particles.push(new Particle(this.width, this.height, this.options.speed));
    }
  }

  setMouse(x: number, y: number) {
    this.mouseX = x;
    this.mouseY = y;
  }

  loop() {
    if (this.destroyed || !this.isRunning) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (const p of this.particles) {
      p.update(this.width, this.height, this.mouseX, this.mouseY, this.options.interactionRadius);
      p.draw(this.ctx, this.options.color);
    }

    this.animationId = requestAnimationFrame(this.loop);
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.loop();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
  }

  destroy() {
    this.destroyed = true;
    this.stop();
    this.particles = [];
  }
}
