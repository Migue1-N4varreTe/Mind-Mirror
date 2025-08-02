export interface InfiniteCell {
  coordinates: { x: number; y: number };
  type: 'empty' | 'player' | 'ai' | 'special' | 'boundary';
  specialType?: string;
  id: string;
  generation: number; // When this cell was added to the board
  stability: number; // How likely this cell is to remain
  energy: number; // Used for special effects and expansion
}

export interface ExpansionZone {
  direction: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';
  priority: number;
  cellCount: number;
  pattern: 'linear' | 'scattered' | 'organic' | 'fractal';
}

export class InfiniteBoardEngine {
  private cells: Map<string, InfiniteCell> = new Map();
  private currentGeneration: number = 0;
  private boardBounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  private expansionTriggers: {
    proximity: number; // Distance from edge to trigger expansion
    density: number; // Minimum cell density to maintain
    pressure: number; // Game pressure that forces expansion
  };
  private expansionHistory: Array<{
    generation: number;
    direction: string;
    cellsAdded: number;
    reason: string;
    timestamp: number;
  }> = [];

  constructor(initialSize: number = 8) {
    this.boardBounds = {
      minX: 0,
      maxX: initialSize - 1,
      minY: 0,
      maxY: initialSize - 1
    };

    this.expansionTriggers = {
      proximity: 2, // Expand when moves are within 2 cells of edge
      density: 0.7, // Maintain at least 70% cell usage
      pressure: 0.8 // Expand when game pressure exceeds 80%
    };

    this.initializeBoard(initialSize);
  }

