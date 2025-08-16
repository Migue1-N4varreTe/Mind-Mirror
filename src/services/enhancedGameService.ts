/**
 * ===================================================================
 * MIND MIRROR - SERVICIO DE JUEGO MEJORADO
 * ===================================================================
 * Servicio que conecta el frontend con el backend API
 * ===================================================================
 */

import { apiClient } from "./apiClient";
import type {
  Player,
  Game,
  Move,
  GameConfiguration,
  GameState,
  GameAnalytics,
  Achievement,
  GAME_CONFIG_DEFAULTS,
} from "@shared/game-api";

export interface GameSession {
  id: string;
  player: Player;
  game: Game;
  isActive: boolean;
  startTime: Date;
  moves: Move[];
  events: any[];
}

export class EnhancedGameService {
  private currentSession: GameSession | null = null;
  private connectionStatus: "connected" | "disconnected" | "error" =
    "disconnected";

  constructor() {
    this.checkConnection();
  }

  // ===================================================================
  // GESTIÓN DE CONEXIÓN
  // ===================================================================

  private async checkConnection(): Promise<void> {
    try {
      const isConnected = await apiClient.checkConnection();
      this.connectionStatus = isConnected ? "connected" : "disconnected";

      if (!isConnected) {
        console.warn("🔌 API connection failed, using offline mode");
      } else {
        console.log("✅ API connection established");
      }
    } catch (error) {
      this.connectionStatus = "error";
      console.error("❌ API connection error:", error);
    }
  }

  public getConnectionStatus(): string {
    return this.connectionStatus;
  }

  public async reconnect(): Promise<boolean> {
    await this.checkConnection();
    return this.connectionStatus === "connected";
  }

  // ===================================================================
  // GESTIÓN DE JUGADORES
  // ===================================================================

  public async createOrGetPlayer(playerData: {
    nombre: string;
    email?: string;
    userId?: string; // Para integración con Firebase
  }): Promise<Player> {
    try {
      // Si tenemos conexión, intentar crear/obtener desde API
      if (this.connectionStatus === "connected") {
        // Primero intentar obtener por email si está disponible
        if (playerData.email) {
          const existingPlayer = await this.findPlayerByEmail(playerData.email);
          if (existingPlayer) {
            return existingPlayer;
          }
        }

        // Si no existe, crear nuevo
        const response = await apiClient.createPlayer({
          nombre: playerData.nombre,
          email: playerData.email,
          estilo: "balanced",
        });

        return response.player;
      } else {
        // Modo offline: crear jugador temporal
        return this.createOfflinePlayer(playerData);
      }
    } catch (error) {
      console.error("Error creating/getting player:", error);
      // Fallback a modo offline
      return this.createOfflinePlayer(playerData);
    }
  }

  private async findPlayerByEmail(email: string): Promise<Player | null> {
    try {
      // Implementar búsqueda por email cuando esté disponible en la API
      // Por ahora, retornar null
      return null;
    } catch (error) {
      return null;
    }
  }

  private createOfflinePlayer(playerData: {
    nombre: string;
    email?: string;
    userId?: string;
  }): Player {
    const id = playerData.userId || `offline_${Date.now()}`;
    return {
      id,
      nombre: playerData.nombre,
      email: playerData.email,
      estilo: "balanced",
      perfil_ia: {
        style: "balanced",
        patterns: {
          favoritePositions: [],
          avgReactionTime: 2000,
          predictabilityScore: 0.5,
          creativityScore: 0.5,
          riskTolerance: 0.5,
          adaptabilityScore: 0.5,
        },
        weaknesses: [],
        strengths: [],
        historicalPerformance: {
          winRate: 0.5,
          avgScore: 0,
          improvementRate: 0,
        },
      },
      estadisticas: {
        total_partidas: 0,
        partidas_ganadas: 0,
        puntuacion_promedio: 0,
        tiempo_reaccion_promedio: 0,
        nivel_habilidad: 1,
      },
      configuracion: {
        dificultad_preferida: 0.5,
        modo_favorito: "classic",
        personalidad_ia: "adaptive",
        mostrar_heatmap: false,
        mostrar_predicciones: false,
        modo_mentor: false,
      },
      activo: true,
      ultimo_acceso: new Date().toISOString(),
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    };
  }

