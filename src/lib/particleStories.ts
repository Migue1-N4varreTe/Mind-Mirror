// Motor de historias con partículas para efectos visuales narrativos

export interface ParticleStory {
  id: string;
  name: string;
  narrative: string;
  particles: ParticleConfig[];
  duration: number;
  trigger: "emotion" | "achievement" | "reflection" | "manual";
}

export interface ParticleConfig {
  type: "star" | "sparkle" | "glow" | "neural" | "quantum" | "flower" | "wave";
  color: string;
  size: number;
  speed: number;
  lifespan: number;
  behavior: "float" | "spiral" | "burst" | "flow" | "dance";
  count: number;
}

export const PARTICLE_STORIES: Record<string, ParticleStory> = {
  REFLECTION_BLOOM: {
    id: "REFLECTION_BLOOM",
    name: "Florecimiento Reflexivo",
    narrative:
      "Tus pensamientos brotan como flores de luz, expandiéndose en el cosmos de tu mente.",
    particles: [
      {
        type: "flower",
        color: "#FFB6C1",
        size: 8,
        speed: 2,
        lifespan: 3000,
        behavior: "float",
        count: 12,
      },
      {
        type: "sparkle",
        color: "#DDA0DD",
        size: 4,
        speed: 1,
        lifespan: 2000,
        behavior: "spiral",
        count: 20,
      },
    ],
    duration: 8000,
    trigger: "reflection",
  },
  WISDOM_CONSTELLATION: {
    id: "WISDOM_CONSTELLATION",
    name: "Constelación de Sabiduría",
    narrative:
      "Las estrellas de tu sabiduría se alinean, formando patrones de conocimiento ancestral.",
    particles: [
      {
        type: "star",
        color: "#FFD700",
        size: 6,
        speed: 0.5,
        lifespan: 5000,
        behavior: "float",
        count: 15,
      },
      {
        type: "neural",
        color: "#00CED1",
        size: 3,
        speed: 1.5,
        lifespan: 4000,
        behavior: "flow",
        count: 30,
      },
    ],
    duration: 10000,
    trigger: "achievement",
  },
  EMOTIONAL_AURORA: {
    id: "EMOTIONAL_AURORA",
    name: "Aurora Emocional",
    narrative:
      "Tus emociones danzan como una aurora boreal en el cielo de tu consciencia.",
    particles: [
      {
        type: "wave",
        color: "#7B68EE",
        size: 12,
        speed: 1,
        lifespan: 4000,
        behavior: "dance",
        count: 8,
      },
      {
        type: "glow",
        color: "#98FB98",
        size: 10,
        speed: 0.8,
        lifespan: 3500,
        behavior: "flow",
        count: 15,
      },
    ],
    duration: 12000,
    trigger: "emotion",
  },
  QUANTUM_JOURNEY: {
    id: "QUANTUM_JOURNEY",
    name: "Viaje Cuántico",
    narrative:
      "Tus ideas saltan entre dimensiones, explorando realidades infinitas de posibilidad.",
    particles: [
      {
        type: "quantum",
        color: "#FF1493",
        size: 5,
        speed: 3,
        lifespan: 2500,
        behavior: "burst",
        count: 25,
      },
      {
        type: "sparkle",
        color: "#00FFFF",
        size: 3,
        speed: 2,
        lifespan: 3000,
        behavior: "spiral",
        count: 40,
      },
    ],
    duration: 9000,
    trigger: "manual",
  },
  MINDFUL_RAIN: {
    id: "MINDFUL_RAIN",
    name: "Lluvia Consciente",
    narrative:
      "Gotas de mindfulness caen suavemente, nutriendo el jardín de tu presencia.",
    particles: [
      {
        type: "glow",
        color: "#87CEEB",
        size: 4,
        speed: 1.5,
        lifespan: 4000,
        behavior: "float",
        count: 30,
      },
      {
        type: "star",
        color: "#B0E0E6",
        size: 2,
        speed: 0.8,
        lifespan: 5000,
        behavior: "flow",
        count: 50,
      },
    ],
    duration: 15000,
    trigger: "reflection",
  },
};

export class ParticleStoryEngine {
  private activeStories: Map<
    string,
    { story: ParticleStory; startTime: number }
  > = new Map();
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrame: number | null = null;
  private particles: Array<{
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    type: ParticleConfig["type"];
    behavior: ParticleConfig["behavior"];
    lifespan: number;
    maxLifespan: number;
    storyId: string;
  }> = [];

