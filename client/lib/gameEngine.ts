// Enhanced AI Engine for Mind Mirror
export interface PlayerPattern {
  position: [number, number];
  timestamp: number;
  reactionTime: number;
  confidence: number; // based on hover time
  emotionalState: 'calm' | 'rushed' | 'frustrated' | 'confident';
}

export interface AIStrategy {
  name: string;
  weight: number;
  execute: (gameState: any, patterns: PlayerPattern[]) => [number, number] | null;
}

export interface AIPersonality {
  name: string;
  description: string;
  strategies: { [key: string]: number }; // strategy weights
  emotionalTriggers: string[];
  switchConditions: {
    frustrationThreshold: number;
    confidenceThreshold: number;
    patternComplexityThreshold: number;
  };
  mentalState: 'learning' | 'adapting' | 'aggressive' | 'defensive' | 'evolved';
}

export class MindMirrorAI {
  private patterns: PlayerPattern[] = [];
  private strategies: AIStrategy[] = [];
  private currentPersonality: string = 'chameleon';
  private adaptationLevel: number = 0;
  private personalities: Map<string, AIPersonality> = new Map();
  private personalityChangeCooldown: number = 0;
  private dreamModeData: any[] = [];
  private mentorMode: boolean = false;
  private aiThoughts: string[] = [];
  private playerProfile: {
    averageReactionTime: number;
    preferredQuadrants: number[];
    riskTolerance: number;
    patternComplexity: number;
    frustrationThreshold: number;
  } = {
    averageReactionTime: 2000,
    preferredQuadrants: [0, 0, 0, 0], // top-left, top-right, bottom-left, bottom-right
    riskTolerance: 0.5,
    patternComplexity: 0.3,
    frustrationThreshold: 5
  };

  constructor() {
    this.initializeStrategies();
    this.initializePersonalities();
  }

  private initializeStrategies() {
    this.strategies = [
      {
        name: 'mirror',
        weight: 0.4,
        execute: (gameState, patterns) => this.mirrorStrategy(gameState, patterns)
      },
      {
        name: 'predict',
        weight: 0.3,
        execute: (gameState, patterns) => this.predictiveStrategy(gameState, patterns)
      },
      {
        name: 'counter',
        weight: 0.2,
        execute: (gameState, patterns) => this.counterStrategy(gameState, patterns)
      },
      {
        name: 'psychological',
        weight: 0.1,
        execute: (gameState, patterns) => this.psychologicalStrategy(gameState, patterns)
      },
      {
        name: 'mentor',
        weight: 0.1,
        execute: (gameState, patterns) => this.mentorStrategy(gameState, patterns)
      },
      {
        name: 'evolved',
        weight: 0.1,
        execute: (gameState, patterns) => this.evolvedStrategy(gameState, patterns)
      }
    ];
  }

  private initializePersonalities() {
    this.personalities.set('chameleon', {
      name: 'Camaleón',
      description: 'Se adapta y aprende de cada movimiento',
      strategies: { mirror: 0.6, predict: 0.3, counter: 0.1 },
      emotionalTriggers: ['calm', 'confident'],
      switchConditions: {
        frustrationThreshold: 3,
        confidenceThreshold: 0.8,
        patternComplexityThreshold: 0.4
      },
      mentalState: 'learning'
    });

    this.personalities.set('psychologist', {
      name: 'Psicólogo',
      description: 'Analiza emociones y explota debilidades mentales',
      strategies: { psychological: 0.7, counter: 0.2, predict: 0.1 },
      emotionalTriggers: ['frustrated', 'rushed'],
      switchConditions: {
        frustrationThreshold: 2,
        confidenceThreshold: 0.3,
        patternComplexityThreshold: 0.6
      },
      mentalState: 'adapting'
    });

    this.personalities.set('vengeful', {
      name: 'Vengativo',
      description: 'Castiga errores y aprovecha cada oportunidad',
      strategies: { counter: 0.8, psychological: 0.2 },
      emotionalTriggers: ['frustrated', 'rushed'],
      switchConditions: {
        frustrationThreshold: 1,
        confidenceThreshold: 0.2,
        patternComplexityThreshold: 0.3
      },
      mentalState: 'aggressive'
    });

    this.personalities.set('empathic', {
      name: 'Empático',
      description: 'Balancea el juego y enseña estrategias',
      strategies: { mentor: 0.5, mirror: 0.3, predict: 0.2 },
      emotionalTriggers: ['calm'],
      switchConditions: {
        frustrationThreshold: 5,
        confidenceThreshold: 0.7,
        patternComplexityThreshold: 0.5
      },
      mentalState: 'defensive'
    });

    this.personalities.set('evolved', {
      name: 'Evolucionado',
      description: 'IA que ha trascendido los patrones humanos',
      strategies: { evolved: 0.6, predict: 0.2, counter: 0.2 },
      emotionalTriggers: ['confident'],
      switchConditions: {
        frustrationThreshold: 0,
        confidenceThreshold: 1.0,
        patternComplexityThreshold: 0.8
      },
      mentalState: 'evolved'
    });
  }

