/**
 * ===================================================================
 * MIND MIRROR - MOTOR DE DECISIONES DE IA
 * ===================================================================
 * 
 * PROPÓSITO:
 * - Evaluar y comparar diferentes opciones de movimiento
 * - Implementar algoritmos de búsqueda y optimización para la IA
 * - Balancear factores múltiples: score, riesgo, estrategia a largo plazo
 * - Proporcionar evaluaciones rápidas y precisas para tiempo real
 * 
 * ENTRADAS:
 * - Estado del tablero y contexto del juego
 * - Perfil del jugador y patrones detectados
 * - Configuración de dificultad y personalidad de IA
 * - Restricciones de tiempo y recursos
 * 
 * SALIDAS:
 * - Movimiento óptimo recomendado
 * - Lista de movimientos alternativos evaluados
 * - Confianza en la decisión tomada
 * - Razonamiento detrás de la elección
 * 
 * OPTIMIZACIONES:
 * - Poda alfa-beta para búsqueda de árbol de juego
 * - Evaluación heurística rápida O(1) para posiciones
 * - Cache de evaluaciones para evitar recálculos
 * - Algoritmos probabilísticos para decisiones en tiempo limitado
 * 
 * ESCALABILIDAD:
 * - Interfaz modular para diferentes tipos de evaluadores
 * - Sistema de pesos configurable para diferentes factores
 * - Capacidad de añadir nuevos criterios de evaluación
 * ===================================================================
 */

import { GameContext } from './AIEngine';

export interface MoveEvaluation {
  position: [number, number];
  score: number;
  confidence: number;
  risk: number;
  strategicValue: number;
  immediateGain: number;
  longTermPotential: number;
  counteringValue: number;
  reasoning: string;
  factors: EvaluationFactor[];
}

export interface EvaluationFactor {
  name: string;
  value: number;
  weight: number;
  description: string;
}

export interface CounterStrategy {
  position: [number, number];
  confidence: number;
  targetSequence: [number, number][];
  predictionConfidence: number;
  expectedAdvantage: number;
}

export interface EvaluationWeights {
  immediateScore: number;
  blockingPotential: number;
  futureOpportunity: number;
  riskAvoidance: number;
  patternDisruption: number;
  centerControl: number;
  edgeValue: number;
  specialCellAccess: number;
  comboSetup: number;
  defensiveValue: number;
}

export class DecisionEngine {
  private evaluationCache = new Map<string, MoveEvaluation>();
  private boardEvaluator: BoardEvaluator;
  private strategicAnalyzer: StrategicAnalyzer;
  private riskAssessor: RiskAssessor;
  
  // Configuración de evaluación
  private weights: EvaluationWeights = {
    immediateScore: 0.3,
    blockingPotential: 0.2,
    futureOpportunity: 0.15,
    riskAvoidance: 0.1,
    patternDisruption: 0.1,
    centerControl: 0.05,
    edgeValue: 0.03,
    specialCellAccess: 0.04,
    comboSetup: 0.02,
    defensiveValue: 0.01
  };

  private readonly CACHE_SIZE_LIMIT = 1000;
  private readonly SEARCH_DEPTH_LIMIT = 4;
  private readonly TIME_LIMIT_MS = 1500;

  constructor() {
    this.boardEvaluator = new BoardEvaluator();
    this.strategicAnalyzer = new StrategicAnalyzer();
    this.riskAssessor = new RiskAssessor();
  }

  /**
   * ===================================================================
   * EVALUACIÓN PRINCIPAL DE MOVIMIENTOS
   * ===================================================================
   * Método central que evalúa todas las opciones disponibles
   */
  public evaluateAllMoves(context: GameContext, difficulty: number): MoveEvaluation[] {
    const startTime = Date.now();
    const availableMoves = this.getAvailableMoves(context.board);
    const evaluations: MoveEvaluation[] = [];
    
    // Configurar pesos según dificultad
    this.adjustWeightsForDifficulty(difficulty);
    
    for (const position of availableMoves) {
      const cacheKey = this.generateCacheKey(context, position);
      
      let evaluation: MoveEvaluation;
      if (this.evaluationCache.has(cacheKey)) {
        evaluation = this.evaluationCache.get(cacheKey)!;
      } else {
        evaluation = this.evaluatePosition(context, position);
        this.cacheEvaluation(cacheKey, evaluation);
      }
      
      evaluations.push(evaluation);
      
      // Límite de tiempo para mantener responsividad
      if (Date.now() - startTime > this.TIME_LIMIT_MS) {
        break;
      }
    }
    
    return evaluations.sort((a, b) => b.score - a.score);
  }

