
const router = require('express').Router();
const db = require('../db');

// GET /inscricoes -> lista todas as inscrições
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT i.id, i.data_inscricao,
             e.id AS evento_id, e.titulo AS evento,
             p.id AS participante_id, p.nome AS participante,
             p.email, p.turma
      FROM inscricoes i
      JOIN eventos e ON e.id = i.evento_id
      JOIN participantes p ON p.id = i.participante_id
      ORDER BY i.data_inscricao DESC
    `);

    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar inscrições' });
  }
});

// GET /inscricoes/:id -> busca uma inscrição
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT i.id, i.data_inscricao,
             e.id AS evento_id, e.titulo AS evento,
             p.id AS participante_id, p.nome AS participante,
             p.email, p.turma
      FROM inscricoes i
      JOIN eventos e ON e.id = i.evento_id
      JOIN participantes p ON p.id = i.participante_id
      WHERE i.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({
        erro: 'Inscrição não encontrada'
      });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar inscrição' });
  }
});

// POST /inscricoes -> inscreve participante em evento
router.post('/', async (req, res) => {
  const { evento_id, participante_id } = req.body;

  if (
    !Number.isInteger(evento_id) || evento_id <= 0 ||
    !Number.isInteger(participante_id) || participante_id <= 0
  ) {
    return res.status(400).json({
      erro: 'evento_id e participante_id devem ser inteiros positivos'
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Bloqueia o evento durante a verificação para evitar
    // que duas requisições ocupem a última vaga simultaneamente.
    const [eventos] = await connection.query(`
      SELECT id, vagas
      FROM eventos
      WHERE id = ?
      FOR UPDATE
    `, [evento_id]);

    if (eventos.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        erro: 'Evento não encontrado'
      });
    }

    const [participantes] = await connection.query(
      'SELECT id FROM participantes WHERE id = ?',
      [participante_id]
    );

    if (participantes.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        erro: 'Participante não encontrado'
      });
    }

    const [existentes] = await connection.query(`
      SELECT id
      FROM inscricoes
      WHERE evento_id = ? AND participante_id = ?
    `, [evento_id, participante_id]);

    if (existentes.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        erro: 'Participante já inscrito neste evento'
      });
    }

    const [contagem] = await connection.query(`
      SELECT COUNT(*) AS total
      FROM inscricoes
      WHERE evento_id = ?
    `, [evento_id]);

    if (Number(contagem[0].total) >= Number(eventos[0].vagas)) {
      await connection.rollback();
      return res.status(409).json({
        erro: 'Evento lotado'
      });
    }

    const [result] = await connection.query(`
      INSERT INTO inscricoes (evento_id, participante_id)
      VALUES (?, ?)
    `, [evento_id, participante_id]);

    await connection.commit();

    return res.status(201).json({
      mensagem: 'Inscrição realizada com sucesso',
      id: result.insertId
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }

    console.error(err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        erro: 'Participante já inscrito neste evento'
      });
    }

    return res.status(500).json({
      erro: 'Erro ao realizar inscrição'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// DELETE /inscricoes/:id -> cancela inscrição
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM inscricoes WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        erro: 'Inscrição não encontrada'
      });
    }

    return res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      erro: 'Erro ao cancelar inscrição'
    });
  }
});

module.exports = router;
