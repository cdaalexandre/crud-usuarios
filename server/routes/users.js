import express from 'express';
import db from '../database.js';

const router = express.Router();

// GET - Listar todos os usuários
router.get('/', async (req, res) => {
  try {
    const users = await db.allAsync('SELECT * FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Buscar usuário por ID
router.get('/:id', async (req, res) => {
  try {
    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar novo usuário
router.post('/', async (req, res) => {
  try {
    const { nome, email, telefone } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }

    const result = await db.runAsync(
      'INSERT INTO users (nome, email, telefone) VALUES (?, ?, ?)',
      [nome, email, telefone || null]
    );

    const newUser = await db.getAsync('SELECT * FROM users WHERE id = ?', [result.lastID]);
    res.status(201).json(newUser);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar usuário
router.put('/:id', async (req, res) => {
  try {
    const { nome, email, telefone } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }

    const result = await db.runAsync(
      'UPDATE users SET nome = ?, email = ?, telefone = ? WHERE id = ?',
      [nome, email, telefone || null, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const updatedUser = await db.getAsync('SELECT * FROM users WHERE id = ?', [req.params.id]);
    res.json(updatedUser);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Deletar usuário
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.runAsync('DELETE FROM users WHERE id = ?', [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
