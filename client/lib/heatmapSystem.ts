export interface HeatmapData {
  position: [number, number];
  intensity: number;
  type: "decision" | "success" | "failure" | "hesitation" | "prediction";
  timestamp: number;
  metadata?: any;
}

export interface HeatmapZone {
  id: string;
  bounds: { minRow: number; maxRow: number; minCol: number; maxCol: number };
  intensity: number;
  type: string;
  description: string;
}

export class HeatmapAnalyzer {
  private heatmapData: HeatmapData[] = [];
  private zones: Map<string, HeatmapZone> = new Map();
  private maxIntensity: number = 0;

  addDataPoint(data: HeatmapData): void {
    this.heatmapData.push(data);
    this.maxIntensity = Math.max(this.maxIntensity, data.intensity);

    // Keep only last 1000 data points for performance
    if (this.heatmapData.length > 1000) {
      this.heatmapData.shift();
    }

    this.updateZones();
  }

  getHeatmapForBoard(boardSize: number = 8): Map<string, number> {
    const heatmap = new Map<string, number>();

    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const cellKey = `${row},${col}`;
        const intensity = this.calculateCellIntensity(row, col);
        heatmap.set(cellKey, intensity);
      }
    }

    return heatmap;
  }

  private calculateCellIntensity(row: number, col: number): number {
    let totalIntensity = 0;
    let count = 0;

    // Calculate base intensity from direct hits
    const directHits = this.heatmapData.filter(
      (data) => data.position[0] === row && data.position[1] === col,
    );

    directHits.forEach((hit) => {
      totalIntensity += hit.intensity;
      count++;
    });

    // Add influence from nearby cells (gaussian blur effect)
    this.heatmapData.forEach((data) => {
      const [dataRow, dataCol] = data.position;
      const distance = Math.sqrt(
        Math.pow(row - dataRow, 2) + Math.pow(col - dataCol, 2),
      );

      if (distance > 0 && distance <= 2) {
        const influence =
          data.intensity * Math.exp((-distance * distance) / 2) * 0.3;
        totalIntensity += influence;
      }
    });

    return Math.min(this.maxIntensity, totalIntensity);
  }

  getDecisionHeatmap(): Map<string, number> {
    return this.getFilteredHeatmap("decision");
  }

  getSuccessHeatmap(): Map<string, number> {
    return this.getFilteredHeatmap("success");
  }

  getHesitationHeatmap(): Map<string, number> {
    return this.getFilteredHeatmap("hesitation");
  }

  getPredictionHeatmap(): Map<string, number> {
    return this.getFilteredHeatmap("prediction");
  }

  private getFilteredHeatmap(type: string): Map<string, number> {
    const filteredData = this.heatmapData.filter((data) => data.type === type);
    const heatmap = new Map<string, number>();

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const cellKey = `${row},${col}`;
        let intensity = 0;

        filteredData.forEach((data) => {
          const [dataRow, dataCol] = data.position;
          const distance = Math.sqrt(
            Math.pow(row - dataRow, 2) + Math.pow(col - dataCol, 2),
          );

          if (distance === 0) {
            intensity += data.intensity;
          } else if (distance <= 1.5) {
            intensity += data.intensity * Math.exp(-distance) * 0.5;
          }
        });

        heatmap.set(cellKey, intensity);
      }
    }

    return heatmap;
  }

  private updateZones(): void {
    // Clear existing zones
    this.zones.clear();

    // Identify hot zones (high activity areas)
    const hotSpots = this.identifyHotSpots();
    hotSpots.forEach((spot, index) => {
      this.zones.set(`hot_${index}`, {
        id: `hot_${index}`,
        bounds: spot.bounds,
        intensity: spot.intensity,
        type: "hot",
        description: `Zona de alta actividad (${spot.intensity.toFixed(1)})`,
      });
    });

    // Identify cold zones (low activity areas)
    const coldSpots = this.identifyColdSpots();
    coldSpots.forEach((spot, index) => {
      this.zones.set(`cold_${index}`, {
        id: `cold_${index}`,
        bounds: spot.bounds,
        intensity: spot.intensity,
        type: "cold",
        description: `Zona evitada (${spot.intensity.toFixed(1)})`,
      });
    });

    // Identify pattern zones
    const patterns = this.identifyPatternZones();
    patterns.forEach((pattern, index) => {
      this.zones.set(`pattern_${index}`, {
        id: `pattern_${index}`,
        bounds: pattern.bounds,
        intensity: pattern.intensity,
        type: "pattern",
        description: pattern.description,
      });
    });
  }

  private identifyHotSpots(): any[] {
    const hotSpots = [];
    const threshold = this.maxIntensity * 0.7;

    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        let totalIntensity = 0;

        // Check 3x3 area
        for (let r = row; r < row + 3; r++) {
          for (let c = col; c < col + 3; c++) {
            totalIntensity += this.calculateCellIntensity(r, c);
          }
        }

        if (totalIntensity > threshold) {
          hotSpots.push({
            bounds: {
              minRow: row,
              maxRow: row + 2,
              minCol: col,
              maxCol: col + 2,
            },
            intensity: totalIntensity / 9,
          });
        }
      }
    }

    return hotSpots;
  }

  private identifyColdSpots(): any[] {
    const coldSpots = [];
    const threshold = this.maxIntensity * 0.1;

    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        let totalIntensity = 0;

        // Check 3x3 area
        for (let r = row; r < row + 3; r++) {
          for (let c = col; c < col + 3; c++) {
            totalIntensity += this.calculateCellIntensity(r, c);
          }
        }

        if (totalIntensity < threshold) {
          coldSpots.push({
            bounds: {
              minRow: row,
              maxRow: row + 2,
              minCol: col,
              maxCol: col + 2,
            },
            intensity: totalIntensity / 9,
          });
        }
      }
    }

    return coldSpots;
  }

  private identifyPatternZones(): any[] {
    const patterns = [];

    // Identify line patterns
    this.identifyLinePatterns().forEach((pattern) => patterns.push(pattern));

    // Identify corner preferences
    this.identifyCornerPatterns().forEach((pattern) => patterns.push(pattern));

    // Identify center patterns
    this.identifyCenterPatterns().forEach((pattern) => patterns.push(pattern));

    return patterns;
  }

  private identifyLinePatterns(): any[] {
    const patterns = [];

    // Horizontal lines
    for (let row = 0; row < 8; row++) {
      let intensity = 0;
      for (let col = 0; col < 8; col++) {
        intensity += this.calculateCellIntensity(row, col);
      }

      if (intensity > this.maxIntensity * 3) {
        patterns.push({
          bounds: { minRow: row, maxRow: row, minCol: 0, maxCol: 7 },
          intensity: intensity / 8,
          description: `Preferencia línea horizontal ${row + 1}`,
        });
      }
    }

    // Vertical lines
    for (let col = 0; col < 8; col++) {
      let intensity = 0;
      for (let row = 0; row < 8; row++) {
        intensity += this.calculateCellIntensity(row, col);
      }

      if (intensity > this.maxIntensity * 3) {
        patterns.push({
          bounds: { minRow: 0, maxRow: 7, minCol: col, maxCol: col },
          intensity: intensity / 8,
          description: `Preferencia línea vertical ${col + 1}`,
        });
      }
    }

    return patterns;
  }

  private identifyCornerPatterns(): any[] {
    const patterns = [];
    const corners = [
      {
        name: "superior-izquierda",
        bounds: { minRow: 0, maxRow: 2, minCol: 0, maxCol: 2 },
      },
      {
        name: "superior-derecha",
        bounds: { minRow: 0, maxRow: 2, minCol: 5, maxCol: 7 },
      },
      {
        name: "inferior-izquierda",
        bounds: { minRow: 5, maxRow: 7, minCol: 0, maxCol: 2 },
      },
      {
        name: "inferior-derecha",
        bounds: { minRow: 5, maxRow: 7, minCol: 5, maxCol: 7 },
      },
    ];

    corners.forEach((corner) => {
      let intensity = 0;
      let count = 0;

      for (let row = corner.bounds.minRow; row <= corner.bounds.maxRow; row++) {
        for (
          let col = corner.bounds.minCol;
          col <= corner.bounds.maxCol;
          col++
        ) {
          intensity += this.calculateCellIntensity(row, col);
          count++;
        }
      }

      if (intensity > this.maxIntensity * 1.5) {
        patterns.push({
          bounds: corner.bounds,
          intensity: intensity / count,
          description: `Preferencia esquina ${corner.name}`,
        });
      }
    });

    return patterns;
  }

  private identifyCenterPatterns(): any[] {
    const patterns = [];
    let centerIntensity = 0;

    // Check center 4x4 area
    for (let row = 2; row < 6; row++) {
      for (let col = 2; col < 6; col++) {
        centerIntensity += this.calculateCellIntensity(row, col);
      }
    }

    if (centerIntensity > this.maxIntensity * 2) {
      patterns.push({
        bounds: { minRow: 2, maxRow: 5, minCol: 2, maxCol: 5 },
        intensity: centerIntensity / 16,
        description: "Estrategia centrada",
      });
    }

    return patterns;
  }

  getZones(): HeatmapZone[] {
    return Array.from(this.zones.values());
  }

  getZoneAnalysis(): any {
    const zones = this.getZones();

    return {
      totalZones: zones.length,
      hotZones: zones.filter((z) => z.type === "hot").length,
      coldZones: zones.filter((z) => z.type === "cold").length,
      patternZones: zones.filter((z) => z.type === "pattern").length,
      averageIntensity:
        zones.reduce((sum, z) => sum + z.intensity, 0) / zones.length || 0,
      maxZoneIntensity: Math.max(...zones.map((z) => z.intensity), 0),
      coverage: this.calculateBoardCoverage(),
    };
  }

  private calculateBoardCoverage(): number {
    let coveredCells = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.calculateCellIntensity(row, col) > 0.1) {
          coveredCells++;
        }
      }
    }

    return coveredCells / 64; // Percentage of board covered
  }

  generateInsights(): string[] {
    const insights = [];
    const analysis = this.getZoneAnalysis();

    if (analysis.hotZones > 3) {
      insights.push(
        "Tienes múltiples zonas preferidas - estrategia diversificada",
      );
    } else if (analysis.hotZones === 1) {
      insights.push("Te concentras en una zona específica - patrón predecible");
    }

    if (analysis.coldZones > 2) {
      insights.push("Evitas ciertas áreas del tablero - considera explorarlas");
    }

    if (analysis.coverage < 0.5) {
      insights.push("Usas menos del 50% del tablero - expande tu territorio");
    } else if (analysis.coverage > 0.8) {
      insights.push("Excelente cobertura del tablero - estrategia balanceada");
    }

    if (analysis.patternZones > 0) {
      insights.push(
        `Detectados ${analysis.patternZones} patrones estratégicos claros`,
      );
    }

    return insights;
  }

  exportHeatmapData(): any {
    return {
      rawData: this.heatmapData.slice(-100), // Last 100 points
      zones: Array.from(this.zones.values()),
      analysis: this.getZoneAnalysis(),
      insights: this.generateInsights(),
      timestamp: Date.now(),
    };
  }

  clearData(): void {
    this.heatmapData = [];
    this.zones.clear();
    this.maxIntensity = 0;
  }
}

