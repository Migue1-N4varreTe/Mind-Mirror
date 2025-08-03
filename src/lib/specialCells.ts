export interface SpecialCell {
  type: CellSpecialType;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effect: CellEffect;
  visual: VisualConfig;
  duration?: number;
  charges?: number;
}

export type CellSpecialType = 
  | 'bomb' | 'portal' | 'multiplier' | 'thief' | 'migrator' | 'contagious' 
  | 'echo' | 'mirror' | 'quantum' | 'neural' | 'virus' | 'phoenix' 
  | 'magnet' | 'phase' | 'clone' | 'void' | 'prism' | 'nexus';

export interface CellEffect {
  onActivate?: (board: any[][], position: [number, number], activator: 'player' | 'ai') => EffectResult;
  onTurnStart?: (board: any[][], position: [number, number]) => EffectResult;
  onPlayerNear?: (board: any[][], position: [number, number], playerPos: [number, number]) => EffectResult;
  passive?: boolean;
}

export interface EffectResult {
  boardChanges?: Array<{ position: [number, number]; newCell: any }>;
  scoreChange?: { player: number; ai: number };
  specialEffects?: Array<{ type: string; position: { x: number; y: number }; intensity?: number }>;
  message?: string;
  combo?: string;
}

export interface VisualConfig {
  baseColor: string;
  glowColor: string;
  animation: 'pulse' | 'spin' | 'glow' | 'float' | 'quantum' | 'neural';
  particles?: boolean;
  intensity: number;
}

