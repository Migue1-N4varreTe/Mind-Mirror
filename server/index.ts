import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { db } from "./services/database";

// Import new route handlers
import {
  createPlayer,
  getPlayer,
  updatePlayer,
  getPlayerAnalysis,
  getPlayerHistory,
  getPlayerStats,
  deletePlayer,
  resetPlayerProgress
} from "./routes/players";

import {
  createGame,
  getGame,
  makeMove,
  endGame,
  getGameAnalytics,
  getGameMoves,
  getGameEvents,
  listGames,
  deleteGame,
  toggleGamePause,
  getGameStatistics
} from "./routes/games";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging middleware (development only)
  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`, req.body ? '(with body)' : '');
      next();
    });
  }

  // Health check endpoint
  app.get("/api/health", async (_req, res) => {
    try {
      const dbHealth = await db.healthCheck();
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        database: dbHealth.healthy ? "connected" : "disconnected",
        version: dbHealth.dbVersion,
        uptime: process.uptime()
      });
    } catch (error) {
      res.status(503).json({
        status: "error",
        timestamp: new Date().toISOString(),
        database: "error",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Legacy routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // ===================================================================
  // PLAYER ROUTES
  // ===================================================================
  app.post("/api/jugadores", createPlayer);
  app.get("/api/jugadores/:id", getPlayer);
  app.put("/api/jugadores/:id", updatePlayer);
  app.delete("/api/jugadores/:id", deletePlayer);
  app.get("/api/jugadores/:id/analisis", getPlayerAnalysis);
  app.get("/api/jugadores/:id/historial", getPlayerHistory);
  app.get("/api/jugadores/:id/estadisticas", getPlayerStats);
  app.post("/api/jugadores/:id/reset", resetPlayerProgress);

  // ===================================================================
  // GAME ROUTES
  // ===================================================================
  app.post("/api/partidas", createGame);
  app.get("/api/partidas", listGames);
  app.get("/api/partidas/:id", getGame);
  app.delete("/api/partidas/:id", deleteGame);
  app.post("/api/partidas/:id/turno", makeMove);
  app.post("/api/partidas/:id/terminar", endGame);
  app.post("/api/partidas/:id/pausa", toggleGamePause);
  app.get("/api/partidas/:id/analytics", getGameAnalytics);
  app.get("/api/partidas/:id/movimientos", getGameMoves);
  app.get("/api/partidas/:id/eventos", getGameEvents);

  // ===================================================================
  // STATISTICS ROUTES
  // ===================================================================
  app.get("/api/estadisticas/partidas", getGameStatistics);

  // ===================================================================
  // SYSTEM CONFIGURATION ROUTES
  // ===================================================================
  app.get("/api/config", async (_req, res) => {
    try {
      const config = await db.getSystemConfig();
      res.json({
        config,
        success: true,
        message: "Configuración obtenida exitosamente"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener configuración"
      });
    }
  });

  app.get("/api/config/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const config = await db.getSystemConfig(key);

      if (!config) {
        return res.status(404).json({
          success: false,
          message: "Configuración no encontrada"
        });
      }

      res.json({
        config,
        success: true,
        message: "Configuración obtenida exitosamente"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener configuración"
      });
    }
  });

  // ===================================================================
  // AI MANAGEMENT ROUTES
  // ===================================================================
  app.post("/api/ia/reset", async (_req, res) => {
    try {
      // Reset AI learning data
      await db.query('DELETE FROM sesiones_aprendizaje');
      await db.query('DELETE FROM analisis_ia WHERE creado_en < NOW() - INTERVAL \'1 day\'');

      res.json({
        success: true,
        message: "Datos de aprendizaje de IA reseteados exitosamente"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al resetear IA"
      });
    }
  });

  // ===================================================================
  // ERROR HANDLING MIDDLEWARE
  // ===================================================================
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);

    if (res.headersSent) {
      return next(err);
    }

    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Endpoint no encontrado: ${req.method} ${req.path}`
    });
  });

  return app;
}
