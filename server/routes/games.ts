/**
 * ===================================================================
 * MIND MIRROR - RUTAS API PARA PARTIDAS
 * ===================================================================
 * Endpoints para gestión de partidas y turnos
 * ===================================================================
 */

import { RequestHandler } from "express";
import { gameService } from "../services/gameService";
import { db } from "../services/database";
import type {
  CreateGameRequest,
  CreateGameResponse,
  GetGameResponse,
  MakeMoveRequest,
  MakeMoveResponse,
  EndGameRequest,
  EndGameResponse,
  GetGameAnalyticsResponse,
  GAME_CONFIG_DEFAULTS
} from "@shared/game-api";

// ===================================================================
// POST /api/partidas - Crear nueva partida
// ===================================================================
export const createGame: RequestHandler = async (req, res) => {
  try {
    const { jugador_id, configuracion }: CreateGameRequest = req.body;

    if (!jugador_id) {
      return res.status(400).json({
        success: false,
        message: "ID de jugador requerido"
      });
    }

    // Verificar que el jugador existe
    const player = await db.getPlayer(jugador_id);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Jugador no encontrado"
      });
    }

    // Usar configuración por defecto si no se proporciona
    const gameConfig = {
      ...GAME_CONFIG_DEFAULTS,
      ...configuracion
    };

    // Verificar que no hay partidas activas
    const activeGames = await db.queryMany(`
      SELECT id FROM partidas 
      WHERE jugador_id = $1 AND terminada = false
    `, [jugador_id]);

    if (activeGames.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Ya tienes una partida activa. Termina la partida actual antes de iniciar una nueva."
      });
    }

    const game = await gameService.createGame(jugador_id, gameConfig);

    const response: CreateGameResponse = {
      game,
      success: true,
      message: "Partida creada exitosamente"
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({
      success: false,
      message: `Error al crear partida: ${error}`
    });
  }
};

// ===================================================================
// GET /api/partidas/:id - Obtener partida por ID
// ===================================================================
export const getGame: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de partida requerido"
      });
    }

    const game = await gameService.getGame(id);

    const response: GetGameResponse = {
      game,
      success: true,
      message: game ? "Partida encontrada" : "Partida no encontrada"
    };

    if (!game) {
      return res.status(404).json(response);
    }

    res.json(response);
  } catch (error) {
    console.error("Error getting game:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

// ===================================================================
// POST /api/partidas/:id/turno - Realizar movimiento
// ===================================================================
export const makeMove: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const moveRequest: MakeMoveRequest = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de partida requerido"
      });
    }

    if (!moveRequest.posicion || !Array.isArray(moveRequest.posicion) || moveRequest.posicion.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "Posición del movimiento requerida en formato [fila, columna]"
      });
    }

    const [row, col] = moveRequest.posicion;
    if (typeof row !== 'number' || typeof col !== 'number' || row < 0 || col < 0) {
      return res.status(400).json({
        success: false,
        message: "Posición inválida"
      });
    }

    const result = await gameService.makeMove(id, moveRequest);

    const response: MakeMoveResponse = {
      move: result.move,
      aiMove: result.aiMove,
      aiAnalysis: result.aiAnalysis,
      gameState: result.gameState,
      gameEvents: result.gameEvents,
      gameEnded: result.gameEnded,
      winner: result.winner,
      success: true,
      message: result.gameEnded 
        ? `Juego terminado. Ganador: ${result.winner}` 
        : "Movimiento realizado exitosamente"
    };

    res.json(response);
  } catch (error) {
    console.error("Error making move:", error);
    res.status(400).json({
      success: false,
      message: `Error al realizar movimiento: ${error}`
    });
  }
};

// ===================================================================
// POST /api/partidas/:id/terminar - Terminar partida
// ===================================================================
export const endGame: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { resultado, razon }: EndGameRequest = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de partida requerido"
      });
    }

    const result = await gameService.endGame(id, resultado, razon);

    const response: EndGameResponse = {
      game: result.game,
      analytics: result.analytics,
      achievements: result.achievements,
      success: true,
      message: "Partida terminada exitosamente"
    };

    res.json(response);
  } catch (error) {
    console.error("Error ending game:", error);
    res.status(400).json({
      success: false,
      message: `Error al terminar partida: ${error}`
    });
  }
};

// ===================================================================
// GET /api/partidas/:id/analytics - Obtener análisis de la partida
// ===================================================================
export const getGameAnalytics: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de partida requerido"
      });
    }

    const analytics = await gameService.generateGameAnalytics(id);

    const response: GetGameAnalyticsResponse = {
      analytics,
      success: true,
      message: "Análisis generado exitosamente"
    };

    res.json(response);
  } catch (error) {
    console.error("Error getting game analytics:", error);
    res.status(500).json({
      success: false,
      message: `Error al generar análisis: ${error}`
    });
  }
};

