import express from 'express';
import cors from 'cors';
import usersRouter from './routes/users.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/users', usersRouter);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API CRUD de Usuários - Funcionando! 🚀' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api/users`);
});
