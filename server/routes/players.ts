/**
 * ===================================================================
 * MIND MIRROR - RUTAS API PARA JUGADORES
 * ===================================================================
 * Endpoints para gestión de jugadores y perfiles
 * ===================================================================
 */

import { RequestHandler } from "express";
import { db } from "../services/database";
import type {
  CreatePlayerRequest,
  CreatePlayerResponse,
  GetPlayerResponse,
  UpdatePlayerRequest,
  UpdatePlayerResponse,
  GetPlayerAnalysisResponse,
  PLAYER_CONFIG_DEFAULTS
} from "@shared/game-api";

// ===================================================================
// POST /api/jugadores - Crear nuevo jugador
// ===================================================================
export const createPlayer: RequestHandler = async (req, res) => {
  try {
    const { nombre, email, estilo = 'balanced' }: CreatePlayerRequest = req.body;

    if (!nombre || nombre.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "El nombre es requerido"
      });
    }

    // Verificar si el email ya existe
    if (email) {
      const existingPlayer = await db.getPlayerByEmail(email);
      if (existingPlayer) {
        return res.status(409).json({
          success: false,
          message: "Ya existe un jugador con este email"
        });
      }
    }

    // Crear perfil inicial de IA
    const initialProfile = {
      style: estilo,
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
    };

    const player = await db.createPlayer({
      nombre: nombre.trim(),
      email: email?.trim(),
      estilo,
      perfil_ia: initialProfile,
      configuracion: PLAYER_CONFIG_DEFAULTS
    });

    const response: CreatePlayerResponse = {
      player,
      success: true,
      message: "Jugador creado exitosamente"
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating player:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

// ===================================================================
// GET /api/jugadores/:id - Obtener jugador por ID
// ===================================================================
export const getPlayer: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de jugador requerido"
      });
    }

    const player = await db.getPlayer(id);

    const response: GetPlayerResponse = {
      player,
      success: true,
      message: player ? "Jugador encontrado" : "Jugador no encontrado"
    };

    if (!player) {
      return res.status(404).json(response);
    }

    res.json(response);
  } catch (error) {
    console.error("Error getting player:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

// ===================================================================
// PUT /api/jugadores/:id - Actualizar jugador
// ===================================================================
export const updatePlayer: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData: UpdatePlayerRequest = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de jugador requerido"
      });
    }

    // Verificar que el jugador existe
    const existingPlayer = await db.getPlayer(id);
    if (!existingPlayer) {
      return res.status(404).json({
        success: false,
        message: "Jugador no encontrado"
      });
    }

    // Preparar datos de actualización
    const dataToUpdate: any = {};

    if (updateData.nombre !== undefined) {
      if (!updateData.nombre.trim()) {
        return res.status(400).json({
          success: false,
          message: "El nombre no puede estar vacío"
        });
      }
      dataToUpdate.nombre = updateData.nombre.trim();
    }

    if (updateData.email !== undefined) {
      if (updateData.email && updateData.email !== existingPlayer.email) {
        const emailExists = await db.getPlayerByEmail(updateData.email);
        if (emailExists) {
          return res.status(409).json({
            success: false,
            message: "Ya existe un jugador con este email"
          });
        }
      }
      dataToUpdate.email = updateData.email?.trim();
    }

    if (updateData.estilo !== undefined) {
      dataToUpdate.estilo = updateData.estilo;
    }

    if (updateData.configuracion !== undefined) {
      // Merge con configuración existente
      dataToUpdate.configuracion = {
        ...existingPlayer.configuracion,
        ...updateData.configuracion
      };
    }

    const updatedPlayer = await db.updatePlayer(id, dataToUpdate);

    const response: UpdatePlayerResponse = {
      player: updatedPlayer,
      success: true,
      message: "Jugador actualizado exitosamente"
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating player:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

// ===================================================================
// GET /api/jugadores/:id/analisis - Obtener análisis completo del jugador
// ===================================================================
export const getPlayerAnalysis: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de jugador requerido"
      });
    }

    // Obtener perfil completo usando la función de la DB
    const fullProfile = await db.queryOne(
      'SELECT obtener_perfil_jugador($1) as perfil',
      [id]
    );

    if (!fullProfile?.perfil) {
      return res.status(404).json({
        success: false,
        message: "Jugador no encontrado"
      });
    }

    const profileData = fullProfile.perfil;

    // Obtener logros del jugador
    const achievements = await db.queryMany(`
      SELECT * FROM logros 
      WHERE jugador_id = $1 
      ORDER BY desbloqueado_en DESC
    `, [id]);

    const response: GetPlayerAnalysisResponse = {
      profile: profileData.jugador?.perfil_ia || {},
      recentGames: profileData.partidas_recientes || [],
      learningSession: profileData.aprendizaje_ia || {},
      achievements: achievements,
      success: true,
      message: "Análisis obtenido exitosamente"
    };

    res.json(response);
  } catch (error) {
    console.error("Error getting player analysis:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

// ===================================================================
// GET /api/jugadores/:id/historial - Obtener historial de partidas
// ===================================================================
export const getPlayerHistory: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      limit = '10',
      offset = '0',
      modo_juego,
      terminadas_solamente = 'true'
    } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de jugador requerido"
      });
    }

    const limitNum = parseInt(limit as string) || 10;
    const offsetNum = parseInt(offset as string) || 0;
    const terminadas = terminadas_solamente === 'true';

    const { games, total } = await db.getPlayerGames(id, {
      limit: Math.min(limitNum, 50), // Máximo 50 por página
      offset: offsetNum,
      modo_juego: modo_juego as string,
      terminadas_solamente: terminadas
    });

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
    console.error("Error getting player history:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

// ===================================================================
// GET /api/jugadores/:id/estadisticas - Obtener estadísticas del jugador
// ===================================================================
export const getPlayerStats: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de jugador requerido"
      });
    }

    const player = await db.getPlayer(id);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Jugador no encontrado"
      });
    }

    // Calcular estadísticas adicionales
    const recentGamesQuery = `
      SELECT 
        COUNT(*) as total_recientes,
        COUNT(*) FILTER (WHERE resultado = 'jugador') as ganadas_recientes,
        AVG(puntuacion->>'jugador') as puntuacion_promedio_reciente,
        AVG(duracion) as duracion_promedio
      FROM partidas 
      WHERE jugador_id = $1 
        AND terminada = true 
        AND creado_en > NOW() - INTERVAL '30 days'
    `;

    const recentStats = await db.queryOne(recentGamesQuery, [id]);

    const statsResponse = {
      basic: player.estadisticas,
      recent: {
        total_partidas_30d: parseInt(recentStats?.total_recientes || '0'),
        partidas_ganadas_30d: parseInt(recentStats?.ganadas_recientes || '0'),
        puntuacion_promedio_30d: Math.round(parseFloat(recentStats?.puntuacion_promedio_reciente || '0')),
        duracion_promedio_30d: Math.round(parseFloat(recentStats?.duracion_promedio || '0')),
        racha_actual: 0 // TODO: calcular racha actual
      },
      profile: player.perfil_ia,
      config: player.configuracion,
      success: true,
      message: "Estadísticas obtenidas exitosamente"
    };

    res.json(statsResponse);
  } catch (error) {
    console.error("Error getting player stats:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

// ===================================================================
// DELETE /api/jugadores/:id - Eliminar jugador (marcar como inactivo)
// ===================================================================
export const deletePlayer: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de jugador requerido"
      });
    }

    const player = await db.getPlayer(id);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Jugador no encontrado"
      });
    }

    // Marcar como inactivo en lugar de eliminar
    await db.updatePlayer(id, { activo: false });

    res.json({
      success: true,
      message: "Jugador eliminado exitosamente"
    });
  } catch (error) {
    console.error("Error deleting player:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};

// ===================================================================
// POST /api/jugadores/:id/reset - Resetear progreso del jugador
// ===================================================================
export const resetPlayerProgress: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de jugador requerido"
      });
    }

    const player = await db.getPlayer(id);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Jugador no encontrado"
      });
    }

    // Resetear estadísticas y perfil de IA
    const resetProfile = {
      style: 'balanced',
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
    };

    const resetStats = {
      total_partidas: 0,
      partidas_ganadas: 0,
      puntuacion_promedio: 0,
      tiempo_reaccion_promedio: 0,
      nivel_habilidad: 1
    };

    await db.updatePlayer(id, {
      perfil_ia: resetProfile,
      estadisticas: resetStats,
      estilo: 'balanced'
    });

    // También eliminar sesiones de aprendizaje
    await db.query(
      'DELETE FROM sesiones_aprendizaje WHERE jugador_id = $1',
      [id]
    );

    res.json({
      success: true,
      message: "Progreso del jugador reseteado exitosamente"
    });
  } catch (error) {
    console.error("Error resetting player progress:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor"
    });
  }
};