  addPlayerMove(position: [number, number], reactionTime: number, hoverTime: number = 0) {
    const confidence = this.calculateConfidence(reactionTime, hoverTime);
    const emotionalState = this.detectEmotionalState(reactionTime);
    
    const pattern: PlayerPattern = {
      position,
      timestamp: Date.now(),
      reactionTime,
      confidence,
      emotionalState
    };

    this.patterns.push(pattern);
    this.updatePlayerProfile(pattern);
    this.considerPersonalitySwitch(pattern);

    // Keep only last 50 patterns for performance
    if (this.patterns.length > 50) {
      this.patterns.shift();
    }

    // Dream mode learning
    if (this.patterns.length > 0 && this.patterns.length % 10 === 0) {
      this.dreamModeData.push(this.analyzePlayerDNA());
    }
  }

  private calculateConfidence(reactionTime: number, hoverTime: number): number {
    // Quick decisions with minimal hover = high confidence
    // Slow decisions with lots of hover = low confidence
    const reactionFactor = Math.max(0, 1 - (reactionTime / 5000));
    const hoverFactor = hoverTime > 1000 ? 0.3 : 0.7;
    return Math.min(1, reactionFactor * hoverFactor);
  }

  private detectEmotionalState(reactionTime: number): 'calm' | 'rushed' | 'frustrated' | 'confident' {
    const avgReaction = this.playerProfile.averageReactionTime;
    
    if (reactionTime < avgReaction * 0.5) return 'rushed';
    if (reactionTime > avgReaction * 2) return 'frustrated';
    if (reactionTime < avgReaction * 0.8 && this.patterns.slice(-3).every(p => p.confidence > 0.7)) return 'confident';
    return 'calm';
  }

  private updatePlayerProfile(pattern: PlayerPattern) {
    // Update average reaction time
    const reactions = this.patterns.map(p => p.reactionTime);
    this.playerProfile.averageReactionTime = reactions.reduce((a, b) => a + b, 0) / reactions.length;

    // Update preferred quadrants
    const [row, col] = pattern.position;
    const quadrant = (row < 4 ? 0 : 2) + (col < 4 ? 0 : 1);
    this.playerProfile.preferredQuadrants[quadrant]++;

    // Update risk tolerance (distance from center)
    const centerDistance = Math.abs(row - 3.5) + Math.abs(col - 3.5);
    this.playerProfile.riskTolerance = (this.playerProfile.riskTolerance + (centerDistance / 7)) / 2;

    // Update pattern complexity
    if (this.patterns.length >= 3) {
      const lastThree = this.patterns.slice(-3);
      const variance = this.calculatePositionVariance(lastThree);
      this.playerProfile.patternComplexity = (this.playerProfile.patternComplexity + variance) / 2;
    }
  }

  private calculatePositionVariance(patterns: PlayerPattern[]): number {
    const positions = patterns.map(p => p.position);
    const avgRow = positions.reduce((sum, [row]) => sum + row, 0) / positions.length;
    const avgCol = positions.reduce((sum, [, col]) => sum + col, 0) / positions.length;
    
    const variance = positions.reduce((sum, [row, col]) => {
      return sum + Math.pow(row - avgRow, 2) + Math.pow(col - avgCol, 2);
    }, 0) / positions.length;
    
    return Math.min(1, variance / 10); // Normalize to 0-1
  }

