// Mock del sistema de heatmap para análisis de patrones de juego

export interface HeatmapData {
  x: number;
  y: number;
  intensity: number;
  timestamp: number;
}

export interface MovementPattern {
  sequence: Array<{ x: number; y: number; time: number }>;
  efficiency: number;
  predictability: number;
}

export class HeatmapAnalyzer {
  private heatmapData: HeatmapData[] = [];
  private maxDataPoints: number = 1000;

  addInteraction(x: number, y: number): void {
    const existing = this.heatmapData.find(
      (point) => point.x === x && point.y === y,
    );

    if (existing) {
      existing.intensity += 1;
      existing.timestamp = Date.now();
    } else {
      this.heatmapData.push({
        x,
        y,
        intensity: 1,
        timestamp: Date.now(),
      });
    }

    // Limitar el número de puntos de datos
    if (this.heatmapData.length > this.maxDataPoints) {
      this.heatmapData.sort((a, b) => b.timestamp - a.timestamp);
      this.heatmapData = this.heatmapData.slice(0, this.maxDataPoints);
    }
  }

  getHotspots(threshold: number = 5): HeatmapData[] {
    return this.heatmapData.filter((point) => point.intensity >= threshold);
  }

  getColdSpots(threshold: number = 2): Array<{ x: number; y: number }> {
    const boardSize = 8; // Tamaño del tablero
    const coldSpots: Array<{ x: number; y: number }> = [];

    for (let x = 0; x < boardSize; x++) {
      for (let y = 0; y < boardSize; y++) {
        const point = this.heatmapData.find((p) => p.x === x && p.y === y);
        if (!point || point.intensity < threshold) {
          coldSpots.push({ x, y });
        }
      }
    }

    return coldSpots;
  }

  getHeatmapIntensity(x: number, y: number): number {
    const point = this.heatmapData.find((p) => p.x === x && p.y === y);
    return point ? point.intensity : 0;
  }

  generateHeatmapVisualization(): string[][] {
    const boardSize = 8;
    const visualization: string[][] = [];

    for (let y = 0; y < boardSize; y++) {
      const row: string[] = [];
      for (let x = 0; x < boardSize; x++) {
        const intensity = this.getHeatmapIntensity(x, y);
        if (intensity === 0) row.push("⬜");
        else if (intensity < 3) row.push("🟦");
        else if (intensity < 6) row.push("🟨");
        else if (intensity < 10) row.push("🟧");
        else row.push("🟥");
      }
      visualization.push(row);
    }

    return visualization;
  }

  reset(): void {
    this.heatmapData = [];
  }

  getAnalytics() {
    const totalInteractions = this.heatmapData.reduce(
      (sum, point) => sum + point.intensity,
      0,
    );
    const uniquePositions = this.heatmapData.length;
    const averageIntensity = totalInteractions / (uniquePositions || 1);

    return {
      totalInteractions,
      uniquePositions,
      averageIntensity,
      hotspotCount: this.getHotspots().length,
      coldspotCount: this.getColdSpots().length,
      coveragePercentage: (uniquePositions / 64) * 100, // 8x8 board
    };
  }
}

export class MovementPredictor {
  private movementHistory: MovementPattern[] = [];
  private maxHistorySize: number = 50;

  recordMovement(
    sequence: Array<{ x: number; y: number; time: number }>,
  ): void {
    if (sequence.length < 2) return;

    const efficiency = this.calculateEfficiency(sequence);
    const predictability = this.calculatePredictability(sequence);

    const pattern: MovementPattern = {
      sequence,
      efficiency,
      predictability,
    };

    this.movementHistory.push(pattern);

    if (this.movementHistory.length > this.maxHistorySize) {
      this.movementHistory.shift();
    }
  }

