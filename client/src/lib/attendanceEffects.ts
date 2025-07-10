// Enhanced cute attendance effects with adorable animations and sounds

export interface SoundEffect {
  url: string;
  audio?: HTMLAudioElement;
  volume?: number;
}

export const soundManager = {
  success: { url: '/sounds/success.mp3', volume: 0.6 } as SoundEffect,
  select: { url: '/sounds/select.mp3', volume: 0.4 } as SoundEffect,
  dragStart: { url: '/sounds/drag.mp3', volume: 0.3 } as SoundEffect,
  drop: { url: '/sounds/drop.mp3', volume: 0.5 } as SoundEffect,
  sparkle: { url: '/sounds/sparkle.mp3', volume: 0.4 } as SoundEffect,
  heart: { url: '/sounds/heart.mp3', volume: 0.5 } as SoundEffect,
  giggle: { url: '/sounds/giggle.mp3', volume: 0.4 } as SoundEffect,
  pop: { url: '/sounds/pop.mp3', volume: 0.3 } as SoundEffect,
  // Space-themed sounds
  rocket: { url: '/sounds/rocket.mp3', volume: 0.5 } as SoundEffect,
  laser: { url: '/sounds/laser.mp3', volume: 0.4 } as SoundEffect,
  space: { url: '/sounds/space.mp3', volume: 0.3 } as SoundEffect,
  alien: { url: '/sounds/alien.mp3', volume: 0.4 } as SoundEffect,

  loadSound(name: string, url: string) {
    if (typeof window !== 'undefined') {
      const audio = new Audio(url);
      audio.preload = 'auto';
      (this[name as keyof typeof soundManager] as SoundEffect).audio = audio;
    }
  },

  playSound(name: string) {
    const sound = this[name as keyof typeof soundManager] as SoundEffect;
    if (sound?.audio) {
      sound.audio.currentTime = 0;
      sound.audio.volume = sound.volume || 0.5;
      sound.audio.play().catch(() => {
        // Silently fail if audio can't play
        console.log(`Failed to play sound: ${name}`);
      });
    } else {
      // Fallback to default sounds if space sounds don't exist
      const fallbackSounds: Record<string, string> = {
        rocket: 'success',
        laser: 'select',
        space: 'sparkle',
        alien: 'giggle'
      };
      const fallback = fallbackSounds[name];
      if (fallback) {
        const fallbackSound = this[fallback as keyof typeof soundManager] as SoundEffect;
        if (fallbackSound?.audio) {
          fallbackSound.audio.currentTime = 0;
          fallbackSound.audio.volume = fallbackSound.volume || 0.5;
          fallbackSound.audio.play().catch(() => {
            console.log(`Failed to play fallback sound: ${fallback}`);
          });
        }
      }
    }
  }
};

