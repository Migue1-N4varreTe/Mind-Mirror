// Enhanced Achievement System for Mind Mirror

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  category: 'gameplay' | 'strategy' | 'speed' | 'endurance' | 'master' | 'secret' | 'seasonal';
  condition: (gameData: GameEndData) => boolean;
  progress?: (gameData: GameEndData) => number;
  maxProgress?: number;
  points: number;
  unlocked: boolean;
  unlockedDate?: string;
  secret: boolean;
  title?: string;
  reward?: AchievementReward;
}

export interface AchievementReward {
  type: 'title' | 'avatar' | 'theme' | 'ability' | 'xp' | 'cosmetic';
  value: string | number;
  description: string;
}

export interface GameEndData {
  winner: 'player' | 'ai' | 'tie';
  playerScore: number;
  aiScore: number;
  totalMoves: number;
  gameDuration: number; // seconds
  phase: 'learning' | 'mirror' | 'evolution';
  combosUsed: number;
  specialCellsActivated: number;
  averageReactionTime: number;
  fastestMove: number;
  slowestMove: number;
  difficultyLevel: number;
  aiPersonality: string;
  boardFull: boolean;
  perfectGame: boolean; // won without losing a cell
  comboChain: number; // max consecutive combos
  timeBonus: number;
  dominationRatio: number; // player cells / total cells
}

export class AchievementSystem {
  private achievements: Achievement[] = [];
  private unlockedAchievements: Set<string> = new Set();

  constructor() {
    this.initializeAchievements();
    this.loadProgress();
  }

