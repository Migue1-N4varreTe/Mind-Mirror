/**
 * ===================================================================
 * MIND MIRROR - SERVICIO DE LÓGICA DE JUEGO
 * ===================================================================
 * Servicio que conecta la lógica de juego con la base de datos
 * ===================================================================
 */

import {
  RefactoredGameEngine,
  GameEngineManager,
  GameConfiguration,
  GameSession,
} from "@/core/GameEngineRefactored";
import { AIEngine, PlayerProfile, AIAnalysis } from "@/core/ai/AIEngine";
import { db } from "./database";
import type {
  Game,
  Move,
  GameState,
  GameEvent,
  GameAnalytics,
  Player,
  MakeMoveRequest,
  GameScore,
  Achievement,
} from "@shared/game-api";

export class GameService {
  private gameEngine: RefactoredGameEngine;
  private aiEngine: AIEngine;
  private activeSessions: Map<string, GameSession> = new Map();

  constructor() {
    this.gameEngine = GameEngineManager.getInstance();
    this.aiEngine = new AIEngine();
  }

  // ===================================================================
  // GESTIÓN DE PARTIDAS
  // ===================================================================

  public async createGame(
    playerId: string,
    configuration: GameConfiguration,
  ): Promise<Game> {
    try {
      // Validar que el jugador existe
      const player = await db.getPlayer(playerId);
      if (!player) {
        throw new Error("Jugador no encontrado");
      }

      // Crear sesión de juego en el motor
      const session = await this.gameEngine.startNewSession(
        playerId,
        configuration,
      );

      // Crear estado inicial del tablero
      const initialGameState: GameState = {
        board: this.createInitialBoard(configuration.boardSize),
        specialCells: [],
        currentPlayer: "player",
        gamePhase: "learning",
      };

      // Guardar partida en base de datos
      const gameData = await db.createGame({
        jugador_id: playerId,
        estado: initialGameState,
        configuracion: configuration,
        modo_juego: configuration.mode,
        fase_juego: "learning",
      });

      // Guardar sesión activa
      this.activeSessions.set(gameData.id, session);

      // Convertir y retornar
      return this.mapDatabaseGameToAPI(gameData);
    } catch (error) {
      console.error("Error creating game:", error);
      throw new Error(`Failed to create game: ${error}`);
    }
  }

  public async getGame(gameId: string): Promise<Game | null> {
    try {
      const gameData = await db.getGame(gameId);
      return gameData ? this.mapDatabaseGameToAPI(gameData) : null;
    } catch (error) {
      console.error("Error getting game:", error);
      throw new Error(`Failed to get game: ${error}`);
    }
  }