export const SPECIAL_CELLS: Record<CellSpecialType, SpecialCell> = {
  // Original cells (enhanced)
  bomb: {
    type: 'bomb',
    name: 'Bomba Cuántica',
    description: 'Explota en 3 turnos, afectando área 3x3',
    icon: 'zap',
    rarity: 'common',
    effect: {
      onActivate: (board, [row, col], activator) => {
        const affected: Array<{ position: [number, number]; newCell: any }> = [];
        
        // 3x3 explosion
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
              affected.push({
                position: [newRow, newCol],
                newCell: { type: 'empty' }
              });
            }
          }
        }
        
        return {
          boardChanges: affected,
          specialEffects: [{ type: 'explosion', position: { x: col * 48 + 24, y: row * 48 + 24 }, intensity: 30 }],
          message: '💥 Explosión Cuántica!',
          scoreChange: activator === 'player' ? { player: 5, ai: 0 } : { player: 0, ai: 5 }
        };
      }
    },
    visual: {
      baseColor: '#ff6b9d',
      glowColor: '#ff1744',
      animation: 'pulse',
      particles: true,
      intensity: 0.8
    },
    duration: 3
  },

  portal: {
    type: 'portal',
    name: 'Portal Dimensional',
    description: 'Teletransporta a posición aleatoria',
    icon: 'sparkles',
    rarity: 'rare',
    effect: {
      onActivate: (board, position, activator) => {
        const emptyCells: [number, number][] = [];
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            if (board[i][j].type === 'empty') {
              emptyCells.push([i, j]);
            }
          }
        }
        
        if (emptyCells.length > 0) {
          const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
          return {
            boardChanges: [
              { position: randomCell, newCell: { type: activator, owner: activator } },
              { position, newCell: { type: 'empty' } }
            ],
            specialEffects: [
              { type: 'portal', position: { x: position[1] * 48 + 24, y: position[0] * 48 + 24 } },
              { type: 'portal', position: { x: randomCell[1] * 48 + 24, y: randomCell[0] * 48 + 24 } }
            ],
            message: '🌀 Teletransporte exitoso!'
          };
        }
        return {};
      }
    },
    visual: {
      baseColor: '#9d4edd',
      glowColor: '#7209b7',
      animation: 'quantum',
      particles: true,
      intensity: 0.9
    }
  },

  // New advanced cells
  quantum: {
    type: 'quantum',
    name: 'Superposición Cuántica',
    description: 'Existe en múltiples estados simultáneamente',
    icon: 'atom',
    rarity: 'legendary',
    effect: {
      onActivate: (board, position, activator) => {
        // Creates 3 quantum echoes in random positions
        const echoes: Array<{ position: [number, number]; newCell: any }> = [];
        const emptyCells: [number, number][] = [];
        
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            if (board[i][j].type === 'empty') {
              emptyCells.push([i, j]);
            }
          }
        }
        
        for (let i = 0; i < Math.min(3, emptyCells.length); i++) {
          const randomIndex = Math.floor(Math.random() * emptyCells.length);
          const echoPos = emptyCells.splice(randomIndex, 1)[0];
          echoes.push({
            position: echoPos,
            newCell: { type: 'special', special: 'quantum', timer: 2, owner: activator }
          });
        }
        
        return {
          boardChanges: echoes,
          specialEffects: echoes.map(echo => ({
            type: 'neural',
            position: { x: echo.position[1] * 48 + 24, y: echo.position[0] * 48 + 24 }
          })),
          message: '⚛️ Superposición Cuántica activada!',
          combo: 'Quantum Entanglement'
        };
      }
    },
    visual: {
      baseColor: '#00d4ff',
      glowColor: '#0099cc',
      animation: 'quantum',
      particles: true,
      intensity: 1.0
    },
    duration: 2
  },

  neural: {
    type: 'neural',
    name: 'Nodo Neural',
    description: 'Se conecta con otros nodos, creando redes',
    icon: 'brain',
    rarity: 'epic',
    effect: {
      onActivate: (board, [row, col], activator) => {
        // Find other neural nodes and create connections
        const neuralNodes: [number, number][] = [];
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            if (board[i][j].special === 'neural' && (i !== row || j !== col)) {
              neuralNodes.push([i, j]);
            }
          }
        }
        
        if (neuralNodes.length > 0) {
          // Convert cells in line between neural nodes
          const connections: Array<{ position: [number, number]; newCell: any }> = [];
          neuralNodes.forEach(([nodeRow, nodeCol]) => {
            const path = getLinePath([row, col], [nodeRow, nodeCol]);
            path.forEach(pos => {
              if (board[pos[0]][pos[1]].type === 'empty') {
                connections.push({
                  position: pos,
                  newCell: { type: activator, owner: activator }
                });
              }
            });
          });
          
          return {
            boardChanges: connections,
            specialEffects: [{ type: 'neural', position: { x: col * 48 + 24, y: row * 48 + 24 } }],
            message: '🧠 Red Neural establecida!',
            combo: 'Neural Network',
            scoreChange: activator === 'player' 
              ? { player: connections.length * 2, ai: 0 }
              : { player: 0, ai: connections.length * 2 }
          };
        }
        
        return { message: '🧠 Nodo Neural colocado, esperando conexiones...' };
      }
    },
    visual: {
      baseColor: '#00f5ff',
      glowColor: '#0099ff',
      animation: 'neural',
      particles: true,
      intensity: 0.9
    }
  },

  virus: {
    type: 'virus',
    name: 'Virus Digital',
    description: 'Se propaga a celdas adyacentes cada turno',
    icon: 'virus',
    rarity: 'epic',
    effect: {
      onTurnStart: (board, [row, col]) => {
        const infected: Array<{ position: [number, number]; newCell: any }> = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        directions.forEach(([dRow, dCol]) => {
          const newRow = row + dRow;
          const newCol = col + dCol;
          if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const targetCell = board[newRow][newCol];
            if (targetCell.type === 'player' || targetCell.type === 'ai') {
              infected.push({
                position: [newRow, newCol],
                newCell: { ...targetCell, infected: true, timer: 3 }
              });
            }
          }
        });
        
        return {
          boardChanges: infected,
          specialEffects: infected.map(inf => ({
            type: 'virus',
            position: { x: inf.position[1] * 48 + 24, y: inf.position[0] * 48 + 24 }
          })),
          message: infected.length > 0 ? '🦠 Virus propagándose...' : undefined
        };
      }
    },
    visual: {
      baseColor: '#00ff88',
      glowColor: '#00cc66',
      animation: 'pulse',
      particles: true,
      intensity: 0.7
    }
  },

  phoenix: {
    type: 'phoenix',
    name: 'Fénix Digital',
    description: 'Renace 2 turnos después de ser destruido',
    icon: 'phoenix',
    rarity: 'legendary',
    effect: {
      onActivate: (board, position, activator) => {
        // Phoenix sacrifices itself to clear all enemy pieces in a cross pattern
        const cleared: Array<{ position: [number, number]; newCell: any }> = [];
        const [row, col] = position;
        const enemy = activator === 'player' ? 'ai' : 'player';
        
        // Cross pattern
        for (let i = 0; i < 8; i++) {
          if (board[i][col].owner === enemy) {
            cleared.push({ position: [i, col], newCell: { type: 'empty' } });
          }
          if (board[row][i].owner === enemy) {
            cleared.push({ position: [row, i], newCell: { type: 'empty' } });
          }
        }
        
        // Schedule revival
        setTimeout(() => {
          // This would need to be handled by the game state
        }, 2000);
        
        return {
          boardChanges: cleared,
          specialEffects: [{ type: 'phoenix', position: { x: col * 48 + 24, y: row * 48 + 24 }, intensity: 40 }],
          message: '🔥 Fénix Digital activado!',
          combo: 'Phoenix Rising',
          scoreChange: activator === 'player' 
            ? { player: cleared.length * 3, ai: 0 }
            : { player: 0, ai: cleared.length * 3 }
        };
      }
    },
    visual: {
      baseColor: '#ff6b35',
      glowColor: '#ff4500',
      animation: 'float',
      particles: true,
      intensity: 1.0
    },
    duration: 2
  },

  void: {
    type: 'void',
    name: 'Vacío Cuántico',
    description: 'Absorbe y elimina todo en un radio de 2 celdas',
    icon: 'black-hole',
    rarity: 'legendary',
    effect: {
      onActivate: (board, [row, col], activator) => {
        const absorbed: Array<{ position: [number, number]; newCell: any }> = [];
        
        // 5x5 area (radius 2)
        for (let i = -2; i <= 2; i++) {
          for (let j = -2; j <= 2; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
              if (newRow !== row || newCol !== col) { // Don't absorb self
                absorbed.push({
                  position: [newRow, newCol],
                  newCell: { type: 'empty' }
                });
              }
            }
          }
        }
        
        return {
          boardChanges: absorbed,
          specialEffects: [{ type: 'void', position: { x: col * 48 + 24, y: row * 48 + 24 }, intensity: 50 }],
          message: '🕳️ Vacío Cuántico devoró todo!',
          combo: 'Absolute Zero',
          scoreChange: activator === 'player' 
            ? { player: absorbed.length, ai: 0 }
            : { player: 0, ai: absorbed.length }
        };
      }
    },
    visual: {
      baseColor: '#1a1a1a',
      glowColor: '#800080',
      animation: 'quantum',
      particles: true,
      intensity: 1.0
    }
  },

  // Existing cells with enhancements
  multiplier: {
    type: 'multiplier',
    name: 'Multiplicador Quántico',
    description: 'Duplica puntos del próximo movimiento',
    icon: 'trending-up',
    rarity: 'rare',
    effect: {
      onActivate: (board, position, activator) => ({
        specialEffects: [{ type: 'multiplier', position: { x: position[1] * 48 + 24, y: position[0] * 48 + 24 } }],
        message: '✨ Multiplicador activado - Próximo movimiento x2!',
        scoreChange: activator === 'player' ? { player: 3, ai: 0 } : { player: 0, ai: 3 }
      })
    },
    visual: {
      baseColor: '#ffd700',
      glowColor: '#ffed4e',
      animation: 'glow',
      particles: true,
      intensity: 0.8
    }
  },

  thief: {
    type: 'thief',
    name: 'Ladrón Cuántico',
    description: 'Roba celdas adyacentes del oponente',
    icon: 'target',
    rarity: 'rare',
    effect: {
      onActivate: (board, [row, col], activator) => {
        const stolen: Array<{ position: [number, number]; newCell: any }> = [];
        const enemy = activator === 'player' ? 'ai' : 'player';
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        
        directions.forEach(([dRow, dCol]) => {
          const newRow = row + dRow;
          const newCol = col + dCol;
          if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            if (board[newRow][newCol].owner === enemy) {
              stolen.push({
                position: [newRow, newCol],
                newCell: { type: activator, owner: activator, stolen: true }
              });
            }
          }
        });
        
        return {
          boardChanges: stolen,
          specialEffects: [{ type: 'steal', position: { x: col * 48 + 24, y: row * 48 + 24 } }],
          message: `💰 Robaste ${stolen.length} celdas!`,
          scoreChange: activator === 'player' 
            ? { player: stolen.length * 2, ai: -stolen.length }
            : { player: -stolen.length, ai: stolen.length * 2 }
        };
      }
    },
    visual: {
      baseColor: '#ffcc00',
      glowColor: '#ff9900',
      animation: 'spin',
      particles: true,
      intensity: 0.7
    }
  }
};

// Utility function to get line path between two points
function getLinePath(start: [number, number], end: [number, number]): [number, number][] {
  const path: [number, number][] = [];
  const [x0, y0] = start;
  const [x1, y1] = end;
  
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  
  let x = x0;
  let y = y0;
  
  while (true) {
    if (x !== x0 || y !== y0) { // Don't include start position
      path.push([x, y]);
    }
    
    if (x === x1 && y === y1) break;
    
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
  
  return path;
}

// Function to get random special cell
export function getRandomSpecialCell(rarity?: 'common' | 'rare' | 'epic' | 'legendary'): CellSpecialType {
  const cellsByRarity = Object.entries(SPECIAL_CELLS).filter(([_, cell]) => 
    !rarity || cell.rarity === rarity
  );
  
  if (cellsByRarity.length === 0) return 'bomb';
  
  const randomIndex = Math.floor(Math.random() * cellsByRarity.length);
  return cellsByRarity[randomIndex][0] as CellSpecialType;
}

// Function to calculate special cell spawn probability
export function getSpecialCellSpawnChance(gameProgress: number): number {
  // Increase spawn rate as game progresses
  return Math.min(0.15, 0.05 + (gameProgress * 0.1));
}