  private initializeAchievements() {
    this.achievements = [
      // Básicos - Gameplay
      {
        id: 'first-victory',
        name: 'Primera Victoria',
        description: 'Gana tu primera partida contra la IA',
        icon: '🏆',
        rarity: 'common',
        category: 'gameplay',
        condition: (data) => data.winner === 'player',
        points: 100,
        unlocked: false,
        secret: false,
        title: 'Novato Victorioso',
        reward: { type: 'xp', value: 500, description: 'Bonificación de experiencia' }
      },
      {
        id: 'perfect-game',
        name: 'Juego Perfecto',
        description: 'Gana sin que la IA capture ninguna celda',
        icon: '💎',
        rarity: 'epic',
        category: 'master',
        condition: (data) => data.winner === 'player' && data.perfectGame,
        points: 1000,
        unlocked: false,
        secret: false,
        title: 'Perfeccionista',
        reward: { type: 'avatar', value: '💎', description: 'Avatar Diamante' }
      },
      {
        id: 'board-domination',
        name: 'Dominación Total',
        description: 'Controla el 90% del tablero al final de la partida',
        icon: '👑',
        rarity: 'legendary',
        category: 'master',
        condition: (data) => data.dominationRatio >= 0.9 && data.winner === 'player',
        points: 2000,
        unlocked: false,
        secret: false,
        title: 'Emperador del Tablero',
        reward: { type: 'theme', value: 'golden-crown', description: 'Tema Corona Dorada' }
      },

      // Velocidad
      {
        id: 'lightning-fast',
        name: 'Rayo Veloz',
        description: 'Completa un movimiento en menos de 0.5 segundos',
        icon: '⚡',
        rarity: 'rare',
        category: 'speed',
        condition: (data) => data.fastestMove < 500,
        points: 300,
        unlocked: false,
        secret: false,
        title: 'Manos de Rayo'
      },
      {
        id: 'speed-demon',
        name: 'Demonio de Velocidad',
        description: 'Mantén un promedio de reacción bajo 1 segundo en toda la partida',
        icon: '🔥',
        rarity: 'epic',
        category: 'speed',
        condition: (data) => data.averageReactionTime < 1000 && data.totalMoves >= 20,
        points: 800,
        unlocked: false,
        secret: false,
        title: 'Velocista Cuántico'
      },

      // Estrategia
      {
        id: 'combo-master',
        name: 'Maestro de Combos',
        description: 'Realiza 5 combos en una sola partida',
        icon: '🌟',
        rarity: 'rare',
        category: 'strategy',
        condition: (data) => data.combosUsed >= 5,
        points: 400,
        unlocked: false,
        secret: false,
        title: 'Estratega Combo'
      },
      {
        id: 'combo-chain',
        name: 'Cadena Imparable',
        description: 'Encadena 3 combos consecutivos',
        icon: '⛓️',
        rarity: 'epic',
        category: 'strategy',
        condition: (data) => data.comboChain >= 3,
        points: 750,
        unlocked: false,
        secret: false,
        title: 'Encadenador'
      },

      // Resistencia
      {
        id: 'marathon-player',
        name: 'Jugador Maratón',
        description: 'Juega una partida de más de 15 minutos',
        icon: '🏃‍♂️',
        rarity: 'rare',
        category: 'endurance',
        condition: (data) => data.gameDuration > 900, // 15 minutos
        points: 350,
        unlocked: false,
        secret: false,
        title: 'Resistente Mental'
      },
      {
        id: 'epic-battle',
        name: 'Batalla Épica',
        description: 'Completa una partida con más de 100 movimientos',
        icon: '⚔️',
        rarity: 'epic',
        category: 'endurance',
        condition: (data) => data.totalMoves > 100,
        points: 600,
        unlocked: false,
        secret: false,
        title: 'Guerrero Épico'
      },

      // IA Evolution
      {
        id: 'ai-evolution',
        name: 'Evolución Completa',
        description: 'Llega a la fase Evolución de la IA',
        icon: '🧬',
        rarity: 'common',
        category: 'gameplay',
        condition: (data) => data.phase === 'evolution',
        points: 200,
        unlocked: false,
        secret: false,
        title: 'Evolucionista'
      },
      {
        id: 'ai-master',
        name: 'Maestro de IA',
        description: 'Vence a la IA en fase Evolución con dificultad alta',
        icon: '🤖',
        rarity: 'legendary',
        category: 'master',
        condition: (data) => data.winner === 'player' && data.phase === 'evolution' && data.difficultyLevel > 0.8,
        points: 1500,
        unlocked: false,
        secret: false,
        title: 'Domador de IA',
        reward: { type: 'ability', value: 'ai-insight', description: 'Capacidad de ver pensamientos de IA' }
      },

      // Celdas Especiales
      {
        id: 'special-master',
        name: 'Maestro Especial',
        description: 'Activa 10 celdas especiales en una partida',
        icon: '✨',
        rarity: 'rare',
        category: 'strategy',
        condition: (data) => data.specialCellsActivated >= 10,
        points: 500,
        unlocked: false,
        secret: false,
        title: 'Alquimista Cuántico'
      },

      // Secretos
      {
        id: 'tie-master',
        name: 'Equilibrio Perfecto',
        description: 'Empata una partida con el tablero completamente lleno',
        icon: '⚖️',
        rarity: 'legendary',
        category: 'secret',
        condition: (data) => data.winner === 'tie' && data.boardFull,
        points: 1200,
        unlocked: false,
        secret: true,
        title: 'Maestro del Equilibrio'
      },
      {
        id: 'quantum-master',
        name: 'Paradoja Cuántica',
        description: 'Gana una partida en exactamente 42 movimientos',
        icon: '⚛️',
        rarity: 'mythic',
        category: 'secret',
        condition: (data) => data.winner === 'player' && data.totalMoves === 42,
        points: 4200,
        unlocked: false,
        secret: true,
        title: 'Señor de la Paradoja',
        reward: { type: 'cosmetic', value: 'quantum-effects', description: 'Efectos cuánticos únicos' }
      },

      // Tiempo
      {
        id: 'speed-victory',
        name: 'Victoria Relámpago',
        description: 'Gana una partida en menos de 5 minutos',
        icon: '💨',
        rarity: 'epic',
        category: 'speed',
        condition: (data) => data.winner === 'player' && data.gameDuration < 300,
        points: 700,
        unlocked: false,
        secret: false,
        title: 'Velocista'
      },

      // Puntuación
      {
        id: 'high-scorer',
        name: 'Gran Puntuador',
        description: 'Consigue más de 50 puntos en una partida',
        icon: '🎯',
        rarity: 'rare',
        category: 'gameplay',
        condition: (data) => data.playerScore >= 50,
        points: 350,
        unlocked: false,
        secret: false,
        title: 'Anotador Élite'
      },
      {
        id: 'score-crusher',
        name: 'Destructor de Puntuaciones',
        description: 'Consigue más de 100 puntos en una partida',
        icon: '💥',
        rarity: 'legendary',
        category: 'master',
        condition: (data) => data.playerScore >= 100,
        points: 1000,
        unlocked: false,
        secret: false,
        title: 'Destructor Cuántico'
      },

      // Personalidades de IA
      {
        id: 'chameleon-hunter',
        name: 'Cazador de Camaleones',
        description: 'Vence a la IA Camaleón 5 veces',
        icon: '🦎',
        rarity: 'rare',
        category: 'strategy',
        condition: (data) => false, // Se trackea por separado
        progress: (data) => data.aiPersonality === 'chameleon' && data.winner === 'player' ? 1 : 0,
        maxProgress: 5,
        points: 400,
        unlocked: false,
        secret: false,
        title: 'Domador de Camaleones'
      },
      {
        id: 'all-personalities',
        name: 'Psicólogo Maestro',
        description: 'Vence a todas las personalidades de IA',
        icon: '🧠',
        rarity: 'legendary',
        category: 'master',
        condition: (data) => false, // Se trackea por separado
        points: 1500,
        unlocked: false,
        secret: false,
        title: 'Maestro Psicólogo'
      },

      // Logros de serie
      {
        id: 'winning-streak-5',
        name: 'Racha Ganadora',
        description: 'Gana 5 partidas consecutivas',
        icon: '🔥',
        rarity: 'epic',
        category: 'master',
        condition: (data) => false, // Se trackea por separado
        points: 800,
        unlocked: false,
        secret: false,
        title: 'Imparable'
      },
      {
        id: 'winning-streak-10',
        name: 'Leyenda Viviente',
        description: 'Gana 10 partidas consecutivas',
        icon: '👑',
        rarity: 'mythic',
        category: 'master',
        condition: (data) => false, // Se trackea por separado
        points: 2500,
        unlocked: false,
        secret: false,
        title: 'Leyenda Cuántica',
        reward: { type: 'theme', value: 'legendary-gold', description: 'Tema Dorado Legendario' }
      }
    ];
  }

