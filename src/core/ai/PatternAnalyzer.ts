/**
 * ===================================================================
 * MIND MIRROR - ANALIZADOR DE PATRONES DEL JUGADOR
 * ===================================================================
 *
 * PROPÓSITO:
 * - Detectar y analizar patrones de comportamiento del jugador
 * - Identificar preferencias, debilidades y fortalezas
 * - Calcular métricas de predictibilidad y creatividad
 * - Optimizar predicciones basadas en historial de juego
 *
 * ENTRADAS:
 * - Historial de movimientos del jugador
 * - Tiempos de reacción
 * - Contexto del juego (score, dificultad, etc.)
 * - Sesiones de juego anteriores
 *
 * SALIDAS:
 * - Patrones detectados (posiciones favoritas, secuencias comunes)
 * - Métricas de comportamiento (creatividad, riesgo, adaptabilidad)
 * - Predicciones de próximos movimientos
 * - Perfil psicológico del jugador
 *
 * OPTIMIZACIONES:
 * - Algoritmos de detección de patrones O(n log n)
 * - Cache de patrones frecuentes
 * - Análisis incremental vs recálculo completo
 * - Estructuras de datos optimizadas para búsqueda rápida
 * ===================================================================
 */

export interface PlayerMove {
  position: [number, number];
  timestamp: number;
  reactionTime: number;
  gameContext: {
    score: { player: number; ai: number };
    movesCount: number;
    timeRemaining: number;
    difficulty: number;
  };
  outcome: "success" | "blocked" | "suboptimal" | "brilliant";
}

export interface MovementPattern {
  id: string;
  type: "sequence" | "position_preference" | "timing" | "strategic";
  pattern: any;
  frequency: number;
  effectiveness: number;
  confidence: number;
  lastSeen: Date;
  contexts: string[]; // En qué situaciones aparece este patrón
}

export interface BehavioralMetrics {
  aggressiveness: number; // 0-1: tendencia a tomar riesgos altos
  defensiveness: number; // 0-1: tendencia a jugar seguro
  creativity: number; // 0-1: variación en estrategias
  predictability: number; // 0-1: repetición de patrones
  adaptability: number; // 0-1: respuesta a cambios
  patience: number; // 0-1: tiempo de deliberación
  pressure_response: number; // 0-1: rendimiento bajo presión
  learning_rate: number; // 0-1: velocidad de mejora
}

export interface PositionHeatmap {
  [key: string]: {
    frequency: number;
    averageReactionTime: number;
    successRate: number;
    preferredInContext: string[];
  };
}

export class PatternAnalyzer {
  private moveHistory: PlayerMove[] = [];
  private detectedPatterns = new Map<string, MovementPattern>();
  private positionHeatmap: PositionHeatmap = {};
  private behavioralMetrics: BehavioralMetrics;
  private sequenceCache = new Map<string, any>();

  // Configuración de análisis
  private readonly PATTERN_CONFIDENCE_THRESHOLD = 0.3;
  private readonly MINIMUM_PATTERN_FREQUENCY = 3;
  private readonly ANALYSIS_WINDOW_SIZE = 50; // Últimos N movimientos para análisis
  private readonly MAX_HISTORY_SIZE = 1000;

  constructor() {
    this.behavioralMetrics = this.initializeMetrics();
  }

  /**
   * ===================================================================
   * REGISTRO Y ANÁLISIS DE MOVIMIENTOS
   * ===================================================================
   */

  public recordMove(move: PlayerMove): void {
    this.moveHistory.push(move);

    // Limitar tamaño del historial para optimización
    if (this.moveHistory.length > this.MAX_HISTORY_SIZE) {
      this.moveHistory = this.moveHistory.slice(-this.MAX_HISTORY_SIZE);
    }

    // Actualizar heatmap de posiciones
    this.updatePositionHeatmap(move);

    // Ejecutar análisis incremental
    this.performIncrementalAnalysis(move);

    // Actualizar métricas conductuales
    this.updateBehavioralMetrics();
  }

