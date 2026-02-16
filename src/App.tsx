import { useState, useEffect } from 'react';
import { User } from './types';
import { api } from './services/api';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import './App.css';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Carregar usuários
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      setError('Erro ao carregar usuários. Verifique se o servidor está rodando.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Criar ou atualizar usuário
  const handleSubmit = async (userData: Omit<User, 'id' | 'created_at'>) => {
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id!, userData);
      } else {
        await api.createUser(userData);
      }
      await loadUsers();
      setShowForm(false);
      setEditingUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar usuário');
    }
  };

  // Deletar usuário
  const handleDelete = async (id: number) => {
    try {
      await api.deleteUser(id);
      await loadUsers();
    } catch (err) {
      alert('Erro ao deletar usuário');
    }
  };

  // Editar usuário
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  // Cancelar formulário
  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📋 CRUD de Usuários</h1>
        <p>Sistema de Gerenciamento com React + SQLite</p>
      </header>

      <main className="app-main">
        <div className="toolbar">
          <button
            onClick={() => setShowForm(true)}
            className="btn-new"
            disabled={loading}
          >
            + Novo Usuário
          </button>
          <button onClick={loadUsers} className="btn-refresh" disabled={loading}>
            🔄 Atualizar
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Carregando...</div>
        ) : (
          <UserList users={users} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </main>

      {showForm && (
        <UserForm user={editingUser} onSubmit={handleSubmit} onCancel={handleCancel} />
      )}
    </div>
  );
}

export default App;
