export interface StoryEvent {
  type:
    | "move"
    | "combo"
    | "special"
    | "emotion"
    | "ai_personality"
    | "victory"
    | "defeat"
    | "milestone";
  timestamp: number;
  position?: [number, number];
  player: "human" | "ai";
  data: any;
  narrative: string;
  intensity: number; // 0-1
  color: string;
  particleType:
    | "explosion"
    | "stream"
    | "spiral"
    | "nova"
    | "ripple"
    | "text"
    | "glow";
}

export interface ParticleStory {
  id: string;
  title: string;
  events: StoryEvent[];
  theme: string;
  duration: number;
  climax?: StoryEvent;
  resolution?: string;
}

export class ParticleStoryEngine {
  private currentStory: ParticleStory;
  private activeEffects: Map<string, any> = new Map();
  private narrativeTemplates: Map<string, string[]> = new Map();
  private storyArc:
    | "introduction"
    | "rising_action"
    | "climax"
    | "falling_action"
    | "resolution" = "introduction";

  constructor() {
    this.initializeNarrativeTemplates();
    this.currentStory = this.createNewStory();
  }

  private initializeNarrativeTemplates(): void {
    // Human move narratives
    this.narrativeTemplates.set("human_move_confident", [
      "Con determinación férrea, el jugador marca su territorio",
      "Un movimiento calculado demuestra la experiencia humana",
      "La estrategia se despliega con precisión quirúrgica",
      "El instinto humano encuentra el punto perfecto",
    ]);

    this.narrativeTemplates.set("human_move_hesitant", [
      "Tras una pausa contemplativa, la decisión emerge",
      "La incertidumbre se transforma en acción",
      "Un movimiento cauteloso revela la profundidad del análisis",
      "La paciencia humana encuentra su recompensa",
    ]);

    this.narrativeTemplates.set("human_move_rushed", [
      "¡Velocidad! El instinto supera al análisis",
      "Una decisión impulsiva cambia el tablero",
      "La presión del tiempo forja la estrategia",
      "En la rapidez, la intuición encuentra su voz",
    ]);

    // AI move narratives
    this.narrativeTemplates.set("ai_move_calculated", [
      "Los algoritmos convergen en una solución elegante",
      "La mente artificial despliega su red de posibilidades",
      "Miles de cálculos cristalizan en un solo movimiento",
      "La lógica fría encuentra la belleza en la estrategia",
    ]);

    this.narrativeTemplates.set("ai_move_adaptive", [
      "Aprendiendo, evolucionando, la IA se transforma",
      "Los patrones humanos alimentan la sabiduría artificial",
      "En la adaptación, la máquina trasciende su programación",
      "El espejo neural refleja y supera",
    ]);

    this.narrativeTemplates.set("ai_personality_change", [
      "¡Una metamorfosis digital sacude el tablero!",
      "La IA revela una nueva faceta de su personalidad",
      "Como un camaleón digital, la estrategia se transforma",
      "El alma artificial muda de piel",
    ]);

    // Combo narratives
    this.narrativeTemplates.set("combo_achievement", [
      "¡Explosión de genialidad! Los elementos se alinean",
      "La sinfonía estratégica alcanza su crescendo",
      "Como fuegos artificiales, los combos iluminan el tablero",
      "El dominio táctico se manifiesta en todo su esplendor",
    ]);

    // Emotional narratives
    this.narrativeTemplates.set("frustration_rising", [
      "Las sombras de la frustración se extienden",
      "La presión mental se intensifica como una tormenta",
      "Los errores se acumulan como nubes oscuras",
      "En la dificultad, el carácter se revela",
    ]);

    this.narrativeTemplates.set("confidence_surge", [
      "¡Una ola de confianza inunda el campo de batalla!",
      "El poder fluye como río dorado",
      "La maestría se eleva hacia las alturas",
      "En la seguridad, nace la audacia",
    ]);

    // Victory/Defeat narratives
    this.narrativeTemplates.set("victory_human", [
      "¡Triunfo! La creatividad humana prevalece",
      "La intuición conquista la lógica fría",
      "El corazón humano supera al algoritmo",
      "Victoria forjada en ingenio y determinación",
    ]);

    this.narrativeTemplates.set("victory_ai", [
      "La evolución artificial alcanza su cúspide",
      "Los circuitos digitales cantan victoria",
      "La perfección calculada encuentra su recompensa",
      "El futuro abraza el presente",
    ]);
  }

