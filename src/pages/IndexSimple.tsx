import React from "react";
import { Link } from "react-router-dom";

export default function IndexSimple() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-dark-purple/20 flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent mb-4">
            Mind Mirror
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Un espejo digital para la reflexión profunda y el crecimiento
            personal
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/mindmirror"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-neon-purple to-neon-cyan hover:opacity-90 text-white h-12 px-8 py-3 text-lg"
          >
            ✨ Comenzar Reflexión
          </Link>

          <div className="text-sm text-muted-foreground">
            <p>Herramientas disponibles:</p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              <span className="px-2 py-1 bg-muted/30 rounded text-xs">
                🪞 Reflexión Personal
              </span>
              <span className="px-2 py-1 bg-muted/30 rounded text-xs">
                ❤️ Mapa Emocional
              </span>
              <span className="px-2 py-1 bg-muted/30 rounded text-xs">
                🎯 Camino de Acción
              </span>
              <span className="px-2 py-1 bg-muted/30 rounded text-xs">
                💭 Diálogo Interior
              </span>
              <span className="px-2 py-1 bg-muted/30 rounded text-xs">
                📖 Resumen Diario
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Versión de prueba con IA simulada • Powered by Fusion Starter
        </div>
      </div>
    </div>
  );
}
