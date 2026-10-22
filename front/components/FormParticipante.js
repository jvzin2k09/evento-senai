'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { IconAlert, IconCheck } from './Icons';

const VAZIO = { nome: '', email: '', turma: '' };

// Formulário de cadastro ou edição de participante.
// - participanteInicial: se informado, entra em modo edição
// - onSalvo(participante) ou onCriado(participante): callback com sucesso
export default function FormParticipante({
  participanteInicial = null,
  onSalvo,
  onCriado,
  onCancelar,
  textoBotao,
  compacto = false,
}) {
  const editando = Boolean(participanteInicial?.id);

  const [dados, setDados] = useState({
    nome: participanteInicial?.nome || '',
    email: participanteInicial?.email || '',
    turma: participanteInicial?.turma || '',
  });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  function alterar(e) {
    setDados((d) => ({ ...d, [e.target.name]: e.target.value }));
  }

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setEnviando(true);

    try {
      if (editando) {
        await api.atualizarParticipante(participanteInicial.id, dados);
        const atualizado = { id: participanteInicial.id, ...dados };
        if (!compacto) setSucesso('Participante atualizado com sucesso.');
        onSalvo?.(atualizado);
      } else {
        const res = await api.criarParticipante(dados);
        const novo = { id: res.id, ...dados };
        setDados(VAZIO);
        if (!compacto) setSucesso('Participante cadastrado com sucesso.');
        onCriado?.(novo);
        onSalvo?.(novo);
      }
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const rotuloBotao =
    textoBotao || (editando ? 'Salvar alterações' : 'Cadastrar participante');

  return (
    <form className="form" onSubmit={enviar} id={editando ? `form-participante-edit-${participanteInicial.id}` : 'form-participante'}>
      <div className="field">
        <label className="label" htmlFor="nome">Nome completo</label>
        <input
          id="nome"
          name="nome"
          className="input"
          placeholder="Ex.: Ana Beatriz Silva"
          value={dados.nome}
          onChange={alterar}
          required
          maxLength={100}
          autoComplete="name"
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          className="input"
          placeholder="voce@email.com"
          value={dados.email}
          onChange={alterar}
          required
          maxLength={100}
          autoComplete="email"
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="turma">Turma</label>
        <input
          id="turma"
          name="turma"
          className="input"
          placeholder="Ex.: IDEV-4"
          value={dados.turma}
          onChange={alterar}
          required
          maxLength={50}
        />
      </div>

      {erro && (
        <div className="alert alert-error" role="alert">
          <IconAlert /> {erro}
        </div>
      )}
      {sucesso && (
        <div className="alert alert-success" role="status">
          <IconCheck /> {sucesso}
        </div>
      )}

      <div className="form-actions-row">
        {onCancelar && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancelar}
            disabled={enviando}
            id="btn-cancelar-participante"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className={`btn btn-primary ${!onCancelar ? 'btn-block' : ''}`}
          style={onCancelar ? { flex: 1 } : {}}
          disabled={enviando}
          id="btn-salvar-participante"
        >
          {enviando ? <span className="spinner" /> : rotuloBotao}
        </button>
      </div>
    </form>
  );
}
