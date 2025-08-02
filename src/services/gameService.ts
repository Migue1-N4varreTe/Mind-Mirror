import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { GameEndData } from '../lib/achievementSystem';

export interface GameSession {
  id?: string;
  userId: string;
  gameData: GameEndData;
  timestamp: string;
  duration: number;
  aiPersonality: string;
  difficulty: number;
  achievements: string[];
  patterns: any[];
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatar: string;
  score: number;
  level: number;
  winRate: number;
  gamesPlayed: number;
  lastActive: string;
}

export const saveGameSession = async (session: Omit<GameSession, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'gameSessions'), session);
    return docRef.id;
  } catch (error) {
    console.error('Error saving game session:', error);
    throw error;
  }
};

export const getUserGameSessions = async (userId: string, limitCount: number = 10): Promise<GameSession[]> => {
  try {
    const q = query(
      collection(db, 'gameSessions'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GameSession));
  } catch (error) {
    console.error('Error getting user game sessions:', error);
    return [];
  }
};

export const getLeaderboard = async (limitCount: number = 50): Promise<LeaderboardEntry[]> => {
  try {
    const q = query(
      collection(db, 'users'),
      orderBy('stats.totalScore', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        userId: doc.id,
        displayName: data.displayName,
        avatar: data.photoURL || '🎮',
        score: data.stats?.totalScore || 0,
        level: data.level || 1,
        winRate: data.totalGames > 0 ? (data.gamesWon / data.totalGames) * 100 : 0,
        gamesPlayed: data.totalGames || 0,
        lastActive: data.lastLogin
      };
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
};

export const saveCustomAI = async (userId: string, aiData: any): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'customAIs'), {
      ...aiData,
      userId,
      createdAt: new Date().toISOString(),
      isPublic: aiData.isPublic || false,
      downloads: 0,
      rating: 0
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving custom AI:', error);
    throw error;
  }
};

export const getUserCustomAIs = async (userId: string): Promise<any[]> => {
  try {
    const q = query(
      collection(db, 'customAIs'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user custom AIs:', error);
    return [];
  }
};

export const getPublicAIs = async (limitCount: number = 20): Promise<any[]> => {
  try {
    const q = query(
      collection(db, 'customAIs'),
      where('isPublic', '==', true),
      orderBy('rating', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting public AIs:', error);
    return [];
  }
};

export const updateUserStats = async (userId: string, gameData: GameEndData): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentData = userDoc.data();
      const currentStats = currentData.stats || {};
      
      // Calculate new stats
      const newTotalGames = (currentData.totalGames || 0) + 1;
      const newGamesWon = (currentData.gamesWon || 0) + (gameData.winner === 'player' ? 1 : 0);
      const newXP = (currentData.xp || 0) + gameData.playerScore * 10;
      const newLevel = Math.floor(newXP / 1000) + 1;
      
      // Update reaction times
      const currentAvgReaction = currentStats.averageReactionTime || 0;
      const newAvgReaction = currentTotalGames > 1 
        ? ((currentAvgReaction * (newTotalGames - 1)) + gameData.averageReactionTime) / newTotalGames
        : gameData.averageReactionTime;
      
      const updates = {
        totalGames: newTotalGames,
        gamesWon: newGamesWon,
        xp: newXP,
        level: newLevel,
        'stats.totalScore': (currentStats.totalScore || 0) + gameData.playerScore,
        'stats.averageReactionTime': newAvgReaction,
        'stats.bestReactionTime': Math.min(currentStats.bestReactionTime || Infinity, gameData.fastestMove),
        'stats.combosAchieved': (currentStats.combosAchieved || 0) + gameData.combosUsed,
        'stats.specialCellsActivated': (currentStats.specialCellsActivated || 0) + gameData.specialCellsActivated,
        'stats.aiPhaseReached': gameData.phase,
        'stats.playtime': (currentStats.playtime || 0) + Math.floor(gameData.gameDuration / 60),
        lastLogin: new Date().toISOString()
      };
      
      // Update win streak
      if (gameData.winner === 'player') {
        const newWinStreak = (currentStats.winStreak || 0) + 1;
        updates['stats.winStreak'] = newWinStreak;
        updates['stats.bestWinStreak'] = Math.max(currentStats.bestWinStreak || 0, newWinStreak);
      } else {
        updates['stats.winStreak'] = 0;
      }
      
      await updateDoc(userRef, updates);
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};