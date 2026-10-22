'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, formatarData, formatarDataCurta, formatarHora, iniciais } from '@/lib/api';
import FormInscricao from './FormInscricao';
import FormEvento from './FormEvento';
import Modal from './Modal';
import { statusVagas } from './EventoCard';
import { IconAlert, IconArrowLeft, IconEdit, IconTrash } from './Icons';

export default function EventoDetalhe() {
  const { id } = useParams();
  const router = useRouter();

  const [evento, setEvento] = useState(null);
  const [inscritos, setInscritos] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const recarregarEvento = useCallback(async () => {
    const [ev, ins] = await Promise.all([api.buscarEvento(id), api.listarInscritos(id)]);
    setEvento(ev);
    setInscritos(ins);
  }, [id]);

  useEffect(() => {
    Promise.all([recarregarEvento(), api.listarParticipantes().then(setParticipantes)])
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [recarregarEvento]);

  const inscritosIds = useMemo(() => new Set(inscritos.map((i) => i.id)), [inscritos]);

  async function handleExcluirEvento() {
    if (
      !confirm(
        `Tem certeza que deseja excluir o evento "${evento.titulo}"?\nTodas as inscrições associadas também serão removidas.`
      )
    ) {
      return;
    }

    setExcluindo(true);
    try {
      await api.excluirEvento(evento.id);
      router.push('/');
    } catch (err) {
      alert(`Erro ao excluir evento: ${err.message}`);
      setExcluindo(false);
    }
  }

  function handleEventoSalvo() {
    setModalEditarAberto(false);
    recarregarEvento();
  }

  if (carregando) return <DetalheSkeleton />;

  if (erro || !evento) {
    return (
      <div className="container" style={{ padding: '80px 24px' }}>
        <Link href="/" className="back">
          <IconArrowLeft /> Voltar para eventos
        </Link>
        <div className="alert alert-error" role="alert">
          <IconAlert /> {erro || 'Evento não encontrado'}
        </div>
      </div>
    );
  }

  const total = Number(evento.vagas);
  const restantes = Math.max(0, Number(evento.vagas_restantes));
  const ocupacao = total > 0 ? ((total - restantes) / total) * 100 : 0;
  const status = statusVagas(evento);

  return (
    <>
      <section className="page-head">
        <div className="container">
          <div className="page-head-top">
            <Link href="/" className="back" id="voltar-eventos">
              <IconArrowLeft /> Voltar para eventos
            </Link>

            <div className="event-head-actions">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setModalEditarAberto(true)}
                id="btn-editar-evento"
              >
                <IconEdit /> Editar
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-danger-hover"
                onClick={handleExcluirEvento}
                disabled={excluindo}
                id="btn-excluir-evento"
              >
                <IconTrash /> {excluindo ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }} className="reveal reveal-1">
            <span className="badge badge-red">{evento.categoria}</span>
            {status && <span className={status.className}>{status.label}</span>}
          </div>
          <h1 className="reveal reveal-2">{evento.titulo}</h1>
        </div>
      </section>

      <div className="container">
        <div className="detail-layout">
          {/* ---------- Conteúdo ---------- */}
          <div className="reveal reveal-3">
            <dl className="info-grid">
              <div>
                <dt>Data</dt>
                <dd style={{ textTransform: 'capitalize' }}>{formatarData(evento.data_evento)}</dd>
              </div>
              <div>
                <dt>Horário</dt>
                <dd>{formatarHora(evento.data_evento)}</dd>
              </div>
              <div>
                <dt>Local</dt>
                <dd>{evento.local}</dd>
              </div>
              <div>
                <dt>Categoria</dt>
                <dd>{evento.categoria}</dd>
              </div>
            </dl>

            <div className="prose block">
              <h2>Sobre o evento</h2>
              <p>{evento.descricao || 'Mais informações em breve.'}</p>
            </div>

            <div className="block">
              <div className="list-head">
                <h2>Inscritos</h2>
                <span>
                  {inscritos.length} {inscritos.length === 1 ? 'pessoa' : 'pessoas'}
                </span>
              </div>

              {inscritos.length === 0 ? (
                <div className="empty">
                  <strong>Nenhum inscrito ainda</strong>
                  <p>Seja o primeiro a garantir sua vaga.</p>
                </div>
              ) : (
                <ul className="list" style={{ listStyle: 'none' }}>
                  {inscritos.map((p) => (
                    <li key={p.id} className="list-item">
                      <span className="avatar">{iniciais(p.nome)}</span>
                      <div className="list-main">
                        <strong>{p.nome}</strong>
                        <span>{p.turma}</span>
                      </div>
                      <span className="list-side muted" style={{ fontSize: '0.75rem' }}>
                        {formatarDataCurta(p.data_inscricao)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* ---------- Painel de inscrição ---------- */}
          <aside className="panel reveal reveal-4" aria-labelledby="titulo-inscricao">
            <h2 id="titulo-inscricao">Inscreva-se</h2>
            <p>Garanta sua participação neste evento.</p>

            <div className="panel-vagas">
              <div className="vagas-row" style={{ marginBottom: 12 }}>
                <span className="big">
                  {restantes}
                  <small>/ {total} vagas</small>
                </span>
              </div>
              <div className="progress">
                <span style={{ width: `${ocupacao}%` }} />
              </div>
            </div>

            <FormInscricao
              evento={evento}
              participantes={participantes}
              inscritosIds={inscritosIds}
              onInscrito={recarregarEvento}
              onParticipanteCriado={(p) =>
                setParticipantes((lista) =>
                  [...lista, p].sort((a, b) => a.nome.localeCompare(b.nome))
                )
              }
            />
          </aside>
        </div>
      </div>

      {/* Modal para Editar Evento */}
      <Modal
        aberto={modalEditarAberto}
        fechar={() => setModalEditarAberto(false)}
        titulo="Editar Evento"
        subtitulo={`Altere as informações de "${evento.titulo}"`}
        larguraMax={580}
      >
        <FormEvento
          eventoInicial={evento}
          onSalvo={handleEventoSalvo}
          onCancelar={() => setModalEditarAberto(false)}
        />
      </Modal>
    </>
  );
}

export function DetalheSkeleton() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <div className="skeleton" style={{ width: 160, height: 18, marginBottom: 28 }} />
          <div className="skeleton" style={{ width: '60%', height: 48 }} />
        </div>
      </section>
      <div className="container">
        <div className="detail-layout">
          <div className="skeleton" style={{ height: 320 }} />
          <div className="skeleton" style={{ height: 360 }} />
        </div>
      </div>
    </>
  );
}
