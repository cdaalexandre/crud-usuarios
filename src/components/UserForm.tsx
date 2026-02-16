import { useState, useEffect } from 'react';
import { User } from '../types';
import './UserForm.css';

interface UserFormProps {
  user?: User | null;
  onSubmit: (user: Omit<User, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}

export default function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setEmail(user.email);
      setTelefone(user.telefone || '');
    } else {
      setNome('');
      setEmail('');
      setTelefone('');
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ nome, email, telefone: telefone || undefined });
  };

  return (
    <div className="user-form-overlay">
      <div className="user-form-container">
        <h2>{user ? 'Editar Usuário' : 'Novo Usuário'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">Nome *</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Digite o nome"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Digite o email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefone">Telefone</label>
            <input
              type="tel"
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              {user ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