// Movement Predictor System
export class MovementPredictor {
  private predictionModel: Map<string, number> = new Map();
  private lastPredictions: Array<{
    position: [number, number];
    confidence: number;
  }> = [];

  updatePredictions(
    gameState: any,
    playerPatterns: any[],
    aiAnalysis: any,
  ): Map<string, number> {
    this.predictionModel.clear();

    // Get empty cells
    const emptyCells = this.getEmptyCells(gameState.board);

    emptyCells.forEach(([row, col]) => {
      const probability = this.calculateMoveProbability(
        [row, col],
        gameState,
        playerPatterns,
        aiAnalysis,
      );

      this.predictionModel.set(`${row},${col}`, probability);
    });

    return new Map(this.predictionModel);
  }

  private calculateMoveProbability(
    position: [number, number],
    gameState: any,
    patterns: any[],
    aiAnalysis: any,
  ): number {
    let probability = 0;

    // Factor 1: Pattern continuation
    probability += this.calculatePatternProbability(position, patterns) * 0.4;

    // Factor 2: Strategic value
    probability += this.calculateStrategicValue(position, gameState) * 0.3;

    // Factor 3: Emotional state influence
    probability += this.calculateEmotionalInfluence(position, patterns) * 0.2;

    // Factor 4: Distance from last move
    probability += this.calculateDistanceInfluence(position, patterns) * 0.1;

    return Math.min(1, Math.max(0, probability));
  }