  predictNextMove(
    currentSequence: Array<{ x: number; y: number; time: number }>,
  ): { x: number; y: number; confidence: number } | null {
    if (currentSequence.length < 2) return null;

    // Buscar patrones similares en el historial
    const similarPatterns = this.findSimilarPatterns(currentSequence);

    if (similarPatterns.length === 0) {
      return this.getRandomPrediction();
    }

    // Predecir basado en patrones similares
    const predictions = similarPatterns.map((pattern) => {
      const nextIndex = currentSequence.length;
      return (
        pattern.sequence[nextIndex] ||
        pattern.sequence[pattern.sequence.length - 1]
      );
    });

    // Calcular la posición más probable
    const positionCounts = new Map<string, number>();
    predictions.forEach((pos) => {
      const key = `${pos.x},${pos.y}`;
      positionCounts.set(key, (positionCounts.get(key) || 0) + 1);
    });

    let maxCount = 0;
    let bestPosition = { x: 0, y: 0 };
    positionCounts.forEach((count, key) => {
      if (count > maxCount) {
        maxCount = count;
        const [x, y] = key.split(",").map(Number);
        bestPosition = { x, y };
      }
    });

    const confidence = maxCount / predictions.length;

    return {
      ...bestPosition,
      confidence,
    };
  }

  private calculateEfficiency(
    sequence: Array<{ x: number; y: number; time: number }>,
  ): number {
    if (sequence.length < 2) return 0;

    let totalDistance = 0;
    let totalTime = 0;

    for (let i = 1; i < sequence.length; i++) {
      const prev = sequence[i - 1];
      const curr = sequence[i];

      const distance = Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2),
      );
      const time = curr.time - prev.time;

      totalDistance += distance;
      totalTime += time;
    }

    // Eficiencia = distancia / tiempo (más eficiente = menos tiempo por distancia)
    return totalTime > 0 ? totalDistance / totalTime : 0;
  }

  private calculatePredictability(
    sequence: Array<{ x: number; y: number; time: number }>,
  ): number {
    if (sequence.length < 3) return 0;

    let consistentMoves = 0;
    const directions: Array<{ dx: number; dy: number }> = [];

    for (let i = 1; i < sequence.length; i++) {
      const prev = sequence[i - 1];
      const curr = sequence[i];
      directions.push({
        dx: curr.x - prev.x,
        dy: curr.y - prev.y,
      });
    }

    // Contar movimientos en la misma dirección
    for (let i = 1; i < directions.length; i++) {
      const prevDir = directions[i - 1];
      const currDir = directions[i];

      if (prevDir.dx === currDir.dx && prevDir.dy === currDir.dy) {
        consistentMoves++;
      }
    }

    return directions.length > 0 ? consistentMoves / directions.length : 0;
  }

  private findSimilarPatterns(
    targetSequence: Array<{ x: number; y: number; time: number }>,
  ): MovementPattern[] {
    const threshold = 0.7; // Umbral de similitud

    return this.movementHistory.filter((pattern) => {
      if (pattern.sequence.length < targetSequence.length) return false;

      let matchingMoves = 0;
      const compareLength = Math.min(
        targetSequence.length,
        pattern.sequence.length,
      );

      for (let i = 0; i < compareLength; i++) {
        const target = targetSequence[i];
        const pattern_move = pattern.sequence[i];

        if (target.x === pattern_move.x && target.y === pattern_move.y) {
          matchingMoves++;
        }
      }

      const similarity = matchingMoves / compareLength;
      return similarity >= threshold;
    });
  }

  private getRandomPrediction(): { x: number; y: number; confidence: number } {
    return {
      x: Math.floor(Math.random() * 8),
      y: Math.floor(Math.random() * 8),
      confidence: 0.1, // Baja confianza para predicciones aleatorias
    };
  }

  getMovementAnalytics() {
    if (this.movementHistory.length === 0) {
      return {
        averageEfficiency: 0,
        averagePredictability: 0,
        totalPatterns: 0,
        mostEfficientPattern: null,
        mostPredictablePattern: null,
      };
    }

    const efficiencies = this.movementHistory.map((p) => p.efficiency);
    const predictabilities = this.movementHistory.map((p) => p.predictability);

    const averageEfficiency =
      efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length;
    const averagePredictability =
      predictabilities.reduce((sum, pred) => sum + pred, 0) /
      predictabilities.length;

    const mostEfficientPattern = this.movementHistory.reduce((best, current) =>
      current.efficiency > best.efficiency ? current : best,
    );

    const mostPredictablePattern = this.movementHistory.reduce(
      (best, current) =>
        current.predictability > best.predictability ? current : best,
    );

    return {
      averageEfficiency,
      averagePredictability,
      totalPatterns: this.movementHistory.length,
      mostEfficientPattern,
      mostPredictablePattern,
    };
  }

  reset(): void {
    this.movementHistory = [];
  }
}

export default { HeatmapAnalyzer, MovementPredictor };