  private initializeBoard(size: number): void {
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const cell: InfiniteCell = {
          coordinates: { x, y },
          type: 'empty',
          id: `${x},${y}`,
          generation: 0,
          stability: 1.0,
          energy: 0.5
        };
        
        this.cells.set(cell.id, cell);
      }
    }
  }

  evaluateExpansion(gameState: any, playerMoves: Array<{ position: [number, number] }>): boolean {
    const expansionNeeded = this.checkExpansionTriggers(gameState, playerMoves);
    
    if (expansionNeeded.shouldExpand) {
      this.expandBoard(expansionNeeded.zones, expansionNeeded.reason);
      return true;
    }
    
    return false;
  }

  private checkExpansionTriggers(gameState: any, playerMoves: Array<{ position: [number, number] }>): {
    shouldExpand: boolean;
    zones: ExpansionZone[];
    reason: string;
  } {
    const triggers = [];
    let expansionZones: ExpansionZone[] = [];

    // Trigger 1: Proximity to edges
    const edgeProximity = this.checkEdgeProximity(playerMoves);
    if (edgeProximity.triggered) {
      triggers.push('proximity');
      expansionZones.push(...edgeProximity.zones);
    }

    // Trigger 2: Board density
    const density = this.calculateBoardDensity();
    if (density > this.expansionTriggers.density) {
      triggers.push('density');
      expansionZones.push(...this.getDensityExpansionZones());
    }

    // Trigger 3: Game pressure
    const pressure = this.calculateGamePressure(gameState);
    if (pressure > this.expansionTriggers.pressure) {
      triggers.push('pressure');
      expansionZones.push(...this.getPressureExpansionZones(gameState));
    }

    // Trigger 4: Strategic necessity
    const strategicNeed = this.analyzeStrategicNeed(gameState);
    if (strategicNeed.required) {
      triggers.push('strategic');
      expansionZones.push(...strategicNeed.zones);
    }

    return {
      shouldExpand: triggers.length > 0,
      zones: this.optimizeExpansionZones(expansionZones),
      reason: triggers.join(', ')
    };
  }

  private checkEdgeProximity(playerMoves: Array<{ position: [number, number] }>): {
    triggered: boolean;
    zones: ExpansionZone[];
  } {
    const recentMoves = playerMoves.slice(-5);
    const zones: ExpansionZone[] = [];
    let triggered = false;

    for (const move of recentMoves) {
      const [row, col] = move.position;
      const distanceToEdge = this.getDistanceToNearestEdge(col, row);
      
      if (distanceToEdge <= this.expansionTriggers.proximity) {
        triggered = true;
        const direction = this.getExpansionDirection(col, row);
        
        zones.push({
          direction,
          priority: 1 - (distanceToEdge / this.expansionTriggers.proximity),
          cellCount: 3 + Math.floor(Math.random() * 3),
          pattern: 'linear'
        });
      }
    }

    return { triggered, zones };
  }

  private getDistanceToNearestEdge(x: number, y: number): number {
    return Math.min(
      x - this.boardBounds.minX,
      this.boardBounds.maxX - x,
      y - this.boardBounds.minY,
      this.boardBounds.maxY - y
    );
  }

  private getExpansionDirection(x: number, y: number): ExpansionZone['direction'] {
    const { minX, maxX, minY, maxY } = this.boardBounds;
    
    const distances = {
      north: y - minY,
      south: maxY - y,
      west: x - minX,
      east: maxX - x
    };

    const closest = Object.keys(distances).reduce((a, b) => 
      distances[a] < distances[b] ? a : b
    ) as ExpansionZone['direction'];

    return closest;
  }

  private calculateBoardDensity(): number {
    const totalCells = this.cells.size;
    const occupiedCells = Array.from(this.cells.values()).filter(
      cell => cell.type !== 'empty'
    ).length;
    
    return occupiedCells / totalCells;
  }

  private getDensityExpansionZones(): ExpansionZone[] {
    // Expand in all directions for density relief
    return [
      { direction: 'north', priority: 0.6, cellCount: 2, pattern: 'linear' },
      { direction: 'south', priority: 0.6, cellCount: 2, pattern: 'linear' },
      { direction: 'east', priority: 0.6, cellCount: 2, pattern: 'linear' },
      { direction: 'west', priority: 0.6, cellCount: 2, pattern: 'linear' }
    ];
  }

  private calculateGamePressure(gameState: any): number {
    // Calculate based on various game factors
    let pressure = 0;

    // Factor 1: Move frequency
    const moveFrequency = gameState.moveHistory?.length || 0;
    pressure += Math.min(1, moveFrequency / 50) * 0.3;

    // Factor 2: Special cells density
    const specialCells = Array.from(this.cells.values()).filter(
      cell => cell.type === 'special'
    ).length;
    pressure += Math.min(1, specialCells / 10) * 0.2;

    // Factor 3: AI aggression level
    const aiAggression = gameState.aiPersonality?.mentalState === 'aggressive' ? 0.8 : 0.4;
    pressure += aiAggression * 0.3;

    // Factor 4: Game duration
    const duration = Date.now() - (gameState.startTime || Date.now());
    pressure += Math.min(1, duration / (5 * 60 * 1000)) * 0.2; // 5 minutes max

    return Math.min(1, pressure);
  }

  private getPressureExpansionZones(gameState: any): ExpansionZone[] {
    const zones: ExpansionZone[] = [];
    
    // High pressure creates organic, scattered expansions
    const directions: ExpansionZone['direction'][] = ['north', 'south', 'east', 'west'];
    
    directions.forEach(direction => {
      zones.push({
        direction,
        priority: 0.8,
        cellCount: 4 + Math.floor(Math.random() * 4),
        pattern: 'organic'
      });
    });

    return zones;
  }

  private analyzeStrategicNeed(gameState: any): {
    required: boolean;
    zones: ExpansionZone[];
  } {
    const zones: ExpansionZone[] = [];
    let required = false;

    // Check if players are running out of strategic positions
    const emptyCells = Array.from(this.cells.values()).filter(cell => cell.type === 'empty');
    const strategicCells = emptyCells.filter(cell => this.isStrategicPosition(cell));

    if (strategicCells.length < 5) {
      required = true;
      
      // Add strategic expansion in corners and edges
      zones.push({
        direction: 'northeast',
        priority: 0.9,
        cellCount: 3,
        pattern: 'scattered'
      });
      
      zones.push({
        direction: 'southwest',
        priority: 0.9,
        cellCount: 3,
        pattern: 'scattered'
      });
    }

    return { required, zones };
  }

  private isStrategicPosition(cell: InfiniteCell): boolean {
    const { x, y } = cell.coordinates;
    const { minX, maxX, minY, maxY } = this.boardBounds;

    // Corners
    if ((x === minX || x === maxX) && (y === minY || y === maxY)) return true;
    
    // Edges
    if (x === minX || x === maxX || y === minY || y === maxY) return true;
    
    // Center region
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    if (Math.abs(x - centerX) <= 1 && Math.abs(y - centerY) <= 1) return true;

    return false;
  }

  private optimizeExpansionZones(zones: ExpansionZone[]): ExpansionZone[] {
    // Merge zones with same direction
    const mergedZones = new Map<string, ExpansionZone>();

    zones.forEach(zone => {
      const existing = mergedZones.get(zone.direction);
      if (existing) {
        existing.priority = Math.max(existing.priority, zone.priority);
        existing.cellCount += zone.cellCount;
      } else {
        mergedZones.set(zone.direction, { ...zone });
      }
    });

    // Sort by priority and limit to top 3
    return Array.from(mergedZones.values())
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);
  }

  private expandBoard(zones: ExpansionZone[], reason: string): void {
    this.currentGeneration++;
    let totalCellsAdded = 0;

    zones.forEach(zone => {
      const newCells = this.createExpansionCells(zone);
      newCells.forEach(cell => {
        this.cells.set(cell.id, cell);
      });
      
      totalCellsAdded += newCells.length;
      this.updateBoardBounds(newCells);
    });

    // Record expansion
    this.expansionHistory.push({
      generation: this.currentGeneration,
      direction: zones.map(z => z.direction).join(', '),
      cellsAdded: totalCellsAdded,
      reason,
      timestamp: Date.now()
    });

    console.log(`🌱 Tablero expandido: +${totalCellsAdded} celdas (${reason})`);
  }

  private createExpansionCells(zone: ExpansionZone): InfiniteCell[] {
    const newCells: InfiniteCell[] = [];
    const baseCoords = this.getExpansionBaseCoordinates(zone.direction);
    
    switch (zone.pattern) {
      case 'linear':
        newCells.push(...this.createLinearExpansion(baseCoords, zone));
        break;
      case 'scattered':
        newCells.push(...this.createScatteredExpansion(baseCoords, zone));
        break;
      case 'organic':
        newCells.push(...this.createOrganicExpansion(baseCoords, zone));
        break;
      case 'fractal':
        newCells.push(...this.createFractalExpansion(baseCoords, zone));
        break;
    }

    return newCells;
  }

  private getExpansionBaseCoordinates(direction: ExpansionZone['direction']): { x: number; y: number } {
    const { minX, maxX, minY, maxY } = this.boardBounds;
    
    switch (direction) {
      case 'north': return { x: Math.floor((minX + maxX) / 2), y: minY - 1 };
      case 'south': return { x: Math.floor((minX + maxX) / 2), y: maxY + 1 };
      case 'east': return { x: maxX + 1, y: Math.floor((minY + maxY) / 2) };
      case 'west': return { x: minX - 1, y: Math.floor((minY + maxY) / 2) };
      case 'northeast': return { x: maxX + 1, y: minY - 1 };
      case 'northwest': return { x: minX - 1, y: minY - 1 };
      case 'southeast': return { x: maxX + 1, y: maxY + 1 };
      case 'southwest': return { x: minX - 1, y: maxY + 1 };
      default: return { x: 0, y: 0 };
    }
  }

  private createLinearExpansion(base: { x: number; y: number }, zone: ExpansionZone): InfiniteCell[] {
    const cells: InfiniteCell[] = [];
    const isHorizontal = zone.direction === 'east' || zone.direction === 'west';
    
    for (let i = 0; i < zone.cellCount; i++) {
      const coords = isHorizontal 
        ? { x: base.x, y: base.y + i - Math.floor(zone.cellCount / 2) }
        : { x: base.x + i - Math.floor(zone.cellCount / 2), y: base.y };
      
      cells.push(this.createNewCell(coords, zone));
    }
    
    return cells;
  }

  private createScatteredExpansion(base: { x: number; y: number }, zone: ExpansionZone): InfiniteCell[] {
    const cells: InfiniteCell[] = [];
    
    for (let i = 0; i < zone.cellCount; i++) {
      const coords = {
        x: base.x + Math.floor(Math.random() * 5) - 2,
        y: base.y + Math.floor(Math.random() * 5) - 2
      };
      
      // Avoid duplicates
      if (!this.cells.has(`${coords.x},${coords.y}`)) {
        cells.push(this.createNewCell(coords, zone));
      }
    }
    
    return cells;
  }

  private createOrganicExpansion(base: { x: number; y: number }, zone: ExpansionZone): InfiniteCell[] {
    const cells: InfiniteCell[] = [];
    const created = new Set<string>();
    
    // Start with base cell
    let frontier = [base];
    
    for (let generation = 0; generation < zone.cellCount && frontier.length > 0; generation++) {
      const newFrontier: Array<{ x: number; y: number }> = [];
      
      frontier.forEach(coords => {
        const neighbors = this.getNeighborCoordinates(coords);
        
        neighbors.forEach(neighbor => {
          const key = `${neighbor.x},${neighbor.y}`;
          if (!created.has(key) && !this.cells.has(key) && Math.random() < 0.6) {
            cells.push(this.createNewCell(neighbor, zone));
            created.add(key);
            newFrontier.push(neighbor);
          }
        });
      });
      
      frontier = newFrontier;
    }
    
    return cells;
  }

  private createFractalExpansion(base: { x: number; y: number }, zone: ExpansionZone): InfiniteCell[] {
    const cells: InfiniteCell[] = [];
    
    // Create fractal pattern using recursive subdivision
    const createFractalCell = (coords: { x: number; y: number }, depth: number, maxDepth: number) => {
      if (depth >= maxDepth || cells.length >= zone.cellCount) return;
      
      cells.push(this.createNewCell(coords, zone));
      
      if (Math.random() < 0.7) {
        const neighbors = this.getNeighborCoordinates(coords);
        neighbors.forEach(neighbor => {
          if (Math.random() < 0.4 && !this.cells.has(`${neighbor.x},${neighbor.y}`)) {
            createFractalCell(neighbor, depth + 1, maxDepth);
          }
        });
      }
    };
    
    createFractalCell(base, 0, 3);
    return cells;
  }

  private createNewCell(coords: { x: number; y: number }, zone: ExpansionZone): InfiniteCell {
    return {
      coordinates: coords,
      type: Math.random() < 0.1 ? 'special' : 'empty', // 10% chance for special cells
      id: `${coords.x},${coords.y}`,
      generation: this.currentGeneration,
      stability: 0.8 + Math.random() * 0.2, // New cells are slightly less stable
      energy: zone.priority * 0.5 + Math.random() * 0.5
    };
  }

  private getNeighborCoordinates(coords: { x: number; y: number }): Array<{ x: number; y: number }> {
    return [
      { x: coords.x - 1, y: coords.y },
      { x: coords.x + 1, y: coords.y },
      { x: coords.x, y: coords.y - 1 },
      { x: coords.x, y: coords.y + 1 },
      { x: coords.x - 1, y: coords.y - 1 },
      { x: coords.x + 1, y: coords.y - 1 },
      { x: coords.x - 1, y: coords.y + 1 },
      { x: coords.x + 1, y: coords.y + 1 }
    ];
  }

  private updateBoardBounds(newCells: InfiniteCell[]): void {
    newCells.forEach(cell => {
      const { x, y } = cell.coordinates;
      
      this.boardBounds.minX = Math.min(this.boardBounds.minX, x);
      this.boardBounds.maxX = Math.max(this.boardBounds.maxX, x);
      this.boardBounds.minY = Math.min(this.boardBounds.minY, y);
      this.boardBounds.maxY = Math.max(this.boardBounds.maxY, y);
    });
  }

  // Public interface methods
  getAllCells(): InfiniteCell[] {
    return Array.from(this.cells.values());
  }

  getVisibleCells(centerX: number, centerY: number, radius: number): InfiniteCell[] {
    return this.getAllCells().filter(cell => {
      const distance = Math.abs(cell.coordinates.x - centerX) + Math.abs(cell.coordinates.y - centerY);
      return distance <= radius;
    });
  }

  getBoardBounds(): typeof this.boardBounds {
    return { ...this.boardBounds };
  }

  getCell(x: number, y: number): InfiniteCell | undefined {
    return this.cells.get(`${x},${y}`);
  }

  setCell(x: number, y: number, updates: Partial<InfiniteCell>): void {
    const cell = this.getCell(x, y);
    if (cell) {
      Object.assign(cell, updates);
    }
  }

  getCurrentGeneration(): number {
    return this.currentGeneration;
  }

  getExpansionHistory(): typeof this.expansionHistory {
    return [...this.expansionHistory];
  }

  getBoardStats(): any {
    const cells = this.getAllCells();
    const totalCells = cells.length;
    const occupiedCells = cells.filter(c => c.type !== 'empty').length;
    const specialCells = cells.filter(c => c.type === 'special').length;
    
    const generations = new Set(cells.map(c => c.generation));
    const averageStability = cells.reduce((sum, c) => sum + c.stability, 0) / totalCells;
    const averageEnergy = cells.reduce((sum, c) => sum + c.energy, 0) / totalCells;

    return {
      totalCells,
      occupiedCells,
      specialCells,
      density: occupiedCells / totalCells,
      generations: generations.size,
      currentGeneration: this.currentGeneration,
      expansions: this.expansionHistory.length,
      averageStability,
      averageEnergy,
      bounds: this.boardBounds,
      size: {
        width: this.boardBounds.maxX - this.boardBounds.minX + 1,
        height: this.boardBounds.maxY - this.boardBounds.minY + 1
      }
    };
  }

  // Cleanup old/unstable cells
  stabilizeBoard(): void {
    const cellsToRemove: string[] = [];
    
    this.getAllCells().forEach(cell => {
      // Remove cells with very low stability after several generations
      if (cell.generation < this.currentGeneration - 5 && cell.stability < 0.2) {
        cellsToRemove.push(cell.id);
      }
    });

    cellsToRemove.forEach(id => {
      this.cells.delete(id);
    });

    if (cellsToRemove.length > 0) {
      console.log(`🧹 Tablero estabilizado: ${cellsToRemove.length} celdas removidas`);
    }
  }

  exportBoardState(): any {
    return {
      cells: this.getAllCells(),
      bounds: this.boardBounds,
      generation: this.currentGeneration,
      expansionHistory: this.expansionHistory,
      stats: this.getBoardStats(),
      timestamp: Date.now()
    };
  }
}
