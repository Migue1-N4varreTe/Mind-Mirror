/**
 * ===================================================================
 * MIND MIRROR - TIPOS COMPARTIDOS PARA API
 * ===================================================================
 * Interfaces y tipos para comunicación entre frontend y backend
 * ===================================================================
 */

// ===================================================================
// TIPOS BASE
// ===================================================================

export interface Player {
  id: string;
  nombre: string;
  email?: string;
  estilo: PlayerStyle;
  perfil_ia: PlayerProfile;
  estadisticas: PlayerStats;
  configuracion: PlayerConfig;
  activo: boolean;
  ultimo_acceso: string;
  creado_en: string;
  actualizado_en: string;
}

export interface Game {
  id: string;
  jugador_id: string;
  estado: GameState;
  configuracion: GameConfiguration;
  puntuacion: GameScore;
  duracion?: number;
  turno_actual: number;
  fase_juego: GamePhase;
  modo_juego: GameMode;
  resultado?: GameResult;
  terminada: boolean;
  creado_en: string;
  terminado_en?: string;
  metadatos: Record<string, any>;
}

export interface Move {
  id: string;
  partida_id: string;
  turno: number;
  jugador: 'human' | 'ai';
  posicion: [number, number];
  tiempo_reaccion?: number;
  resultado: MoveResult;
  contexto: Record<string, any>;
  puntuacion_obtenida: number;
  efectos: any[];
  creado_en: string;
}

export interface AIAnalysis {
  id: string;
  partida_id: string;
  turno: number;
  movimiento_recomendado: [number, number] | null;
  confianza: number;
  razonamiento: string;
  alternativas: AlternativeMove[];
  prediccion_jugador: PlayerPrediction;
  personalidad_usada: AIPersonality;
  datos_aprendizaje: Record<string, any>;
  tiempo_procesamiento: number;
  creado_en: string;
}

// ===================================================================
// TIPOS ESPECÍFICOS
// ===================================================================

export type PlayerStyle = 'aggressive' | 'defensive' | 'creative' | 'predictable' | 'risky' | 'balanced';
export type GamePhase = 'learning' | 'mirror' | 'evolution' | 'mastery';
export type GameMode = 'classic' | 'mirror' | 'shadow' | 'rulebreaker' | 'infinite' | 'tutorial';
export type GameResult = 'jugador' | 'ia' | 'empate';
export type MoveResult = 'success' | 'blocked' | 'combo' | 'special';
export type AIPersonality = 'mirror' | 'shadow' | 'adaptive' | 'chameleon' | 'hunter' | 'sage';

export interface PlayerProfile {
  style: PlayerStyle;
  patterns: {
    favoritePositions: [number, number][];
    avgReactionTime: number;
    predictabilityScore: number;
    creativityScore: number;
    riskTolerance: number;
    adaptabilityScore: number;
  };
  weaknesses: string[];
  strengths: string[];
  historicalPerformance: {
    winRate: number;
    avgScore: number;
    improvementRate: number;
  };
}

export interface PlayerStats {
  total_partidas: number;
  partidas_ganadas: number;
  puntuacion_promedio: number;
  tiempo_reaccion_promedio: number;
  nivel_habilidad: number;
}

export interface PlayerConfig {
  dificultad_preferida: number;
  modo_favorito: GameMode;
  personalidad_ia: AIPersonality;
  mostrar_heatmap: boolean;
  mostrar_predicciones: boolean;
  modo_mentor: boolean;
}

export interface GameState {
  board: CellState[][];
  specialCells: SpecialCell[];
  currentPlayer: 'player' | 'ai';
  gamePhase: GamePhase;
}

export interface CellState {
  type: 'empty' | 'player' | 'ai' | 'special';
  value?: number;
  effects?: string[];
}

export interface SpecialCell {
  position: [number, number];
  type: string;
  value?: number;
  duration?: number;
}

export interface GameConfiguration {
  mode: GameMode;
  difficulty: number;
  aiPersonality: AIPersonality;
  boardSize: number;
  timeLimit: number;
  specialCellFrequency: number;
  enableLearning: boolean;
  enableFeedback: boolean;
  enableAchievements: boolean;
}

export interface GameScore {
  jugador: number;
  ia: number;
}

export interface AlternativeMove {
  position: [number, number];
  score: number;
  risk: number;
}

export interface PlayerPrediction {
  likelyMoves: [number, number][];
  confidence: number;
}

// ===================================================================
// REQUEST/RESPONSE TYPES
// ===================================================================

// Jugadores
export interface CreatePlayerRequest {
  nombre: string;
  email?: string;
  estilo?: PlayerStyle;
}

export interface CreatePlayerResponse {
  player: Player;
  success: boolean;
  message: string;
}

export interface GetPlayerResponse {
  player: Player | null;
  success: boolean;
  message: string;
}

export interface UpdatePlayerRequest {
  nombre?: string;
  email?: string;
  estilo?: PlayerStyle;
  configuracion?: Partial<PlayerConfig>;
}

export interface UpdatePlayerResponse {
  player: Player;
  success: boolean;
  message: string;
}