  constructor(canvasElement?: HTMLCanvasElement) {
    if (canvasElement) {
      this.setCanvas(canvasElement);
    }
  }

  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.setupCanvas();
  }

  private setupCanvas(): void {
    if (!this.canvas) return;

    const resizeCanvas = () => {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    this.startAnimation();
  }

  playStory(storyId: string, customNarrative?: string): void {
    const story = PARTICLE_STORIES[storyId];
    if (!story) {
      console.warn(`Particle story ${storyId} not found`);
      return;
    }

    // Si hay una narrativa personalizada, usar esa
    const storyToPlay = customNarrative
      ? { ...story, narrative: customNarrative }
      : story;

    this.activeStories.set(storyId, {
      story: storyToPlay,
      startTime: Date.now(),
    });

    this.spawnParticlesForStory(storyToPlay);
    this.displayNarrative(storyToPlay.narrative);
  }

  playStoryByTrigger(
    trigger: ParticleStory["trigger"],
    emotion?: string,
  ): void {
    const availableStories = Object.values(PARTICLE_STORIES).filter(
      (story) => story.trigger === trigger,
    );

    if (availableStories.length === 0) return;

    // Si es un trigger emocional, intentar encontrar una historia que coincida
    let selectedStory =
      availableStories[Math.floor(Math.random() * availableStories.length)];

    if (trigger === "emotion" && emotion) {
      const emotionStory = this.getStoryForEmotion(emotion);
      if (emotionStory) selectedStory = emotionStory;
    }

    this.playStory(selectedStory.id);
  }

  private getStoryForEmotion(emotion: string): ParticleStory | null {
    const emotionMap: Record<string, string> = {
      alegría: "REFLECTION_BLOOM",
      sabiduría: "WISDOM_CONSTELLATION",
      calma: "MINDFUL_RAIN",
      creatividad: "QUANTUM_JOURNEY",
      reflexión: "EMOTIONAL_AURORA",
    };

    const storyId = emotionMap[emotion.toLowerCase()];
    return storyId ? PARTICLE_STORIES[storyId] : null;
  }

  private spawnParticlesForStory(story: ParticleStory): void {
    if (!this.canvas) return;

    story.particles.forEach((particleConfig) => {
      for (let i = 0; i < particleConfig.count; i++) {
        const particle = {
          id: Math.random().toString(36).substr(2, 9),
          x: Math.random() * this.canvas!.width,
          y: Math.random() * this.canvas!.height,
          vx: (Math.random() - 0.5) * particleConfig.speed,
          vy: (Math.random() - 0.5) * particleConfig.speed,
          size: particleConfig.size * (0.8 + Math.random() * 0.4),
          color: particleConfig.color,
          type: particleConfig.type,
          behavior: particleConfig.behavior,
          lifespan: particleConfig.lifespan,
          maxLifespan: particleConfig.lifespan,
          storyId: story.id,
        };

        this.particles.push(particle);
      }
    });
  }

  private displayNarrative(narrative: string): void {
    // Crear overlay temporal para mostrar la narrativa
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 1rem 2rem;
      border-radius: 10px;
      font-style: italic;
      text-align: center;
      max-width: 80%;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.5s ease-in-out;
      font-family: 'Georgia', serif;
      font-size: 1.1rem;
      line-height: 1.4;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    `;

    overlay.textContent = narrative;
    document.body.appendChild(overlay);

    // Animar entrada
    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
    });

    // Remover después de 5 segundos
    setTimeout(() => {
      overlay.style.opacity = "0";
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 500);
    }, 5000);
  }

  private startAnimation(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    const animate = () => {
      this.updateParticles();
      this.renderParticles();
      this.cleanupExpiredStories();
      this.animationFrame = requestAnimationFrame(animate);
    };

    animate();
  }

  private updateParticles(): void {
    const now = Date.now();

    this.particles = this.particles.filter((particle) => {
      // Actualizar posición basada en comportamiento
      this.updateParticleBehavior(particle);

      // Reducir lifespan
      particle.lifespan -= 16; // ~60fps

      // Eliminar partículas muertas
      return particle.lifespan > 0;
    });
  }

  private updateParticleBehavior(particle: any): void {
    switch (particle.behavior) {
      case "float":
        particle.y -= particle.vy;
        particle.x += Math.sin(Date.now() * 0.001) * 0.5;
        break;
      case "spiral":
        const angle = Date.now() * 0.002;
        const radius = 2;
        particle.x += Math.cos(angle) * radius;
        particle.y += Math.sin(angle) * radius;
        break;
      case "burst":
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.99;
        particle.vy *= 0.99;
        break;
      case "flow":
        particle.x += particle.vx;
        particle.y += particle.vy * Math.sin(Date.now() * 0.001);
        break;
      case "dance":
        particle.x += Math.sin(Date.now() * 0.003) * particle.vx;
        particle.y += Math.cos(Date.now() * 0.003) * particle.vy;
        break;
    }

    // Wrap around screen edges
    if (this.canvas) {
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;
    }
  }

  private renderParticles(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((particle) => {
      const alpha = particle.lifespan / particle.maxLifespan;
      this.ctx!.globalAlpha = alpha;

      this.renderParticleByType(particle);
    });

    this.ctx.globalAlpha = 1;
  }

  private renderParticleByType(particle: any): void {
    if (!this.ctx) return;

    this.ctx.fillStyle = particle.color;
    this.ctx.strokeStyle = particle.color;

    switch (particle.type) {
      case "star":
        this.drawStar(particle.x, particle.y, particle.size);
        break;
      case "sparkle":
        this.drawSparkle(particle.x, particle.y, particle.size);
        break;
      case "glow":
        this.drawGlow(particle.x, particle.y, particle.size);
        break;
      case "neural":
        this.drawNeural(particle.x, particle.y, particle.size);
        break;
      case "quantum":
        this.drawQuantum(particle.x, particle.y, particle.size);
        break;
      case "flower":
        this.drawFlower(particle.x, particle.y, particle.size);
        break;
      case "wave":
        this.drawWave(particle.x, particle.y, particle.size);
        break;
      default:
        this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    }
  }

  private drawStar(x: number, y: number, size: number): void {
    if (!this.ctx) return;

    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.5;

    this.ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes;
      const dx = Math.cos(angle) * radius;
      const dy = Math.sin(angle) * radius;

      if (i === 0) {
        this.ctx.moveTo(x + dx, y + dy);
      } else {
        this.ctx.lineTo(x + dx, y + dy);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawSparkle(x: number, y: number, size: number): void {
    if (!this.ctx) return;

    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, Math.PI * 2);
    this.ctx.fill();

    // Añadir líneas de brillo
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(x - size * 1.5, y);
    this.ctx.lineTo(x + size * 1.5, y);
    this.ctx.moveTo(x, y - size * 1.5);
    this.ctx.lineTo(x, y + size * 1.5);
    this.ctx.stroke();
  }

  private drawGlow(x: number, y: number, size: number): void {
    if (!this.ctx) return;

    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, this.ctx.fillStyle as string);
    gradient.addColorStop(1, "transparent");

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawNeural(x: number, y: number, size: number): void {
    if (!this.ctx) return;

    // Nodo central
    this.ctx.beginPath();
    this.ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
    this.ctx.fill();

    // Conexiones
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const endX = x + Math.cos(angle) * size;
      const endY = y + Math.sin(angle) * size;

      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }
  }

  private drawQuantum(x: number, y: number, size: number): void {
    if (!this.ctx) return;

    // Núcleo
    this.ctx.beginPath();
    this.ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
    this.ctx.fill();

    // Órbitas
    for (let i = 0; i < 3; i++) {
      const radius = size * (0.6 + i * 0.3);
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  private drawFlower(x: number, y: number, size: number): void {
    if (!this.ctx) return;

    const petals = 6;
    for (let i = 0; i < petals; i++) {
      const angle = (i * 2 * Math.PI) / petals;
      const petalX = x + Math.cos(angle) * size * 0.7;
      const petalY = y + Math.sin(angle) * size * 0.7;

      this.ctx.beginPath();
      this.ctx.arc(petalX, petalY, size * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Centro
    this.ctx.beginPath();
    this.ctx.arc(x, y, size * 0.2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawWave(x: number, y: number, size: number): void {
    if (!this.ctx) return;

    this.ctx.lineWidth = size / 2;
    this.ctx.lineCap = "round";
    this.ctx.beginPath();

    const waveLength = size * 2;
    const amplitude = size * 0.5;

    for (let i = 0; i <= waveLength; i += 2) {
      const waveY = y + Math.sin((i / waveLength) * Math.PI * 2) * amplitude;
      if (i === 0) {
        this.ctx.moveTo(x - waveLength / 2 + i, waveY);
      } else {
        this.ctx.lineTo(x - waveLength / 2 + i, waveY);
      }
    }

    this.ctx.stroke();
  }

  private cleanupExpiredStories(): void {
    const now = Date.now();

    this.activeStories.forEach((activeStory, storyId) => {
      if (now - activeStory.startTime > activeStory.story.duration) {
        this.activeStories.delete(storyId);
        // Remover partículas de esta historia
        this.particles = this.particles.filter((p) => p.storyId !== storyId);
      }
    });
  }

  stopStory(storyId: string): void {
    this.activeStories.delete(storyId);
    this.particles = this.particles.filter((p) => p.storyId !== storyId);
  }

  stopAllStories(): void {
    this.activeStories.clear();
    this.particles = [];
  }

  getActiveStories(): string[] {
    return Array.from(this.activeStories.keys());
  }

  getAvailableStories(): ParticleStory[] {
    return Object.values(PARTICLE_STORIES);
  }

  destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.stopAllStories();
  }
}

export default ParticleStoryEngine;
