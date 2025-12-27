const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface User {
  id: string;
  nickname: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateUserResponse {
  user: User;
  token: string;
}

export interface Game {
  id: string;
  name: string;
  password: string;
  description: string | null;
  status: 'PENDING' | 'STARTED' | 'PAUSED' | 'FINISHED';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateGameRequest {
  name: string;
  password: string;
  description?: string;
}

export interface GameUser {
  id: string;
  gameId: string;
  userId: string;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  game?: Game;
  user?: User;
}

export interface AddUserToGameRequest {
  gameId: string;
  password: string;
}

export interface PlayerBalance {
  userId: string;
  user: User;
  balance: number;
  finishedAt: string | null;
}

export interface Transaction {
  id: string;
  userId: string;
  gameId: string;
  description: string | null;
  amount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  user?: User;
}

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async createUser(nickname: string): Promise<CreateUserResponse> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ nickname }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao criar usuário' }));
      throw new Error(error.message || 'Erro ao criar usuário');
    }

    return response.json();
  }

  async getAllGames(): Promise<Game[]> {
    const response = await fetch(`${API_BASE_URL}/games`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao buscar jogos' }));
      throw new Error(error.message || 'Erro ao buscar jogos');
    }

    return response.json();
  }

  async createGame(gameData: CreateGameRequest): Promise<Game> {
    const response = await fetch(`${API_BASE_URL}/games`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(gameData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao criar jogo' }));
      throw new Error(error.message || 'Erro ao criar jogo');
    }

    return response.json();
  }

  async getGameUsers(gameId: string): Promise<GameUser[]> {
    const response = await fetch(`${API_BASE_URL}/game-users/game/${gameId}`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao buscar usuários do jogo' }));
      throw new Error(error.message || 'Erro ao buscar usuários do jogo');
    }

    return response.json();
  }

  async addUserToGame(data: AddUserToGameRequest): Promise<GameUser> {
    const response = await fetch(`${API_BASE_URL}/game-users`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao entrar no jogo' }));
      throw new Error(error.message || 'Erro ao entrar no jogo');
    }

    return response.json();
  }

  async getGame(gameId: string): Promise<Game> {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao buscar jogo' }));
      throw new Error(error.message || 'Erro ao buscar jogo');
    }

    return response.json();
  }

  async updateGame(gameId: string, updateData: Partial<Game>): Promise<Game> {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao atualizar jogo' }));
      throw new Error(error.message || 'Erro ao atualizar jogo');
    }

    return response.json();
  }

  async getPlayersBalance(gameId: string): Promise<PlayerBalance[]> {
    const response = await fetch(`${API_BASE_URL}/transactions/game/${gameId}/players-balance`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao buscar saldos' }));
      throw new Error(error.message || 'Erro ao buscar saldos');
    }

    return response.json();
  }

  async startGame(gameId: string, initialBalance: number): Promise<Transaction[]> {
    const response = await fetch(`${API_BASE_URL}/transactions/start-game`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ gameId, initialBalance }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao iniciar jogo' }));
      throw new Error(error.message || 'Erro ao iniciar jogo');
    }

    return response.json();
  }

  async transferMoney(gameId: string, toUserId: string, amount: number, description?: string): Promise<{ fromTransaction: Transaction; toTransaction: Transaction }> {
    const response = await fetch(`${API_BASE_URL}/transactions/transfer`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ gameId, toUserId, amount, description }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao transferir dinheiro' }));
      throw new Error(error.message || 'Erro ao transferir dinheiro');
    }

    return response.json();
  }

  async receiveFromBank(gameId: string, amount: number, description?: string): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/transactions/receive-from-bank`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ gameId, amount, description }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao receber empréstimo' }));
      throw new Error(error.message || 'Erro ao receber empréstimo');
    }

    return response.json();
  }

  async getGameTransactions(gameId: string): Promise<Transaction[]> {
    const response = await fetch(`${API_BASE_URL}/transactions/game/${gameId}`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao buscar transações' }));
      throw new Error(error.message || 'Erro ao buscar transações');
    }

    return response.json();
  }

  async declareBankruptcy(gameId: string): Promise<GameUser> {
    const response = await fetch(`${API_BASE_URL}/game-users/declare-bankruptcy`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ gameId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao declarar falência' }));
      throw new Error(error.message || 'Erro ao declarar falência');
    }

    return response.json();
  }
}

export const apiService = new ApiService();

