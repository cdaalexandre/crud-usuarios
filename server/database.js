import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper para promisify sqlite3
const promisify = (fn) => {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn.apply(this, [
        ...args,
        function (err, result) {
          if (err) reject(err);
          else resolve(result);
        },
      ]);
    });
  };
};

// Criar banco de dados
const db = new sqlite3.Database(join(__dirname, 'users.db'));

// Promisified methods
db.runAsync = promisify(db.run);
db.getAsync = promisify(db.get);
db.allAsync = promisify(db.all);

// Criar tabela de usuários
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      telefone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Verificar se há dados
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (!err && row.count === 0) {
      // Inserir dados de exemplo
      const stmt = db.prepare('INSERT INTO users (nome, email, telefone) VALUES (?, ?, ?)');
      stmt.run('João Silva', 'joao@example.com', '(11) 98765-4321');
      stmt.run('Maria Santos', 'maria@example.com', '(21) 91234-5678');
      stmt.run('Pedro Oliveira', 'pedro@example.com', '(31) 99876-5432');
      stmt.finalize();
      console.log('✅ Dados de exemplo inseridos');
    }
  });
});

export default db;
