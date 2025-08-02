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
    
    // Keep only last 50 patterns for performance
    if (this.patterns.length > 50) {
      this.patterns.shift();
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

  generateMove(gameState: any, difficulty: number = 0.5): [number, number] | null {
    const emptyCells = this.getEmptyCells(gameState.board);
    if (emptyCells.length === 0) return null;
    
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

  getAIThought(): string {
    const recentPatterns = this.patterns.slice(-3);
    if (recentPatterns.length === 0) return "Analizando tus primeros movimientos...";
    
    const lastState = recentPatterns[recentPatterns.length - 1]?.emotionalState;
    const complexity = this.playerProfile.patternComplexity;
    const avgReaction = this.playerProfile.averageReactionTime;
    
    const thoughts = {
      frustrated: [
        "Detecto frustración en tu timing... explotando debilidad",
        "Tus decisiones se vuelven erráticas, momento perfecto para atacar",
        "La presión te está afectando, aumentando agresividad"
      ],
      rushed: [
        "Juegas demasiado rápido, preparando contratrampas",
        "Tu impulsividad será tu perdición",
        "Decisiones apresuradas detectadas, calculando aprovechamiento"
      ],
      confident: [
        "Tu confianza es admirable... e ingenua",
        "Confidence overload detectado, trampa en progreso",
        "Te sientes seguro, momento ideal para el golpe maestro"
      ],
      calm: [
        `Patrón de complejidad ${(complexity * 100).toFixed(0)}% - intrigante`,
        `Tiempo de reacción promedio: ${(avgReaction / 1000).toFixed(1)}s - calculando`,
        "Jugador metódico detectado, adaptando estrategia espejo"
      ]
    };
    
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