  public async updatePlayerConfig(
    playerId: string,
    config: any,
  ): Promise<boolean> {
    try {
      if (this.connectionStatus === "connected") {
        await apiClient.updatePlayer(playerId, { configuracion: config });
        return true;
      } else {
        // Guardar en localStorage para modo offline
        localStorage.setItem(
          `player_config_${playerId}`,
          JSON.stringify(config),
        );
        return true;
      }
    } catch (error) {
      console.error("Error updating player config:", error);
      return false;
    }
  }

  // ===================================================================
  // GESTIÓN DE PARTIDAS
  // ===================================================================

  public async startNewGame(
    player: Player,
    configuration: GameConfiguration = GAME_CONFIG_DEFAULTS,
  ): Promise<GameSession> {
    try {
      let game: Game;

      if (this.connectionStatus === "connected") {
        // Crear partida en el backend
        const response = await apiClient.createGame({
          jugador_id: player.id,
          configuracion: configuration,
        });
        game = response.game;
      } else {
        // Crear partida offline
        game = this.createOfflineGame(player.id, configuration);
      }

      // Crear sesión
      const session: GameSession = {
        id: game.id,
        player,
        game,
        isActive: true,
        startTime: new Date(game.creado_en),
        moves: [],
        events: [],
      };

      this.currentSession = session;
      return session;
    } catch (error) {
      console.error("Error starting new game:", error);
      throw new Error(`Failed to start game: ${error}`);
    }
  }

  private createOfflineGame(
    playerId: string,
    configuration: GameConfiguration,
  ): Game {
    const id = `offline_game_${Date.now()}`;
    const now = new Date().toISOString();

    return {
      id,
      jugador_id: playerId,
      estado: {
        board: this.createInitialBoard(configuration.boardSize),
        specialCells: [],
        currentPlayer: "player",
        gamePhase: "learning",
      },
      configuracion: configuration,
      puntuacion: { jugador: 0, ia: 0 },
      turno_actual: 1,
      fase_juego: "learning",
      modo_juego: configuration.mode,
      terminada: false,
      creado_en: now,
      metadatos: { offline: true },
    };
  }