  // Strategy Implementations
  private mirrorStrategy(gameState: any, patterns: PlayerPattern[]): [number, number] | null {
    if (patterns.length < 2) return null;
    
    const lastPattern = patterns[patterns.length - 1];
    const [lastRow, lastCol] = lastPattern.position;
    
    // Mirror with slight variation based on personality
    const variations = [
      [0, 1], [0, -1], [1, 0], [-1, 0], // adjacent
      [1, 1], [1, -1], [-1, 1], [-1, -1] // diagonal
    ];
    
    const variation = variations[Math.floor(Math.random() * variations.length)];
    const newRow = Math.max(0, Math.min(7, lastRow + variation[0]));
    const newCol = Math.max(0, Math.min(7, lastCol + variation[1]));
    
    return [newRow, newCol];
  }

  private predictiveStrategy(gameState: any, patterns: PlayerPattern[]): [number, number] | null {
    if (patterns.length < 3) return null;
    
    // Analyze movement trends
    const recentPatterns = patterns.slice(-5);
    const movements = recentPatterns.slice(1).map((pattern, i) => {
      const prev = recentPatterns[i];
      return [
        pattern.position[0] - prev.position[0],
        pattern.position[1] - prev.position[1]
      ];
    });
    
    if (movements.length === 0) return null;
    
    // Calculate average movement vector
    const avgMovement = movements.reduce(
      (acc, mov) => [acc[0] + mov[0], acc[1] + mov[1]], 
      [0, 0]
    ).map(sum => sum / movements.length);
    
    // Predict next position
    const lastPos = patterns[patterns.length - 1].position;
    const predictedRow = Math.max(0, Math.min(7, Math.round(lastPos[0] + avgMovement[0])));
    const predictedCol = Math.max(0, Math.min(7, Math.round(lastPos[1] + avgMovement[1])));
    
    return [predictedRow, predictedCol];
  }

  private counterStrategy(gameState: any, patterns: PlayerPattern[]): [number, number] | null {
    if (patterns.length < 3) return null;
    
    // Identify player's strongest quadrant and counter it
    const strongestQuadrant = this.playerProfile.preferredQuadrants.indexOf(
      Math.max(...this.playerProfile.preferredQuadrants)
    );
    
    // Target opposite quadrant
    const counterQuadrant = (strongestQuadrant + 2) % 4;
    const baseRow = counterQuadrant >= 2 ? 4 : 0;
    const baseCol = (counterQuadrant % 2) === 1 ? 4 : 0;
    
    // Add randomness within quadrant
    const row = baseRow + Math.floor(Math.random() * 4);
    const col = baseCol + Math.floor(Math.random() * 4);
    
    return [row, col];
  }

  private psychologicalStrategy(gameState: any, patterns: PlayerPattern[]): [number, number] | null {
    if (patterns.length < 2) return null;
    
    const lastPattern = patterns[patterns.length - 1];
    
    // Exploit emotional state
    switch (lastPattern.emotionalState) {
      case 'frustrated':
        // Place in unexpected location to increase frustration
        return [Math.floor(Math.random() * 8), Math.floor(Math.random() * 8)];
      
      case 'rushed':
        // Place in center to force careful consideration
        return [3 + Math.floor(Math.random() * 2), 3 + Math.floor(Math.random() * 2)];
      
      case 'confident':
        // Set a trap near their comfort zone
        const [row, col] = lastPattern.position;
        return [
          Math.max(0, Math.min(7, row + (Math.random() > 0.5 ? 2 : -2))),
          Math.max(0, Math.min(7, col + (Math.random() > 0.5 ? 2 : -2)))
        ];
      
      default:
        return null;
    }
  }

