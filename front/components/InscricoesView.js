'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api, formatarDataCurta, iniciais } from '@/lib/api';
import { IconAlert, IconSearch } from './Icons';

export default function InscricoesView() {
  const [inscricoes, setInscricoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    api.listarInscricoes()
      .then(setInscricoes)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

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
            <p className="reveal reveal-3">Acompanhe quem está inscrito em cada evento e cancele quando necessário.</p>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '56px 24px 96px' }}>
        <div className="toolbar" style={{ marginBottom: 16 }}>
          <div className="list-head" style={{ margin: 0 }}>
            <h2>Registros <span style={{ marginLeft: 6 }}>{inscricoes.length}</span></h2>
          </div>
          <label className="search">
            <span className="visually-hidden">Buscar inscrição</span>
            <IconSearch />
            <input id="busca-inscricoes" className="input" type="search" placeholder="Buscar participante ou evento"
              value={busca} onChange={(e) => setBusca(e.target.value)} />
          </label>
        </div>

        {erro && <div className="alert alert-error" role="alert" style={{ marginBottom: 16 }}><IconAlert /> {erro}</div>}

        {carregando ? (
          <div className="skeleton" style={{ height: 320 }} />
        ) : filtradas.length === 0 ? (
          <div className="empty">
            <strong>Nenhuma inscrição encontrada</strong>
            <p>
              {busca ? 'Tente outro termo de busca.' : <>Escolha um evento na <Link href="/" style={{ color: 'var(--text)', textDecoration: 'underline' }}>agenda</Link> para se inscrever.</>}
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
                    <Link href={`/eventos/${i.evento_id}`} style={{ color: 'var(--muted)' }}>{i.evento}</Link>
                  </span>
                </div>
                <div className="list-side">
                  <span className="muted" style={{ fontSize: '0.75rem' }}>{formatarDataCurta(i.data_inscricao)}</span>
                  <button className="btn-danger-text" onClick={() => cancelar(i)} id={`cancelar-inscricao-${i.id}`}>
                    Cancelar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
