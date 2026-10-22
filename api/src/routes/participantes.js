
const router = require('express').Router();
const db = require('../db');

// GET /participantes -> lista todos os participantes
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, nome, email, turma
      FROM participantes
      ORDER BY nome
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar participantes' });
  }
});

// GET /participantes/:id -> busca um participante
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, nome, email, turma
      FROM participantes
      WHERE id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Participante não encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar participante' });
  }
});

// POST /participantes -> cadastra um participante
router.post('/', async (req, res) => {
  try {
    const { nome, email, turma } = req.body;

    if (!nome?.trim() || !email?.trim() || !turma?.trim()) {
      return res.status(400).json({
        erro: 'Nome, e-mail e turma são obrigatórios'
      });
    }

    const [result] = await db.query(`
      INSERT INTO participantes (nome, email, turma)
      VALUES (?, ?, ?)
    `, [nome.trim(), email.trim(), turma.trim()]);

    res.status(201).json({
      mensagem: 'Participante cadastrado com sucesso',
      id: result.insertId
    });
  } catch (err) {
    console.error(err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        erro: 'Já existe um participante com esse e-mail'
      });
    }

    res.status(500).json({ erro: 'Erro ao cadastrar participante' });
  }
});

// PUT /participantes/:id -> atualiza um participante
router.put('/:id', async (req, res) => {
  try {
    const { nome, email, turma } = req.body;

    if (!nome?.trim() || !email?.trim() || !turma?.trim()) {
      return res.status(400).json({
        erro: 'Nome, e-mail e turma são obrigatórios'
      });
    }

    const [result] = await db.query(`
      UPDATE participantes
      SET nome = ?, email = ?, turma = ?
      WHERE id = ?
    `, [nome.trim(), email.trim(), turma.trim(), req.params.id]);

    if (result.affectedRows === 0) {
      const [exists] = await db.query(
        'SELECT id FROM participantes WHERE id = ?',
        [req.params.id]
      );

      if (exists.length === 0) {
        return res.status(404).json({ erro: 'Participante não encontrado' });
      }
    }

    res.json({ mensagem: 'Participante atualizado com sucesso' });
  } catch (err) {
    console.error(err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        erro: 'Já existe um participante com esse e-mail'
      });
    }

    res.status(500).json({ erro: 'Erro ao atualizar participante' });
  }
});

// DELETE /participantes/:id -> exclui um participante
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM participantes WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Participante não encontrado' });
    }

    res.json({ mensagem: 'Participante excluído com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir participante' });
  }
});

module.exports = router;
