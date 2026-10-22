
const router = require('express').Router();
const db = require('../db');

// GET /eventos -> lista eventos com categoria e vagas restantes
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.id, e.titulo, e.descricao, e.data_evento,
             e.local, e.vagas, e.categoria_id,
             c.nome AS categoria,
             e.vagas - COUNT(i.id) AS vagas_restantes
      FROM eventos e
      JOIN categorias c ON c.id = e.categoria_id
      LEFT JOIN inscricoes i ON i.evento_id = e.id
      GROUP BY e.id
      ORDER BY e.data_evento
    `);

    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar eventos' });
  }
});

// GET /eventos/:id/inscritos ou /eventos/:id/participantes -> lista inscritos do evento
// Esta rota precisa ficar antes de GET /:id
router.get(['/:id/inscritos', '/:id/participantes'], async (req, res) => {
  try {
    const [eventos] = await db.query(
      'SELECT id FROM eventos WHERE id = ?',
      [req.params.id]
    );

    if (eventos.length === 0) {
      return res.status(404).json({
        erro: 'Evento não encontrado'
      });
    }

    const [rows] = await db.query(`
      SELECT p.id, p.nome, p.email, p.turma, i.data_inscricao
      FROM inscricoes i
      JOIN participantes p ON p.id = i.participante_id
      WHERE i.evento_id = ?
      ORDER BY i.data_inscricao DESC
    `, [req.params.id]);

    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      erro: 'Erro ao buscar inscritos do evento'
    });
  }
});

// GET /eventos/:id -> detalhes de um evento
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.id, e.titulo, e.descricao, e.data_evento,
             e.local, e.vagas, e.categoria_id,
             c.nome AS categoria,
             e.vagas - COUNT(i.id) AS vagas_restantes
      FROM eventos e
      JOIN categorias c ON c.id = e.categoria_id
      LEFT JOIN inscricoes i ON i.evento_id = e.id
      WHERE e.id = ?
      GROUP BY e.id
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({
        erro: 'Evento não encontrado'
      });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar evento' });
  }
});

// POST /eventos -> cria um evento
router.post('/', async (req, res) => {
  try {
    const {
      titulo, descricao, data_evento,
      local, vagas, categoria_id
    } = req.body;

    if (
      typeof titulo !== 'string' || !titulo.trim() ||
      !data_evento ||
      typeof local !== 'string' || !local.trim() ||
      !Number.isInteger(vagas) || vagas <= 0 ||
      !Number.isInteger(categoria_id) || categoria_id <= 0
    ) {
      return res.status(400).json({
        erro: 'Dados inválidos para cadastrar evento'
      });
    }

    const [result] = await db.query(`
      INSERT INTO eventos
        (titulo, descricao, data_evento, local, vagas, categoria_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      titulo.trim(),
      descricao || null,
      data_evento,
      local.trim(),
      vagas,
      categoria_id
    ]);

    res.status(201).json({
      mensagem: 'Evento cadastrado com sucesso',
      id: result.insertId
    });
  } catch (err) {
    console.error(err);

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        erro: 'Categoria não encontrada'
      });
    }

    res.status(500).json({ erro: 'Erro ao cadastrar evento' });
  }
});

// PUT /eventos/:id -> atualiza um evento
router.put('/:id', async (req, res) => {
  try {
    const {
      titulo, descricao, data_evento,
      local, vagas, categoria_id
    } = req.body;

    if (
      typeof titulo !== 'string' || !titulo.trim() ||
      !data_evento ||
      typeof local !== 'string' || !local.trim() ||
      !Number.isInteger(vagas) || vagas <= 0 ||
      !Number.isInteger(categoria_id) || categoria_id <= 0
    ) {
      return res.status(400).json({
        erro: 'Dados inválidos para atualizar evento'
      });
    }

    const [eventos] = await db.query(
      'SELECT id FROM eventos WHERE id = ?',
      [req.params.id]
    );

    if (eventos.length === 0) {
      return res.status(404).json({
        erro: 'Evento não encontrado'
      });
    }

    const [contagem] = await db.query(`
      SELECT COUNT(*) AS total
      FROM inscricoes
      WHERE evento_id = ?
    `, [req.params.id]);

    if (vagas < Number(contagem[0].total)) {
      return res.status(400).json({
        erro: 'As vagas não podem ser menores que as inscrições existentes'
      });
    }

    await db.query(`
      UPDATE eventos
      SET titulo = ?, descricao = ?, data_evento = ?,
          local = ?, vagas = ?, categoria_id = ?
      WHERE id = ?
    `, [
      titulo.trim(),
      descricao || null,
      data_evento,
      local.trim(),
      vagas,
      categoria_id,
      req.params.id
    ]);

    res.status(200).json({
      mensagem: 'Evento atualizado com sucesso'
    });
  } catch (err) {
    console.error(err);

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        erro: 'Categoria não encontrada'
      });
    }

    res.status(500).json({ erro: 'Erro ao atualizar evento' });
  }
});

// DELETE /eventos/:id -> remove um evento
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM eventos WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        erro: 'Evento não encontrado'
      });
    }

    // O banco remove inscrições relacionadas via ON DELETE CASCADE
    return res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao excluir evento' });
  }
});

module.exports = router;
