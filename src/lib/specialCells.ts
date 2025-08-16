// Mock de celdas especiales para el juego

export interface SpecialCell {
  id: string;
  name: string;
  icon: string;
  color: string;
  effect: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  power: number;
}

export const SPECIAL_CELLS: Record<string, SpecialCell> = {
  NEURAL_BOOST: {
    id: "NEURAL_BOOST",
    name: "Impulso Neural",
    icon: "🧠",
    color: "#00ffff",
    effect: "Aumenta la puntuación x2 por 10 segundos",
    rarity: "common",
    power: 2,
  },
  QUANTUM_LINK: {
    id: "QUANTUM_LINK",
    name: "Enlace Cuántico",
    icon: "⚛️",
    color: "#9370db",
    effect: "Conecta celdas distantes automáticamente",
    rarity: "rare",
    power: 3,
  },
  TIME_WARP: {
    id: "TIME_WARP",
    name: "Distorsión Temporal",
    icon: "⏰",
    color: "#ffd700",
    effect: "Congela el tiempo por 5 segundos",
    rarity: "epic",
    power: 4,
  },
  MIND_EXPLOSION: {
    id: "MIND_EXPLOSION",
    name: "Explosión Mental",
    icon: "💥",
    color: "#ff6b35",
    effect: "Elimina todas las celdas en un radio de 3",
    rarity: "legendary",
    power: 5,
  },
  REFLECTION_MIRROR: {
    id: "REFLECTION_MIRROR",
    name: "Espejo Reflexivo",
    icon: "🪞",
    color: "#c0c0c0",
    effect: "Duplica el efecto de la última celda activada",
    rarity: "rare",
    power: 3,
  },
  WISDOM_CRYSTAL: {
    id: "WISDOM_CRYSTAL",
    name: "Cristal de Sabiduría",
    icon: "💎",
    color: "#48cae4",
    effect: "Revela patrones ocultos en el tablero",
    rarity: "epic",
    power: 4,
  },
};

export function getRandomSpecialCell(): SpecialCell {
  const cells = Object.values(SPECIAL_CELLS);
  return cells[Math.floor(Math.random() * cells.length)];
}

export function getSpecialCellSpawnChance(level: number): number {
  // Aumenta la probabilidad de spawn con el nivel
  return Math.min(0.1 + level * 0.02, 0.5);
}

export function getSpecialCellByRarity(
  rarity: SpecialCell["rarity"],
): SpecialCell[] {
  return Object.values(SPECIAL_CELLS).filter((cell) => cell.rarity === rarity);
}

export function applySpecialCellEffect(cell: SpecialCell, gameState: any): any {
  // Mock de efectos - en una implementación real esto modificaría el estado del juego
  console.log(`Activating special cell: ${cell.name} - ${cell.effect}`);

  switch (cell.id) {
    case "NEURAL_BOOST":
      return { ...gameState, scoreMultiplier: cell.power, boostTimer: 10 };
    case "QUANTUM_LINK":
      return { ...gameState, quantumLinksActive: 3 };
    case "TIME_WARP":
      return { ...gameState, timeFreeze: 5 };
    case "MIND_EXPLOSION":
      return { ...gameState, explosionRadius: 3, explosionActive: true };
    case "REFLECTION_MIRROR":
      return { ...gameState, lastEffectDoubled: true };
    case "WISDOM_CRYSTAL":
      return { ...gameState, patternsRevealed: true, revealTimer: 15 };
    default:
      return gameState;
  }
}

export default SPECIAL_CELLS;