// Partidas
export interface CreateGameRequest {
  jugador_id: string;
  configuracion: GameConfiguration;
}

export interface CreateGameResponse {
  game: Game;
  success: boolean;
  message: string;
}

export interface GetGameResponse {
  game: Game | null;
  success: boolean;
  message: string;
}

export interface MakeMoveRequest {
  posicion: [number, number];
  tiempo_reaccion?: number;
  contexto?: Record<string, any>;
}

export interface MakeMoveResponse {
  move: Move;
  aiMove?: Move;
  aiAnalysis?: AIAnalysis;
  gameState: GameState;
  gameEvents: GameEvent[];
  gameEnded: boolean;
  winner?: GameResult;
  success: boolean;
  message: string;
}

export interface EndGameRequest {
  resultado?: GameResult;
  razon?: string;
}

export interface EndGameResponse {
  game: Game;
  analytics: GameAnalytics;
  achievements: Achievement[];
  success: boolean;
  message: string;
}

// Historial
export interface GetPlayerHistoryRequest {
  limit?: number;
  offset?: number;
  modo_juego?: GameMode;
  terminadas_solamente?: boolean;
}

export interface GetPlayerHistoryResponse {
  games: Game[];
  total: number;
  page: number;
  totalPages: number;
  success: boolean;
  message: string;
}

// Análisis y estadísticas
export interface GetPlayerAnalysisResponse {
  profile: PlayerProfile;
  recentGames: Game[];
  learningSession: LearningSession;
  achievements: Achievement[];
  success: boolean;
  message: string;
}

export interface GetGameAnalyticsResponse {
  analytics: GameAnalytics;
  success: boolean;
  message: string;
}

// ===================================================================
// TIPOS AUXILIARES
// ===================================================================

export interface GameEvent {
  id: string;
  partida_id: string;
  tipo: string;
  datos: Record<string, any>;
  importancia: number;
  timestamp_evento: string;
  procesado: boolean;
}

export interface Achievement {
  id: string;
  jugador_id: string;
  tipo_logro: string;
  nombre: string;
  descripcion: string;
  datos: Record<string, any>;
  desbloqueado_en: string;
  partida_id?: string;
}

export interface LearningSession {
  id: string;
  jugador_id: string;
  patrones_detectados: Record<string, any>;
  fortalezas: string[];
  debilidades: string[];
  predicciones_exitosas: number;
  predicciones_fallidas: number;
  adaptaciones_realizadas: number;
  nivel_desafio: number;
  ultima_actualizacion: string;
}

export interface GameAnalytics {
  sessionSummary: {
    duration: number;
    totalMoves: number;
    winnerScore: number;
    efficiencyRating: number;
    innovationScore: number;
    adaptabilityScore: number;
  };
  playerPerformance: {
    averageReactionTime: number;
    decisionAccuracy: number;
    patternConsistency: number;
    pressureHandling: number;
    learningIndicators: string[];
  };
  aiPerformance: {
    strategiesUsed: string[];
    adaptationsMade: number;
    predictionAccuracy: number;
    challengeLevel: number;
  };
  insights: {
    keyMoments: GameEvent[];
    improvementAreas: string[];
    strengthsShown: string[];
    nextRecommendations: string[];
  };
}

// ===================================================================
// ERROR TYPES
// ===================================================================

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface APIResponse<T = any> {
  data?: T;
  error?: APIError;
  success: boolean;
  message: string;
}

// ===================================================================
// CONSTANTES
// ===================================================================

export const API_ENDPOINTS = {
  // Jugadores
  PLAYERS: '/api/jugadores',
  PLAYER_BY_ID: (id: string) => `/api/jugadores/${id}`,
  PLAYER_ANALYSIS: (id: string) => `/api/jugadores/${id}/analisis`,
  PLAYER_HISTORY: (id: string) => `/api/jugadores/${id}/historial`,
  
  // Partidas
  GAMES: '/api/partidas',
  GAME_BY_ID: (id: string) => `/api/partidas/${id}`,
  GAME_MOVE: (id: string) => `/api/partidas/${id}/turno`,
  GAME_END: (id: string) => `/api/partidas/${id}/terminar`,
  GAME_ANALYTICS: (id: string) => `/api/partidas/${id}/analytics`,
  
  // Sistema
  HEALTH: '/api/health',
  CONFIG: '/api/config',
  RESET_AI: '/api/ia/reset',
} as const;

export const GAME_CONFIG_DEFAULTS: GameConfiguration = {
  mode: 'classic',
  difficulty: 0.5,
  aiPersonality: 'adaptive',
  boardSize: 8,
  timeLimit: 30,
  specialCellFrequency: 0.1,
  enableLearning: true,
  enableFeedback: true,
  enableAchievements: true,
};

export const PLAYER_CONFIG_DEFAULTS: PlayerConfig = {
  dificultad_preferida: 0.5,
  modo_favorito: 'classic',
  personalidad_ia: 'adaptive',
  mostrar_heatmap: false,
  mostrar_predicciones: false,
  modo_mentor: false,
};
