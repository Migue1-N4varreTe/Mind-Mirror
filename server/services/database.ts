/**
 * ===================================================================
 * MIND MIRROR - SERVICIO DE BASE DE DATOS
 * ===================================================================
 * Servicio para interacción con PostgreSQL/Supabase
 * ===================================================================
 */

import { Pool, QueryResult } from 'pg';

export class DatabaseService {
  private pool: Pool | null = null;
  private isConnected = false;

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    try {
      // Configuración para PostgreSQL/Supabase
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      this.pool.on('connect', () => {
        this.isConnected = true;
        console.log('✅ Database connection established');
      });

      this.pool.on('error', (err) => {
        this.isConnected = false;
        console.error('❌ Database connection error:', err);
      });

    } catch (error) {
      console.error('❌ Failed to initialize database connection:', error);
    }
  }

  // ===================================================================
  // MÉTODOS GENÉRICOS DE CONSULTA
  // ===================================================================

  public async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    try {
      const start = Date.now();
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      
      // Log solo en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Query executed in ${duration}ms:`, text.slice(0, 50) + '...');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Database query error:', error);
      throw error;
    }
  }

  public async queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
    const result = await this.query<T>(text, params);
    return result.rows[0] || null;
  }

  public async queryMany<T = any>(text: string, params?: any[]): Promise<T[]> {
    const result = await this.query<T>(text, params);
    return result.rows;
  }

  // ===================================================================
  // TRANSACCIONES
  // ===================================================================

  public async transaction<T>(callback: (query: (text: string, params?: any[]) => Promise<QueryResult>) => Promise<T>): Promise<T> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const result = await callback((text: string, params?: any[]) => client.query(text, params));
      
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ===================================================================
  // MÉTODOS ESPECÍFICOS PARA JUGADORES
  // ===================================================================

  public async createPlayer(data: {
    nombre: string;
    email?: string;
    estilo?: string;
    perfil_ia?: any;
    configuracion?: any;
  }): Promise<any> {
    const query = `
      INSERT INTO jugadores (nombre, email, estilo, perfil_ia, configuracion)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    return this.queryOne(query, [
      data.nombre,
      data.email || null,
      data.estilo || 'balanced',
      JSON.stringify(data.perfil_ia || {}),
      JSON.stringify(data.configuracion || {})
    ]);
  }

  public async getPlayer(id: string): Promise<any> {
    const query = `
      SELECT * FROM jugadores WHERE id = $1 AND activo = true
    `;
    return this.queryOne(query, [id]);
  }

  public async getPlayerByEmail(email: string): Promise<any> {
    const query = `
      SELECT * FROM jugadores WHERE email = $1 AND activo = true
    `;
    return this.queryOne(query, [email]);
  }

  public async updatePlayer(id: string, data: {
    nombre?: string;
    email?: string;
    estilo?: string;
    perfil_ia?: any;
    configuracion?: any;
  }): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.nombre !== undefined) {
      fields.push(`nombre = $${paramCount++}`);
      values.push(data.nombre);
    }
    if (data.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(data.email);
    }
    if (data.estilo !== undefined) {
      fields.push(`estilo = $${paramCount++}`);
      values.push(data.estilo);
    }
    if (data.perfil_ia !== undefined) {
      fields.push(`perfil_ia = $${paramCount++}`);
      values.push(JSON.stringify(data.perfil_ia));
    }
    if (data.configuracion !== undefined) {
      fields.push(`configuracion = $${paramCount++}`);
      values.push(JSON.stringify(data.configuracion));
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`actualizado_en = NOW()`);
    values.push(id);

    const query = `
      UPDATE jugadores 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount} AND activo = true
      RETURNING *
    `;

    return this.queryOne(query, values);
  }

  // ===================================================================
  // MÉTODOS ESPECÍFICOS PARA PARTIDAS
  // ===================================================================

  public async createGame(data: {
    jugador_id: string;
    estado: any;
    configuracion: any;
    modo_juego?: string;
    fase_juego?: string;
  }): Promise<any> {
    const query = `
      INSERT INTO partidas (jugador_id, estado, configuracion, modo_juego, fase_juego)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    return this.queryOne(query, [
      data.jugador_id,
      JSON.stringify(data.estado),
      JSON.stringify(data.configuracion),
      data.modo_juego || 'classic',
      data.fase_juego || 'learning'
    ]);
  }

  public async getGame(id: string): Promise<any> {
    const query = `
      SELECT * FROM partidas WHERE id = $1
    `;
    return this.queryOne(query, [id]);
  }

  public async updateGame(id: string, data: {
    estado?: any;
    puntuacion?: any;
    turno_actual?: number;
    fase_juego?: string;
    resultado?: string;
    terminada?: boolean;
    duracion?: number;
    metadatos?: any;
  }): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.estado !== undefined) {
      fields.push(`estado = $${paramCount++}`);
      values.push(JSON.stringify(data.estado));
    }
    if (data.puntuacion !== undefined) {
      fields.push(`puntuacion = $${paramCount++}`);
      values.push(JSON.stringify(data.puntuacion));
    }
    if (data.turno_actual !== undefined) {
      fields.push(`turno_actual = $${paramCount++}`);
      values.push(data.turno_actual);
    }
    if (data.fase_juego !== undefined) {
      fields.push(`fase_juego = $${paramCount++}`);
      values.push(data.fase_juego);
    }
    if (data.resultado !== undefined) {
      fields.push(`resultado = $${paramCount++}`);
      values.push(data.resultado);
    }
    if (data.terminada !== undefined) {
      fields.push(`terminada = $${paramCount++}`, `terminado_en = ${data.terminada ? 'NOW()' : 'NULL'}`);
      values.push(data.terminada);
    }
    if (data.duracion !== undefined) {
      fields.push(`duracion = $${paramCount++}`);
      values.push(data.duracion);
    }
    if (data.metadatos !== undefined) {
      fields.push(`metadatos = $${paramCount++}`);
      values.push(JSON.stringify(data.metadatos));
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    const query = `
      UPDATE partidas 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    return this.queryOne(query, values);
  }

  public async getPlayerGames(playerId: string, options: {
    limit?: number;
    offset?: number;
    terminadas_solamente?: boolean;
    modo_juego?: string;
  } = {}): Promise<{ games: any[], total: number }> {
    const { limit = 10, offset = 0, terminadas_solamente, modo_juego } = options;
    
    let whereClause = 'WHERE jugador_id = $1';
    const params: any[] = [playerId];
    let paramCount = 2;

    if (terminadas_solamente !== undefined) {
      whereClause += ` AND terminada = $${paramCount++}`;
      params.push(terminadas_solamente);
    }

    if (modo_juego) {
      whereClause += ` AND modo_juego = $${paramCount++}`;
      params.push(modo_juego);
    }

    // Contar total
    const countQuery = `SELECT COUNT(*) as total FROM partidas ${whereClause}`;
    const totalResult = await this.queryOne<{ total: string }>(countQuery, params);
    const total = parseInt(totalResult?.total || '0');

    // Obtener partidas
    const gamesQuery = `
      SELECT * FROM partidas 
      ${whereClause}
      ORDER BY creado_en DESC
      LIMIT $${paramCount++} OFFSET $${paramCount++}
    `;
    
    params.push(limit, offset);
    const games = await this.queryMany(gamesQuery, params);

    return { games, total };
  }

  // ===================================================================
  // MÉTODOS ESPECÍFICOS PARA MOVIMIENTOS
  // ===================================================================

  public async createMove(data: {
    partida_id: string;
    turno: number;
    jugador: 'human' | 'ai';
    posicion: [number, number];
    tiempo_reaccion?: number;
    resultado: string;
    contexto?: any;
    puntuacion_obtenida?: number;
    efectos?: any[];
  }): Promise<any> {
    const query = `
      INSERT INTO movimientos (
        partida_id, turno, jugador, posicion, tiempo_reaccion, 
        resultado, contexto, puntuacion_obtenida, efectos
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    return this.queryOne(query, [
      data.partida_id,
      data.turno,
      data.jugador,
      JSON.stringify(data.posicion),
      data.tiempo_reaccion || null,
      data.resultado,
      JSON.stringify(data.contexto || {}),
      data.puntuacion_obtenida || 0,
      JSON.stringify(data.efectos || [])
    ]);
  }

  public async getGameMoves(gameId: string): Promise<any[]> {
    const query = `
      SELECT * FROM movimientos 
      WHERE partida_id = $1 
      ORDER BY turno ASC
    `;
    return this.queryMany(query, [gameId]);
  }

  // ===================================================================
  // MÉTODOS ESPECÍFICOS PARA ANÁLISIS DE IA
  // ===================================================================

  public async createAIAnalysis(data: {
    partida_id: string;
    turno: number;
    movimiento_recomendado: [number, number] | null;
    confianza: number;
    razonamiento: string;
    alternativas?: any[];
    prediccion_jugador?: any;
    personalidad_usada: string;
    datos_aprendizaje?: any;
    tiempo_procesamiento: number;
  }): Promise<any> {
    const query = `
      INSERT INTO analisis_ia (
        partida_id, turno, movimiento_recomendado, confianza, razonamiento,
        alternativas, prediccion_jugador, personalidad_usada, 
        datos_aprendizaje, tiempo_procesamiento
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    return this.queryOne(query, [
      data.partida_id,
      data.turno,
      JSON.stringify(data.movimiento_recomendado),
      data.confianza,
      data.razonamiento,
      JSON.stringify(data.alternativas || []),
      JSON.stringify(data.prediccion_jugador || {}),
      data.personalidad_usada,
      JSON.stringify(data.datos_aprendizaje || {}),
      data.tiempo_procesamiento
    ]);
  }

  // ===================================================================
  // MÉTODOS DE UTILIDAD
  // ===================================================================

  public async healthCheck(): Promise<{ healthy: boolean; timestamp: string; dbVersion?: string }> {
    try {
      const result = await this.queryOne('SELECT version() as version, NOW() as timestamp');
      return {
        healthy: true,
        timestamp: result?.timestamp || new Date().toISOString(),
        dbVersion: result?.version
      };
    } catch (error) {
      return {
        healthy: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  public async getSystemConfig(key?: string): Promise<any> {
    if (key) {
      const query = 'SELECT * FROM configuracion_sistema WHERE clave = $1';
      return this.queryOne(query, [key]);
    } else {
      const query = 'SELECT * FROM configuracion_sistema ORDER BY clave';
      return this.queryMany(query);
    }
  }

  public isHealthy(): boolean {
    return this.isConnected && this.pool !== null;
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
      console.log('🔐 Database connection closed');
    }
  }
}

// Singleton instance
export const db = new DatabaseService();
