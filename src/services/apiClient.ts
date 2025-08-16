/**
 * ===================================================================
 * MIND MIRROR - CLIENTE API PARA FRONTEND
 * ===================================================================
 * Cliente HTTP para comunicación con el backend
 * ===================================================================
 */

import type {
  Player,
  Game,
  Move,
  CreatePlayerRequest,
  CreatePlayerResponse,
  UpdatePlayerRequest,
  UpdatePlayerResponse,
  CreateGameRequest,
  CreateGameResponse,
  MakeMoveRequest,
  MakeMoveResponse,
  EndGameRequest,
  EndGameResponse,
  GetPlayerHistoryResponse,
  GetGameAnalyticsResponse,
  GetPlayerAnalysisResponse,
  GameConfiguration,
  API_ENDPOINTS
} from '@shared/game-api';

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || '/api';
  }

  // ===================================================================
  // MÉTODO GENÉRICO PARA REQUESTS
  // ===================================================================
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ===================================================================
  // MÉTODOS PARA JUGADORES
  // ===================================================================

  public async createPlayer(data: CreatePlayerRequest): Promise<CreatePlayerResponse> {
    return this.request<CreatePlayerResponse>(API_ENDPOINTS.PLAYERS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getPlayer(id: string): Promise<Player | null> {
    try {
      const response = await this.request<{ player: Player; success: boolean }>(
        API_ENDPOINTS.PLAYER_BY_ID(id)
      );
      return response.player;
    } catch (error) {
      console.error('Error getting player:', error);
      return null;
    }
  }

  public async updatePlayer(id: string, data: UpdatePlayerRequest): Promise<UpdatePlayerResponse> {
    return this.request<UpdatePlayerResponse>(API_ENDPOINTS.PLAYER_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async deletePlayer(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(API_ENDPOINTS.PLAYER_BY_ID(id), {
      method: 'DELETE',
    });
  }

  public async getPlayerAnalysis(id: string): Promise<GetPlayerAnalysisResponse> {
    return this.request<GetPlayerAnalysisResponse>(API_ENDPOINTS.PLAYER_ANALYSIS(id));
  }

  public async getPlayerHistory(
    id: string,
    options: {
      limit?: number;
      offset?: number;
      modo_juego?: string;
      terminadas_solamente?: boolean;
    } = {}
  ): Promise<GetPlayerHistoryResponse> {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.modo_juego) params.append('modo_juego', options.modo_juego);
    if (options.terminadas_solamente !== undefined) {
      params.append('terminadas_solamente', options.terminadas_solamente.toString());
    }

    const endpoint = `${API_ENDPOINTS.PLAYER_HISTORY(id)}?${params.toString()}`;
    return this.request<GetPlayerHistoryResponse>(endpoint);
  }

  public async getPlayerStats(id: string): Promise<any> {
    return this.request(`${API_ENDPOINTS.PLAYER_BY_ID(id)}/estadisticas`);
  }

  public async resetPlayerProgress(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`${API_ENDPOINTS.PLAYER_BY_ID(id)}/reset`, {
      method: 'POST',
    });
  }

  // ===================================================================
  // MÉTODOS PARA PARTIDAS
  // ===================================================================

  public async createGame(data: CreateGameRequest): Promise<CreateGameResponse> {
    return this.request<CreateGameResponse>(API_ENDPOINTS.GAMES, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getGame(id: string): Promise<Game | null> {
    try {
      const response = await this.request<{ game: Game; success: boolean }>(
        API_ENDPOINTS.GAME_BY_ID(id)
      );
      return response.game;
    } catch (error) {
      console.error('Error getting game:', error);
      return null;
    }
  }

  public async makeMove(gameId: string, data: MakeMoveRequest): Promise<MakeMoveResponse> {
    return this.request<MakeMoveResponse>(API_ENDPOINTS.GAME_MOVE(gameId), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async endGame(gameId: string, data: EndGameRequest = {}): Promise<EndGameResponse> {
    return this.request<EndGameResponse>(API_ENDPOINTS.GAME_END(gameId), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getGameAnalytics(gameId: string): Promise<GetGameAnalyticsResponse> {
    return this.request<GetGameAnalyticsResponse>(API_ENDPOINTS.GAME_ANALYTICS(gameId));
  }

  public async getGameMoves(gameId: string): Promise<{ moves: Move[]; success: boolean }> {
    return this.request(`${API_ENDPOINTS.GAME_BY_ID(gameId)}/movimientos`);
  }

  public async getGameEvents(gameId: string): Promise<{ events: any[]; success: boolean }> {
    return this.request(`${API_ENDPOINTS.GAME_BY_ID(gameId)}/eventos`);
  }

  public async listGames(options: {
    jugador_id?: string;
    modo_juego?: string;
    terminada?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    games: Game[];
    total: number;
    page: number;
    totalPages: number;
    success: boolean;
  }> {
    const params = new URLSearchParams();
    if (options.jugador_id) params.append('jugador_id', options.jugador_id);
    if (options.modo_juego) params.append('modo_juego', options.modo_juego);
    if (options.terminada !== undefined) params.append('terminada', options.terminada.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());

    const endpoint = `${API_ENDPOINTS.GAMES}?${params.toString()}`;
    return this.request(endpoint);
  }

  public async deleteGame(gameId: string): Promise<{ success: boolean; message: string }> {
    return this.request(API_ENDPOINTS.GAME_BY_ID(gameId), {
      method: 'DELETE',
    });
  }

  public async pauseGame(gameId: string, pausar: boolean = true): Promise<{ success: boolean; message: string }> {
    return this.request(`${API_ENDPOINTS.GAME_BY_ID(gameId)}/pausa`, {
      method: 'POST',
      body: JSON.stringify({ pausar }),
    });
  }

  // ===================================================================
  // MÉTODOS DEL SISTEMA
  // ===================================================================

  public async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    database: string;
    version?: string;
    uptime: number;
  }> {
    return this.request(API_ENDPOINTS.HEALTH);
  }

  public async getSystemConfig(key?: string): Promise<any> {
    const endpoint = key ? `/api/config/${key}` : API_ENDPOINTS.CONFIG;
    return this.request(endpoint);
  }

  public async resetAI(): Promise<{ success: boolean; message: string }> {
    return this.request(API_ENDPOINTS.RESET_AI, {
      method: 'POST',
    });
  }

  public async getGameStatistics(options: {
    desde?: string;
    hasta?: string;
  } = {}): Promise<{
    general: any;
    por_modo: any[];
    success: boolean;
  }> {
    const params = new URLSearchParams();
    if (options.desde) params.append('desde', options.desde);
    if (options.hasta) params.append('hasta', options.hasta);

    const endpoint = `/api/estadisticas/partidas?${params.toString()}`;
    return this.request(endpoint);
  }

  // ===================================================================
  // MÉTODOS DE UTILIDAD
  // ===================================================================

  public async ping(): Promise<{ message: string }> {
    return this.request('/api/ping');
  }

  public async demo(): Promise<any> {
    return this.request('/api/demo');
  }

  // Método para verificar conexión con la API
  public async checkConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error('API connection failed:', error);
      return false;
    }
  }

  // Método para manejar errores de conexión de forma elegante
  public async safeRequest<T>(
    requestFn: () => Promise<T>,
    fallback?: T
  ): Promise<T | null> {
    try {
      return await requestFn();
    } catch (error) {
      console.error('Safe request failed:', error);
      return fallback || null;
    }
  }
}

// Exportar instancia singleton
export const apiClient = new APIClient();

// Exportar la clase para testing
export { APIClient };

// ===================================================================
// HOOKS DE REACT PARA USO FÁCIL
// ===================================================================

export const useAPIClient = () => {
  return apiClient;
};

// Hook para verificar estado de conexión
export const useAPIConnection = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const connected = await apiClient.checkConnection();
      setIsConnected(connected);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  return {
    isConnected,
    isChecking,
    checkConnection,
    retry: checkConnection
  };
};

// Necesario para los hooks
import { useState } from 'react';
