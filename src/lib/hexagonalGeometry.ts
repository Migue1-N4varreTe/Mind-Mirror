// Geometría hexagonal para tableros y patrones del juego

export interface HexCoordinate {
  q: number; // columna hexagonal
  r: number; // fila hexagonal
  s: number; // coordenada calculada (q + r + s = 0)
}

export interface Point {
  x: number;
  y: number;
}

export interface HexCell {
  coordinate: HexCoordinate;
  center: Point;
  corners: Point[];
  neighbors: HexCoordinate[];
}

export class HexagonalBoard {
  private size: number;
  private hexSize: number;
  private cells: Map<string, HexCell> = new Map();
  private origin: Point;

  constructor(
    size: number = 5,
    hexSize: number = 30,
    origin: Point = { x: 0, y: 0 },
  ) {
    this.size = size;
    this.hexSize = hexSize;
    this.origin = origin;
    this.generateBoard();
  }

  private generateBoard(): void {
    // Generar todas las celdas hexagonales en un patrón circular
    for (let q = -this.size; q <= this.size; q++) {
      const r1 = Math.max(-this.size, -q - this.size);
      const r2 = Math.min(this.size, -q + this.size);

      for (let r = r1; r <= r2; r++) {
        const s = -q - r;
        const coordinate: HexCoordinate = { q, r, s };
        const cell = this.createHexCell(coordinate);
        this.cells.set(this.coordinateToKey(coordinate), cell);
      }
    }
  }

  private createHexCell(coord: HexCoordinate): HexCell {
    const center = this.hexToPixel(coord);
    const corners = this.getHexCorners(center, this.hexSize);
    const neighbors = this.getNeighborCoordinates(coord);

    return {
      coordinate: coord,
      center,
      corners,
      neighbors,
    };
  }

  private hexToPixel(hex: HexCoordinate): Point {
    const x = this.hexSize * ((3 / 2) * hex.q) + this.origin.x;
    const y =
      this.hexSize * ((Math.sqrt(3) / 2) * hex.q + Math.sqrt(3) * hex.r) +
      this.origin.y;
    return { x, y };
  }

  private pixelToHex(point: Point): HexCoordinate {
    const relativeX = point.x - this.origin.x;
    const relativeY = point.y - this.origin.y;

    const q = ((2 / 3) * relativeX) / this.hexSize;
    const r =
      ((-1 / 3) * relativeX + (Math.sqrt(3) / 3) * relativeY) / this.hexSize;
    const s = -q - r;

    return this.roundHex({ q, r, s });
  }

  private roundHex(hex: HexCoordinate): HexCoordinate {
    let q = Math.round(hex.q);
    let r = Math.round(hex.r);
    let s = Math.round(hex.s);

    const qDiff = Math.abs(q - hex.q);
    const rDiff = Math.abs(r - hex.r);
    const sDiff = Math.abs(s - hex.s);

    if (qDiff > rDiff && qDiff > sDiff) {
      q = -r - s;
    } else if (rDiff > sDiff) {
      r = -q - s;
    } else {
      s = -q - r;
    }

    return { q, r, s };
  }

  private getHexCorners(center: Point, size: number): Point[] {
    const corners: Point[] = [];

    for (let i = 0; i < 6; i++) {
      const angle = ((2 * Math.PI) / 6) * i;
      const x = center.x + size * Math.cos(angle);
      const y = center.y + size * Math.sin(angle);
      corners.push({ x, y });
    }

    return corners;
  }

  private getNeighborCoordinates(hex: HexCoordinate): HexCoordinate[] {
    const directions: HexCoordinate[] = [
      { q: 1, r: 0, s: -1 },
      { q: 1, r: -1, s: 0 },
      { q: 0, r: -1, s: 1 },
      { q: -1, r: 0, s: 1 },
      { q: -1, r: 1, s: 0 },
      { q: 0, r: 1, s: -1 },
    ];

    return directions
      .map((dir) => ({
        q: hex.q + dir.q,
        r: hex.r + dir.r,
        s: hex.s + dir.s,
      }))
      .filter((coord) => this.isValidCoordinate(coord));
  }