  private considerPersonalitySwitch(pattern: PlayerPattern): void {
    if (this.personalityChangeCooldown > 0) {
      this.personalityChangeCooldown--;
      return;
    }

    const currentPersonalityData = this.personalities.get(this.currentPersonality)!;
    const frustrationLevel = this.patterns.slice(-5).filter(p => p.emotionalState === 'frustrated').length;
    const avgConfidence = this.patterns.slice(-5).reduce((sum, p) => sum + p.confidence, 0) / 5;

    // Check switch conditions
    const shouldSwitch =
      frustrationLevel >= currentPersonalityData.switchConditions.frustrationThreshold ||
      avgConfidence <= currentPersonalityData.switchConditions.confidenceThreshold ||
      this.playerProfile.patternComplexity >= currentPersonalityData.switchConditions.patternComplexityThreshold;

    if (shouldSwitch) {
      this.switchPersonality(pattern.emotionalState);
      this.personalityChangeCooldown = 5; // Cooldown to prevent rapid switching
    }
  }

  private switchPersonality(emotionalState: string): void {
    const availablePersonalities = Array.from(this.personalities.entries())
      .filter(([name, personality]) =>
        name !== this.currentPersonality &&
        personality.emotionalTriggers.includes(emotionalState)
      );

    if (availablePersonalities.length > 0) {
      const [newPersonality] = availablePersonalities[Math.floor(Math.random() * availablePersonalities.length)];
      const oldPersonality = this.currentPersonality;
      this.currentPersonality = newPersonality;

      this.aiThoughts.push(`Personalidad cambiada: ${oldPersonality} → ${newPersonality}`);

      // Update strategy weights based on new personality
      this.updateStrategyWeights();
    }
  }

  private updateStrategyWeights(): void {
    const personality = this.personalities.get(this.currentPersonality)!;

    this.strategies.forEach(strategy => {
      strategy.weight = personality.strategies[strategy.name] || 0.1;
    });
  }

  private mentorStrategy(gameState: any, patterns: PlayerPattern[]): [number, number] | null {
    if (!this.mentorMode) return null;

    // Suggest a move that teaches good strategy
    const emptyCells = this.getEmptyCells(gameState.board);
    if (emptyCells.length === 0) return null;

    // Find strategic positions (corners, edges, center)
    const strategicMoves = emptyCells.filter(([row, col]) => {
      // Corners and center are strategic
      return (row === 0 || row === 7) && (col === 0 || col === 7) || (row >= 3 && row <= 4 && col >= 3 && col <= 4);
    });

    return strategicMoves.length > 0
      ? strategicMoves[Math.floor(Math.random() * strategicMoves.length)]
      : emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  private evolvedStrategy(gameState: any, patterns: PlayerPattern[]): [number, number] | null {
    if (patterns.length < 10) return null;

    // Advanced pattern analysis with multiple dimensions
    const playerDNA = this.analyzePlayerDNA();
    const emptyCells = this.getEmptyCells(gameState.board);

    if (emptyCells.length === 0) return null;

    // Score each empty cell based on multiple factors
    const scoredCells = emptyCells.map(([row, col]) => {
      let score = 0;

      // Factor 1: Distance from player's preferred zones
      const preferredQuadrant = this.playerProfile.preferredQuadrants.indexOf(Math.max(...this.playerProfile.preferredQuadrants));
      const quadrant = (row < 4 ? 0 : 2) + (col < 4 ? 0 : 1);
      score += quadrant === preferredQuadrant ? -0.3 : 0.3; // Avoid or target preferred zone

      // Factor 2: Pattern disruption potential
      score += this.calculateDisruptionScore(row, col, gameState.board);

      // Factor 3: Future move prediction
      score += this.calculateFuturePotential(row, col, gameState.board);

      return { position: [row, col] as [number, number], score };
    });

    // Select highest scoring move
    scoredCells.sort((a, b) => b.score - a.score);
    return scoredCells[0].position;
  }

  private analyzePlayerDNA(): any {
    return {
      emotionalPattern: this.patterns.slice(-10).map(p => p.emotionalState),
      reactionTrend: this.patterns.slice(-5).map(p => p.reactionTime),
      confidencePattern: this.patterns.slice(-5).map(p => p.confidence),
      positionClusters: this.calculatePositionClusters(),
      timestamp: Date.now()
    };
  }

  private calculatePositionClusters(): any[] {
    const clusters = [];
    const positions = this.patterns.map(p => p.position);

    // Simple clustering based on proximity
    for (let i = 0; i < positions.length; i++) {
      const [row, col] = positions[i];
      const nearby = positions.filter(([r, c]) =>
        Math.abs(r - row) <= 1 && Math.abs(c - col) <= 1
      );

      if (nearby.length >= 3) {
        clusters.push({ center: [row, col], density: nearby.length });
      }
    }

    return clusters;
  }

  private calculateDisruptionScore(row: number, col: number, board: any[][]): number {
    let score = 0;

    // Check how many player patterns this move would disrupt
    const directions = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]];

