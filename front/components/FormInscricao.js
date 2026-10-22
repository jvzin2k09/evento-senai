'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import FormParticipante from './FormParticipante';
import { IconAlert, IconCheck } from './Icons';

// Painel de inscrição em um evento.
// - participantes: lista completa vinda da API
// - inscritosIds: Set com os ids já inscritos neste evento
export default function FormInscricao({ evento, participantes, inscritosIds, onInscrito, onParticipanteCriado }) {
  const [participanteId, setParticipanteId] = useState('');
  const [novo, setNovo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const esgotado = Number(evento.vagas_restantes) <= 0;

  async function inscrever(e) {
    e.preventDefault();
    if (!participanteId) return;

    setErro('');
    setSucesso('');
    setEnviando(true);

    try {
      await api.criarInscricao(evento.id, Number(participanteId));
      const nome = participantes.find((p) => p.id === Number(participanteId))?.nome;
      setSucesso(`Inscrição confirmada${nome ? ` para ${nome.split(' ')[0]}` : ''}!`);
      setParticipanteId('');
      onInscrito?.();
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  function criado(participante) {
    onParticipanteCriado?.(participante);
    setParticipanteId(String(participante.id));
    setNovo(false);
    setSucesso('Cadastro criado. Agora é só confirmar a inscrição.');
  }

  if (esgotado) {
    return (
      <div className="alert alert-error" role="status">
        <IconAlert /> Todas as vagas deste evento foram preenchidas.
      </div>
    );
  }

  if (novo) {
    return (
      <>
        <FormParticipante compacto onCriado={criado} textoBotao="Criar cadastro" />
        <div className="divider-text">ou</div>
        <button type="button" className="btn btn-ghost btn-block" onClick={() => setNovo(false)} id="btn-voltar-inscricao">
          Já tenho cadastro
        </button>
      </>
    );
  }

  return (
    <>
      <form className="form" onSubmit={inscrever} id="form-inscricao">
        <div className="field">
          <label className="label" htmlFor="participante">Participante</label>
          <select
            id="participante"
            className="select"
            value={participanteId}
            onChange={(e) => setParticipanteId(e.target.value)}
            required
          >
            <option value="" disabled>Selecione seu nome</option>
            {participantes.map((p) => {
              const jaInscrito = inscritosIds.has(p.id);
              return (
                <option key={p.id} value={p.id} disabled={jaInscrito}>
                  {p.nome} · {p.turma}{jaInscrito ? ' (já inscrito)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {erro && <div className="alert alert-error" role="alert"><IconAlert /> {erro}</div>}
        {sucesso && <div className="alert alert-success" role="status"><IconCheck /> {sucesso}</div>}

        <button type="submit" className="btn btn-primary btn-block" disabled={enviando || !participanteId} id="btn-inscrever">
          {enviando ? <span className="spinner" /> : 'Confirmar inscrição'}
        </button>
      </form>

      <div className="divider-text">ou</div>

      <button type="button" className="btn btn-ghost btn-block" onClick={() => { setNovo(true); setErro(''); setSucesso(''); }} id="btn-novo-cadastro">
        Não tenho cadastro
      </button>
    </>
  );
}