  private isValidCoordinate(coord: HexCoordinate): boolean {
    return (
      Math.abs(coord.q) <= this.size &&
      Math.abs(coord.r) <= this.size &&
      Math.abs(coord.s) <= this.size
    );
  }

  private coordinateToKey(coord: HexCoordinate): string {
    return `${coord.q},${coord.r},${coord.s}`;
  }

  // Métodos públicos

  getCell(coordinate: HexCoordinate): HexCell | null {
    const key = this.coordinateToKey(coordinate);
    return this.cells.get(key) || null;
  }

  getCellAt(point: Point): HexCell | null {
    const coordinate = this.pixelToHex(point);
    return this.getCell(coordinate);
  }

  getAllCells(): HexCell[] {
    return Array.from(this.cells.values());
  }

  getNeighbors(coordinate: HexCoordinate): HexCell[] {
    const neighbors: HexCell[] = [];
    const neighborCoords = this.getNeighborCoordinates(coordinate);

    neighborCoords.forEach((coord) => {
      const cell = this.getCell(coord);
      if (cell) neighbors.push(cell);
    });

    return neighbors;
  }

  getDistance(coord1: HexCoordinate, coord2: HexCoordinate): number {
    return (
      (Math.abs(coord1.q - coord2.q) +
        Math.abs(coord1.q + coord1.r - coord2.q - coord2.r) +
        Math.abs(coord1.r - coord2.r)) /
      2
    );
  }

  getPath(start: HexCoordinate, end: HexCoordinate): HexCoordinate[] {
    const distance = this.getDistance(start, end);
    const path: HexCoordinate[] = [];

    for (let i = 0; i <= distance; i++) {
      const t = distance === 0 ? 0 : i / distance;
      const coord = this.lerpHex(start, end, t);
      path.push(coord);
    }

    return path;
  }

  private lerpHex(
    start: HexCoordinate,
    end: HexCoordinate,
    t: number,
  ): HexCoordinate {
    const q = start.q + (end.q - start.q) * t;
    const r = start.r + (end.r - start.r) * t;
    const s = start.s + (end.s - start.s) * t;

    return this.roundHex({ q, r, s });
  }

  getCellsInRange(center: HexCoordinate, range: number): HexCell[] {
    const cellsInRange: HexCell[] = [];

    for (let q = -range; q <= range; q++) {
      const r1 = Math.max(-range, -q - range);
      const r2 = Math.min(range, -q + range);

      for (let r = r1; r <= r2; r++) {
        const s = -q - r;
        const coord: HexCoordinate = {
          q: center.q + q,
          r: center.r + r,
          s: center.s + s,
        };

        const cell = this.getCell(coord);
        if (cell) cellsInRange.push(cell);
      }
    }

    return cellsInRange;
  }