  private createInitialBoard(size: number): any[][] {
    const board = [];
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        row.push({ type: "empty" });
      }
      board.push(row);
    }
    return board;
  }

  public async makeMove(
    position: [number, number],
    reactionTime?: number,
    context?: any,
  ): Promise<{
    success: boolean;
    move?: Move;
    aiMove?: Move;
    gameState?: GameState;
    gameEnded?: boolean;
    winner?: string;
    error?: string;
  }> {
    if (!this.currentSession) {
      return { success: false, error: "No hay sesión activa" };
    }

    try {
      if (this.connectionStatus === "connected") {
        // Procesar movimiento en el backend
        const response = await apiClient.makeMove(this.currentSession.game.id, {
          posicion: position,
          tiempo_reaccion: reactionTime,
          contexto: context,
        });

        // Actualizar sesión local
        this.currentSession.moves.push(response.move);
        if (response.aiMove) {
          this.currentSession.moves.push(response.aiMove);
        }
        this.currentSession.game.estado = response.gameState;
        this.currentSession.game.turno_actual++;

        if (response.gameEnded) {
          this.currentSession.isActive = false;
          this.currentSession.game.terminada = true;
          this.currentSession.game.resultado = response.winner;
        }

        return {
          success: true,
          move: response.move,
          aiMove: response.aiMove,
          gameState: response.gameState,
          gameEnded: response.gameEnded,
          winner: response.winner,
        };
      } else {
        // Procesar movimiento offline
        return this.processOfflineMove(position, reactionTime, context);
      }
    } catch (error) {
      console.error("Error making move:", error);
      return {
        success: false,
        error: `Error al realizar movimiento: ${error}`,
      };
    }
  }

  private processOfflineMove(
    position: [number, number],
    reactionTime?: number,
    context?: any,
  ): {
    success: boolean;
    move?: Move;
    aiMove?: Move;
    gameState?: GameState;
    gameEnded?: boolean;
    winner?: string;
    error?: string;
  } {
    if (!this.currentSession) {
      return { success: false, error: "No hay sesión activa" };
    }

    try {
      const [row, col] = position;
      const game = this.currentSession.game;

      // Validar movimiento
      if (
        row < 0 ||
        row >= game.estado.board.length ||
        col < 0 ||
        col >= game.estado.board[0].length ||
        game.estado.board[row][col].type !== "empty"
      ) {
        return { success: false, error: "Movimiento inválido" };
      }

      // Crear movimiento del jugador
      const playerMove: Move = {
        id: `offline_move_${Date.now()}`,
        partida_id: game.id,
        turno: game.turno_actual,
        jugador: "human",
        posicion: position,
        tiempo_reaccion: reactionTime,
        resultado: "success",
        contexto: context || {},
        puntuacion_obtenida: 10,
        efectos: [],
        creado_en: new Date().toISOString(),
      };

      // Aplicar movimiento al tablero
      game.estado.board[row][col] = { type: "player" };

      // Generar movimiento de IA simple
      const aiPosition = this.generateSimpleAIMove(game.estado);
      let aiMove: Move | undefined;

      if (aiPosition) {
        const [aiRow, aiCol] = aiPosition;
        game.estado.board[aiRow][aiCol] = { type: "ai" };

        aiMove = {
          id: `offline_ai_move_${Date.now()}`,
          partida_id: game.id,
          turno: game.turno_actual,
          jugador: "ai",
          posicion: aiPosition,
          resultado: "success",
          contexto: { strategy: "random" },
          puntuacion_obtenida: 10,
          efectos: [],
          creado_en: new Date().toISOString(),
        };
      }

      // Actualizar puntuación
      game.puntuacion.jugador += playerMove.puntuacion_obtenida;
      if (aiMove) {
        game.puntuacion.ia += aiMove.puntuacion_obtenida;
      }

      // Actualizar turno
      game.turno_actual++;

      // Verificar fin de juego
      const gameEnded = this.checkOfflineGameEnd(game.estado);
      let winner: string | undefined;

      if (gameEnded) {
        this.currentSession.isActive = false;
        game.terminada = true;
        winner = this.determineWinner(game.puntuacion);
        game.resultado = winner;
      }

      // Guardar movimientos en la sesión
      this.currentSession.moves.push(playerMove);
      if (aiMove) {
        this.currentSession.moves.push(aiMove);
      }

      return {
        success: true,
        move: playerMove,
        aiMove,
        gameState: game.estado,
        gameEnded,
        winner,
      };
    } catch (error) {
      console.error("Error processing offline move:", error);
      return { success: false, error: `Error en movimiento offline: ${error}` };
    }
  }

  private generateSimpleAIMove(gameState: GameState): [number, number] | null {
    const emptyPositions: [number, number][] = [];

    for (let i = 0; i < gameState.board.length; i++) {
      for (let j = 0; j < gameState.board[i].length; j++) {
        if (gameState.board[i][j].type === "empty") {
          emptyPositions.push([i, j]);
        }
      }
    }

    if (emptyPositions.length === 0) return null;

    // Seleccionar posición aleatoria
    const randomIndex = Math.floor(Math.random() * emptyPositions.length);
    return emptyPositions[randomIndex];
  }

  private checkOfflineGameEnd(gameState: GameState): boolean {
    // Verificar si el tablero está lleno
    for (let i = 0; i < gameState.board.length; i++) {
      for (let j = 0; j < gameState.board[i].length; j++) {
        if (gameState.board[i][j].type === "empty") {
          return false;
        }
      }
    }
    return true;
  }

  private determineWinner(score: { jugador: number; ia: number }): string {
    if (score.jugador > score.ia) return "jugador";
    if (score.ia > score.jugador) return "ia";
    return "empate";
  }

  public async endGame(
    resultado?: string,
    razon?: string,
  ): Promise<{
    success: boolean;
    analytics?: GameAnalytics;
    achievements?: Achievement[];
    error?: string;
  }> {
    if (!this.currentSession) {
      return { success: false, error: "No hay sesión activa" };
    }

    try {
      if (this.connectionStatus === "connected") {
        const response = await apiClient.endGame(this.currentSession.game.id, {
          resultado,
          razon,
        });

        this.currentSession.isActive = false;
        this.currentSession = null;

        return {
          success: true,
          analytics: response.analytics,
          achievements: response.achievements,
        };
      } else {
        // Finalizar partida offline
        this.currentSession.isActive = false;
        const game = this.currentSession.game;
        game.terminada = true;
        game.terminado_en = new Date().toISOString();

        if (resultado) {
          game.resultado = resultado;
        }

        // TODO: Generar analytics offline básico
        const analytics = this.generateOfflineAnalytics();

        this.currentSession = null;

        return {
          success: true,
          analytics,
          achievements: [], // Sin achievements en modo offline
        };
      }
    } catch (error) {
      console.error("Error ending game:", error);
      return { success: false, error: `Error al terminar partida: ${error}` };
    }
  }

  private generateOfflineAnalytics(): GameAnalytics {
    if (!this.currentSession) {
      throw new Error("No session available for analytics");
    }

    const game = this.currentSession.game;
    const moves = this.currentSession.moves;
    const playerMoves = moves.filter((m) => m.jugador === "human");

    return {
      sessionSummary: {
        duration: Date.now() - new Date(game.creado_en).getTime(),
        totalMoves: moves.length,
        winnerScore: Math.max(game.puntuacion.jugador, game.puntuacion.ia),
        efficiencyRating: 0.75,
        innovationScore: 0.6,
        adaptabilityScore: 0.7,
      },
      playerPerformance: {
        averageReactionTime:
          playerMoves.reduce((sum, m) => sum + (m.tiempo_reaccion || 2000), 0) /
          Math.max(playerMoves.length, 1),
        decisionAccuracy: 0.75,
        patternConsistency: 0.6,
        pressureHandling: 0.7,
        learningIndicators: ["Partida offline completada"],
      },
      aiPerformance: {
        strategiesUsed: ["random"],
        adaptationsMade: 0,
        predictionAccuracy: 0.5,
        challengeLevel: game.configuracion?.difficulty || 0.5,
      },
      insights: {
        keyMoments: [],
        improvementAreas: ["Conectar a internet para análisis completo"],
        strengthsShown: ["Jugabilidad offline"],
        nextRecommendations: ["Sincronizar datos cuando esté online"],
      },
    };
  }

  // ===================================================================
  // MÉTODOS DE CONSULTA
  // ===================================================================

  public getCurrentSession(): GameSession | null {
    return this.currentSession;
  }

  public async getPlayerHistory(
    playerId: string,
    limit: number = 10,
  ): Promise<Game[]> {
    try {
      if (this.connectionStatus === "connected") {
        const response = await apiClient.getPlayerHistory(playerId, { limit });
        return response.games;
      } else {
        // Retornar historial offline si está disponible
        const offlineHistory = localStorage.getItem(`game_history_${playerId}`);
        return offlineHistory ? JSON.parse(offlineHistory) : [];
      }
    } catch (error) {
      console.error("Error getting player history:", error);
      return [];
    }
  }

  public async getGameAnalytics(gameId: string): Promise<GameAnalytics | null> {
    try {
      if (this.connectionStatus === "connected") {
        const response = await apiClient.getGameAnalytics(gameId);
        return response.analytics;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting game analytics:", error);
      return null;
    }
  }

  // ===================================================================
  // MÉTODOS DE SINCRONIZACIÓN
  // ===================================================================

  public async syncOfflineData(): Promise<boolean> {
    if (this.connectionStatus !== "connected") {
      return false;
    }

    try {
      // TODO: Implementar sincronización de datos offline
      console.log("🔄 Sincronizando datos offline...");
      return true;
    } catch (error) {
      console.error("Error syncing offline data:", error);
      return false;
    }
  }

  public hasOfflineData(): boolean {
    // Verificar si hay datos offline pendientes de sincronización
    const keys = Object.keys(localStorage).filter(
      (key) =>
        key.startsWith("offline_") ||
        key.startsWith("game_history_") ||
        key.startsWith("player_config_"),
    );
    return keys.length > 0;
  }
}

// Exportar instancia singleton
export const enhancedGameService = new EnhancedGameService();