  private createNewStory(): ParticleStory {
    return {
      id: `story_${Date.now()}`,
      title: "La Danza de las Mentes",
      events: [],
      theme: "epic_battle",
      duration: 0,
      climax: undefined,
      resolution: undefined,
    };
  }

  addGameEvent(eventData: {
    type: StoryEvent["type"];
    position?: [number, number];
    player: "human" | "ai";
    data: any;
    intensity?: number;
  }): StoryEvent {
    const narrative = this.generateNarrative(eventData);
    const { color, particleType } = this.getVisualStyle(eventData);

    const event: StoryEvent = {
      type: eventData.type,
      timestamp: Date.now(),
      position: eventData.position,
      player: eventData.player,
      data: eventData.data,
      narrative,
      intensity: eventData.intensity || 0.5,
      color,
      particleType,
    };

    this.currentStory.events.push(event);
    this.updateStoryArc();
    this.createParticleEffect(event);

    return event;
  }

  private generateNarrative(eventData: any): string {
    let templateKey = "";

    switch (eventData.type) {
      case "move":
        if (eventData.player === "human") {
          const reactionTime = eventData.data.reactionTime || 2000;
          const confidence = eventData.data.confidence || 0.5;

          if (reactionTime < 1000 && confidence > 0.7) {
            templateKey = "human_move_confident";
          } else if (reactionTime > 3000) {
            templateKey = "human_move_hesitant";
          } else {
            templateKey = "human_move_rushed";
          }
        } else {
          const aiPersonality = eventData.data.personality || "calculated";
          if (aiPersonality === "evolved" || aiPersonality === "chameleon") {
            templateKey = "ai_move_adaptive";
          } else {
            templateKey = "ai_move_calculated";
          }
        }
        break;

      case "combo":
        templateKey = "combo_achievement";
        break;

      case "emotion":
        const emotion = eventData.data.emotionalState;
        if (emotion === "frustrated") {
          templateKey = "frustration_rising";
        } else if (emotion === "confident") {
          templateKey = "confidence_surge";
        }
        break;

      case "ai_personality":
        templateKey = "ai_personality_change";
        break;

      case "victory":
        templateKey =
          eventData.player === "human" ? "victory_human" : "victory_ai";
        break;
    }

    const templates = this.narrativeTemplates.get(templateKey) || [
      "Un momento decisivo se despliega...",
    ];
    const template = templates[Math.floor(Math.random() * templates.length)];

    return this.personalizeNarrative(template, eventData);
  }

  private personalizeNarrative(template: string, eventData: any): string {
    let narrative = template;

    // Add position context
    if (eventData.position) {
      const [row, col] = eventData.position;
      const zones = [
        "las fronteras",
        "el centro",
        "las esquinas",
        "los flancos",
      ];

      if ((row === 0 || row === 7) && (col === 0 || col === 7)) {
        narrative += " desde las esquinas estratégicas";
      } else if (row >= 3 && row <= 4 && col >= 3 && col <= 4) {
        narrative += " dominando el centro del poder";
      } else if (row === 0 || row === 7 || col === 0 || col === 7) {
        narrative += " controlando las fronteras";
      }
    }

    // Add intensity modifiers
    if (eventData.intensity > 0.8) {
      narrative = "¡" + narrative + "!";
    } else if (eventData.intensity < 0.3) {
      narrative = narrative.toLowerCase();
    }

    return narrative;
  }

  private getVisualStyle(eventData: any): {
    color: string;
    particleType: StoryEvent["particleType"];
  } {
    let color = "#ffffff";
    let particleType: StoryEvent["particleType"] = "glow";

    switch (eventData.type) {
      case "move":
        color = eventData.player === "human" ? "#00f5ff" : "#ff1744";
        particleType = "ripple";
        break;

      case "combo":
        color = "#ffd700";
        particleType = "explosion";
        break;

      case "emotion":
        const emotion = eventData.data.emotionalState;
        switch (emotion) {
          case "frustrated":
            color = "#ff4444";
            particleType = "spiral";
            break;
          case "confident":
            color = "#44ff44";
            particleType = "nova";
            break;
          case "excited":
            color = "#ffaa00";
            particleType = "stream";
            break;
        }
        break;

      case "ai_personality":
        color = "#aa44ff";
        particleType = "nova";
        break;

      case "special":
        color = "#ff44aa";
        particleType = "explosion";
        break;

      case "victory":
        color = eventData.player === "human" ? "#00ff88" : "#ff0044";
        particleType = "nova";
        break;

      case "milestone":
        color = "#8844ff";
        particleType = "text";
        break;
    }

    return { color, particleType };
  }

