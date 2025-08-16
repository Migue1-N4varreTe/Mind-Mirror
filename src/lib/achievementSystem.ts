// Sistema de logros para Mind Mirror y el juego principal

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'reflection' | 'progress' | 'discovery' | 'mastery' | 'social';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  secret: boolean;
  requirements: AchievementRequirement[];
}

export interface AchievementRequirement {
  type: 'stat' | 'action' | 'count' | 'streak' | 'time';
  stat?: string;
  value: number;
  comparison: 'gte' | 'lte' | 'eq';
}

export interface PlayerStats {
  totalReflections: number;
  totalGameSessions: number;
  totalScore: number;
  currentStreak: number;
  longestStreak: number;
  perfectGames: number;
  achievementsUnlocked: number;
  hoursPlayed: number;
  levelsCompleted: number;
  specialCellsFound: number;
  mindMirrorSessions: number;
  emotionsExplored: number;
  actionsCompleted: number;
  questionsAnswered: number;
  dailySummariesViewed: number;
  [key: string]: number;
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  FIRST_REFLECTION: {
    id: 'FIRST_REFLECTION',
    name: 'Primera Reflexión',
    description: 'Completa tu primera sesión de reflexión en Mind Mirror',
    icon: '🪞',
    category: 'reflection',
    difficulty: 'bronze',
    points: 10,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    secret: false,
    requirements: [
      { type: 'count', stat: 'totalReflections', value: 1, comparison: 'gte' }
    ]
  },
  REFLECTION_MASTER: {
    id: 'REFLECTION_MASTER',
    name: 'Maestro de la Reflexión',
    description: 'Completa 100 sesiones de reflexión',
    icon: '🧘‍♀️',
    category: 'reflection', 
    difficulty: 'gold',
    points: 100,
    unlocked: false,
    progress: 0,
    maxProgress: 100,
    secret: false,
    requirements: [
      { type: 'count', stat: 'totalReflections', value: 100, comparison: 'gte' }
    ]
  },
  EMOTIONAL_EXPLORER: {
    id: 'EMOTIONAL_EXPLORER',
    name: 'Explorador Emocional',
    description: 'Explora 10 emociones diferentes en tus reflexiones',
    icon: '❤️‍🔥',
    category: 'discovery',
    difficulty: 'silver',
    points: 50,
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    secret: false,
    requirements: [
      { type: 'count', stat: 'emotionsExplored', value: 10, comparison: 'gte' }
    ]
  },
  DAILY_STREAK_7: {
    id: 'DAILY_STREAK_7',
    name: 'Semana Reflexiva',
    description: 'Mantén una racha de 7 días consecutivos de reflexión',
    icon: '🔥',
    category: 'progress',
    difficulty: 'silver',
    points: 75,
    unlocked: false,
    progress: 0,
    maxProgress: 7,
    secret: false,
    requirements: [
      { type: 'streak', stat: 'currentStreak', value: 7, comparison: 'gte' }
    ]
  },
  MINDFUL_MONTH: {
    id: 'MINDFUL_MONTH',
    name: 'Mes Consciente',
    description: 'Mantén una racha de 30 días consecutivos',
    icon: '🌟',
    category: 'progress',
    difficulty: 'platinum',
    points: 250,
    unlocked: false,
    progress: 0,
    maxProgress: 30,
    secret: false,
    requirements: [
      { type: 'streak', stat: 'currentStreak', value: 30, comparison: 'gte' }
    ]
  },
  ACTION_HERO: {
    id: 'ACTION_HERO',
    name: 'Héroe de Acción',
    description: 'Completa 50 acciones sugeridas por Mind Mirror',
    icon: '⚡',
    category: 'progress',
    difficulty: 'gold',
    points: 125,
    unlocked: false,
    progress: 0,
    maxProgress: 50,
    secret: false,
    requirements: [
      { type: 'count', stat: 'actionsCompleted', value: 50, comparison: 'gte' }
    ]
  },
  QUESTION_SEEKER: {
    id: 'QUESTION_SEEKER',
    name: 'Buscador de Preguntas',
    description: 'Genera 200 preguntas introspectivas',
    icon: '❓',
    category: 'discovery',
    difficulty: 'gold',
    points: 100,
    unlocked: false,
    progress: 0,
    maxProgress: 200,
    secret: false,
    requirements: [
      { type: 'count', stat: 'questionsAnswered', value: 200, comparison: 'gte' }
    ]
  },
  GAME_PERFECTIONIST: {
    id: 'GAME_PERFECTIONIST',
    name: 'Perfeccionista',
    description: 'Completa 10 juegos con precisión perfecta (100%)',
    icon: '🎯',
    category: 'mastery',
    difficulty: 'platinum',
    points: 200,
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    secret: false,
    requirements: [
      { type: 'count', stat: 'perfectGames', value: 10, comparison: 'gte' }
    ]
  },
  SPECIAL_HUNTER: {
    id: 'SPECIAL_HUNTER',
    name: 'Cazador de Especiales',
    description: 'Encuentra 100 celdas especiales',
    icon: '💎',
    category: 'discovery',
    difficulty: 'gold',
    points: 150,
    unlocked: false,
    progress: 0,
    maxProgress: 100,
    secret: false,
    requirements: [
      { type: 'count', stat: 'specialCellsFound', value: 100, comparison: 'gte' }
    ]
  },
  WISDOM_SEEKER: {
    id: 'WISDOM_SEEKER',
    name: 'Buscador de Sabiduría',
    description: 'Completa 365 días de reflexión diaria',
    icon: '🦉',
    category: 'mastery',
    difficulty: 'diamond',
    points: 500,
    unlocked: false,
    progress: 0,
    maxProgress: 365,
    secret: false,
    requirements: [
      { type: 'count', stat: 'totalReflections', value: 365, comparison: 'gte' }
    ]
  },
  SECRET_PHILOSOPHER: {
    id: 'SECRET_PHILOSOPHER',
    name: 'Filósofo Secreto',
    description: 'Descubre el poder de la reflexión profunda',
    icon: '🔮',
    category: 'mastery',
    difficulty: 'diamond',
    points: 1000,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    secret: true,
    requirements: [
      { type: 'count', stat: 'totalReflections', value: 1000, comparison: 'gte' },
      { type: 'count', stat: 'emotionsExplored', value: 50, comparison: 'gte' },
      { type: 'streak', stat: 'longestStreak', value: 100, comparison: 'gte' }
    ]
  }
};