  /**
   * ===================================================================
   * DETECCIÓN DE PATRONES SECUENCIALES
   * ===================================================================
   * Detecta secuencias comunes de movimientos
   */
  public detectSequencePatterns(): MovementPattern[] {
    const sequences = new Map<string, { count: number; moves: PlayerMove[] }>();
    const windowSize = 3; // Detectar secuencias de 3 movimientos

    // Analizar ventana deslizante de movimientos
    for (let i = 0; i <= this.moveHistory.length - windowSize; i++) {
      const sequence = this.moveHistory.slice(i, i + windowSize);
      const sequenceKey = this.generateSequenceKey(sequence);

      if (!sequences.has(sequenceKey)) {
        sequences.set(sequenceKey, { count: 0, moves: sequence });
      }
      sequences.get(sequenceKey)!.count++;
    }

    const patterns: MovementPattern[] = [];

    sequences.forEach((data, key) => {
      if (data.count >= this.MINIMUM_PATTERN_FREQUENCY) {
        const effectiveness = this.calculateSequenceEffectiveness(data.moves);
        const confidence = Math.min(data.count / 10, 1); // Normalizar confianza

        patterns.push({
          id: `seq_${key}`,
          type: "sequence",
          pattern: {
            sequence: data.moves.map((m) => m.position),
            avgReactionTime: this.calculateAverageReactionTime(data.moves),
            contextTriggers: this.identifyContextTriggers(data.moves),
          },
          frequency: data.count,
          effectiveness,
          confidence,
          lastSeen: new Date(Math.max(...data.moves.map((m) => m.timestamp))),
          contexts: this.extractContexts(data.moves),
        });
      }
    });

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * ===================================================================
   * ANÁLISIS DE PREFERENCIAS POSICIONALES
   * ===================================================================
   * Identifica posiciones favoritas y aversiones del jugador
   */
  public analyzePositionPreferences(): MovementPattern[] {
    const preferences: MovementPattern[] = [];

    // Convertir heatmap a array para análisis
    const positionData = Object.entries(this.positionHeatmap)
      .map(([pos, data]) => ({
        position: pos.split(",").map(Number) as [number, number],
        ...data,
      }))
      .sort((a, b) => b.frequency - a.frequency);

    // Identificar posiciones favoritas (top 20%)
    const favoriteCount = Math.ceil(positionData.length * 0.2);
    const favorites = positionData.slice(0, favoriteCount);

    if (favorites.length > 0) {
      preferences.push({
        id: "pos_favorites",
        type: "position_preference",
        pattern: {
          favoritePositions: favorites.map((p) => p.position),
          averageSuccessRate:
            favorites.reduce((sum, p) => sum + p.successRate, 0) /
            favorites.length,
          preferredQuadrants: this.identifyPreferredQuadrants(favorites),
        },
        frequency: favorites.reduce((sum, p) => sum + p.frequency, 0),
        effectiveness:
          favorites.reduce((sum, p) => sum + p.successRate, 0) /
          favorites.length,
        confidence: Math.min(favorites.length / 10, 1),
        lastSeen: new Date(),
        contexts: this.aggregateContexts(favorites),
      });
    }

    // Identificar posiciones evitadas (bottom 20%)
    const avoidedCount = Math.ceil(positionData.length * 0.2);
    const avoided = positionData.slice(-avoidedCount);

    if (avoided.length > 0) {
      preferences.push({
        id: "pos_avoided",
        type: "position_preference",
        pattern: {
          avoidedPositions: avoided.map((p) => p.position),
          avoidanceReasons: this.analyzeAvoidanceReasons(avoided),
          alternativePreferences: this.findAlternativePositions(avoided),
        },
        frequency: -avoided.reduce((sum, p) => sum + p.frequency, 0), // Frecuencia negativa
        effectiveness:
          1 -
          avoided.reduce((sum, p) => sum + p.successRate, 0) / avoided.length,
        confidence: Math.min(avoided.length / 10, 1),
        lastSeen: new Date(),
        contexts: this.aggregateContexts(avoided),
      });
    }

    return preferences;
  }

  /**
   * ===================================================================
   * ANÁLISIS TEMPORAL Y DE TIMING
   * ===================================================================
   * Analiza patrones en los tiempos de reacción y decisión
   */
  public analyzeTimingPatterns(): MovementPattern[] {
    const patterns: MovementPattern[] = [];

    // Analizar distribución de tiempos de reacción
    const reactionTimes = this.moveHistory.map((m) => m.reactionTime);
    const avgReactionTime =
      reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length;
    const reactionTimeVariance = this.calculateVariance(reactionTimes);

    // Patrón de velocidad de decisión
    patterns.push({
      id: "timing_speed",
      type: "timing",
      pattern: {
        averageReactionTime: avgReactionTime,
        variance: reactionTimeVariance,
        fastMoves: reactionTimes.filter((t) => t < avgReactionTime * 0.7)
          .length,
        slowMoves: reactionTimes.filter((t) => t > avgReactionTime * 1.5)
          .length,
        speedConsistency:
          1 - reactionTimeVariance / (avgReactionTime * avgReactionTime),
      },
      frequency: this.moveHistory.length,
      effectiveness: this.correlateSpeedWithSuccess(),
      confidence: Math.min(this.moveHistory.length / 50, 1),
      lastSeen: new Date(),
      contexts: ["timing_analysis"],
    });

    // Patrón de respuesta bajo presión
    const pressureMoves = this.moveHistory.filter(
      (m) =>
        m.gameContext.timeRemaining < 10 ||
        m.gameContext.score.ai > m.gameContext.score.player,
    );

    if (pressureMoves.length >= 5) {
      const pressureAvgTime =
        pressureMoves.reduce((sum, m) => sum + m.reactionTime, 0) /
        pressureMoves.length;
      const pressureSuccessRate =
        pressureMoves.filter(
          (m) => m.outcome === "success" || m.outcome === "brilliant",
        ).length / pressureMoves.length;

      patterns.push({
        id: "timing_pressure",
        type: "timing",
        pattern: {
          pressureReactionTime: pressureAvgTime,
          normalReactionTime: avgReactionTime,
          pressurePerformanceRatio: pressureSuccessRate,
          pressureSpeedChange:
            (pressureAvgTime - avgReactionTime) / avgReactionTime,
        },
        frequency: pressureMoves.length,
        effectiveness: pressureSuccessRate,
        confidence: Math.min(pressureMoves.length / 20, 1),
        lastSeen: new Date(Math.max(...pressureMoves.map((m) => m.timestamp))),
        contexts: ["pressure", "time_constraint"],
      });
    }

    return patterns;
  }

  /**
   * ===================================================================
   * ANÁLISIS ESTRATÉGICO
   * ===================================================================
   * Identifica patrones estratégicos de alto nivel
   */
  public analyzeStrategicPatterns(): MovementPattern[] {
    const patterns: MovementPattern[] = [];

    // Analizar tendencias ofensivas vs defensivas
    const offensiveMoves = this.moveHistory.filter((m) =>
      this.isOffensiveMove(m),
    );
    const defensiveMoves = this.moveHistory.filter((m) =>
      this.isDefensiveMove(m),
    );

    patterns.push({
      id: "strategy_aggression",
      type: "strategic",
      pattern: {
        offensiveRatio: offensiveMoves.length / this.moveHistory.length,
        defensiveRatio: defensiveMoves.length / this.moveHistory.length,
        aggressionTrend: this.calculateAggressionTrend(),
        contextualAggression: this.analyzeContextualAggression(),
      },
      frequency: this.moveHistory.length,
      effectiveness: this.calculateStrategicEffectiveness("aggression"),
      confidence: Math.min(this.moveHistory.length / 30, 1),
      lastSeen: new Date(),
      contexts: ["strategic_analysis"],
    });

    // Analizar adaptabilidad estratégica
    const adaptationInstances = this.detectAdaptationInstances();
    if (adaptationInstances.length > 0) {
      patterns.push({
        id: "strategy_adaptation",
        type: "strategic",
        pattern: {
          adaptationFrequency: adaptationInstances.length,
          adaptationTriggers:
            this.identifyAdaptationTriggers(adaptationInstances),
          adaptationEffectiveness:
            this.calculateAdaptationEffectiveness(adaptationInstances),
          adaptationSpeed: this.calculateAdaptationSpeed(adaptationInstances),
        },
        frequency: adaptationInstances.length,
        effectiveness:
          this.calculateAdaptationEffectiveness(adaptationInstances),
        confidence: Math.min(adaptationInstances.length / 10, 1),
        lastSeen: new Date(),
        contexts: ["adaptation", "strategic_change"],
      });
    }

    return patterns;
  }

  /**
   * ===================================================================
   * PREDICCIÓN DE MOVIMIENTOS FUTUROS
   * ===================================================================
   */
  public predictNextMoves(
    gameContext: any,
    count: number = 3,
  ): Array<{
    position: [number, number];
    probability: number;
    reasoning: string;
  }> {
    const predictions: Array<{
      position: [number, number];
      probability: number;
      reasoning: string;
    }> = [];

    // Combinar diferentes tipos de predicción
    const sequencePredictions = this.predictFromSequences(gameContext);
    const positionPredictions =
      this.predictFromPositionPreferences(gameContext);
    const contextPredictions = this.predictFromContext(gameContext);

    // Fusionar predicciones con pesos
    const combinedPredictions = this.combinePredictions([
      { predictions: sequencePredictions, weight: 0.4 },
      { predictions: positionPredictions, weight: 0.3 },
      { predictions: contextPredictions, weight: 0.3 },
    ]);

    return combinedPredictions.slice(0, count);
  }

  /**
   * ===================================================================
   * CÁLCULO DE MÉTRICAS CONDUCTUALES
   * ===================================================================
   */
  public updateBehavioralMetrics(): void {
    if (this.moveHistory.length < 5) return;

    const recentMoves = this.moveHistory.slice(-this.ANALYSIS_WINDOW_SIZE);

    // Agresividad: frecuencia de movimientos de alto riesgo
    this.behavioralMetrics.aggressiveness =
      this.calculateAggressiveness(recentMoves);

    // Defensividad: tendencia a bloquear y jugar seguro
    this.behavioralMetrics.defensiveness =
      this.calculateDefensiveness(recentMoves);

    // Creatividad: variación en estrategias y posiciones
    this.behavioralMetrics.creativity = this.calculateCreativity(recentMoves);

    // Predictibilidad: repetición de patrones
    this.behavioralMetrics.predictability =
      this.calculatePredictability(recentMoves);

    // Adaptabilidad: respuesta a cambios en el contexto
    this.behavioralMetrics.adaptability =
      this.calculateAdaptability(recentMoves);

    // Paciencia: tiempo promedio de deliberación
    this.behavioralMetrics.patience = this.calculatePatience(recentMoves);

    // Respuesta bajo presión
    this.behavioralMetrics.pressure_response =
      this.calculatePressureResponse(recentMoves);

    // Tasa de aprendizaje
    this.behavioralMetrics.learning_rate = this.calculateLearningRate();
  }

  /**
   * ===================================================================
   * MÉTODOS PÚBLICOS DE ACCESO
   * ===================================================================
   */

  public getDetectedPatterns(): MovementPattern[] {
    return Array.from(this.detectedPatterns.values());
  }

  public getBehavioralMetrics(): BehavioralMetrics {
    return { ...this.behavioralMetrics };
  }

  public getPositionHeatmap(): PositionHeatmap {
    return { ...this.positionHeatmap };
  }

  public getMoveHistory(limit?: number): PlayerMove[] {
    return limit ? this.moveHistory.slice(-limit) : [...this.moveHistory];
  }

  public updatePatterns(existingPatterns: any, context: any): any {
    // Método para integración con el sistema existente
    this.performFullAnalysis();
    return {
      favoritePositions: this.getFavoritePositions(),
      avgReactionTime: this.getAverageReactionTime(),
      predictabilityScore: this.behavioralMetrics.predictability,
      creativityScore: this.behavioralMetrics.creativity,
      riskTolerance: this.behavioralMetrics.aggressiveness,
      adaptabilityScore: this.behavioralMetrics.adaptability,
    };
  }

  public calculateSimilarity(
    position: [number, number],
    favoritePositions: [number, number][],
  ): number {
    if (favoritePositions.length === 0) return 0;

    const distances = favoritePositions.map((fav) =>
      Math.sqrt(
        Math.pow(position[0] - fav[0], 2) + Math.pow(position[1] - fav[1], 2),
      ),
    );

    const minDistance = Math.min(...distances);
    return Math.max(0, 1 - minDistance / 8); // Normalizar para tablero 8x8
  }

  /**
   * ===================================================================
   * MÉTODOS AUXILIARES PRIVADOS
   * ===================================================================
   */

  private initializeMetrics(): BehavioralMetrics {
    return {
      aggressiveness: 0.5,
      defensiveness: 0.5,
      creativity: 0.5,
      predictability: 0.5,
      adaptability: 0.5,
      patience: 0.5,
      pressure_response: 0.5,
      learning_rate: 0.5,
    };
  }

  private performIncrementalAnalysis(newMove: PlayerMove): void {
    // Actualizar patrones existentes con el nuevo movimiento
    this.updateExistingPatterns(newMove);

    // Detectar nuevos patrones si hay suficientes datos
    if (this.moveHistory.length % 10 === 0) {
      this.performFullAnalysis();
    }
  }

  private performFullAnalysis(): void {
    // Limpiar patrones obsoletos
    this.cleanupObsoletePatterns();

    // Detectar todos los tipos de patrones
    const sequencePatterns = this.detectSequencePatterns();
    const positionPatterns = this.analyzePositionPreferences();
    const timingPatterns = this.analyzeTimingPatterns();
    const strategicPatterns = this.analyzeStrategicPatterns();

    // Actualizar mapa de patrones detectados
    [
      ...sequencePatterns,
      ...positionPatterns,
      ...timingPatterns,
      ...strategicPatterns,
    ].forEach((pattern) => {
      this.detectedPatterns.set(pattern.id, pattern);
    });
  }

  private updatePositionHeatmap(move: PlayerMove): void {
    const key = `${move.position[0]},${move.position[1]}`;

    if (!this.positionHeatmap[key]) {
      this.positionHeatmap[key] = {
        frequency: 0,
        averageReactionTime: 0,
        successRate: 0,
        preferredInContext: [],
      };
    }

    const data = this.positionHeatmap[key];
    data.frequency++;
    data.averageReactionTime =
      (data.averageReactionTime * (data.frequency - 1) + move.reactionTime) /
      data.frequency;

    const isSuccess =
      move.outcome === "success" || move.outcome === "brilliant";
    data.successRate =
      (data.successRate * (data.frequency - 1) + (isSuccess ? 1 : 0)) /
      data.frequency;
  }

  // Implementaciones básicas de métodos auxiliares (se pueden expandir)
  private generateSequenceKey(sequence: PlayerMove[]): string {
    return sequence.map((m) => `${m.position[0]}-${m.position[1]}`).join("|");
  }

  private calculateSequenceEffectiveness(moves: PlayerMove[]): number {
    const successCount = moves.filter(
      (m) => m.outcome === "success" || m.outcome === "brilliant",
    ).length;
    return successCount / moves.length;
  }

  private calculateAverageReactionTime(moves: PlayerMove[]): number {
    return moves.reduce((sum, m) => sum + m.reactionTime, 0) / moves.length;
  }

  private getFavoritePositions(): [number, number][] {
    return Object.entries(this.positionHeatmap)
      .sort(([, a], [, b]) => b.frequency - a.frequency)
      .slice(0, 5)
      .map(([pos]) => pos.split(",").map(Number) as [number, number]);
  }

  private getAverageReactionTime(): number {
    if (this.moveHistory.length === 0) return 2000;
    return (
      this.moveHistory.reduce((sum, m) => sum + m.reactionTime, 0) /
      this.moveHistory.length
    );
  }

  // Métodos placeholder que se implementarían completamente
  private identifyContextTriggers(moves: PlayerMove[]): string[] {
    return [];
  }
  private extractContexts(moves: PlayerMove[]): string[] {
    return [];
  }
  private identifyPreferredQuadrants(positions: any[]): string[] {
    return [];
  }
  private aggregateContexts(positions: any[]): string[] {
    return [];
  }
  private analyzeAvoidanceReasons(positions: any[]): string[] {
    return [];
  }
  private findAlternativePositions(avoided: any[]): [number, number][] {
    return [];
  }
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    return (
      values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length
    );
  }
  private correlateSpeedWithSuccess(): number {
    return 0.5;
  }
  private isOffensiveMove(move: PlayerMove): boolean {
    return false;
  }
  private isDefensiveMove(move: PlayerMove): boolean {
    return false;
  }
  private calculateAggressionTrend(): number {
    return 0.5;
  }
  private analyzeContextualAggression(): any {
    return {};
  }
  private calculateStrategicEffectiveness(type: string): number {
    return 0.5;
  }
  private detectAdaptationInstances(): any[] {
    return [];
  }
  private identifyAdaptationTriggers(instances: any[]): string[] {
    return [];
  }
  private calculateAdaptationEffectiveness(instances: any[]): number {
    return 0.5;
  }
  private calculateAdaptationSpeed(instances: any[]): number {
    return 0.5;
  }
  private predictFromSequences(context: any): any[] {
    return [];
  }
  private predictFromPositionPreferences(context: any): any[] {
    return [];
  }
  private predictFromContext(context: any): any[] {
    return [];
  }
  private combinePredictions(predictions: any[]): any[] {
    return [];
  }
  private calculateAggressiveness(moves: PlayerMove[]): number {
    return 0.5;
  }
  private calculateDefensiveness(moves: PlayerMove[]): number {
    return 0.5;
  }
  private calculateCreativity(moves: PlayerMove[]): number {
    return 0.5;
  }
  private calculatePredictability(moves: PlayerMove[]): number {
    return 0.5;
  }
  private calculateAdaptability(moves: PlayerMove[]): number {
    return 0.5;
  }
  private calculatePatience(moves: PlayerMove[]): number {
    return 0.5;
  }
  private calculatePressureResponse(moves: PlayerMove[]): number {
    return 0.5;
  }
  private calculateLearningRate(): number {
    return 0.5;
  }
  private updateExistingPatterns(move: PlayerMove): void {}
  private cleanupObsoletePatterns(): void {}
}
