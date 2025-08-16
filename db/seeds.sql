-- ===================================================================
-- MIND MIRROR - DATOS INICIALES (SEEDS)
-- ===================================================================
-- Datos de prueba y configuración inicial para el desarrollo
-- ===================================================================

-- Limpiar datos existentes (solo para desarrollo)
-- TRUNCATE TABLE eventos_juego, analisis_ia, movimientos, partidas, logros, sesiones_aprendizaje, jugadores CASCADE;

-- ===================================================================
-- JUGADORES DE PRUEBA
-- ===================================================================

INSERT INTO jugadores (id, nombre, email, estilo, perfil_ia, estadisticas, configuracion) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Jugador Demo',
  'demo@mindmirror.com',
  'balanced',
  '{
    "style": "balanced",
    "patterns": {
      "favoritePositions": [[2,2], [3,3], [4,4]],
      "avgReactionTime": 1500,
      "predictabilityScore": 0.6,
      "creativityScore": 0.7,
      "riskTolerance": 0.5,
      "adaptabilityScore": 0.8
    },
    "weaknesses": ["Presión temporal", "Patrones complejos"],
    "strengths": ["Pensamiento estratégico", "Adaptabilidad"],
    "historicalPerformance": {
      "winRate": 0.65,
      "avgScore": 850,
      "improvementRate": 0.15
    }
  }',
  '{
    "total_partidas": 25,
    "partidas_ganadas": 16,
    "puntuacion_promedio": 850,
    "tiempo_reaccion_promedio": 1500,
    "nivel_habilidad": 3
  }',
  '{
    "dificultad_preferida": 0.6,
    "modo_favorito": "classic",
    "personalidad_ia": "adaptive",
    "mostrar_heatmap": true,
    "mostrar_predicciones": false,
    "modo_mentor": true
  }'
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'Ana García',
  'ana@example.com',
  'aggressive',
  '{
    "style": "aggressive",
    "patterns": {
      "favoritePositions": [[0,0], [0,7], [7,0], [7,7]],
      "avgReactionTime": 800,
      "predictabilityScore": 0.4,
      "creativityScore": 0.9,
      "riskTolerance": 0.9,
      "adaptabilityScore": 0.6
    },
    "weaknesses": ["Paciencia", "Defensas"],
    "strengths": ["Velocidad", "Agresividad", "Creatividad"],
    "historicalPerformance": {
      "winRate": 0.72,
      "avgScore": 920,
      "improvementRate": 0.08
    }
  }',
  '{
    "total_partidas": 40,
    "partidas_ganadas": 29,
    "puntuacion_promedio": 920,
    "tiempo_reaccion_promedio": 800,
    "nivel_habilidad": 5
  }',
  '{
    "dificultad_preferida": 0.8,
    "modo_favorito": "shadow",
    "personalidad_ia": "hunter",
    "mostrar_heatmap": true,
    "mostrar_predicciones": true,
    "modo_mentor": false
  }'
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Carlos Méndez',
  'carlos@example.com',
  'defensive',
  '{
    "style": "defensive",
    "patterns": {
      "favoritePositions": [[3,3], [3,4], [4,3], [4,4]],
      "avgReactionTime": 2200,
      "predictabilityScore": 0.8,
      "creativityScore": 0.4,
      "riskTolerance": 0.2,
      "adaptabilityScore": 0.7
    },
    "weaknesses": ["Velocidad", "Riesgo calculado"],
    "strengths": ["Paciencia", "Análisis", "Defensa"],
    "historicalPerformance": {
      "winRate": 0.58,
      "avgScore": 750,
      "improvementRate": 0.12
    }
  }',
  '{
    "total_partidas": 18,
    "partidas_ganadas": 10,
    "puntuacion_promedio": 750,
    "tiempo_reaccion_promedio": 2200,
    "nivel_habilidad": 2
  }',
  '{
    "dificultad_preferida": 0.4,
    "modo_favorito": "classic",
    "personalidad_ia": "sage",
    "mostrar_heatmap": false,
    "mostrar_predicciones": true,
    "modo_mentor": true
  }'
);

