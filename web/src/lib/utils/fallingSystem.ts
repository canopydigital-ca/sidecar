interface FallingItem {
  x: number;
  y: number;
  vy: number;
  vx: number;
  rotation: number;
  vRotation: number;
  type: 'emoji' | 'confetti' | 'ui' | 'dynamic';
  content: string | any; // Emoji char, or UI config
  size: number;
  color: string;
  opacity: number;
}

export class FallingSystem {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  items: FallingItem[] = [];
  width: number = 0;
  height: number = 0;
  isRunning: boolean = false;
  animationId: number = 0;
  
  // Sequence State
  sequenceStartTime: number = 0;
  currentPhase: 'idle' | 'emoji' | 'confetti' | 'ui' | 'dynamic' = 'idle';
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    this.ctx = ctx;
    this.resize();
  }

  resize() {
    // Full screen
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
  }

  startSequence() {
    this.isRunning = true;
    this.sequenceStartTime = Date.now();
    this.currentPhase = 'emoji';
    this.loop();
  }

  spawnItem(type: FallingItem['type']) {
    const x = Math.random() * this.width;
    const y = -50; // Start above
    
    let item: Partial<FallingItem> = {
      x, y,
      vx: (Math.random() - 0.5) * 1,
      rotation: Math.random() * Math.PI * 2,
      vRotation: (Math.random() - 0.5) * 0.1,
      type
    };

    if (type === 'emoji') {
      const emojis = ['🚀', '✨', '💻', '🤖', '⚡', '🔥'];
      item.content = emojis[Math.floor(Math.random() * emojis.length)];
      item.size = 24 + Math.random() * 20;
      item.vy = 2 + Math.random() * 2;
      item.opacity = 1;
    } else if (type === 'confetti') {
      const colors = ['#34d399', '#60a5fa', '#f472b6', '#fbbf24'];
      item.color = colors[Math.floor(Math.random() * colors.length)];
      item.size = 5 + Math.random() * 5;
      item.vy = 3 + Math.random() * 3;
      item.content = Math.random() > 0.5 ? 'rect' : 'circle';
      item.opacity = 0.8;
    } else if (type === 'ui') {
      const widgets = [
        { w: 80, h: 30, r: 4, label: 'Button' },
        { w: 120, h: 40, r: 6, label: 'Input' },
        { w: 40, h: 40, r: 20, label: 'Icon' }
      ];
      item.content = widgets[Math.floor(Math.random() * widgets.length)];
      item.size = 1; // Scale multiplier
      item.vy = 4 + Math.random() * 2; // Heavier
      item.color = 'rgba(255, 255, 255, 0.1)';
      item.opacity = 0.9;
    }

    this.items.push(item as FallingItem);
  }

  updatePhase() {
    const elapsed = Date.now() - this.sequenceStartTime;
    
    // Timing Sequence
    if (elapsed < 3000) {
      this.currentPhase = 'emoji';
      if (Math.random() < 0.05) this.spawnItem('emoji');
    } else if (elapsed < 6000) {
      this.currentPhase = 'confetti';
      if (Math.random() < 0.2) this.spawnItem('confetti'); // More confetti
    } else if (elapsed < 10000) {
      this.currentPhase = 'ui';
      if (Math.random() < 0.03) this.spawnItem('ui');
    } else {
      // Loop back or mix? Let's mix
      this.currentPhase = 'dynamic';
      if (Math.random() < 0.1) {
        const r = Math.random();
        if (r < 0.3) this.spawnItem('emoji');
        else if (r < 0.8) this.spawnItem('confetti');
        else this.spawnItem('ui');
      }
    }
  }

  loop = () => {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.updatePhase();

    // Update & Draw Items
    for (let i = this.items.length - 1; i >= 0; i--) {
      const p = this.items[i];
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.y * 0.01) * 0.5; // Slight sway
      p.rotation += p.vRotation;

      // Remove if out of bounds
      if (p.y > this.height + 100) {
        this.items.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = p.opacity;

      if (p.type === 'emoji') {
        this.ctx.font = `${p.size}px serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(p.content, 0, 0);
      } else if (p.type === 'confetti') {
        this.ctx.fillStyle = p.color;
        if (p.content === 'rect') {
            this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
      } else if (p.type === 'ui') {
        // Draw UI Element
        const { w, h, r, label } = p.content;
        this.ctx.fillStyle = '#18181b'; // zinc-900
        this.ctx.strokeStyle = '#34d399'; // emerald-400
        this.ctx.lineWidth = 2;
        
        // Round Rect
        this.ctx.beginPath();
        this.ctx.roundRect(-w/2, -h/2, w, h, r);
        this.ctx.fill();
        this.ctx.stroke();

        // Label
        if (label === 'Icon') {
           this.ctx.fillStyle = '#34d399';
           this.ctx.beginPath();
           this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
           this.ctx.fill();
        }
      }

      this.ctx.restore();
    }

    this.animationId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationId);
  }
}