  checkAchievements(gameData: GameEndData): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    this.achievements.forEach(achievement => {
      if (!achievement.unlocked && !achievement.secret && achievement.condition(gameData)) {
        achievement.unlocked = true;
        achievement.unlockedDate = new Date().toISOString();
        this.unlockedAchievements.add(achievement.id);
        newlyUnlocked.push(achievement);
      }
    });

    // Check secret achievements
    this.achievements.filter(a => a.secret).forEach(achievement => {
      if (!achievement.unlocked && achievement.condition(gameData)) {
        achievement.unlocked = true;
        achievement.unlockedDate = new Date().toISOString();
        this.unlockedAchievements.add(achievement.id);
        newlyUnlocked.push(achievement);
      }
    });

    this.saveProgress();
    return newlyUnlocked;
  }

  updateProgress(achievementId: string, increment: number = 1) {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (achievement && achievement.maxProgress) {
      const currentProgress = this.getProgress(achievementId);
      const newProgress = Math.min(currentProgress + increment, achievement.maxProgress);
      localStorage.setItem(`achievement-progress-${achievementId}`, newProgress.toString());
      
      if (newProgress >= achievement.maxProgress && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedDate = new Date().toISOString();
        this.unlockedAchievements.add(achievement.id);
        this.saveProgress();
        return achievement;
      }
    }
    return null;
  }

  getProgress(achievementId: string): number {
    const stored = localStorage.getItem(`achievement-progress-${achievementId}`);
    return stored ? parseInt(stored) : 0;
  }

  private saveProgress() {
    const unlockedList = Array.from(this.unlockedAchievements);
    localStorage.setItem('mindmirror-achievements', JSON.stringify(unlockedList));
    
    // Save individual achievement data
    this.achievements.forEach(achievement => {
      if (achievement.unlocked) {
        localStorage.setItem(`achievement-${achievement.id}`, JSON.stringify({
          unlocked: true,
          unlockedDate: achievement.unlockedDate
        }));
      }
    });
  }

  private loadProgress() {
    const stored = localStorage.getItem('mindmirror-achievements');
    if (stored) {
      const unlockedList = JSON.parse(stored);
      this.unlockedAchievements = new Set(unlockedList);
      
      // Load individual achievement data
      this.achievements.forEach(achievement => {
        const achData = localStorage.getItem(`achievement-${achievement.id}`);
        if (achData) {
          const data = JSON.parse(achData);
          achievement.unlocked = data.unlocked;
          achievement.unlockedDate = data.unlockedDate;
        }
      });
    }
  }

  getAllAchievements(): Achievement[] {
    return this.achievements.map(achievement => ({
      ...achievement,
      progress: achievement.maxProgress ? this.getProgress(achievement.id) : undefined
    }));
  }

  getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.unlocked);
  }

  getSecretAchievements(): Achievement[] {
    return this.achievements.filter(a => a.secret && a.unlocked);
  }

  getTotalPoints(): number {
    return this.achievements
      .filter(a => a.unlocked)
      .reduce((total, a) => total + a.points, 0);
  }

  getCompletionPercentage(): number {
    const visibleAchievements = this.achievements.filter(a => !a.secret);
    const unlockedVisible = visibleAchievements.filter(a => a.unlocked);
    return (unlockedVisible.length / visibleAchievements.length) * 100;
  }
}