export class AchievementSystem {
  private achievements: Map<string, Achievement> = new Map();
  private playerStats: PlayerStats;
  private onAchievementUnlocked?: (achievement: Achievement) => void;

  constructor(onAchievementUnlocked?: (achievement: Achievement) => void) {
    this.playerStats = this.getDefaultStats();
    this.onAchievementUnlocked = onAchievementUnlocked;
    this.initializeAchievements();
  }

  private getDefaultStats(): PlayerStats {
    return {
      totalReflections: 0,
      totalGameSessions: 0,
      totalScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      perfectGames: 0,
      achievementsUnlocked: 0,
      hoursPlayed: 0,
      levelsCompleted: 0,
      specialCellsFound: 0,
      mindMirrorSessions: 0,
      emotionsExplored: 0,
      actionsCompleted: 0,
      questionsAnswered: 0,
      dailySummariesViewed: 0
    };
  }

  private initializeAchievements(): void {
    Object.values(ACHIEVEMENTS).forEach(achievement => {
      this.achievements.set(achievement.id, { ...achievement });
    });
  }

  updateStat(statName: keyof PlayerStats, value: number, increment: boolean = true): void {
    if (increment) {
      this.playerStats[statName] += value;
    } else {
      this.playerStats[statName] = value;
    }

    this.checkAchievements();
  }

  incrementStat(statName: keyof PlayerStats, amount: number = 1): void {
    this.updateStat(statName, amount, true);
  }

  setStat(statName: keyof PlayerStats, value: number): void {
    this.updateStat(statName, value, false);
  }

  private checkAchievements(): void {
    this.achievements.forEach(achievement => {
      if (achievement.unlocked) return;

      const meetsAllRequirements = achievement.requirements.every(req => 
        this.checkRequirement(req)
      );

      if (meetsAllRequirements) {
        this.unlockAchievement(achievement.id);
      } else {
        // Actualizar progreso
        this.updateAchievementProgress(achievement);
      }
    });
  }

  private checkRequirement(requirement: AchievementRequirement): boolean {
    const statValue = requirement.stat ? this.playerStats[requirement.stat] || 0 : 0;

    switch (requirement.comparison) {
      case 'gte':
        return statValue >= requirement.value;
      case 'lte':
        return statValue <= requirement.value;
      case 'eq':
        return statValue === requirement.value;
      default:
        return false;
    }
  }

  private updateAchievementProgress(achievement: Achievement): void {
    if (achievement.requirements.length === 1) {
      const req = achievement.requirements[0];
      const statValue = req.stat ? this.playerStats[req.stat] || 0 : 0;
      achievement.progress = Math.min(statValue, achievement.maxProgress);
    } else {
      // Para logros con múltiples requisitos, calcular progreso promedio
      const progressValues = achievement.requirements.map(req => {
        const statValue = req.stat ? this.playerStats[req.stat] || 0 : 0;
        return Math.min(statValue / req.value, 1);
      });
      
      const avgProgress = progressValues.reduce((sum, p) => sum + p, 0) / progressValues.length;
      achievement.progress = Math.floor(avgProgress * achievement.maxProgress);
    }
  }

