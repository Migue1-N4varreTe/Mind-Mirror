-- ===================================================================
-- MIND MIRROR - DATABASE SCHEMA (PostgreSQL/Supabase)
-- ===================================================================
-- Este esquema implementa la arquitectura recomendada para el juego
-- Mind Mirror con soporte completo para jugadores, partidas y IA
-- ===================================================================

-- Extensiones necesarias para UUID y funciones avanzadas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================================================
-- TABLA: jugadores
-- ===================================================================
-- Almacena información básica de jugadores y sus perfiles de IA
CREATE TABLE jugadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT UNIQUE,
  estilo TEXT DEFAULT 'balanced', -- aggressive, defensive, creative, predictable, risky, balanced
  perfil_ia JSONB DEFAULT '{}', -- Datos de personalidad y patrones de juego
  estadisticas JSONB DEFAULT '{
    "total_partidas": 0,
    "partidas_ganadas": 0,
    "puntuacion_promedio": 0,
    "tiempo_reaccion_promedio": 0,
    "nivel_habilidad": 1
  }',
  configuracion JSONB DEFAULT '{
    "dificultad_preferida": 0.5,
    "modo_favorito": "classic",
    "personalidad_ia": "adaptive",
    "mostrar_heatmap": false,
    "mostrar_predicciones": false,
    "modo_mentor": false
  }',
  activo BOOLEAN DEFAULT true,
  ultimo_acceso TIMESTAMP DEFAULT NOW(),
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

-- ===================================================================
-- TABLA: partidas
-- ===================================================================
-- Registro completo de partidas jugadas
CREATE TABLE partidas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jugador_id UUID REFERENCES jugadores(id) ON DELETE CASCADE,
  estado JSONB NOT NULL, -- Snapshot completo del estado del tablero
  configuracion JSONB NOT NULL, -- Configuración de la partida
  puntuacion JSONB DEFAULT '{"jugador": 0, "ia": 0}',
  duracion INTEGER, -- Duración en milisegundos
  turno_actual INTEGER DEFAULT 1,
  fase_juego TEXT DEFAULT 'learning', -- learning, mirror, evolution, mastery
  modo_juego TEXT DEFAULT 'classic', -- classic, mirror, shadow, rulebreaker, infinite
  resultado TEXT, -- ganador: 'jugador', 'ia', 'empate'
  terminada BOOLEAN DEFAULT false,
  creado_en TIMESTAMP DEFAULT NOW(),
  terminado_en TIMESTAMP,
  metadatos JSONB DEFAULT '{}'
);

-- ===================================================================
-- TABLA: movimientos
-- ===================================================================
-- Registro detallado de cada movimiento en las partidas
CREATE TABLE movimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partida_id UUID REFERENCES partidas(id) ON DELETE CASCADE,
  turno INTEGER NOT NULL,
  jugador TEXT NOT NULL, -- 'human' o 'ai'
  posicion JSONB NOT NULL, -- [row, col]
  tiempo_reaccion INTEGER, -- En milisegundos
  resultado TEXT, -- 'success', 'blocked', 'combo', 'special'
  contexto JSONB DEFAULT '{}', -- Estado del tablero al momento del movimiento
  puntuacion_obtenida INTEGER DEFAULT 0,
  efectos JSONB DEFAULT '[]', -- Efectos especiales activados
  creado_en TIMESTAMP DEFAULT NOW()
);

-- ===================================================================
-- TABLA: analisis_ia
-- ===================================================================
-- Análisis y decisiones de la IA para aprendizaje y mejora
CREATE TABLE analisis_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partida_id UUID REFERENCES partidas(id) ON DELETE CASCADE,
  turno INTEGER NOT NULL,
  movimiento_recomendado JSONB, -- [row, col]
  confianza DECIMAL(3,2), -- 0.00 - 1.00
  razonamiento TEXT,
  alternativas JSONB DEFAULT '[]', -- Movimientos alternativos considerados
  prediccion_jugador JSONB DEFAULT '{}', -- Predicción del próximo movimiento del jugador
  personalidad_usada TEXT, -- mirror, shadow, adaptive, etc.
  datos_aprendizaje JSONB DEFAULT '{}', -- Patrones detectados del jugador
  tiempo_procesamiento INTEGER, -- Milisegundos que tardó en analizar
  creado_en TIMESTAMP DEFAULT NOW()
);

-- ===================================================================
-- TABLA: eventos_juego
-- ===================================================================
-- Log de eventos importantes durante las partidas
CREATE TABLE eventos_juego (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partida_id UUID REFERENCES partidas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'move', 'combo', 'special_activated', 'phase_change', 'achievement'
  datos JSONB NOT NULL,
  importancia DECIMAL(3,2) DEFAULT 0.5, -- 0.00 - 1.00
  timestamp_evento TIMESTAMP DEFAULT NOW(),
  procesado BOOLEAN DEFAULT false
);