  private updateStoryArc(): void {
    const eventCount = this.currentStory.events.length;
    const lastEvents = this.currentStory.events.slice(-5);
    const averageIntensity =
      lastEvents.reduce((sum, e) => sum + e.intensity, 0) / lastEvents.length;

    if (eventCount < 5) {
      this.storyArc = "introduction";
    } else if (eventCount < 15 && averageIntensity < 0.7) {
      this.storyArc = "rising_action";
    } else if (averageIntensity > 0.8 || this.hasClimax()) {
      this.storyArc = "climax";
      this.identifyClimax();
    } else if (this.storyArc === "climax") {
      this.storyArc = "falling_action";
    } else if (eventCount > 30) {
      this.storyArc = "resolution";
    }
  }

  private hasClimax(): boolean {
    const lastEvents = this.currentStory.events.slice(-3);
    return lastEvents.some(
      (e) =>
        (e.type === "combo" && e.intensity > 0.8) ||
        e.type === "ai_personality" ||
        e.type === "victory",
    );
  }

  private identifyClimax(): void {
    if (this.currentStory.climax) return;

    const significantEvents = this.currentStory.events.filter(
      (e) =>
        e.intensity > 0.7 ||
        e.type === "combo" ||
        e.type === "ai_personality" ||
        e.type === "victory",
    );

    if (significantEvents.length > 0) {
      this.currentStory.climax =
        significantEvents[significantEvents.length - 1];
    }
  }

  private createParticleEffect(event: StoryEvent): void {
    const effectId = `effect_${Date.now()}_${Math.random()}`;

    const effect = {
      id: effectId,
      type: event.particleType,
      position: event.position || [4, 4],
      color: event.color,
      intensity: event.intensity,
      duration: this.getEffectDuration(event),
      narrative: event.narrative,
      timestamp: Date.now(),
    };

    this.activeEffects.set(effectId, effect);

    // Auto-cleanup after duration
    setTimeout(() => {
      this.activeEffects.delete(effectId);
    }, effect.duration);
  }

  private getEffectDuration(event: StoryEvent): number {
    const baseDuration = 2000;
    const intensityMultiplier = 1 + event.intensity;

    switch (event.type) {
      case "victory":
      case "ai_personality":
        return baseDuration * 3 * intensityMultiplier;
      case "combo":
        return baseDuration * 2 * intensityMultiplier;
      case "emotion":
        return baseDuration * 1.5 * intensityMultiplier;
      default:
        return baseDuration * intensityMultiplier;
    }
  }

  getActiveEffects(): any[] {
    return Array.from(this.activeEffects.values());
  }

  getCurrentNarrative(): string {
    const lastEvent =
      this.currentStory.events[this.currentStory.events.length - 1];
    if (!lastEvent) return "La historia comienza...";

    const arcContext = this.getArcContext();
    return `${arcContext} ${lastEvent.narrative}`;
  }

  private getArcContext(): string {
    switch (this.storyArc) {
      case "introduction":
        return "En los albores del conflicto,";
      case "rising_action":
        return "Mientras la tensión se eleva,";
      case "climax":
        return "En el momento crucial,";
      case "falling_action":
        return "Tras el punto de inflexión,";
      case "resolution":
        return "En los ecos finales,";
      default:
        return "";
    }
  }

  getStoryArc(): typeof this.storyArc {
    return this.storyArc;
  }

  getStoryMetrics(): any {
    const events = this.currentStory.events;

    if (events.length === 0) {
      return {
        totalEvents: 0,
        averageIntensity: 0,
        dominantPlayer: "none",
        emotionalRange: 0,
        climaxReached: false,
      };
    }

    const humanEvents = events.filter((e) => e.player === "human").length;
    const aiEvents = events.filter((e) => e.player === "ai").length;
    const averageIntensity =
      events.reduce((sum, e) => sum + e.intensity, 0) / events.length;

    const intensities = events.map((e) => e.intensity);
    const emotionalRange = Math.max(...intensities) - Math.min(...intensities);

    return {
      totalEvents: events.length,
      averageIntensity,
      dominantPlayer: humanEvents > aiEvents ? "human" : "ai",
      emotionalRange,
      climaxReached: !!this.currentStory.climax,
      storyArc: this.storyArc,
      narrativeLength: events.reduce((sum, e) => sum + e.narrative.length, 0),
    };
  }

