export interface HexCoordinates {
  q: number; // column
  r: number; // row
  s: number; // diagonal (q + r + s = 0)
}

export interface HexCell {
  coordinates: HexCoordinates;
  type: 'empty' | 'player' | 'ai' | 'special';
  specialType?: string;
  id: string;
  isVisible: boolean;
  temporalState?: 'appearing' | 'disappearing' | 'stable';
  temporalCycle?: number;
}

export class HexagonalBoard {
  private radius: number;
  private cells: Map<string, HexCell>;

  constructor(radius: number = 3) {
    this.radius = radius;
    this.cells = new Map();
    this.generateBoard();
  }

  private generateBoard(): void {
    for (let q = -this.radius; q <= this.radius; q++) {
      const r1 = Math.max(-this.radius, -q - this.radius);
      const r2 = Math.min(this.radius, -q + this.radius);
      
      for (let r = r1; r <= r2; r++) {
        const s = -q - r;
        const coordinates: HexCoordinates = { q, r, s };
        const id = this.coordsToId(coordinates);
        
        this.cells.set(id, {
          coordinates,
          type: 'empty',
          id,
          isVisible: true,
          temporalState: 'stable'
        });
      }
    }
  }

  coordsToId(coords: HexCoordinates): string {
    return `${coords.q},${coords.r},${coords.s}`;
  }

  idToCoords(id: string): HexCoordinates {
    const [q, r, s] = id.split(',').map(Number);
    return { q, r, s };
  }

  getCell(coords: HexCoordinates): HexCell | undefined {
    return this.cells.get(this.coordsToId(coords));
  }

  setCell(coords: HexCoordinates, cell: Partial<HexCell>): void {
    const id = this.coordsToId(coords);
    const existingCell = this.cells.get(id);
    if (existingCell) {
      this.cells.set(id, { ...existingCell, ...cell });
    }
  }

  getNeighbors(coords: HexCoordinates): HexCoordinates[] {
    const directions = [
      { q: 1, r: 0, s: -1 }, { q: 1, r: -1, s: 0 }, { q: 0, r: -1, s: 1 },
      { q: -1, r: 0, s: 1 }, { q: -1, r: 1, s: 0 }, { q: 0, r: 1, s: -1 }
    ];

    return directions
      .map(dir => ({
        q: coords.q + dir.q,
        r: coords.r + dir.r,
        s: coords.s + dir.s
      }))
      .filter(neighbor => this.cells.has(this.coordsToId(neighbor)));
  }

  getAllCells(): HexCell[] {
    return Array.from(this.cells.values());
  }

  getVisibleCells(): HexCell[] {
    return this.getAllCells().filter(cell => cell.isVisible);
  }

  // Convert hex coordinates to pixel coordinates for rendering
  hexToPixel(coords: HexCoordinates, size: number): { x: number; y: number } {
    const x = size * (3/2 * coords.q);
    const y = size * (Math.sqrt(3)/2 * coords.q + Math.sqrt(3) * coords.r);
    return { x, y };
  }

  // Convert pixel coordinates to hex coordinates
  pixelToHex(x: number, y: number, size: number): HexCoordinates {
    const q = (2/3 * x) / size;
    const r = (-1/3 * x + Math.sqrt(3)/3 * y) / size;
    const s = -q - r;

    // Round to nearest hex
    return this.roundHex({ q, r, s });
  }

  private roundHex(coords: HexCoordinates): HexCoordinates {
    let rq = Math.round(coords.q);
    let rr = Math.round(coords.r);
    let rs = Math.round(coords.s);

    const qDiff = Math.abs(rq - coords.q);
    const rDiff = Math.abs(rr - coords.r);
    const sDiff = Math.abs(rs - coords.s);

    if (qDiff > rDiff && qDiff > sDiff) {
      rq = -rr - rs;
    } else if (rDiff > sDiff) {
      rr = -rq - rs;
    } else {
      rs = -rq - rr;
    }

    return { q: rq, r: rr, s: rs };
  }

  // Check for winning conditions in hexagonal layout
  checkWinCondition(playerType: 'player' | 'ai'): boolean {
    const playerCells = this.getAllCells().filter(cell => cell.type === playerType);
    
    if (playerCells.length < 3) return false;

    // Check for lines of 3 or more
    return this.hasLine(playerCells, 3);
  }

  private hasLine(cells: HexCell[], minLength: number): boolean {
    const directions = [
      { q: 1, r: 0, s: -1 }, { q: 0, r: 1, s: -1 }, { q: -1, r: 1, s: 0 }
    ];

    for (const cell of cells) {
      for (const direction of directions) {
        let count = 1;
        
        // Check positive direction
        let current = cell.coordinates;
        while (true) {
          current = {
            q: current.q + direction.q,
            r: current.r + direction.r,
            s: current.s + direction.s
          };
          
          const nextCell = this.getCell(current);
          if (nextCell && nextCell.type === cell.type) {
            count++;
          } else {
            break;
          }
        }

        // Check negative direction
        current = cell.coordinates;
        while (true) {
          current = {
            q: current.q - direction.q,
            r: current.r - direction.r,
            s: current.s - direction.s
          };
          
          const nextCell = this.getCell(current);
          if (nextCell && nextCell.type === cell.type) {
            count++;
          } else {
            break;
          }
        }

        if (count >= minLength) return true;
      }
    }

    return false;
  }

  // Temporal cells system
  updateTemporalCells(cycle: number): void {
    this.getAllCells().forEach(cell => {
      if (cell.temporalCycle !== undefined) {
        const cyclePhase = cycle % 6; // 6-cycle pattern
        
        if (cyclePhase === cell.temporalCycle) {
          cell.temporalState = 'appearing';
          cell.isVisible = true;
        } else if ((cyclePhase + 3) % 6 === cell.temporalCycle) {
          cell.temporalState = 'disappearing';
          cell.isVisible = false;
        } else {
          cell.temporalState = 'stable';
        }
      }
    });
  }

  // Add temporal cell at coordinates
  addTemporalCell(coords: HexCoordinates, cycle: number): void {
    const cell = this.getCell(coords);
    if (cell) {
      cell.temporalCycle = cycle;
      cell.temporalState = 'appearing';
    }
  }

  // Expand board for infinite mode
  expandBoard(): void {
    this.radius++;
    const newCells = new Map(this.cells);

    for (let q = -this.radius; q <= this.radius; q++) {
      const r1 = Math.max(-this.radius, -q - this.radius);
      const r2 = Math.min(this.radius, -q + this.radius);
      
      for (let r = r1; r <= r2; r++) {
        const s = -q - r;
        const coordinates: HexCoordinates = { q, r, s };
        const id = this.coordsToId(coordinates);
        
        if (!newCells.has(id)) {
          newCells.set(id, {
            coordinates,
            type: 'empty',
            id,
            isVisible: true,
            temporalState: 'stable'
          });
        }
      }
    }

    this.cells = newCells;
  }
}