// Helper functions for game end logic
export function calculateGameEndData(gameState: any, startTime: number, reactionTimes: number[]): GameEndData {
  const endTime = Date.now();
  const gameDuration = (endTime - startTime) / 1000; // seconds
  
  // Count filled cells
  const filledCells = gameState.board.flat().filter((cell: any) => cell.type !== 'empty');
  const playerCells = filledCells.filter((cell: any) => cell.owner === 'player').length;
  const aiCells = filledCells.filter((cell: any) => cell.owner === 'ai').length;
  const totalCells = gameState.board.length * gameState.board[0].length;
  const boardFull = filledCells.length >= totalCells - 1; // Allow for special cells
  
  // Determine winner
  let winner: 'player' | 'ai' | 'tie';
  if (playerCells > aiCells) {
    winner = 'player';
  } else if (aiCells > playerCells) {
    winner = 'ai';
  } else {
    winner = 'tie';
  }
  
  // Calculate stats
  const averageReactionTime = reactionTimes.length > 0 
    ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
    : 0;
  
  const fastestMove = reactionTimes.length > 0 ? Math.min(...reactionTimes) : 0;
  const slowestMove = reactionTimes.length > 0 ? Math.max(...reactionTimes) : 0;
  
  const dominationRatio = totalCells > 0 ? playerCells / totalCells : 0;
  const perfectGame = winner === 'player' && aiCells === 0;
  
  return {
    winner,
    playerScore: gameState.score.player,
    aiScore: gameState.score.ai,
    totalMoves: gameState.moves,
    gameDuration,
    phase: gameState.phase,
    combosUsed: gameState.comboCount,
    specialCellsActivated: 0, // Esto se trackearía durante el juego
    averageReactionTime,
    fastestMove,
    slowestMove,
    difficultyLevel: gameState.difficulty,
    aiPersonality: gameState.aiPersonality,
    boardFull,
    perfectGame,
    comboChain: 0, // Esto se trackearía durante el juego
    timeBonus: 0,
    dominationRatio
  };
}