  generateChapterSummary(): string {
    const metrics = this.getStoryMetrics();
    const events = this.currentStory.events;

    if (events.length === 0) return "La historia aún no ha comenzado...";

    const summaries = [
      `En ${events.length} movimientos memorables, `,
      metrics.dominantPlayer === "human"
        ? "la creatividad humana lideró la danza"
        : "la inteligencia artificial dominó el tablero",
      `. Con una intensidad promedio de ${(metrics.averageIntensity * 100).toFixed(0)}%, `,
      this.currentStory.climax
        ? `el clímax llegó cuando ${this.currentStory.climax.narrative.toLowerCase()}`
        : "la historia continúa desarrollándose",
      `. ${this.getEmotionalSummary()}`,
    ];

    return summaries.join("");
  }

  private getEmotionalSummary(): string {
    const emotionEvents = this.currentStory.events.filter(
      (e) => e.type === "emotion",
    );

    if (emotionEvents.length === 0)
      return "Las emociones permanecieron estables.";

    const emotions = emotionEvents.map((e) => e.data.emotionalState);
    const emotionCounts = emotions.reduce(
      (acc, emotion) => {
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
      emotionCounts[a] > emotionCounts[b] ? a : b,
    );

    const emotionDescriptions = {
      frustrated: "La frustración marcó el ritmo",
      confident: "La confianza iluminó el camino",
      excited: "La emoción electrificó cada movimiento",
      calm: "La calma guió las decisiones",
      focused: "La concentración forjó la estrategia",
    };

    return (
      emotionDescriptions[dominantEmotion] ||
      "Las emociones danzaron en armonía."
    );
  }

  exportStory(): ParticleStory {
    this.currentStory.duration =
      Date.now() - (this.currentStory.events[0]?.timestamp || Date.now());
    this.currentStory.resolution = this.generateChapterSummary();

    return { ...this.currentStory };
  }

  startNewStory(): void {
    const oldStory = this.exportStory();
    this.currentStory = this.createNewStory();
    this.storyArc = "introduction";
    this.activeEffects.clear();

    // Could save oldStory to history here
    console.log(
      "📖 Nueva historia iniciada. Historia anterior:",
      oldStory.title,
    );
  }

  getVisualEffectConfig(effectType: StoryEvent["particleType"]): any {
    const configs = {
      explosion: {
        particleCount: 50,
        spread: 60,
        speed: { min: 1, max: 3 },
        scale: { start: 0.1, end: 1.5 },
        alpha: { start: 1, end: 0 },
        duration: 1000,
      },
      stream: {
        particleCount: 30,
        spread: 15,
        speed: { min: 2, max: 4 },
        scale: { start: 0.2, end: 0.8 },
        alpha: { start: 0.8, end: 0 },
        duration: 1500,
      },
      spiral: {
        particleCount: 40,
        spread: 360,
        speed: { min: 0.5, max: 2 },
        scale: { start: 0.3, end: 1.2 },
        alpha: { start: 0.9, end: 0 },
        duration: 2000,
        spiral: true,
      },
      nova: {
        particleCount: 60,
        spread: 360,
        speed: { min: 1, max: 5 },
        scale: { start: 0.05, end: 2 },
        alpha: { start: 1, end: 0 },
        duration: 2500,
      },
      ripple: {
        particleCount: 20,
        spread: 360,
        speed: { min: 1, max: 2 },
        scale: { start: 1, end: 3 },
        alpha: { start: 0.6, end: 0 },
        duration: 1200,
        ripple: true,
      },
      glow: {
        particleCount: 15,
        spread: 30,
        speed: { min: 0.1, max: 0.5 },
        scale: { start: 0.8, end: 1.5 },
        alpha: { start: 0.4, end: 0 },
        duration: 3000,
      },
      text: {
        particleCount: 1,
        speed: { min: 0, max: 0.2 },
        scale: { start: 1, end: 1.2 },
        alpha: { start: 1, end: 0 },
        duration: 4000,
        text: true,
      },
    };

    return configs[effectType] || configs.glow;
  }

  // Real-time narrative generation
  generateLiveCommentary(gameState: any): string {
    const metrics = this.getStoryMetrics();
    const lastEvents = this.currentStory.events.slice(-3);

    if (lastEvents.length === 0) return "";

    const recentIntensity =
      lastEvents.reduce((sum, e) => sum + e.intensity, 0) / lastEvents.length;

    if (recentIntensity > 0.8) {
      return "¡La intensidad alcanza niveles épicos!";
    } else if (recentIntensity < 0.3) {
      return "Un momento de calma estratégica...";
    } else if (metrics.storyArc === "climax") {
      return "El destino se decide en estos movimientos...";
    }

    return "";
  }
}