-- ===================================================================
-- TABLA: logros
-- ===================================================================
-- Sistema de logros y achievements
CREATE TABLE logros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jugador_id UUID REFERENCES jugadores(id) ON DELETE CASCADE,
  tipo_logro TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  datos JSONB DEFAULT '{}',
  desbloqueado_en TIMESTAMP DEFAULT NOW(),
  partida_id UUID REFERENCES partidas(id)
);

-- ===================================================================
-- TABLA: sesiones_aprendizaje
-- ===================================================================
-- Datos de aprendizaje de la IA por jugador
CREATE TABLE sesiones_aprendizaje (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jugador_id UUID REFERENCES jugadores(id) ON DELETE CASCADE,
  patrones_detectados JSONB DEFAULT '{}',
  fortalezas JSONB DEFAULT '[]',
  debilidades JSONB DEFAULT '[]',
  predicciones_exitosas INTEGER DEFAULT 0,
  predicciones_fallidas INTEGER DEFAULT 0,
  adaptaciones_realizadas INTEGER DEFAULT 0,
  nivel_desafio DECIMAL(3,2) DEFAULT 0.5,
  ultima_actualizacion TIMESTAMP DEFAULT NOW()
);

-- ===================================================================
-- TABLA: configuracion_sistema
-- ===================================================================
-- Configuración global del sistema y la IA
CREATE TABLE configuracion_sistema (
  clave TEXT PRIMARY KEY,
  valor JSONB NOT NULL,
  descripcion TEXT,
  actualizado_en TIMESTAMP DEFAULT NOW()
);

-- ===================================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ===================================================================

-- Índices principales para consultas frecuentes
CREATE INDEX idx_partidas_jugador ON partidas(jugador_id);
CREATE INDEX idx_partidas_fecha ON partidas(creado_en DESC);
CREATE INDEX idx_partidas_activas ON partidas(terminada) WHERE NOT terminada;

CREATE INDEX idx_movimientos_partida ON movimientos(partida_id);
CREATE INDEX idx_movimientos_turno ON movimientos(partida_id, turno);

CREATE INDEX idx_analisis_partida ON analisis_ia(partida_id);
CREATE INDEX idx_analisis_personalidad ON analisis_ia(personalidad_usada);

CREATE INDEX idx_eventos_partida ON eventos_juego(partida_id);
CREATE INDEX idx_eventos_tipo ON eventos_juego(tipo);
CREATE INDEX idx_eventos_no_procesados ON eventos_juego(procesado) WHERE NOT procesado;

CREATE INDEX idx_logros_jugador ON logros(jugador_id);
CREATE INDEX idx_sesiones_jugador ON sesiones_aprendizaje(jugador_id);

-- Índices compuestos para consultas específicas
CREATE INDEX idx_jugadores_activos ON jugadores(activo, ultimo_acceso DESC) WHERE activo;
CREATE INDEX idx_partidas_completas ON partidas(jugador_id, terminada, creado_en DESC) WHERE terminada;

-- ===================================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- ===================================================================

-- Función para actualizar timestamp de actualización
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para jugadores
CREATE TRIGGER trigger_actualizar_jugadores
  BEFORE UPDATE ON jugadores
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

-- Función para actualizar estadísticas del jugador
CREATE OR REPLACE FUNCTION actualizar_estadisticas_jugador()
RETURNS TRIGGER AS $$
DECLARE
  stats JSONB;
  total_partidas INTEGER;
  partidas_ganadas INTEGER;
  puntuacion_promedio DECIMAL;
BEGIN
  -- Calcular estadísticas actualizadas
  SELECT COUNT(*), 
         COUNT(*) FILTER (WHERE resultado = 'jugador'),
         AVG(COALESCE((puntuacion->>'jugador')::INTEGER, 0))
  INTO total_partidas, partidas_ganadas, puntuacion_promedio
  FROM partidas 
  WHERE jugador_id = NEW.jugador_id AND terminada = true;

  -- Actualizar estadísticas en el perfil del jugador
  UPDATE jugadores 
  SET estadisticas = jsonb_set(
        jsonb_set(
          jsonb_set(estadisticas, '{total_partidas}', to_jsonb(total_partidas)),
          '{partidas_ganadas}', to_jsonb(partidas_ganadas)
        ),
        '{puntuacion_promedio}', to_jsonb(ROUND(puntuacion_promedio, 2))
      ),
      ultimo_acceso = NOW()
  WHERE id = NEW.jugador_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estadísticas cuando termine una partida
