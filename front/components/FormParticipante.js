'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { IconAlert, IconCheck } from './Icons';

const VAZIO = { nome: '', email: '', turma: '' };

// Formulário de cadastro de participante.
// onCriado(participante) é chamado após sucesso (com o id retornado pela API).
export default function FormParticipante({ onCriado, textoBotao = 'Cadastrar participante', compacto = false }) {
  const [dados, setDados] = useState(VAZIO);
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
      const res = await api.criarParticipante(dados);
      const participante = { id: res.id, ...dados };
      setDados(VAZIO);
      if (!compacto) setSucesso('Participante cadastrado com sucesso.');
      onCriado?.(participante);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="form" onSubmit={enviar} id="form-participante">
      <div className="field">
        <label className="label" htmlFor="nome">Nome completo</label>
        <input id="nome" name="nome" className="input" placeholder="Ex.: Ana Beatriz Silva"
          value={dados.nome} onChange={alterar} required maxLength={100} autoComplete="name" />
      </div>

      <div className="field">
        <label className="label" htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" className="input" placeholder="voce@email.com"
          value={dados.email} onChange={alterar} required maxLength={100} autoComplete="email" />
      </div>

      <div className="field">
        <label className="label" htmlFor="turma">Turma</label>
        <input id="turma" name="turma" className="input" placeholder="Ex.: IDEV-4"
          value={dados.turma} onChange={alterar} required maxLength={50} />
      </div>

      {erro && <div className="alert alert-error" role="alert"><IconAlert /> {erro}</div>}
      {sucesso && <div className="alert alert-success" role="status"><IconCheck /> {sucesso}</div>}

      <button type="submit" className="btn btn-primary btn-block" disabled={enviando} id="btn-cadastrar-participante">
        {enviando ? <span className="spinner" /> : textoBotao}
      </button>
    </form>
  );
}
