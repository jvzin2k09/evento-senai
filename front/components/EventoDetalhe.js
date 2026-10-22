'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, formatarData, formatarDataCurta, formatarHora, iniciais } from '@/lib/api';
import FormInscricao from './FormInscricao';
import { statusVagas } from './EventoCard';
import { IconAlert, IconArrowLeft } from './Icons';

export default function EventoDetalhe() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [inscritos, setInscritos] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

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

  if (carregando) return <DetalheSkeleton />;

  if (erro || !evento) {
    return (
      <div className="container" style={{ padding: '80px 24px' }}>
        <Link href="/" className="back"><IconArrowLeft /> Voltar para eventos</Link>
        <div className="alert alert-error" role="alert"><IconAlert /> {erro || 'Evento não encontrado'}</div>
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
          <Link href="/" className="back" id="voltar-eventos"><IconArrowLeft /> Voltar para eventos</Link>
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
                <span>{inscritos.length} {inscritos.length === 1 ? 'pessoa' : 'pessoas'}</span>
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
                <span className="big">{restantes}<small>/ {total} vagas</small></span>
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
                setParticipantes((lista) => [...lista, p].sort((a, b) => a.nome.localeCompare(b.nome)))
              }
            />
          </aside>
        </div>
      </div>
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