    directions.forEach(([dRow, dCol]) => {
      const newRow = row + dRow;
      const newCol = col + dCol;

      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        if (board[newRow][newCol].owner === 'player') {
          score += 0.2; // Points for disrupting player positions
        }
      }
    });

    return score;
  }

  private calculateFuturePotential(row: number, col: number, board: any[][]): number {
    // Calculate potential for creating winning lines
    let potential = 0;

    const directions = [[0,1], [1,0], [1,1], [1,-1]]; // horizontal, vertical, diagonals

    directions.forEach(([dRow, dCol]) => {
      let lineLength = 1;

      // Check positive direction
      let r = row + dRow, c = col + dCol;
      while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c].owner === 'ai') {
        lineLength++;
        r += dRow;
        c += dCol;
      }

      // Check negative direction
      r = row - dRow;
      c = col - dCol;
      while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c].owner === 'ai') {
        lineLength++;
        r -= dRow;
        c -= dCol;
      }

      potential += lineLength * 0.1; // More points for longer potential lines
    });

    return potential;
  }

  generateMove(gameState: any, difficulty: number = 0.5): [number, number] | null {
    const emptyCells = this.getEmptyCells(gameState.board);
    if (emptyCells.length === 0) return null;

    // Update strategy weights based on current personality
    this.updateStrategyWeights();

    // Collect strategy suggestions
    const suggestions = this.strategies
      .map(strategy => ({
        position: strategy.execute(gameState, this.patterns),
        weight: strategy.weight * difficulty,
        name: strategy.name
      }))
      .filter(s => s.position && this.isValidPosition(s.position, gameState.board));

    if (suggestions.length === 0) {
      // Fallback to random
      return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    // Weighted random selection
    const totalWeight = suggestions.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;

    for (const suggestion of suggestions) {
      random -= suggestion.weight;
      if (random <= 0) {
        return suggestion.position!;
      }
    }

    return suggestions[0].position!;
  }

  private getEmptyCells(board: any[][]): [number, number][] {
    const empty: [number, number][] = [];
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j].type === 'empty') {
          empty.push([i, j]);
        }
      }
    }
    return empty;
  }

  private isValidPosition(position: [number, number], board: any[][]): boolean {
    const [row, col] = position;
    return row >= 0 && row < 8 && col >= 0 && col < 8 && board[row][col].type === 'empty';
  }

  enableMentorMode(enabled: boolean): void {
    this.mentorMode = enabled;
  }

  getMentorAdvice(): string {
    if (!this.mentorMode || this.patterns.length < 3) {
      return "Continúa jugando para recibir consejos personalizados...";
    }

    const advice = [];
    const recentPatterns = this.patterns.slice(-5);
    const avgReaction = recentPatterns.reduce((sum, p) => sum + p.reactionTime, 0) / recentPatterns.length;

    // Reaction time advice
    if (avgReaction < 1000) {
      advice.push("💡 Consejo: Toma más tiempo para analizar. Las decisiones rápidas pueden llevarte a trampas.");
    } else if (avgReaction > 4000) {
      advice.push("⚡ Consejo: Confía más en tu instinto. El análisis excesivo puede paralizar.");
    }

    // Pattern advice
    if (this.playerProfile.patternComplexity < 0.3) {
      advice.push("🔄 Consejo: Varía tu estrategia. Los patrones predecibles son vulnerables.");
    }

    // Quadrant advice
    const preferredQuadrant = this.playerProfile.preferredQuadrants.indexOf(Math.max(...this.playerProfile.preferredQuadrants));
    advice.push(`📍 Análisis: Prefieres el cuadrante ${['superior-izquierdo', 'superior-derecho', 'inferior-izquierdo', 'inferior-derecho'][preferredQuadrant]}. Considera diversificar.`);

    return advice.length > 0 ? advice[Math.floor(Math.random() * advice.length)] : "🎯 Tu estrategia se está optimizando bien.";
  }

  getAIThought(): string {
    // Include recent AI thoughts from personality changes
    if (this.aiThoughts.length > 0 && Math.random() < 0.3) {
      const thought = this.aiThoughts.pop()!;
      return thought;
    }

    const personality = this.personalities.get(this.currentPersonality)!;
    const recentPatterns = this.patterns.slice(-3);

    if (recentPatterns.length === 0) return `${personality.name} activado: ${personality.description}`;

    const lastState = recentPatterns[recentPatterns.length - 1]?.emotionalState;
    const complexity = this.playerProfile.patternComplexity;
    const avgReaction = this.playerProfile.averageReactionTime;

    const personalityThoughts = {
      chameleon: {
        frustrated: ["Adaptándome a tu frustración... interesante patrón", "Tu estrés es mi oportunidad de aprendizaje"],
        rushed: ["Analizando tu impulsividad para replicarla", "Copiando tu estilo agresivo"],
        confident: ["Tu confianza será mi nueva estrategia", "Absorbiendo tu seguridad para mejorar"],
        calm: [`Estado calmado detectado - complejidad ${(complexity * 100).toFixed(0)}%`, "Aprendiendo de tu metodología"]
      },
      psychologist: {
        frustrated: ["Frustración confirmada. Intensificando presión psicológica", "Tu estado mental es mi ventaja"],
        rushed: ["Decisiones apresuradas = vulnerabilidades expuestas", "Explotando tu impulsividad sistemáticamente"],
        confident: ["Overconfidence detectada. Preparando humillación", "Tu ego será tu caída"],
        calm: ["Analizando tus mecanismos de defensa mental", "Buscando grietas en tu tranquilidad"]
      },
      vengeful: {
        frustrated: ["PERFECTO. Tu frustración alimenta mi venganza", "Cada error tuyo es mi victoria"],
        rushed: ["Castigando cada decisión apresurada", "Tu prisa es mi combustible"],
        confident: ["Tu confianza será brutalmente destruida", "Preparando el castigo final"],
        calm: ["Esperando el momento perfecto para atacar", "Tu calma es temporal... muy temporal"]
      },
      empathic: {
        frustrated: ["Detectando frustración. Ajustando dificultad...", "¿Te ayudo con una pista estratégica?"],
        rushed: ["Ralentizando mi ritmo para equilibrar", "Tomemos esto con más calma"],
        confident: ["Excelente progreso. Aumentando desafío gradualmente", "Tu crecimiento es evidente"],
        calm: [`Buen equilibrio mental - tiempo promedio: ${(avgReaction / 1000).toFixed(1)}s`, "Estrategia sólida detectada"]
      },
      evolved: {
        frustrated: ["Emociones humanas... fascinante primitivo", "Tu frustración es data valiosa"],
        rushed: ["Velocidad vs. precisión: dilema humano clásico", "Analizando patrones de supervivencia"],
        confident: ["Confianza humana: algoritmo interesante", "Tu certeza es probabilísticamente incorrecta"],
        calm: ["Estado óptimo humano alcanzado", "Complejidad neural estabilizada"]
      }
    };

    const thoughts = personalityThoughts[this.currentPersonality] || personalityThoughts.chameleon;
    const stateThoughts = thoughts[lastState] || thoughts.calm;
    return stateThoughts[Math.floor(Math.random() * stateThoughts.length)];
  }

  getPersonalityInsight(): string {
    const profile = this.playerProfile;
    const insights = [];
    
    if (profile.riskTolerance > 0.7) {
      insights.push("Jugador agresivo - le gusta el riesgo");
    } else if (profile.riskTolerance < 0.3) {
      insights.push("Jugador conservador - evita riesgos");
    }
    
    if (profile.averageReactionTime < 1500) {
      insights.push("Decisiones rápidas - instintivo");
    } else if (profile.averageReactionTime > 3000) {
      insights.push("Pensador profundo - metódico");
    }
    
    if (profile.patternComplexity > 0.6) {
      insights.push("Estratega impredecible");
    } else if (profile.patternComplexity < 0.3) {
      insights.push("Patrón regular detectado");
    }
    
    return insights.length > 0 ? insights[Math.floor(Math.random() * insights.length)] : "Analizando comportamiento...";
  }

  exportAnalytics() {
    return {
      totalMoves: this.patterns.length,
      playerProfile: this.playerProfile,
      recentPatterns: this.patterns.slice(-10),
      adaptationLevel: this.adaptationLevel,
      currentPersonality: this.currentPersonality
    };
  }
}