  getCellsInRing(center: HexCoordinate, radius: number): HexCell[] {
    if (radius === 0) {
      const cell = this.getCell(center);
      return cell ? [cell] : [];
    }

    const ring: HexCell[] = [];
    const directions: HexCoordinate[] = [
      { q: 1, r: 0, s: -1 },
      { q: 1, r: -1, s: 0 },
      { q: 0, r: -1, s: 1 },
      { q: -1, r: 0, s: 1 },
      { q: -1, r: 1, s: 0 },
      { q: 0, r: 1, s: -1 },
    ];

    let coord: HexCoordinate = {
      q: center.q + directions[4].q * radius,
      r: center.r + directions[4].r * radius,
      s: center.s + directions[4].s * radius,
    };

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < radius; j++) {
        const cell = this.getCell(coord);
        if (cell) ring.push(cell);

        coord = {
          q: coord.q + directions[i].q,
          r: coord.r + directions[i].r,
          s: coord.s + directions[i].s,
        };
      }
    }

    return ring;
  }

  getSpiral(center: HexCoordinate, maxRadius: number): HexCell[] {
    const spiral: HexCell[] = [];

    // Añadir centro
    const centerCell = this.getCell(center);
    if (centerCell) spiral.push(centerCell);

    // Añadir anillos concéntricos
    for (let radius = 1; radius <= maxRadius; radius++) {
      const ring = this.getCellsInRing(center, radius);
      spiral.push(...ring);
    }

    return spiral;
  }

  findShortestPath(
    start: HexCoordinate,
    end: HexCoordinate,
    obstacles: HexCoordinate[] = [],
  ): HexCoordinate[] {
    // Implementación simple de A* para hexágonos
    const openSet = new Set<string>([this.coordinateToKey(start)]);
    const cameFrom = new Map<string, HexCoordinate>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    const obstacleSet = new Set(
      obstacles.map((coord) => this.coordinateToKey(coord)),
    );

    gScore.set(this.coordinateToKey(start), 0);
    fScore.set(this.coordinateToKey(start), this.getDistance(start, end));

    while (openSet.size > 0) {
      // Encontrar el nodo con menor fScore
      let current: HexCoordinate | null = null;
      let lowestF = Infinity;

      for (const key of openSet) {
        const f = fScore.get(key) || Infinity;
        if (f < lowestF) {
          lowestF = f;
          const parts = key.split(",").map(Number);
          current = { q: parts[0], r: parts[1], s: parts[2] };
        }
      }

      if (!current) break;

      const currentKey = this.coordinateToKey(current);

      // Si llegamos al destino
      if (currentKey === this.coordinateToKey(end)) {
        const path: HexCoordinate[] = [];
        let pathCurrent: HexCoordinate | undefined = current;

        while (pathCurrent) {
          path.unshift(pathCurrent);
          pathCurrent = cameFrom.get(this.coordinateToKey(pathCurrent));
        }

        return path;
      }

      openSet.delete(currentKey);

      // Explorar vecinos
      const neighbors = this.getNeighborCoordinates(current);

      for (const neighbor of neighbors) {
        const neighborKey = this.coordinateToKey(neighbor);

        // Saltar obstáculos
        if (obstacleSet.has(neighborKey)) continue;

        const tentativeG = (gScore.get(currentKey) || 0) + 1;

        if (tentativeG < (gScore.get(neighborKey) || Infinity)) {
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeG);
          fScore.set(neighborKey, tentativeG + this.getDistance(neighbor, end));

          if (!openSet.has(neighborKey)) {
            openSet.add(neighborKey);
          }
        }
      }
    }

    return []; // No se encontró camino
  }

  getBoardBounds(): { minX: number; maxX: number; minY: number; maxY: number } {
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    this.cells.forEach((cell) => {
      cell.corners.forEach((corner) => {
        minX = Math.min(minX, corner.x);
        maxX = Math.max(maxX, corner.x);
        minY = Math.min(minY, corner.y);
        maxY = Math.max(maxY, corner.y);
      });
    });

    return { minX, maxX, minY, maxY };
  }

  resize(newSize: number, newHexSize?: number): void {
    this.size = newSize;
    if (newHexSize !== undefined) {
      this.hexSize = newHexSize;
    }

    this.cells.clear();
    this.generateBoard();
  }

  setOrigin(newOrigin: Point): void {
    this.origin = newOrigin;
    this.cells.clear();
    this.generateBoard();
  }

  // Utilidades de conversión
  static coordinateEquals(
    coord1: HexCoordinate,
    coord2: HexCoordinate,
  ): boolean {
    return (
      coord1.q === coord2.q && coord1.r === coord2.r && coord1.s === coord2.s
    );
  }

  static coordinateToString(coord: HexCoordinate): string {
    return `(${coord.q}, ${coord.r}, ${coord.s})`;
  }

  static stringToCoordinate(str: string): HexCoordinate | null {
    const match = str.match(/\((-?\d+),\s*(-?\d+),\s*(-?\d+)\)/);
    if (!match) return null;

    return {
      q: parseInt(match[1]),
      r: parseInt(match[2]),
      s: parseInt(match[3]),
    };
  }
}

export default HexagonalBoard;