  public async makeMove(
    gameId: string,
    moveRequest: MakeMoveRequest,
  ): Promise<{
    move: Move;
    aiMove?: Move;
    aiAnalysis?: any;
    gameState: GameState;
    gameEvents: GameEvent[];
    gameEnded: boolean;
    winner?: string;
  }> {
    try {
      // Obtener partida actual
      const game = await db.getGame(gameId);
      if (!game) {
        throw new Error("Partida no encontrada");
      }

      if (game.terminada) {
        throw new Error("La partida ya ha terminado");
      }

      // Obtener sesión activa o recrearla
      let session = this.activeSessions.get(gameId);
      if (!session) {
        session = await this.recreateSession(game);
        this.activeSessions.set(gameId, session);
      }

      // Procesar movimiento del jugador
      const context = {
        board: game.estado.board,
        timeRemaining: moveRequest.contexto?.timeRemaining || 30,
        ...moveRequest.contexto,
      };

      const moveResult = await this.gameEngine.processPlayerMove(
        moveRequest.posicion,
        context,
      );

      if (!moveResult.moveAccepted) {
        throw new Error(moveResult.moveResult.error || "Movimiento no válido");
      }

      // Guardar movimiento del jugador
      const playerMove = await db.createMove({
        partida_id: gameId,
        turno: game.turno_actual,
        jugador: "human",
        posicion: moveRequest.posicion,
        tiempo_reaccion: moveRequest.tiempo_reaccion,
        resultado: "success",
        contexto: context,
        puntuacion_obtenida: moveResult.moveResult.scoreGained || 10,
      });

      let aiMove: Move | undefined;
      let aiAnalysisData: any | undefined;

      // Procesar respuesta de IA si está disponible
      if (moveResult.aiResponse && moveResult.aiResponse.move) {
        aiMove = await db.createMove({
          partida_id: gameId,
          turno: game.turno_actual,
          jugador: "ai",
          posicion: moveResult.aiResponse.move,
          resultado: "success",
          contexto: {
            strategy: moveResult.aiResponse.analysis?.reasoning || "adaptive",
          },
          puntuacion_obtenida: 10,
        });

        // Guardar análisis de IA
        if (moveResult.aiResponse.analysis) {
          aiAnalysisData = await db.createAIAnalysis({
            partida_id: gameId,
            turno: game.turno_actual,
            movimiento_recomendado: moveResult.aiResponse.move,
            confianza: moveResult.aiResponse.analysis.confidence || 0.5,
            razonamiento:
              moveResult.aiResponse.analysis.reasoning ||
              "Movimiento adaptativo",
            alternativas: moveResult.aiResponse.analysis.alternativeMoves || [],
            prediccion_jugador:
              moveResult.aiResponse.analysis.playerPrediction || {},
            personalidad_usada: game.configuracion.aiPersonality || "adaptive",
            datos_aprendizaje: {},
            tiempo_procesamiento: 150,
          });
        }
      }

      // Actualizar estado del juego
      const newGameState = this.updateGameState(
        game.estado,
        moveRequest.posicion,
        aiMove?.posicion,
      );
      const newScore: GameScore = {
        jugador:
          (game.puntuacion?.jugador || 0) +
          (playerMove.puntuacion_obtenida || 0),
        ia: (game.puntuacion?.ia || 0) + (aiMove?.puntuacion_obtenida || 0),
      };

      // Verificar si el juego ha terminado
      const gameEnded = this.checkGameEndCondition(
        newGameState,
        game.turno_actual + 1,
      );
      let winner: string | undefined;

      if (gameEnded) {
        winner = this.determineWinner(newScore);
        const duration = Date.now() - new Date(game.creado_en).getTime();

        await db.updateGame(gameId, {
          estado: newGameState,
          puntuacion: newScore,
          turno_actual: game.turno_actual + 1,
          resultado: winner,
          terminada: true,
          duracion,
        });

        // Terminar sesión en el motor de juego
        await this.gameEngine.endSession();
        this.activeSessions.delete(gameId);
      } else {
        await db.updateGame(gameId, {
          estado: newGameState,
          puntuacion: newScore,
          turno_actual: game.turno_actual + 1,
        });
      }

      return {
        move: this.mapDatabaseMoveToAPI(playerMove),
        aiMove: aiMove ? this.mapDatabaseMoveToAPI(aiMove) : undefined,
        aiAnalysis: aiAnalysisData,
        gameState: newGameState,
        gameEvents: moveResult.gameEvents || [],
        gameEnded,
        winner,
      };
    } catch (error) {
      console.error("Error making move:", error);
      throw new Error(`Failed to make move: ${error}`);
    }
  }

  public async endGame(
    gameId: string,
    resultado?: string,
    razon?: string,
  ): Promise<{
    game: Game;
    analytics: GameAnalytics;
    achievements: Achievement[];
  }> {
    try {
      const game = await db.getGame(gameId);
      if (!game) {
        throw new Error("Partida no encontrada");
      }

      const duration = Date.now() - new Date(game.creado_en).getTime();

      // Determinar ganador si no se especifica
      const winner = resultado || this.determineWinner(game.puntuacion);

      // Actualizar partida
      const updatedGame = await db.updateGame(gameId, {
        resultado: winner,
        terminada: true,
        duracion,
        metadatos: { ...game.metadatos, endReason: razon },
      });

      // Generar analytics
      const analytics = await this.generateGameAnalytics(gameId);

      // Obtener/generar achievements
      const achievements = await this.checkAchievements(
        game.jugador_id,
        updatedGame,
        analytics,
      );

      // Limpiar sesión activa
      this.activeSessions.delete(gameId);

      return {
        game: this.mapDatabaseGameToAPI(updatedGame),
        analytics,
        achievements,
      };
    } catch (error) {
      console.error("Error ending game:", error);
      throw new Error(`Failed to end game: ${error}`);
    }
  }

