'use client';

import { useEffect, useMemo, useState } from 'react';
import { api, iniciais } from '@/lib/api';
import FormParticipante from './FormParticipante';
import { IconAlert, IconSearch } from './Icons';

export default function ParticipantesView() {
  const [participantes, setParticipantes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    api.listarParticipantes()
      .then(setParticipantes)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase();
    if (!t) return participantes;
    return participantes.filter((p) =>
      [p.nome, p.email, p.turma].some((v) => v.toLowerCase().includes(t))
    );
  }, [participantes, busca]);

  async function excluir(p) {
    if (!confirm(`Excluir ${p.nome}? As inscrições dessa pessoa também serão removidas.`)) return;
    try {
      await api.excluirParticipante(p.id);
      setParticipantes((lista) => lista.filter((x) => x.id !== p.id));
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <>
      <section className="page-head">
        <div className="container">
          <div className="section-title" style={{ marginBottom: 0 }}>
            <span className="eyebrow reveal reveal-1">Participantes</span>
            <h1 className="reveal reveal-2">Cadastro de participantes</h1>
            <p className="reveal reveal-3">Cadastre-se uma vez e use seu nome para se inscrever em qualquer evento.</p>
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingTop: 56 }}>
        <div className="two-col">
          <div className="reveal reveal-3">
            <div className="toolbar" style={{ marginBottom: 16 }}>
              <div className="list-head" style={{ margin: 0 }}>
                <h2>Cadastrados <span style={{ marginLeft: 6 }}>{participantes.length}</span></h2>
              </div>
              <label className="search">
                <span className="visually-hidden">Buscar participante</span>
                <IconSearch />
                <input id="busca-participantes" className="input" type="search" placeholder="Buscar nome, e-mail ou turma"
                  value={busca} onChange={(e) => setBusca(e.target.value)} />
              </label>
            </div>

            {erro && <div className="alert alert-error" role="alert" style={{ marginBottom: 16 }}><IconAlert /> {erro}</div>}

            {carregando ? (
              <div className="skeleton" style={{ height: 320 }} />
            ) : filtrados.length === 0 ? (
              <div className="empty">
                <strong>Nenhum participante encontrado</strong>
                <p>{busca ? 'Tente outro termo de busca.' : 'Use o formulário ao lado para fazer o primeiro cadastro.'}</p>
              </div>
            ) : (
              <ul className="list" style={{ listStyle: 'none' }}>
                {filtrados.map((p) => (
                  <li key={p.id} className="list-item">
                    <span className="avatar">{iniciais(p.nome)}</span>
                    <div className="list-main">
                      <strong>{p.nome}</strong>
                      <span>{p.email}</span>
                    </div>
                    <div className="list-side">
                      <span className="badge">{p.turma}</span>
                      <button className="btn-danger-text" onClick={() => excluir(p)} id={`excluir-participante-${p.id}`}>
                        Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="panel reveal reveal-4" aria-labelledby="titulo-novo-participante">
            <h2 id="titulo-novo-participante">Novo cadastro</h2>
            <p>Preencha seus dados para participar dos eventos.</p>
            <FormParticipante
              onCriado={(p) =>
                setParticipantes((lista) => [...lista, p].sort((a, b) => a.nome.localeCompare(b.nome)))
              }
            />
          </aside>
        </div>
      </div>
    </>
  );
}
