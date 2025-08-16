// Mock del motor de juego para Mind Mirror y el juego principal

export class MindMirrorAI {
  static generateInsight(input: string): string {
    const insights = [
      "Tu reflexión muestra una profunda capacidad de introspección",
      "Hay una búsqueda constante de significado en tus palabras",
      "Se percibe un deseo de crecimiento y transformación",
      "Tu mente busca conexiones entre experiencias y aprendizajes",
      "Existe una sabiduría emergente en tu proceso reflexivo",
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  }

  static analyzeEmotion(text: string): {
    emotion: string;
    intensity: number;
    color: string;
  } {
    const emotions = [
      { emotion: "calma", intensity: 0.7, color: "#87CEEB" },
      { emotion: "alegría", intensity: 0.8, color: "#FFD700" },
      { emotion: "reflexión", intensity: 0.6, color: "#9370DB" },
      { emotion: "esperanza", intensity: 0.75, color: "#98FB98" },
      { emotion: "curiosidad", intensity: 0.65, color: "#FF69B4" },
    ];
    return emotions[Math.floor(Math.random() * emotions.length)];
  }

  static suggestAction(context: string): {
    action: string;
    difficulty: string;
    benefit: string;
  } {
    const actions = [
      {
        action: "Practica 10 minutos de meditación consciente",
        difficulty: "baja",
        benefit: "Reduce el estrés y aumenta la claridad mental",
      },
      {
        action: "Escribe en un diario por 15 minutos",
        difficulty: "baja",
        benefit: "Mejora la autoconciencia y procesa emociones",
      },
      {
        action: "Realiza ejercicio físico durante 30 minutos",
        difficulty: "media",
        benefit: "Libera endorfinas y mejora el estado de ánimo",
      },
      {
        action: "Conecta con un ser querido",
        difficulty: "baja",
        benefit: "Fortalece vínculos sociales y apoyo emocional",
      },
      {
        action: "Aprende algo nuevo durante 20 minutos",
        difficulty: "media",
        benefit: "Estimula la neuroplasticidad y el crecimiento personal",
      },
    ];
    return actions[Math.floor(Math.random() * actions.length)];
  }
}

export class ComboSystem {
  private combos: number = 0;
  private multiplier: number = 1;

  addCombo(): void {
    this.combos++;
    this.multiplier = Math.min(this.combos * 0.1 + 1, 3);
  }

  resetCombo(): void {
    this.combos = 0;
    this.multiplier = 1;
  }

  getCurrentMultiplier(): number {
    return this.multiplier;
  }

  getCombos(): number {
    return this.combos;
  }
}

export class GameEngine {
  private score: number = 0;
  private level: number = 1;
  private combo: ComboSystem = new ComboSystem();

  calculateScore(points: number): number {
    const multipliedPoints = points * this.combo.getCurrentMultiplier();
    this.score += multipliedPoints;
    return multipliedPoints;
  }

  levelUp(): void {
    this.level++;
    this.combo.resetCombo();
  }

  getGameState() {
    return {
      score: this.score,
      level: this.level,
      combos: this.combo.getCombos(),
      multiplier: this.combo.getCurrentMultiplier(),
    };
  }

  reset(): void {
    this.score = 0;
    this.level = 1;
    this.combo.resetCombo();
  }
}

export default GameEngine;