  // ===================================================================
  // ANÁLISIS Y ESTADÍSTICAS
  // ===================================================================

  public async generateGameAnalytics(gameId: string): Promise<GameAnalytics> {
    try {
      const game = await db.getGame(gameId);
      const moves = await db.getGameMoves(gameId);

      if (!game) {
        throw new Error("Partida no encontrada");
      }

      const playerMoves = moves.filter((m) => m.jugador === "human");
      const aiMoves = moves.filter((m) => m.jugador === "ai");

      const analytics: GameAnalytics = {
        sessionSummary: {
          duration: game.duracion || 0,
          totalMoves: moves.length,
          winnerScore: Math.max(
            game.puntuacion?.jugador || 0,
            game.puntuacion?.ia || 0,
          ),
          efficiencyRating: this.calculateEfficiencyRating(playerMoves),
          innovationScore: this.calculateInnovationScore(playerMoves),
          adaptabilityScore: this.calculateAdaptabilityScore(
            playerMoves,
            aiMoves,
          ),
        },
        playerPerformance: {
          averageReactionTime: this.calculateAverageReactionTime(playerMoves),
          decisionAccuracy: this.calculateDecisionAccuracy(playerMoves),
          patternConsistency: this.calculatePatternConsistency(playerMoves),
          pressureHandling: this.calculatePressureHandling(playerMoves),
          learningIndicators: this.identifyLearningIndicators(playerMoves),
        },
        aiPerformance: {
          strategiesUsed: this.identifyAIStrategies(gameId),
          adaptationsMade: aiMoves.length,
          predictionAccuracy: 0.75, // Placeholder
          challengeLevel: game.configuracion?.difficulty || 0.5,
        },
        insights: {
          keyMoments: [],
          improvementAreas: this.identifyImprovementAreas(playerMoves),
          strengthsShown: this.identifyStrengths(playerMoves),
          nextRecommendations: this.generateRecommendations(
            playerMoves,
            game.configuracion,
          ),
        },
      };

      return analytics;
    } catch (error) {
      console.error("Error generating analytics:", error);
      throw new Error(`Failed to generate analytics: ${error}`);
    }
  }

  public async getPlayerHistory(
    playerId: string,
    options: {
      limit?: number;
      offset?: number;
      modo_juego?: string;
      terminadas_solamente?: boolean;
    } = {},
  ): Promise<{ games: Game[]; total: number }> {
    try {
      const { games: dbGames, total } = await db.getPlayerGames(
        playerId,
        options,
      );
      const games = dbGames.map((game) => this.mapDatabaseGameToAPI(game));
      return { games, total };
    } catch (error) {
      console.error("Error getting player history:", error);
      throw new Error(`Failed to get player history: ${error}`);
    }
  }

  // ===================================================================
  // MÉTODOS AUXILIARES PRIVADOS
  // ===================================================================

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

  private updateGameState(
    currentState: GameState,
    playerMove: [number, number],
    aiMove?: [number, number],
  ): GameState {
    const newState = JSON.parse(JSON.stringify(currentState)); // Deep clone

    // Aplicar movimiento del jugador
    const [playerRow, playerCol] = playerMove;
    newState.board[playerRow][playerCol] = { type: "player" };

    // Aplicar movimiento de IA si existe
    if (aiMove) {
      const [aiRow, aiCol] = aiMove;
      newState.board[aiRow][aiCol] = { type: "ai" };
    }

    // Alternar jugador actual
    newState.currentPlayer =
      newState.currentPlayer === "player" ? "ai" : "player";

    return newState;
  }

  private checkGameEndCondition(
    gameState: GameState,
    turnCount: number,
  ): boolean {
    // Verificar si el tablero está lleno
    const emptySpaces = gameState.board
      .flat()
      .filter((cell) => cell.type === "empty").length;
    if (emptySpaces === 0) return true;

    // Verificar límite de turnos
    if (turnCount >= 64) return true; // Para tablero 8x8

    return false;
  }

