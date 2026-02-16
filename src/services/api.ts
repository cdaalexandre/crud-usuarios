import { User } from '../types';

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/users`
  : 'http://localhost:3000/api/users';

export const api = {
  // Listar todos os usuários
  async getUsers(): Promise<User[]> {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Erro ao buscar usuários');
    return response.json();
  },

  // Buscar usuário por ID
  async getUser(id: number): Promise<User> {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Erro ao buscar usuário');
    return response.json();
  },

  // Criar novo usuário
  async createUser(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar usuário');
    }
    return response.json();
  },

  // Atualizar usuário
  async updateUser(id: number, user: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar usuário');
    }
    return response.json();
  },

  // Deletar usuário
  async deleteUser(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Erro ao deletar usuário');
  },
};