// Cute confetti animation with hearts and stars
export class ConfettiAnimation {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    type: 'heart' | 'star' | 'circle' | 'sparkle';
    color: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
    life: number;
    maxLife: number;
  }> = [];
  private animationId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createConfetti(x: number, y: number, count: number = 30) {
    const types: Array<'heart' | 'star' | 'circle' | 'sparkle'> = ['heart', 'star', 'circle', 'sparkle'];
    const colors = ['#ff6b9d', '#ffd93d', '#6bcf7f', '#4d9de0', '#e15759', '#ff8e3c', '#9b5de5', '#f15bb5'];
    
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      this.particles.push({
        x: x + (Math.random() - 0.5) * 50,
        y: y + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 2,
        type,
        color,
        size: Math.random() * 8 + 4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        life: 1,
        maxLife: Math.random() * 0.5 + 0.5
      });
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  private animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1; // gravity
      particle.rotation += particle.rotationSpeed;
      particle.life -= 0.02;
      
      if (particle.life <= 0) return false;
      
      this.ctx.save();
      this.ctx.globalAlpha = particle.life;
      this.ctx.translate(particle.x, particle.y);
      this.ctx.rotate(particle.rotation);
      
      this.drawParticle(particle);
      
      this.ctx.restore();
      return true;
    });
    
    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
    }
  }

  private drawParticle(particle: any) {
    this.ctx.fillStyle = particle.color;
    this.ctx.strokeStyle = particle.color;
    this.ctx.lineWidth = 1;
    
    switch (particle.type) {
      case 'heart':
        this.drawHeart(particle.size);
        break;
      case 'star':
        this.drawStar(particle.size);
        break;
      case 'circle':
        this.ctx.beginPath();
        this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      case 'sparkle':
        this.drawSparkle(particle.size);
        break;
    }
  }

  private drawHeart(size: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(0, size * 0.3);
    this.ctx.bezierCurveTo(-size * 0.5, -size * 0.2, -size, size * 0.3, 0, size);
    this.ctx.bezierCurveTo(size, size * 0.3, size * 0.5, -size * 0.2, 0, size * 0.3);
    this.ctx.fill();
  }

  private drawStar(size: number) {
    this.ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const x = Math.cos(angle) * size;
      const y = Math.sin(angle) * size;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
      
      const innerAngle = angle + Math.PI / 5;
      const innerX = Math.cos(innerAngle) * (size * 0.5);
      const innerY = Math.sin(innerAngle) * (size * 0.5);
      this.ctx.lineTo(innerX, innerY);
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawSparkle(size: number) {
    this.ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const x = Math.cos(angle) * size;
      const y = Math.sin(angle) * size;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.particles = [];
    // Clear canvas
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// Floating hearts and sparkles system
export class ParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    type: 'heart' | 'sparkle' | 'star';
    size: number;
    opacity: number;
    life: number;
  }> = [];
  private animationId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles(count: number, themeId: string) {
    const colors = this.getThemeColors(themeId);
    
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: this.canvas.height + 20,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 2 - 1,
          type: Math.random() > 0.5 ? 'heart' : 'sparkle',
          size: Math.random() * 6 + 3,
          opacity: Math.random() * 0.5 + 0.3,
          life: Math.random() * 0.5 + 0.5
        });
      }, i * 100);
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  private getThemeColors(themeId: string): string[] {
    const themeColors: Record<string, string[]> = {
      puppy: ['#ff6b9d', '#ffd93d', '#6bcf7f', '#4d9de0'],
      space: ['#9b5de5', '#f15bb5', '#00bbf9', '#00f5d4'],
      jungle: ['#6bcf7f', '#ffd93d', '#ff8e3c', '#e15759'],
      ocean: ['#4d9de0', '#00bbf9', '#00f5d4', '#6bcf7f'],
      superhero: ['#e15759', '#ff8e3c', '#9b5de5', '#f15bb5'],
      farm: ['#ffd93d', '#6bcf7f', '#ff8e3c', '#e15759']
    };
    return themeColors[themeId] || themeColors.puppy;
  }

  private animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 0.005;
      
      if (particle.y < -20 || particle.life <= 0) return false;
      
      this.ctx.save();
      this.ctx.globalAlpha = particle.opacity * particle.life;
      this.ctx.translate(particle.x, particle.y);
      
      this.drawFloatingParticle(particle);
      
      this.ctx.restore();
      return true;
    });
    
    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
    }
  }

  private drawFloatingParticle(particle: any) {
    const colors = ['#ff6b9d', '#ffd93d', '#6bcf7f', '#4d9de0'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    
    if (particle.type === 'heart') {
      this.drawHeart(particle.size);
    } else {
      this.drawSparkle(particle.size);
    }
  }

  private drawHeart(size: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(0, size * 0.3);
    this.ctx.bezierCurveTo(-size * 0.5, -size * 0.2, -size, size * 0.3, 0, size);
    this.ctx.bezierCurveTo(size, size * 0.3, size * 0.5, -size * 0.2, 0, size * 0.3);
    this.ctx.fill();
  }

  private drawSparkle(size: number) {
    this.ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const x = Math.cos(angle) * size;
      const y = Math.sin(angle) * size;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.particles = [];
    // Clear canvas
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// Cute ripple effect
export function createRippleEffect(event: MouseEvent, element: HTMLElement) {
  const ripple = document.createElement('div');
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s ease-out;
    pointer-events: none;
    z-index: 1000;
  `;
  
  element.style.position = 'relative';
  element.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// Add CSS animation for ripple
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(2);
        opacity: 0;
      }
    }
    
    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% {
        transform: translate3d(0,0,0);
      }
      40%, 43% {
        transform: translate3d(0, -8px, 0);
      }
      70% {
        transform: translate3d(0, -4px, 0);
      }
      90% {
        transform: translate3d(0, -2px, 0);
      }
    }
    
    @keyframes wiggle {
      0%, 7% {
        transform: rotateZ(0);
      }
      15% {
        transform: rotateZ(-15deg);
      }
      20% {
        transform: rotateZ(10deg);
      }
      25% {
        transform: rotateZ(-10deg);
      }
      30% {
        transform: rotateZ(6deg);
      }
      35% {
        transform: rotateZ(-4deg);
      }
      40%, 100% {
        transform: rotateZ(0);
      }
    }
    
    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(1);
      }
    }
    
    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }
    
    .animate-bounce {
      animation: bounce 1s ease-in-out;
    }
    
    .animate-wiggle {
      animation: wiggle 0.8s ease-in-out;
    }
    
    .animate-pulse {
      animation: pulse 2s infinite;
    }
    
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

// Enhanced element animation
export function animateElement(element: HTMLElement, animation: string, duration: number = 1000) {
  element.classList.add(animation);
  setTimeout(() => {
    element.classList.remove(animation);
  }, duration);
}

// Cute sound effects (fallback for when audio files aren't available)
export function playCuteSound(type: 'success' | 'select' | 'drag' | 'drop' | 'sparkle' | 'heart' | 'giggle' | 'pop') {
  soundManager.playSound(type);
} 