  private determineWinner(score: GameScore): string {
    if (score.jugador > score.ia) return "jugador";
    if (score.ia > score.jugador) return "ia";
    return "empate";
  }

  private async recreateSession(game: any): Promise<GameSession> {
    const configuration: GameConfiguration = game.configuracion;
    return await this.gameEngine.startNewSession(
      game.jugador_id,
      configuration,
    );
  }

  private async checkAchievements(
    playerId: string,
    game: any,
    analytics: GameAnalytics,
  ): Promise<Achievement[]> {
    // Placeholder para sistema de achievements
    return [];
  }

  // Métodos de cálculo de métricas (placeholders)
  private calculateEfficiencyRating(moves: any[]): number {
    return 0.75; // Placeholder
  }

  private calculateInnovationScore(moves: any[]): number {
    return 0.6; // Placeholder
  }

  private calculateAdaptabilityScore(
    playerMoves: any[],
    aiMoves: any[],
  ): number {
    return 0.7; // Placeholder
  }

  private calculateAverageReactionTime(moves: any[]): number {
    const reactions = moves
      .filter((m) => m.tiempo_reaccion)
      .map((m) => m.tiempo_reaccion);
    return reactions.length > 0
      ? reactions.reduce((sum, time) => sum + time, 0) / reactions.length
      : 2000;
  }

  private calculateDecisionAccuracy(moves: any[]): number {
    return 0.75; // Placeholder
  }

  private calculatePatternConsistency(moves: any[]): number {
    return 0.6; // Placeholder
  }

  private calculatePressureHandling(moves: any[]): number {
    return 0.7; // Placeholder
  }

  private identifyLearningIndicators(moves: any[]): string[] {
    return ["Mejorando reconocimiento de patrones"]; // Placeholder
  }

  private identifyAIStrategies(gameId: string): string[] {
    return ["adaptive", "mirror"]; // Placeholder
  }

  private identifyImprovementAreas(moves: any[]): string[] {
    return ["Velocidad de decisión"]; // Placeholder
  }

  private identifyStrengths(moves: any[]): string[] {
    return ["Pensamiento estratégico"]; // Placeholder
  }

  private generateRecommendations(moves: any[], config: any): string[] {
    return ["Practicar bajo presión"]; // Placeholder
  }

  // Mappers para convertir entre formatos de DB y API
  private mapDatabaseGameToAPI(dbGame: any): Game {
    return {
      id: dbGame.id,
      jugador_id: dbGame.jugador_id,
      estado: dbGame.estado,
      configuracion: dbGame.configuracion,
      puntuacion: dbGame.puntuacion || { jugador: 0, ia: 0 },
      duracion: dbGame.duracion,
      turno_actual: dbGame.turno_actual,
      fase_juego: dbGame.fase_juego,
      modo_juego: dbGame.modo_juego,
      resultado: dbGame.resultado,
      terminada: dbGame.terminada,
      creado_en: dbGame.creado_en,
      terminado_en: dbGame.terminado_en,
      metadatos: dbGame.metadatos || {},
    };
  }

  private mapDatabaseMoveToAPI(dbMove: any): Move {
    return {
      id: dbMove.id,
      partida_id: dbMove.partida_id,
      turno: dbMove.turno,
      jugador: dbMove.jugador,
      posicion:
        typeof dbMove.posicion === "string"
          ? JSON.parse(dbMove.posicion)
          : dbMove.posicion,
      tiempo_reaccion: dbMove.tiempo_reaccion,
      resultado: dbMove.resultado,
      contexto:
        typeof dbMove.contexto === "string"
          ? JSON.parse(dbMove.contexto)
          : dbMove.contexto,
      puntuacion_obtenida: dbMove.puntuacion_obtenida,
      efectos:
        typeof dbMove.efectos === "string"
          ? JSON.parse(dbMove.efectos)
          : dbMove.efectos,
      creado_en: dbMove.creado_en,
    };
  }
}

export const gameService = new GameService();