  private calculatePatternProbability(
    position: [number, number],
    patterns: any[],
  ): number {
    if (patterns.length < 3) return 0.5;

    const recentMoves = patterns.slice(-5).map((p) => p.position);
    const [targetRow, targetCol] = position;

    // Calculate movement vectors
    const vectors = [];
    for (let i = 1; i < recentMoves.length; i++) {
      const prev = recentMoves[i - 1];
      const curr = recentMoves[i];
      vectors.push([curr[0] - prev[0], curr[1] - prev[1]]);
    }

    if (vectors.length === 0) return 0.5;

    // Average vector
    const avgVector = vectors
      .reduce((acc, vec) => [acc[0] + vec[0], acc[1] + vec[1]], [0, 0])
      .map((sum) => sum / vectors.length);

    // Predict next position based on pattern
    const lastMove = recentMoves[recentMoves.length - 1];
    const predictedRow = lastMove[0] + avgVector[0];
    const predictedCol = lastMove[1] + avgVector[1];

    // Calculate distance from prediction
    const distance = Math.sqrt(
      Math.pow(targetRow - predictedRow, 2) +
        Math.pow(targetCol - predictedCol, 2),
    );

    return Math.exp(-distance / 2); // Closer to prediction = higher probability
  }

  private calculateStrategicValue(
    position: [number, number],
    gameState: any,
  ): number {
    const [row, col] = position;
    let value = 0;

    // Corner bonus
    if ((row === 0 || row === 7) && (col === 0 || col === 7)) {
      value += 0.3;
    }

    // Edge bonus
    if (row === 0 || row === 7 || col === 0 || col === 7) {
      value += 0.1;
    }

    // Center bonus
    if (row >= 3 && row <= 4 && col >= 3 && col <= 4) {
      value += 0.2;
    }

    // Adjacent to own pieces bonus
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];
    let adjacentOwn = 0;