CREATE TRIGGER trigger_actualizar_estadisticas
  AFTER UPDATE ON partidas
  FOR EACH ROW
  WHEN (NEW.terminada = true AND OLD.terminada = false)
  EXECUTE FUNCTION actualizar_estadisticas_jugador();

-- ===================================================================
-- DATOS INICIALES DEL SISTEMA
-- ===================================================================

-- Configuración inicial del sistema
INSERT INTO configuracion_sistema (clave, valor, descripcion) VALUES
('version_esquema', '"1.0.0"', 'Versión actual del esquema de base de datos'),
('ia_config', '{
  "personalidades_disponibles": ["mirror", "shadow", "adaptive", "chameleon", "hunter", "sage"],
  "modos_juego": ["classic", "mirror", "shadow", "rulebreaker", "infinite"],
  "dificultad_minima": 0.1,
  "dificultad_maxima": 1.0,
  "dificultad_por_defecto": 0.5
}', 'Configuración de la IA del sistema'),
('limites_sistema', '{
  "max_partidas_simultaneas": 10,
  "max_movimientos_por_partida": 1000,
  "timeout_partida_minutos": 60,
  "max_analisis_ia_por_hora": 10000
}', 'Límites operacionales del sistema'),
('metricas_rendimiento', '{
  "tiempo_respuesta_objetivo_ms": 200,
  "cache_movimientos_ttl_segundos": 300,
  "limpieza_eventos_dias": 30
}', 'Métricas y configuración de rendimiento');

-- ===================================================================
-- FUNCIONES DE UTILIDAD
-- ===================================================================

-- Función para obtener el perfil completo de un jugador
CREATE OR REPLACE FUNCTION obtener_perfil_jugador(p_jugador_id UUID)
RETURNS JSONB AS $$
DECLARE
  perfil JSONB;
  estadisticas_recientes JSONB;
  sesion_aprendizaje JSONB;
BEGIN
  -- Obtener datos básicos del jugador
  SELECT to_jsonb(j.*) INTO perfil
  FROM jugadores j
  WHERE j.id = p_jugador_id;
  
  -- Obtener estadísticas de partidas recientes (últimas 10)
  SELECT jsonb_agg(to_jsonb(p.*)) INTO estadisticas_recientes
  FROM (
    SELECT * FROM partidas 
    WHERE jugador_id = p_jugador_id AND terminada = true
    ORDER BY creado_en DESC 
    LIMIT 10
  ) p;
  
  -- Obtener datos de aprendizaje de IA
  SELECT to_jsonb(s.*) INTO sesion_aprendizaje
  FROM sesiones_aprendizaje s
  WHERE s.jugador_id = p_jugador_id
  ORDER BY ultima_actualizacion DESC
  LIMIT 1;
  
  -- Combinar todos los datos
  RETURN jsonb_build_object(
    'jugador', perfil,
    'partidas_recientes', COALESCE(estadisticas_recientes, '[]'::jsonb),
    'aprendizaje_ia', COALESCE(sesion_aprendizaje, '{}'::jsonb)
  );
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar datos antiguos
CREATE OR REPLACE FUNCTION limpiar_datos_antiguos()
RETURNS void AS $$
BEGIN
  -- Eliminar eventos de juego más antiguos que 30 días
  DELETE FROM eventos_juego 
  WHERE timestamp_evento < NOW() - INTERVAL '30 days';
  
  -- Eliminar análisis de IA más antiguos que 90 días
  DELETE FROM analisis_ia 
  WHERE creado_en < NOW() - INTERVAL '90 days';
  
  -- Marcar jugadores inactivos (sin acceso en 180 días)
  UPDATE jugadores 
  SET activo = false 
  WHERE ultimo_acceso < NOW() - INTERVAL '180 days' AND activo = true;
  
  RAISE NOTICE 'Limpieza de datos completada';
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- COMENTARIOS FINALES
-- ===================================================================
-- Este esquema proporciona:
-- 1. Estructura completa para gestión de jugadores y partidas
-- 2. Sistema robusto de análisis de IA y aprendizaje
-- 3. Tracking detallado de movimientos y eventos
-- 4. Sistema de logros y achievements
-- 5. Optimizaciones de rendimiento con índices apropiados
-- 6. Triggers automáticos para mantener consistencia
-- 7. Funciones de utilidad para operaciones comunes
-- 
-- Para usar con Supabase:
-- - Ejecutar este script en el SQL Editor de Supabase
-- - Configurar Row Level Security (RLS) según necesidades
-- - Configurar las políticas de acceso apropiadas
-- ===================================================================
