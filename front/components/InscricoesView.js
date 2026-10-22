'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, formatarDataCurta, iniciais } from '@/lib/api';
import Modal from './Modal';
import { IconAlert, IconCheck, IconPlus, IconSearch, IconTrash } from './Icons';

export default function InscricoesView() {
  const [inscricoes, setInscricoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  // Modal nova inscrição
  const [modalNovaAberto, setModalNovaAberto] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [eventoSelecionado, setEventoSelecionado] = useState('');
  const [participanteSelecionado, setParticipanteSelecionado] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroModal, setErroModal] = useState('');
  const [sucessoModal, setSucessoModal] = useState('');

  const carregarInscricoes = useCallback(() => {
    return api
      .listarInscricoes()
      .then(setInscricoes)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    carregarInscricoes();
  }, [carregarInscricoes]);

  function abrirModalNovaInscricao() {
    setModalNovaAberto(true);
    setErroModal('');
    setSucessoModal('');
    setEventoSelecionado('');
    setParticipanteSelecionado('');

    Promise.all([api.listarEventos(), api.listarParticipantes()])
      .then(([evs, parts]) => {
        setEventos(evs);
        setParticipantes(parts);
      })
      .catch((e) => setErroModal(e.message));
  }

  async function handleSubmeterInscricao(e) {
    e.preventDefault();
    if (!eventoSelecionado || !participanteSelecionado) return;

    setErroModal('');
    setSucessoModal('');
    setEnviando(true);

    try {
      await api.criarInscricao(Number(eventoSelecionado), Number(participanteSelecionado));
      setSucessoModal('Inscrição confirmada com sucesso!');
      carregarInscricoes();
      setTimeout(() => {
        setModalNovaAberto(false);
      }, 1000);
    } catch (err) {
      setErroModal(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const filtradas = useMemo(() => {
    const t = busca.trim().toLowerCase();
    if (!t) return inscricoes;
    return inscricoes.filter((i) =>
      [i.participante, i.evento, i.email, i.turma].some((v) => v?.toLowerCase().includes(t))
    );
  }, [inscricoes, busca]);

  async function cancelar(i) {
    if (!confirm(`Cancelar a inscrição de ${i.participante} em "${i.evento}"?`)) return;
    try {
      await api.cancelarInscricao(i.id);
      setInscricoes((lista) => lista.filter((x) => x.id !== i.id));
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <>
      <section className="page-head">
        <div className="container">
          <div className="section-title" style={{ marginBottom: 0 }}>
            <span className="eyebrow reveal reveal-1">Inscrições</span>
            <h1 className="reveal reveal-2">Todas as inscrições</h1>
            <p className="reveal reveal-3">
              Acompanhe quem está inscrito em cada evento e gerencie participações.
            </p>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '56px 24px 96px' }}>
        <div className="toolbar" style={{ marginBottom: 24 }}>
          <div className="list-head" style={{ margin: 0 }}>
            <h2>
              Registros <span style={{ marginLeft: 6 }}>{inscricoes.length}</span>
            </h2>
          </div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <label className="search">
              <span className="visually-hidden">Buscar inscrição</span>
              <IconSearch />
              <input
                id="busca-inscricoes"
                className="input"
                type="search"
                placeholder="Buscar participante ou evento"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </label>

            <button
              type="button"
              className="btn btn-primary"
              onClick={abrirModalNovaInscricao}
              id="btn-nova-inscricao"
            >
              <IconPlus /> Nova inscrição
            </button>
          </div>
        </div>

        {erro && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: 16 }}>
            <IconAlert /> {erro}
          </div>
        )}

        {carregando ? (
          <div className="skeleton" style={{ height: 320 }} />
        ) : filtradas.length === 0 ? (
          <div className="empty">
            <strong>Nenhuma inscrição encontrada</strong>
            <p>
              {busca ? (
                'Tente outro termo de busca.'
              ) : (
                <>
                  Escolha um evento na{' '}
                  <Link href="/" style={{ color: 'var(--text)', textDecoration: 'underline' }}>
                    agenda
                  </Link>{' '}
                  ou use o botão acima para fazer uma nova inscrição.
                </>
              )}
            </p>
          </div>
        ) : (
          <ul className="list reveal reveal-3" style={{ listStyle: 'none' }}>
            {filtradas.map((i) => (
              <li key={i.id} className="list-item">
                <span className="avatar">{iniciais(i.participante)}</span>
                <div className="list-main">
                  <strong>{i.participante}</strong>
                  <span>
                    <Link href={`/eventos/${i.evento_id}`} style={{ color: 'var(--muted)' }}>
                      {i.evento}
                    </Link>{' '}
                    · <small className="muted">{i.turma}</small>
                  </span>
                </div>
                <div className="list-side">
                  <span className="muted" style={{ fontSize: '0.75rem' }}>
                    {formatarDataCurta(i.data_inscricao)}
                  </span>
                  <button
                    type="button"
                    className="btn-danger-text"
                    onClick={() => cancelar(i)}
                    id={`cancelar-inscricao-${i.id}`}
                    title="Cancelar inscrição"
                  >
                    <IconTrash style={{ verticalAlign: '-2px', marginRight: 4 }} /> Cancelar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Modal para Nova Inscrição */}
      <Modal
        aberto={modalNovaAberto}
        fechar={() => setModalNovaAberto(false)}
        titulo="Nova Inscrição"
        subtitulo="Vincule um participante a um evento disponível"
        larguraMax={520}
      >
        <form className="form" onSubmit={handleSubmeterInscricao} id="form-nova-inscricao-modal">
          <div className="field">
            <label className="label" htmlFor="select-evento-modal">
              Selecione o Evento
            </label>
            <select
              id="select-evento-modal"
              className="select"
              value={eventoSelecionado}
              onChange={(e) => setEventoSelecionado(e.target.value)}
              required
            >
              <option value="" disabled>
                Escolha o evento
              </option>
              {eventos.map((ev) => {
                const rest = Number(ev.vagas_restantes);
                const esgotado = rest <= 0;
                return (
                  <option key={ev.id} value={ev.id} disabled={esgotado}>
                    {ev.titulo} — {ev.local} ({rest} vagas restantes){esgotado ? ' [ESGOTADO]' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="field">
            <label className="label" htmlFor="select-participante-modal">
              Selecione o Participante
            </label>
            <select
              id="select-participante-modal"
              className="select"
              value={participanteSelecionado}
              onChange={(e) => setParticipanteSelecionado(e.target.value)}
              required
            >
              <option value="" disabled>
                Escolha o participante
              </option>
              {participantes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} · {p.turma} ({p.email})
                </option>
              ))}
            </select>
          </div>

          {erroModal && (
            <div className="alert alert-error" role="alert">
              <IconAlert /> {erroModal}
            </div>
          )}

          {sucessoModal && (
            <div className="alert alert-success" role="status">
              <IconCheck /> {sucessoModal}
            </div>
          )}

          <div className="form-actions-row" style={{ marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setModalNovaAberto(false)}
              disabled={enviando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={enviando || !eventoSelecionado || !participanteSelecionado}
              id="btn-confirmar-inscricao-modal"
            >
              {enviando ? <span className="spinner" /> : 'Confirmar Inscrição'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