    directions.forEach(([dRow, dCol]) => {
      const newRow = row + dRow;
      const newCol = col + dCol;

      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        if (gameState.board[newRow][newCol].owner === "player") {
          adjacentOwn++;
        }
      }
    });

    value += (adjacentOwn / 8) * 0.2;

    return value;
  }

  private calculateEmotionalInfluence(
    position: [number, number],
    patterns: any[],
  ): number {
    if (patterns.length === 0) return 0.5;

    const lastPattern = patterns[patterns.length - 1];
    const [row, col] = position;

    switch (lastPattern.emotionalState) {
      case "frustrated":
        // More likely to make random moves
        return 0.3 + Math.random() * 0.4;

      case "confident":
        // More likely to make bold moves (corners, edges)
        return row === 0 || row === 7 || col === 0 || col === 7 ? 0.8 : 0.3;

      case "rushed":
        // More likely to choose nearby positions
        const lastPos = lastPattern.position;
        const distance =
          Math.abs(row - lastPos[0]) + Math.abs(col - lastPos[1]);
        return Math.max(0, 1 - distance / 4);

      default:
        return 0.5;
    }
  }

  private calculateDistanceInfluence(
    position: [number, number],
    patterns: any[],
  ): number {
    if (patterns.length === 0) return 0.5;

    const lastMove = patterns[patterns.length - 1].position;
    const [row, col] = position;
    const distance = Math.abs(row - lastMove[0]) + Math.abs(col - lastMove[1]);

    // Moderate distance is most likely (not too close, not too far)
    if (distance >= 2 && distance <= 4) {
      return 0.8;
    } else if (distance === 1) {
      return 0.6;
    } else {
      return 0.3;
    }
  }

  private getEmptyCells(board: any[][]): [number, number][] {
    const empty: [number, number][] = [];
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j].type === "empty") {
          empty.push([i, j]);
        }
      }
    }
    return empty;
  }

  getTopPredictions(
    count: number = 5,
  ): Array<{ position: [number, number]; confidence: number }> {
    const predictions = Array.from(this.predictionModel.entries())
      .map(([key, value]) => {
        const [row, col] = key.split(",").map(Number);
        return { position: [row, col] as [number, number], confidence: value };
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, count);

    this.lastPredictions = predictions;
    return predictions;
  }

  validatePrediction(actualMove: [number, number]): number {
    const prediction = this.lastPredictions.find(
      (p) => p.position[0] === actualMove[0] && p.position[1] === actualMove[1],
    );

    return prediction ? prediction.confidence : 0;
  }

  getPredictionAccuracy(): number {
    // This would be calculated based on historical validation
    return Math.random() * 0.5 + 0.4; // Simulated for now
  }
}