  /**
   * ===================================================================
   * EVALUACIÓN DETALLADA DE POSICIÓN
   * ===================================================================
   * Análisis completo de una posición específica
   */
  public evaluatePosition(context: GameContext, position: [number, number]): MoveEvaluation {
    const [row, col] = position;
    const factors: EvaluationFactor[] = [];
    
    // Factor 1: Ganancia inmediata
    const immediateGain = this.calculateImmediateGain(context, position);
    factors.push({
      name: 'immediate_gain',
      value: immediateGain,
      weight: this.weights.immediateScore,
      description: `Puntos inmediatos obtenidos: ${immediateGain}`
    });

    // Factor 2: Potencial de bloqueo
    const blockingPotential = this.calculateBlockingPotential(context, position);
    factors.push({
      name: 'blocking_potential',
      value: blockingPotential,
      weight: this.weights.blockingPotential,
      description: `Capacidad de bloquear al jugador: ${(blockingPotential * 100).toFixed(1)}%`
    });

    // Factor 3: Oportunidades futuras
    const futureOpportunity = this.calculateFutureOpportunity(context, position);
    factors.push({
      name: 'future_opportunity',
      value: futureOpportunity,
      weight: this.weights.futureOpportunity,
      description: `Oportunidades futuras creadas: ${(futureOpportunity * 100).toFixed(1)}%`
    });

    // Factor 4: Evaluación de riesgo
    const risk = this.riskAssessor.assessPositionRisk(context, position);
    factors.push({
      name: 'risk_assessment',
      value: 1 - risk, // Invertir para que menos riesgo = más valor
      weight: this.weights.riskAvoidance,
      description: `Nivel de riesgo: ${(risk * 100).toFixed(1)}%`
    });

    // Factor 5: Disrupción de patrones del jugador
    const patternDisruption = this.calculatePatternDisruption(context, position);
    factors.push({
      name: 'pattern_disruption',
      value: patternDisruption,
      weight: this.weights.patternDisruption,
      description: `Interrumpir patrones del jugador: ${(patternDisruption * 100).toFixed(1)}%`
    });

    // Factor 6: Control del centro
    const centerControl = this.calculateCenterControl(position);
    factors.push({
      name: 'center_control',
      value: centerControl,
      weight: this.weights.centerControl,
      description: `Control del centro del tablero: ${(centerControl * 100).toFixed(1)}%`
    });

    // Factor 7: Acceso a celdas especiales
    const specialCellAccess = this.calculateSpecialCellAccess(context, position);
    factors.push({
      name: 'special_cell_access',
      value: specialCellAccess,
      weight: this.weights.specialCellAccess,
      description: `Acceso a celdas especiales: ${(specialCellAccess * 100).toFixed(1)}%`
    });

    // Calcular puntuación total ponderada
    const totalScore = factors.reduce((sum, factor) => 
      sum + (factor.value * factor.weight), 0
    );

    // Calcular confianza basada en consistencia de factores
    const confidence = this.calculateConfidence(factors);

    // Generar razonamiento
    const topFactors = factors
      .sort((a, b) => (b.value * b.weight) - (a.value * a.weight))
      .slice(0, 3);
    
    const reasoning = `Evaluación [${row},${col}]: ${topFactors
      .map(f => f.description)
      .join(', ')}`;

    return {
      position,
      score: totalScore,
      confidence,
      risk,
      strategicValue: futureOpportunity,
      immediateGain,
      longTermPotential: futureOpportunity,
      counteringValue: blockingPotential,
      reasoning,
      factors
    };
  }

  /**
   * ===================================================================
   * EVALUACIÓN DE ESTRATEGIAS DE CONTRAATAQUE
   * ===================================================================
   * Analiza movimientos que contrarrestan estrategias del jugador
   */
  public evaluateCounterStrategies(
    context: GameContext, 
    counterMoves: any[], 
    difficulty: number
  ): CounterStrategy {
    const evaluations = counterMoves.map(move => {
      const baseEval = this.evaluatePosition(context, move.position);
      
      // Bonus por contraataque efectivo
      const counterBonus = this.calculateCounterEffectiveness(context, move);
      const adjustedScore = baseEval.score + counterBonus;
      
      return {
        position: move.position,
        confidence: Math.min(baseEval.confidence + counterBonus * 0.2, 1),
        targetSequence: move.targetSequence || [],
        predictionConfidence: move.predictionConfidence || 0.5,
        expectedAdvantage: adjustedScore
      };
    });

    // Seleccionar la mejor estrategia de contraataque
    return evaluations.reduce((best, current) => 
      current.expectedAdvantage > best.expectedAdvantage ? current : best
    );
  }