// ===================================================================
// GET /api/partidas/:id/movimientos - Obtener movimientos de la partida
// ===================================================================
export const getGameMoves: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de partida requerido"
      });
    }

    const moves = await db.getGameMoves(id);

    res.json({
      moves,
      success: true,
      message: `${moves.length} movimientos encontrados`
    });
  } catch (error) {
    console.error("Error getting game moves:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

// ===================================================================
// GET /api/partidas/:id/eventos - Obtener eventos de la partida
// ===================================================================
export const getGameEvents: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de partida requerido"
      });
    }

    const events = await db.queryMany(`
      SELECT * FROM eventos_juego 
      WHERE partida_id = $1 
      ORDER BY timestamp_evento ASC
    `, [id]);

    res.json({
      events,
      success: true,
      message: `${events.length} eventos encontrados`
    });
  } catch (error) {
    console.error("Error getting game events:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

// ===================================================================
// GET /api/partidas - Listar partidas (con filtros)
// ===================================================================
export const listGames: RequestHandler = async (req, res) => {
  try {
    const {
      jugador_id,
      modo_juego,
      terminada,
      limit = '10',
      offset = '0'
    } = req.query;

    const limitNum = Math.min(parseInt(limit as string) || 10, 50);
    const offsetNum = parseInt(offset as string) || 0;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (jugador_id) {
      whereClause += ` AND jugador_id = $${paramCount++}`;
      params.push(jugador_id);
    }

    if (modo_juego) {
      whereClause += ` AND modo_juego = $${paramCount++}`;
      params.push(modo_juego);
    }

    if (terminada !== undefined) {
      whereClause += ` AND terminada = $${paramCount++}`;
      params.push(terminada === 'true');
    }

    // Contar total
    const countQuery = `SELECT COUNT(*) as total FROM partidas ${whereClause}`;
    const totalResult = await db.queryOne<{ total: string }>(countQuery, params);
    const total = parseInt(totalResult?.total || '0');

    // Obtener partidas
    const gamesQuery = `
      SELECT p.*, j.nombre as jugador_nombre
      FROM partidas p
      LEFT JOIN jugadores j ON p.jugador_id = j.id
      ${whereClause}
      ORDER BY p.creado_en DESC
      LIMIT $${paramCount++} OFFSET $${paramCount++}
    `;
    
    params.push(limitNum, offsetNum);
    const games = await db.queryMany(gamesQuery, params);

    const totalPages = Math.ceil(total / limitNum);
    const currentPage = Math.floor(offsetNum / limitNum) + 1;

    res.json({
      games,
      total,
      page: currentPage,
      totalPages,
      success: true,
      message: `${games.length} partidas encontradas`
    });
  } catch (error) {
    console.error("Error listing games:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

// ===================================================================
// DELETE /api/partidas/:id - Eliminar partida
// ===================================================================
export const deleteGame: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de partida requerido"
      });
    }

    // Verificar que la partida existe
    const game = await db.getGame(id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Partida no encontrada"
      });
    }

    // Eliminar en cascada (movimientos, análisis, eventos)
    await db.query('DELETE FROM partidas WHERE id = $1', [id]);

    res.json({
      success: true,
      message: "Partida eliminada exitosamente"
    });
  } catch (error) {
    console.error("Error deleting game:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

// ===================================================================
// POST /api/partidas/:id/pausa - Pausar/reanudar partida
// ===================================================================
export const toggleGamePause: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { pausar = true } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de partida requerido"
      });
    }

    const game = await db.getGame(id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Partida no encontrada"
      });
    }

    if (game.terminada) {
      return res.status(400).json({
        success: false,
        message: "No se puede pausar una partida terminada"
      });
    }

    // Actualizar metadatos con información de pausa
    const metadatos = {
      ...game.metadatos,
      pausada: pausar,
      tiempo_pausa: pausar ? new Date().toISOString() : null,
      tiempo_total_pausado: game.metadatos.tiempo_total_pausado || 0
    };

    await db.updateGame(id, { metadatos });

    res.json({
      success: true,
      message: pausar ? "Partida pausada" : "Partida reanudada"
    });
  } catch (error) {
    console.error("Error toggling game pause:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

// ===================================================================
// GET /api/estadisticas/partidas - Estadísticas generales de partidas
// ===================================================================
export const getGameStatistics: RequestHandler = async (req, res) => {
  try {
    const { desde, hasta } = req.query;

    let dateFilter = '';
    const params: any[] = [];
    let paramCount = 1;

    if (desde) {
      dateFilter += ` AND creado_en >= $${paramCount++}`;
      params.push(desde);
    }

    if (hasta) {
      dateFilter += ` AND creado_en <= $${paramCount++}`;
      params.push(hasta);
    }

    const statsQuery = `
      SELECT 
        COUNT(*) as total_partidas,
        COUNT(*) FILTER (WHERE terminada = true) as partidas_terminadas,
        COUNT(*) FILTER (WHERE resultado = 'jugador') as victorias_jugador,
        COUNT(*) FILTER (WHERE resultado = 'ia') as victorias_ia,
        COUNT(*) FILTER (WHERE resultado = 'empate') as empates,
        AVG(duracion) FILTER (WHERE duracion IS NOT NULL) as duracion_promedio,
        AVG(turno_actual) as turnos_promedio,
        COUNT(DISTINCT jugador_id) as jugadores_unicos,
        mode() WITHIN GROUP (ORDER BY modo_juego) as modo_mas_popular
      FROM partidas 
      WHERE 1=1 ${dateFilter}
    `;

    const stats = await db.queryOne(statsQuery, params);

    // Estadísticas por modo de juego
    const modeStatsQuery = `
      SELECT 
        modo_juego,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE resultado = 'jugador') as victorias_jugador,
        AVG(duracion) as duracion_promedio
      FROM partidas 
      WHERE terminada = true ${dateFilter}
      GROUP BY modo_juego
      ORDER BY total DESC
    `;

    const modeStats = await db.queryMany(modeStatsQuery, params);

    res.json({
      general: stats,
      por_modo: modeStats,
      success: true,
      message: "Estadísticas generadas exitosamente"
    });
  } catch (error) {
    console.error("Error getting game statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};
