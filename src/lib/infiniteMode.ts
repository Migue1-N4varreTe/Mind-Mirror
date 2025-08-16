// Motor de modo infinito para expansión dinámica del juego

export interface InfiniteConfig {
  initialSize: number;
  expansionRate: number;
  maxSize: number;
  difficultyScaling: number;
  rewardMultiplier: number;
}

export interface InfiniteChunk {
  id: string;
  x: number;
  y: number;
  size: number;
  difficulty: number;
  generated: boolean;
  cells: any[];
  specialCells: any[];
}

export class InfiniteBoardEngine {
  private config: InfiniteConfig;
  private chunks: Map<string, InfiniteChunk> = new Map();
  private currentLevel: number = 1;
  private playerPosition: { x: number; y: number } = { x: 0, y: 0 };
  private loadedRadius: number = 2; // Cuántos chunks cargar alrededor del jugador

  constructor(config: Partial<InfiniteConfig> = {}) {
    this.config = {
      initialSize: 8,
      expansionRate: 1.2,
      maxSize: 64,
      difficultyScaling: 1.1,
      rewardMultiplier: 1.05,
      ...config
    };

    this.generateInitialChunks();
  }

  private generateInitialChunks(): void {
    // Generar chunks iniciales alrededor del origen
    for (let x = -this.loadedRadius; x <= this.loadedRadius; x++) {
      for (let y = -this.loadedRadius; y <= this.loadedRadius; y++) {
        this.generateChunk(x, y);
      }
    }
  }

  private generateChunk(chunkX: number, chunkY: number): InfiniteChunk {
    const chunkId = `${chunkX},${chunkY}`;
    
    if (this.chunks.has(chunkId)) {
      return this.chunks.get(chunkId)!;
    }

    // Calcular dificultad basada en distancia del origen
    const distance = Math.sqrt(chunkX * chunkX + chunkY * chunkY);
    const difficulty = Math.max(1, distance * this.config.difficultyScaling);

    // Calcular tamaño del chunk
    const sizeMultiplier = Math.min(
      Math.pow(this.config.expansionRate, Math.floor(distance / 2)),
      this.config.maxSize / this.config.initialSize
    );
    const chunkSize = Math.floor(this.config.initialSize * sizeMultiplier);

    const chunk: InfiniteChunk = {
      id: chunkId,
      x: chunkX,
      y: chunkY,
      size: chunkSize,
      difficulty,
      generated: false,
      cells: [],
      specialCells: []
    };

    this.chunks.set(chunkId, chunk);
    return chunk;
  }

  generateChunkContent(chunk: InfiniteChunk): void {
    if (chunk.generated) return;

    // Generar celdas normales
    chunk.cells = this.generateNormalCells(chunk);
    
    // Generar celdas especiales basadas en dificultad
    chunk.specialCells = this.generateSpecialCells(chunk);
    
    chunk.generated = true;
  }

  private generateNormalCells(chunk: InfiniteChunk): any[] {
    const cells = [];
    const totalCells = chunk.size * chunk.size;
    
    for (let i = 0; i < totalCells; i++) {
      const x = i % chunk.size;
      const y = Math.floor(i / chunk.size);
      
      cells.push({
        id: `${chunk.id}-${x}-${y}`,
        x: chunk.x * chunk.size + x,
        y: chunk.y * chunk.size + y,
        type: 'normal',
        value: Math.floor(Math.random() * 10) + 1,
        difficulty: chunk.difficulty,
        discovered: false,
        connections: []
      });
    }
    
    return cells;
  }

  private generateSpecialCells(chunk: InfiniteChunk): any[] {
    const specialCells = [];
    const specialCellCount = Math.floor(chunk.difficulty * 2);
    
    for (let i = 0; i < specialCellCount; i++) {
      const x = Math.floor(Math.random() * chunk.size);
      const y = Math.floor(Math.random() * chunk.size);
      
      specialCells.push({
        id: `${chunk.id}-special-${i}`,
        x: chunk.x * chunk.size + x,
        y: chunk.y * chunk.size + y,
        type: this.getRandomSpecialType(chunk.difficulty),
        power: Math.floor(chunk.difficulty * Math.random() * 3) + 1,
        rarity: this.calculateRarity(chunk.difficulty),
        discovered: false
      });
    }
    
    return specialCells;
  }

  private getRandomSpecialType(difficulty: number): string {
    const types = [
      'neural_boost', 'quantum_link', 'time_warp', 
      'mind_explosion', 'reflection_mirror', 'wisdom_crystal'
    ];
    
    // Tipos más raros aparecen en chunks de mayor dificultad
    const availableTypes = types.filter((_, index) => index < Math.ceil(difficulty));
    return availableTypes[Math.floor(Math.random() * availableTypes.length)];
  }

  private calculateRarity(difficulty: number): 'common' | 'rare' | 'epic' | 'legendary' {
    const random = Math.random() * difficulty;
    
    if (random < 1) return 'common';
    if (random < 2) return 'rare';
    if (random < 4) return 'epic';
    return 'legendary';
  }

  updatePlayerPosition(x: number, y: number): void {
    this.playerPosition = { x, y };
    
    // Determinar en qué chunk está el jugador
    const chunkX = Math.floor(x / this.config.initialSize);
    const chunkY = Math.floor(y / this.config.initialSize);
    
    // Cargar chunks circundantes si es necesario
    this.loadChunksAroundPlayer(chunkX, chunkY);
    
    // Descargar chunks lejanos para optimizar memoria
    this.unloadDistantChunks(chunkX, chunkY);
  }