-- ===================================================================
-- PARTIDAS DE EJEMPLO
-- ===================================================================

INSERT INTO partidas (id, jugador_id, estado, configuracion, puntuacion, duracion, turno_actual, fase_juego, modo_juego, resultado, terminada, terminado_en) VALUES
(
  '660e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440001',
  '{
    "board": [
      [{"type": "empty"}, {"type": "player"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "ai"}, {"type": "empty"}],
      [{"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}],
      [{"type": "empty"}, {"type": "empty"}, {"type": "player"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}],
      [{"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "ai"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}],
      [{"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "special"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}],
      [{"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "player"}, {"type": "empty"}, {"type": "empty"}],
      [{"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}],
      [{"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "ai"}]
    ],
    "specialCells": [{"position": [4,4], "type": "multiplier", "value": 2}],
    "currentPlayer": "ai",
    "gamePhase": "mirror"
  }',
  '{
    "mode": "classic",
    "difficulty": 0.6,
    "aiPersonality": "adaptive",
    "boardSize": 8,
    "timeLimit": 30,
    "specialCellFrequency": 0.1,
    "enableLearning": true,
    "enableFeedback": true,
    "enableAchievements": true
  }',
  '{"jugador": 245, "ia": 180}',
  185000,
  12,
  'mirror',
  'classic',
  'jugador',
  true,
  NOW() - INTERVAL '2 hours'
),
(
  '660e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440002',
  '{
    "board": [
      [{"type": "ai"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "player"}],
      [{"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}],
      [{"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}],
      [{"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}],
      [{"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}],
      [{"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}],
      [{"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}],
      [{"type": "player"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "empty"}, {"type": "ai"}]
    ],
    "specialCells": [],
    "currentPlayer": "player",
    "gamePhase": "learning"
  }',
  '{
    "mode": "shadow",
    "difficulty": 0.8,
    "aiPersonality": "hunter",
    "boardSize": 8,
    "timeLimit": 20,
    "specialCellFrequency": 0.05,
    "enableLearning": true,
    "enableFeedback": false,
    "enableAchievements": true
  }',
  '{"jugador": 420, "ia": 380}',
  142000,
  8,
  'evolution',
  'shadow',
  'jugador',
  true,
  NOW() - INTERVAL '4 hours'
);

-- ===================================================================
-- MOVIMIENTOS DE EJEMPLO
-- ===================================================================

INSERT INTO movimientos (partida_id, turno, jugador, posicion, tiempo_reaccion, resultado, contexto, puntuacion_obtenida) VALUES
('660e8400-e29b-41d4-a716-446655440001', 1, 'human', '[0,1]', 1250, 'success', '{"boardState": "initial", "pressure": "low"}', 10),
('660e8400-e29b-41d4-a716-446655440001', 2, 'ai', '[0,6]', NULL, 'success', '{"strategy": "mirror", "confidence": 0.7}', 10),
('660e8400-e29b-41d4-a716-446655440001', 3, 'human', '[2,2]', 980, 'success', '{"boardState": "early", "pressure": "medium"}', 10),
('660e8400-e29b-41d4-a716-446655440001', 4, 'ai', '[3,3]', NULL, 'success', '{"strategy": "mirror", "confidence": 0.8}', 10),
('660e8400-e29b-41d4-a716-446655440001', 5, 'human', '[5,5]', 1420, 'success', '{"boardState": "middle", "pressure": "medium"}', 10),
('660e8400-e29b-41d4-a716-446655440001', 6, 'ai', '[7,7]', NULL, 'success', '{"strategy": "adaptive", "confidence": 0.6}', 10),

('660e8400-e29b-41d4-a716-446655440002', 1, 'human', '[0,7]', 650, 'success', '{"boardState": "initial", "pressure": "low"}', 15),
('660e8400-e29b-41d4-a716-446655440002', 2, 'ai', '[0,0]', NULL, 'success', '{"strategy": "counter", "confidence": 0.9}', 15),
('660e8400-e29b-41d4-a716-446655440002', 3, 'human', '[7,0]', 720, 'success', '{"boardState": "early", "pressure": "high"}', 15),
('660e8400-e29b-41d4-a716-446655440002', 4, 'ai', '[7,7]', NULL, 'success', '{"strategy": "counter", "confidence": 0.85}', 15);

-- ===================================================================
-- ANÁLISIS DE IA
-- ===================================================================

INSERT INTO analisis_ia (partida_id, turno, movimiento_recomendado, confianza, razonamiento, alternativas, prediccion_jugador, personalidad_usada, datos_aprendizaje, tiempo_procesamiento) VALUES
(
  '660e8400-e29b-41d4-a716-446655440001',
  2,
  '[0,6]',
  0.75,
  'Imitando patrón preferido del jugador en posición simétrica',
  '[{"position": [0,6], "score": 0.75, "risk": 0.2}, {"position": [1,1], "score": 0.6, "risk": 0.3}]',
  '{"likelyMoves": [[2,2], [3,3]], "confidence": 0.8}',
  'mirror',
  '{"detectedPattern": "corner_preference", "playerStyle": "balanced", "adaptationLevel": 0.3}',
  150
),
(
  '660e8400-e29b-41d4-a716-446655440001',
  4,
  '[3,3]',
  0.82,
  'Continuando estrategia de espejo con alta confianza',
  '[{"position": [3,3], "score": 0.82, "risk": 0.15}, {"position": [4,4], "score": 0.7, "risk": 0.25}]',
  '{"likelyMoves": [[4,4], [5,5]], "confidence": 0.9}',
  'mirror',
  '{"patternStrength": 0.85, "predictability": 0.75, "mirrorSuccess": 0.8}',
  125
),
(
  '660e8400-e29b-41d4-a716-446655440002',
  2,
  '[0,0]',
  0.92,
  'Anticipando movimientos futuros: bloqueando secuencia probable en esquinas',
  '[{"position": [0,0], "score": 0.92, "risk": 0.1}, {"position": [7,7], "score": 0.8, "risk": 0.2}]',
  '{"likelyMoves": [[7,0], [7,7]], "confidence": 0.85}',
  'hunter',
  '{"aggressionDetected": 0.9, "riskTolerance": 0.8, "counterStrategy": "corner_control"}',
  180
);

-- ===================================================================
-- EVENTOS DE JUEGO
-- ===================================================================

INSERT INTO eventos_juego (partida_id, tipo, datos, importancia) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'move', '{"player": "human", "position": [0,1], "reactionTime": 1250}', 0.3),
('660e8400-e29b-41d4-a716-446655440001', 'move', '{"player": "ai", "position": [0,6], "strategy": "mirror"}', 0.4),
('660e8400-e29b-41d4-a716-446655440001', 'phase_change', '{"from": "learning", "to": "mirror", "trigger": "pattern_detected"}', 0.8),
('660e8400-e29b-41d4-a716-446655440001', 'special_activated', '{"type": "multiplier", "position": [4,4], "effect": "2x_score"}', 0.7),

('660e8400-e29b-41d4-a716-446655440002', 'move', '{"player": "human", "position": [0,7], "reactionTime": 650}', 0.4),
('660e8400-e29b-41d4-a716-446655440002', 'move', '{"player": "ai", "position": [0,0], "strategy": "counter"}', 0.5),
('660e8400-e29b-41d4-a716-446655440002', 'phase_change', '{"from": "learning", "to": "evolution", "trigger": "aggressive_play_detected"}', 0.9);

-- ===================================================================
-- LOGROS
-- ===================================================================

INSERT INTO logros (jugador_id, tipo_logro, nombre, descripcion, datos, partida_id) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  'first_win',
  'Primera Victoria',
  'Ganaste tu primera partida contra la IA',
  '{"difficulty": 0.6, "score": 245, "mode": "classic"}',
  '660e8400-e29b-41d4-a716-446655440001'
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  'quick_thinker',
  'Pensador Rápido',
  'Promedio de tiempo de reacción menor a 2 segundos',
  '{"avgReactionTime": 1500, "gamesCount": 10}',
  NULL
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'speed_demon',
  'Demonio de Velocidad',
  'Tiempo de reacción promedio menor a 1 segundo',
  '{"avgReactionTime": 800, "gamesCount": 20}',
  NULL
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  'ai_slayer',
  'Cazador de IA',
  'Ganaste 10 partidas consecutivas',
  '{"consecutiveWins": 10, "difficulty": 0.8}',
  '660e8400-e29b-41d4-a716-446655440002'
);

-- ===================================================================
-- SESIONES DE APRENDIZAJE
-- ===================================================================

INSERT INTO sesiones_aprendizaje (jugador_id, patrones_detectados, fortalezas, debilidades, predicciones_exitosas, predicciones_fallidas, adaptaciones_realizadas, nivel_desafio) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  '{
    "movimiento_favorito": "centro_tablero",
    "patron_temporal": "consistente",
    "preferencia_riesgo": "moderado",
    "adaptabilidad": "alta",
    "estrategia_dominante": "equilibrada"
  }',
  '["Pensamiento estratégico", "Adaptabilidad", "Paciencia"]',
  '["Presión temporal", "Patrones complejos"]',
  24,
  8,
  12,
  0.65
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  '{
    "movimiento_favorito": "esquinas",
    "patron_temporal": "rapido",
    "preferencia_riesgo": "alto",
    "adaptabilidad": "media",
    "estrategia_dominante": "agresiva"
  }',
  '["Velocidad", "Agresividad", "Creatividad"]',
  '["Paciencia", "Defensas", "Análisis profundo"]',
  35,
  12,
  8,
  0.85
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  '{
    "movimiento_favorito": "centro_seguro",
    "patron_temporal": "lento_pero_seguro",
    "preferencia_riesgo": "bajo",
    "adaptabilidad": "media",
    "estrategia_dominante": "defensiva"
  }',
  '["Paciencia", "Análisis", "Defensa"]',
  '["Velocidad", "Riesgo calculado", "Agresividad"]',
  18,
  6,
  5,
  0.45
);

-- ===================================================================
-- CONFIGURACIÓN ADICIONAL DEL SISTEMA
-- ===================================================================

INSERT INTO configuracion_sistema (clave, valor, descripcion) VALUES
('achievements_config', '{
  "enabled": true,
  "categories": ["gameplay", "speed", "strategy", "learning", "social"],
  "point_system": {
    "first_win": 100,
    "speed_demon": 150,
    "ai_slayer": 200,
    "pattern_master": 175,
    "adaptive_genius": 250
  }
}', 'Configuración del sistema de logros'),

('analytics_config', '{
  "track_moves": true,
  "track_reaction_times": true,
  "track_patterns": true,
  "retention_days": 365,
  "aggregation_intervals": ["daily", "weekly", "monthly"]
}', 'Configuración de analytics y métricas'),

('game_balance', '{
  "ai_personalities": {
    "adaptive": {"base_strength": 0.6, "learning_rate": 0.8},
    "mirror": {"base_strength": 0.5, "learning_rate": 0.9},
    "hunter": {"base_strength": 0.8, "learning_rate": 0.6},
    "sage": {"base_strength": 0.7, "learning_rate": 0.7}
  },
  "difficulty_curves": {
    "beginner": [0.1, 0.2, 0.3, 0.4],
    "intermediate": [0.4, 0.5, 0.6, 0.7],
    "advanced": [0.7, 0.8, 0.9, 1.0]
  }
}', 'Configuración de balance del juego');

-- ===================================================================
-- COMENTARIOS FINALES
-- ===================================================================
-- Estos datos de ejemplo proporcionan:
-- 1. Jugadores con diferentes estilos y niveles de habilidad
-- 2. Partidas completas con movimientos y análisis de IA
-- 3. Eventos de juego importantes
-- 4. Sistema de logros funcional
-- 5. Datos de aprendizaje de IA por jugador
-- 6. Configuración del sistema lista para usar
--
-- Para usar en desarrollo:
-- 1. Ejecutar schema.sql primero
-- 2. Ejecutar este archivo seeds.sql
-- 3. Verificar que los datos se insertaron correctamente
-- 4. Ajustar IDs según necesidades específicas
-- ===================================================================