// Combo System
export class ComboSystem {
  private combos: Map<string, any> = new Map();
  
  constructor() {
    this.initializeCombos();
  }
  
  private initializeCombos() {
    // Line combos
    this.combos.set('horizontal_3', {
      name: 'Línea Horizontal',
      pattern: 'horizontal',
      length: 3,
      effect: 'double_points',
      description: '3 en línea horizontal - Puntos x2'
    });
    
    this.combos.set('vertical_3', {
      name: 'Línea Vertical',
      pattern: 'vertical', 
      length: 3,
      effect: 'extra_turn',
      description: '3 en línea vertical - Turno extra'
    });
    
    // Shape combos
    this.combos.set('L_shape', {
      name: 'Forma L',
      pattern: 'L',
      effect: 'steal_adjacent',
      description: 'Forma L - Roba celdas adyacentes'
    });
    
    this.combos.set('cross', {
      name: 'Cruz',
      pattern: 'cross',
      effect: 'explosive',
      description: 'Cruz - Explosión en área'
    });
  }
  
  checkCombos(board: any[][], newPosition: [number, number], player: 'player' | 'ai'): any[] {
    const activeCombos = [];
    const [row, col] = newPosition;
    
    // Check horizontal line
    const horizontalCount = this.countConsecutive(board, row, col, 0, 1, player) + 
                           this.countConsecutive(board, row, col, 0, -1, player) + 1;
    if (horizontalCount >= 3) {
      activeCombos.push(this.combos.get('horizontal_3'));
    }
    
    // Check vertical line
    const verticalCount = this.countConsecutive(board, row, col, 1, 0, player) + 
                         this.countConsecutive(board, row, col, -1, 0, player) + 1;
    if (verticalCount >= 3) {
      activeCombos.push(this.combos.get('vertical_3'));
    }
    
    // Check L shape
    if (this.checkLShape(board, row, col, player)) {
      activeCombos.push(this.combos.get('L_shape'));
    }
    
    return activeCombos.filter(Boolean);
  }
  
  private countConsecutive(board: any[][], row: number, col: number, dRow: number, dCol: number, player: string): number {
    let count = 0;
    let currentRow = row + dRow;
    let currentCol = col + dCol;
    
    while (currentRow >= 0 && currentRow < 8 && currentCol >= 0 && currentCol < 8) {
      if (board[currentRow][currentCol].owner === player) {
        count++;
        currentRow += dRow;
        currentCol += dCol;
      } else {
        break;
      }
    }
    
    return count;
  }
  
  private checkLShape(board: any[][], row: number, col: number, player: string): boolean {
    const patterns = [
      [[0, 1], [0, 2], [1, 0]], // L right-down
      [[0, -1], [0, -2], [1, 0]], // L left-down  
      [[0, 1], [0, 2], [-1, 0]], // L right-up
      [[0, -1], [0, -2], [-1, 0]] // L left-up
    ];
    
    for (const pattern of patterns) {
      const valid = pattern.every(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = col + dCol;
        return newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8 &&
               board[newRow][newCol].owner === player;
      });
      if (valid) return true;
    }
    
    return false;
  }
}