  /**
   * ===================================================================
   * EVALUACIÓN BAJO REGLAS MODIFICADAS
   * ===================================================================
   * Evalúa movimientos cuando las reglas del juego han cambiado
   */
  public evaluateUnderModifiedRules(
    context: GameContext, 
    ruleEffect: any, 
    difficulty: number
  ): any {
    // Crear contexto modificado según el efecto de regla
    const modifiedContext = this.applyRuleModification(context, ruleEffect);
    
    // Evaluar bajo las nuevas condiciones
    const evaluations = this.evaluateAllMoves(modifiedContext, difficulty);
    
    if (evaluations.length === 0) {
      return {
        position: [0, 0],
        description: 'No hay movimientos válidos',
        alternatives: [],
        adaptationRequired: false,
        duration: 0
      };
    }

    const bestMove = evaluations[0];
    
    return {
      position: bestMove.position,
      description: `Bajo ${ruleEffect.type}: ${bestMove.reasoning}`,
      alternatives: evaluations.slice(1, 4),
      adaptationRequired: ruleEffect.adaptationChallenge || false,
      duration: ruleEffect.duration || 3
    };
  }

  /**
   * ===================================================================
   * BÚSQUEDA EN PROFUNDIDAD CON PODA ALFA-BETA
   * ===================================================================
   * Algoritmo optimizado para explorar movimientos futuros
   */
  public alphaBetaSearch(
    context: GameContext, 
    depth: number, 
    alpha: number = -Infinity, 
    beta: number = Infinity, 
    maximizingPlayer: boolean = true
  ): { score: number; move: [number, number] | null } {
    // Caso base: profundidad máxima o juego terminado
    if (depth === 0 || this.isGameOver(context)) {
      return {
        score: this.evaluateGameState(context),
        move: null
      };
    }

    const availableMoves = this.getAvailableMoves(context.board);
    let bestMove: [number, number] | null = null;

    if (maximizingPlayer) {
      let maxEval = -Infinity;
      
      for (const move of availableMoves) {
        const newContext = this.simulateMove(context, move, 'ai');
        const evaluation = this.alphaBetaSearch(newContext, depth - 1, alpha, beta, false);
        
        if (evaluation.score > maxEval) {
          maxEval = evaluation.score;
          bestMove = move;
        }
        
        alpha = Math.max(alpha, evaluation.score);
        if (beta <= alpha) {
          break; // Poda beta
        }
      }
      
      return { score: maxEval, move: bestMove };
    } else {
      let minEval = Infinity;
      
      for (const move of availableMoves) {
        const newContext = this.simulateMove(context, move, 'player');
        const evaluation = this.alphaBetaSearch(newContext, depth - 1, alpha, beta, true);
        
        if (evaluation.score < minEval) {
          minEval = evaluation.score;
          bestMove = move;
        }
        
        beta = Math.min(beta, evaluation.score);
        if (beta <= alpha) {
          break; // Poda alfa
        }
      }
      
      return { score: minEval, move: bestMove };
    }
  }

  /**
   * ===================================================================
   * MÉTODOS DE CÁLCULO DE FACTORES ESPECÍFICOS
   * ===================================================================
   */

  private calculateImmediateGain(context: GameContext, position: [number, number]): number {
    const [row, col] = position;
    const cell = context.board[row][col];
    
    let gain = 1; // Ganancia base por ocupar una posición
    
    // Bonus por celdas especiales
    if (cell?.type === 'special') {
      gain += this.getSpecialCellValue(cell.special);
    }
    
    // Bonus por combos potenciales
    const comboValue = this.calculateComboValue(context, position);
    gain += comboValue;
    
    return Math.min(gain / 10, 1); // Normalizar a 0-1
  }

  private calculateBlockingPotential(context: GameContext, position: [number, number]): number {
    // Evalúa cuánto este movimiento bloquea las opciones del jugador
    const playerFavoritePositions = this.getPlayerFavoritePositions(context);
    const proximityToFavorites = playerFavoritePositions.reduce((total, fav) => {
      const distance = Math.sqrt(
        Math.pow(position[0] - fav[0], 2) + Math.pow(position[1] - fav[1], 2)
      );
      return total + Math.max(0, 1 - distance / 8); // Normalizar distancia
    }, 0);
    
    return Math.min(proximityToFavorites / playerFavoritePositions.length || 0, 1);
  }

  private calculateFutureOpportunity(context: GameContext, position: [number, number]): number {
    // Evalúa las oportunidades futuras que crea este movimiento
    const adjacentCells = this.getAdjacentCells(position);
    const futureOpportunities = adjacentCells.filter(cell => 
      this.isCellEmpty(context.board, cell) || this.isCellSpecial(context.board, cell)
    ).length;
    
    return futureOpportunities / 8; // Máximo 8 celdas adyacentes, normalizar
  }

  private calculatePatternDisruption(context: GameContext, position: [number, number]): number {
    // Evalúa cuánto este movimiento interrumpe los patrones del jugador
    // Esta implementación sería específica según los patrones detectados
    return 0.5; // Placeholder
  }