  unlockAchievement(achievementId: string): boolean {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) return false;

    achievement.unlocked = true;
    achievement.unlockedAt = new Date();
    achievement.progress = achievement.maxProgress;
    this.playerStats.achievementsUnlocked++;

    if (this.onAchievementUnlocked) {
      this.onAchievementUnlocked(achievement);
    }

    return true;
  }

  getAchievement(id: string): Achievement | null {
    return this.achievements.get(id) || null;
  }

  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  getUnlockedAchievements(): Achievement[] {
    return this.getAllAchievements().filter(a => a.unlocked);
  }

  getLockedAchievements(): Achievement[] {
    return this.getAllAchievements().filter(a => !a.unlocked && !a.secret);
  }

  getSecretAchievements(): Achievement[] {
    return this.getAllAchievements().filter(a => a.secret);
  }

  getAchievementsByCategory(category: Achievement['category']): Achievement[] {
    return this.getAllAchievements().filter(a => a.category === category);
  }

  getAchievementsByDifficulty(difficulty: Achievement['difficulty']): Achievement[] {
    return this.getAllAchievements().filter(a => a.difficulty === difficulty);
  }

  getTotalPoints(): number {
    return this.getUnlockedAchievements().reduce((total, achievement) => 
      total + achievement.points, 0
    );
  }

  getCompletionPercentage(): number {
    const totalAchievements = this.getAllAchievements().length;
    const unlockedAchievements = this.getUnlockedAchievements().length;
    return totalAchievements > 0 ? (unlockedAchievements / totalAchievements) * 100 : 0;
  }

  getPlayerStats(): PlayerStats {
    return { ...this.playerStats };
  }

  getRecentAchievements(limit: number = 5): Achievement[] {
    return this.getUnlockedAchievements()
      .filter(a => a.unlockedAt)
      .sort((a, b) => (b.unlockedAt!.getTime() - a.unlockedAt!.getTime()))
      .slice(0, limit);
  }

  exportProgress(): string {
    const data = {
      achievements: Array.from(this.achievements.entries()),
      stats: this.playerStats,
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data);
  }

  importProgress(dataJson: string): boolean {
    try {
      const data = JSON.parse(dataJson);
      
      // Validar estructura básica
      if (!data.achievements || !data.stats) {
        throw new Error('Invalid data structure');
      }

      // Importar logros
      this.achievements.clear();
      data.achievements.forEach(([id, achievement]: [string, Achievement]) => {
        if (achievement.unlockedAt && typeof achievement.unlockedAt === 'string') {
          achievement.unlockedAt = new Date(achievement.unlockedAt);
        }
        this.achievements.set(id, achievement);
      });

      // Importar estadísticas
      this.playerStats = { ...this.getDefaultStats(), ...data.stats };

      return true;
    } catch (error) {
      console.error('Failed to import achievement progress:', error);
      return false;
    }
  }

  reset(): void {
    this.playerStats = this.getDefaultStats();
    this.initializeAchievements();
  }

  // Métodos de conveniencia para eventos comunes
  onReflectionCompleted(): void {
    this.incrementStat('totalReflections');
    this.incrementStat('mindMirrorSessions');
  }

  onGameCompleted(score: number, perfect: boolean = false): void {
    this.incrementStat('totalGameSessions');
    this.incrementStat('totalScore', score);
    this.incrementStat('levelsCompleted');
    
    if (perfect) {
      this.incrementStat('perfectGames');
    }
  }

  onSpecialCellFound(): void {
    this.incrementStat('specialCellsFound');
  }

  onEmotionExplored(): void {
    this.incrementStat('emotionsExplored');
  }

  onActionCompleted(): void {
    this.incrementStat('actionsCompleted');
  }

  onQuestionAnswered(): void {
    this.incrementStat('questionsAnswered');
  }

  onDailySummaryViewed(): void {
    this.incrementStat('dailySummariesViewed');
  }

  updateStreak(currentStreak: number): void {
    this.setStat('currentStreak', currentStreak);
    if (currentStreak > this.playerStats.longestStreak) {
      this.setStat('longestStreak', currentStreak);
    }
  }

  addPlayTime(minutes: number): void {
    this.incrementStat('hoursPlayed', minutes / 60);
  }
}

export default AchievementSystem;
