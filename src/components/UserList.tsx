import { User } from '../types';
import './UserList.css';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

export default function UserList({ users, onEdit, onDelete }: UserListProps) {
  const handleDelete = (id: number, nome: string) => {
    if (window.confirm(`Tem certeza que deseja deletar ${nome}?`)) {
      onDelete(id);
    }
  };

  if (users.length === 0) {
    return (
      <div className="empty-state">
        <p>Nenhum usuário cadastrado</p>
        <p className="empty-hint">Clique em "Novo Usuário" para adicionar</p>
      </div>
    );
  }

  return (
    <div className="user-list">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.nome}</td>
              <td>{user.email}</td>
              <td>{user.telefone || '-'}</td>
              <td className="actions">
                <button onClick={() => onEdit(user)} className="btn-edit">
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(user.id!, user.nome)}
                  className="btn-delete"
                >
                  Deletar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