  private loadChunksAroundPlayer(centerX: number, centerY: number): void {
    for (let x = centerX - this.loadedRadius; x <= centerX + this.loadedRadius; x++) {
      for (let y = centerY - this.loadedRadius; y <= centerY + this.loadedRadius; y++) {
        const chunk = this.generateChunk(x, y);
        if (!chunk.generated) {
          this.generateChunkContent(chunk);
        }
      }
    }
  }

  private unloadDistantChunks(centerX: number, centerY: number): void {
    const maxDistance = this.loadedRadius + 2;
    
    this.chunks.forEach((chunk, chunkId) => {
      const distance = Math.max(
        Math.abs(chunk.x - centerX),
        Math.abs(chunk.y - centerY)
      );
      
      if (distance > maxDistance) {
        this.chunks.delete(chunkId);
      }
    });
  }

  getVisibleCells(viewportX: number, viewportY: number, viewportWidth: number, viewportHeight: number): any[] {
    const visibleCells: any[] = [];
    
    this.chunks.forEach(chunk => {
      if (!chunk.generated) return;
      
      // Verificar si el chunk está en el viewport
      const chunkWorldX = chunk.x * chunk.size;
      const chunkWorldY = chunk.y * chunk.size;
      
      if (this.chunkIntersectsViewport(
        chunkWorldX, chunkWorldY, chunk.size, chunk.size,
        viewportX, viewportY, viewportWidth, viewportHeight
      )) {
        visibleCells.push(...chunk.cells, ...chunk.specialCells);
      }
    });
    
    return visibleCells;
  }

  private chunkIntersectsViewport(
    chunkX: number, chunkY: number, chunkW: number, chunkH: number,
    viewX: number, viewY: number, viewW: number, viewH: number
  ): boolean {
    return !(
      chunkX > viewX + viewW ||
      chunkX + chunkW < viewX ||
      chunkY > viewY + viewH ||
      chunkY + chunkH < viewY
    );
  }

  expandWorld(): void {
    // Incrementar el radio de carga
    this.loadedRadius += 1;
    
    // Generar nuevos chunks en la periferia
    const currentChunkX = Math.floor(this.playerPosition.x / this.config.initialSize);
    const currentChunkY = Math.floor(this.playerPosition.y / this.config.initialSize);
    
    this.loadChunksAroundPlayer(currentChunkX, currentChunkY);
  }

  getWorldStats() {
    const loadedChunks = Array.from(this.chunks.values()).filter(chunk => chunk.generated);
    const totalCells = loadedChunks.reduce((sum, chunk) => sum + chunk.cells.length, 0);
    const totalSpecialCells = loadedChunks.reduce((sum, chunk) => sum + chunk.specialCells.length, 0);
    
    const difficultyCounts = new Map<number, number>();
    loadedChunks.forEach(chunk => {
      const roundedDifficulty = Math.floor(chunk.difficulty);
      difficultyCounts.set(roundedDifficulty, (difficultyCounts.get(roundedDifficulty) || 0) + 1);
    });

    return {
      totalChunks: this.chunks.size,
      loadedChunks: loadedChunks.length,
      totalCells,
      totalSpecialCells,
      currentLevel: this.currentLevel,
      playerPosition: { ...this.playerPosition },
      loadedRadius: this.loadedRadius,
      avgDifficulty: loadedChunks.reduce((sum, chunk) => sum + chunk.difficulty, 0) / loadedChunks.length,
      difficultyDistribution: Object.fromEntries(difficultyCounts),
      worldSize: this.loadedRadius * 2 * this.config.initialSize
    };
  }

  getChunkAt(x: number, y: number): InfiniteChunk | null {
    const chunkX = Math.floor(x / this.config.initialSize);
    const chunkY = Math.floor(y / this.config.initialSize);
    const chunkId = `${chunkX},${chunkY}`;
    
    return this.chunks.get(chunkId) || null;
  }

  discoverCell(x: number, y: number): boolean {
    const chunk = this.getChunkAt(x, y);
    if (!chunk || !chunk.generated) return false;
    
    // Buscar la celda en el chunk
    const cell = [...chunk.cells, ...chunk.specialCells].find(
      cell => cell.x === x && cell.y === y
    );
    
    if (cell && !cell.discovered) {
      cell.discovered = true;
      return true;
    }
    
    return false;
  }

  levelUp(): void {
    this.currentLevel++;
    
    // Aumentar dificultad general
    this.config.difficultyScaling *= 1.05;
    
    // Expandir el mundo automáticamente cada ciertos niveles
    if (this.currentLevel % 5 === 0) {
      this.expandWorld();
    }
  }

  reset(): void {
    this.chunks.clear();
    this.currentLevel = 1;
    this.playerPosition = { x: 0, y: 0 };
    this.loadedRadius = 2;
    this.generateInitialChunks();
  }

  saveState(): string {
    const state = {
      config: this.config,
      currentLevel: this.currentLevel,
      playerPosition: this.playerPosition,
      loadedRadius: this.loadedRadius,
      chunks: Array.from(this.chunks.entries())
    };
    
    return JSON.stringify(state);
  }

  loadState(stateJson: string): void {
    try {
      const state = JSON.parse(stateJson);
      
      this.config = state.config;
      this.currentLevel = state.currentLevel;
      this.playerPosition = state.playerPosition;
      this.loadedRadius = state.loadedRadius;
      this.chunks = new Map(state.chunks);
    } catch (error) {
      console.error('Failed to load infinite mode state:', error);
      this.reset();
    }
  }
}

export default InfiniteBoardEngine;
