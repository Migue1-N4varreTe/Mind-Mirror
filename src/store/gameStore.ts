import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from 'firebase/auth';
import type { UserProfile } from '../services/authService';

interface GameSettings {
  difficulty: 'novice' | 'intermediate' | 'expert' | 'master' | 'quantum';
  theme: 'neon' | 'matrix' | 'cyberpunk' | 'retro' | 'minimal';
  soundEnabled: boolean;
  musicVolume: number;
  effectsVolume: number;
  visualEffects: boolean;
  animationSpeed: number;
  boardSize: '6x6' | '8x8' | '10x10';
  timeLimit: number;
  specialCellFrequency: number;
}

interface GameState {
  // Authentication
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  
  // Game settings
  settings: GameSettings;
  
  // Current game state
  currentGame: {
    isActive: boolean;
    startTime: number;
    moves: number;
    score: { player: number; ai: number };
    phase: 'learning' | 'mirror' | 'evolution';
    aiPersonality: string;
    difficulty: number;
  } | null;
  
  // UI state
  showHeatmap: boolean;
  showPredictions: boolean;
  mentorMode: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  startGame: () => void;
  endGame: () => void;
  updateGameState: (updates: any) => void;
  toggleHeatmap: () => void;
  togglePredictions: () => void;
  toggleMentorMode: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      userProfile: null,
      isLoading: true,
      
      settings: {
        difficulty: 'intermediate',
        theme: 'neon',
        soundEnabled: true,
        musicVolume: 70,
        effectsVolume: 85,
        visualEffects: true,
        animationSpeed: 100,
        boardSize: '8x8',
        timeLimit: 30,
        specialCellFrequency: 20
      },
      
      currentGame: null,
      showHeatmap: false,
      showPredictions: false,
      mentorMode: false,
      
      // Actions
      setUser: (user) => set({ user }),
      setUserProfile: (profile) => set({ userProfile: profile }),
      setLoading: (loading) => set({ isLoading: loading }),
      
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      
      startGame: () => set({
        currentGame: {
          isActive: true,
          startTime: Date.now(),
          moves: 0,
          score: { player: 0, ai: 0 },
          phase: 'learning',
          aiPersonality: 'chameleon',
          difficulty: 0.5
        }
      }),
      
      endGame: () => set({ currentGame: null }),
      
      updateGameState: (updates) => set((state) => ({
        currentGame: state.currentGame ? { ...state.currentGame, ...updates } : null
      })),
      
      toggleHeatmap: () => set((state) => ({ showHeatmap: !state.showHeatmap })),
      togglePredictions: () => set((state) => ({ showPredictions: !state.showPredictions })),
      toggleMentorMode: () => set((state) => ({ mentorMode: !state.mentorMode }))
    }),
    {
      name: 'mindmirror-game-store',
      partialize: (state) => ({ 
        settings: state.settings,
        showHeatmap: state.showHeatmap,
        showPredictions: state.showPredictions,
        mentorMode: state.mentorMode
      })
    }
  )
);