  private calculateCenterControl(position: [number, number]): number {
    const [row, col] = position;
    const centerRow = 3.5, centerCol = 3.5; // Centro del tablero 8x8
    const distance = Math.sqrt(
      Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
    );
    const maxDistance = Math.sqrt(2 * Math.pow(3.5, 2)); // Distancia máxima del centro
    return 1 - (distance / maxDistance);
  }

  private calculateSpecialCellAccess(context: GameContext, position: [number, number]): number {
    const adjacentCells = this.getAdjacentCells(position);
    const specialCellsNearby = adjacentCells.filter(cell => 
      this.isCellSpecial(context.board, cell)
    ).length;
    
    return specialCellsNearby / 8; // Normalizar por número máximo de celdas adyacentes
  }

  private calculateConfidence(factors: EvaluationFactor[]): number {
    // Calcular confianza basada en la consistencia de los factores
    const values = factors.map(f => f.value * f.weight);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    // Menor varianza = mayor confianza
    return Math.max(0.1, 1 - variance);
  }

  /**
   * ===================================================================
   * MÉTODOS AUXILIARES
   * ===================================================================
   */

  private adjustWeightsForDifficulty(difficulty: number): void {
    // Ajustar pesos según el nivel de dificultad
    const aggressionFactor = difficulty;
    
    this.weights.immediateScore = 0.3 + (aggressionFactor * 0.1);
    this.weights.blockingPotential = 0.2 + (aggressionFactor * 0.15);
    this.weights.futureOpportunity = 0.15 + (aggressionFactor * 0.1);
    this.weights.riskAvoidance = 0.1 - (aggressionFactor * 0.05);
  }

  private getAvailableMoves(board: any[][]): [number, number][] {
    const moves: [number, number][] = [];
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[0].length; col++) {
        if (board[row][col]?.type === 'empty' || board[row][col]?.type === 'special') {
          moves.push([row, col]);
        }
      }
    }
    return moves;
  }

  private generateCacheKey(context: GameContext, position: [number, number]): string {
    const boardState = context.board.flat().map(cell => cell?.type || 'empty').join('');
    return `${boardState}_${position[0]}_${position[1]}_${context.currentPlayer}`;
  }

  private cacheEvaluation(key: string, evaluation: MoveEvaluation): void {
    if (this.evaluationCache.size >= this.CACHE_SIZE_LIMIT) {
      // Limpiar entradas más antiguas
      const oldestKey = this.evaluationCache.keys().next().value;
      this.evaluationCache.delete(oldestKey);
    }
    this.evaluationCache.set(key, evaluation);
  }

  private getAdjacentCells(position: [number, number]): [number, number][] {
    const [row, col] = position;
    const adjacent: [number, number][] = [];
    
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          adjacent.push([newRow, newCol]);
        }
      }
    }
    
    return adjacent;
  }

  // Métodos placeholder que se implementarían completamente
  private calculateCounterEffectiveness(context: GameContext, move: any): number { return 0.2; }
  private applyRuleModification(context: GameContext, effect: any): GameContext { return context; }
  private isGameOver(context: GameContext): boolean { return false; }
  private evaluateGameState(context: GameContext): number { return 0; }
  private simulateMove(context: GameContext, move: [number, number], player: 'ai' | 'player'): GameContext { return context; }
  private getSpecialCellValue(special: string): number { return 2; }
  private calculateComboValue(context: GameContext, position: [number, number]): number { return 0; }
  private getPlayerFavoritePositions(context: GameContext): [number, number][] { return []; }
  private isCellEmpty(board: any[][], position: [number, number]): boolean { 
    const [row, col] = position;
    return board[row]?.[col]?.type === 'empty';
  }
  private isCellSpecial(board: any[][], position: [number, number]): boolean { 
    const [row, col] = position;
    return board[row]?.[col]?.type === 'special';
  }
}

/**
 * ===================================================================
 * CLASES AUXILIARES
 * ===================================================================
 */

class BoardEvaluator {
  evaluateBoard(board: any[][]): number {
    // Implementar evaluación heurística del tablero
    return 0;
  }
}

class StrategicAnalyzer {
  analyzeStrategicPosition(context: GameContext): any {
    // Implementar análisis estratégico
    return {};
  }
}

class RiskAssessor {
  assessPositionRisk(context: GameContext, position: [number, number]): number {
    // Implementar evaluación de riesgo
    const [row, col] = position;
    
    // Riesgo basado en proximidad a bordes (mayor riesgo en bordes)
    const edgeDistance = Math.min(row, col, 7 - row, 7 - col);
    const edgeRisk = 1 - (edgeDistance / 3.5);
    
    // Riesgo basado en exposición (número de celdas enemigas adyacentes)
    // Esta implementación sería más compleja en la versión real
    
    return Math.max(0, Math.min(1, edgeRisk));
  }
}
