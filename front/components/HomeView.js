'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import EventoCard from './EventoCard';
import { IconAlert, IconArrowRight, IconSearch } from './Icons';

export default function HomeView() {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    api.listarEventos()
      .then(setEventos)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  const categorias = useMemo(
    () => ['Todos', ...new Set(eventos.map((e) => e.categoria))],
    [eventos]
  );

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return eventos.filter(
      (e) =>
        (categoria === 'Todos' || e.categoria === categoria) &&
        (!termo || e.titulo.toLowerCase().includes(termo) || e.local.toLowerCase().includes(termo))
    );
  }, [eventos, categoria, busca]);

  const totalVagas = eventos.reduce((s, e) => s + Math.max(0, Number(e.vagas_restantes)), 0);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero" aria-labelledby="hero-titulo">
        <div className="hero-media">
          <Image src="/hero.png" alt="" fill priority sizes="100vw" />
        </div>

        <div className="container">
          <div className="hero-content">
            <span className="hero-tag reveal reveal-1">Agenda de eventos SENAI</span>
            <h1 id="hero-titulo" className="reveal reveal-2">
              Aprenda além <br />da sala de <em>aula.</em>
            </h1>
            <p className="reveal reveal-3">
              Palestras, oficinas e workshops com profissionais da indústria.
              Escolha um evento e garanta sua vaga em poucos cliques.
            </p>
            <div className="hero-actions reveal reveal-4">
              <a href="#eventos" className="btn btn-primary" id="cta-ver-eventos">
                Ver eventos <IconArrowRight />
              </a>
              <Link href="/participantes" className="btn btn-ghost" id="cta-cadastro">
                Fazer cadastro
              </Link>
            </div>

            <div className="hero-stats reveal reveal-5">
              <div>
                <strong>{carregando ? '—' : eventos.length}</strong>
                <span>Eventos</span>
              </div>
              <div>
                <strong>{carregando ? '—' : totalVagas}</strong>
                <span>Vagas abertas</span>
              </div>
              <div>
                <strong>{carregando ? '—' : categorias.length - 1}</strong>
                <span>Categorias</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Lista de eventos ---------- */}
      <section className="section" id="eventos" aria-labelledby="eventos-titulo">
        <div className="container">
          <div className="section-title">
            <span className="eyebrow">Próximos eventos</span>
            <h2 id="eventos-titulo">Encontre seu próximo evento</h2>
          </div>

          <div className="toolbar">
            <div className="chips" role="tablist" aria-label="Filtrar por categoria">
              {categorias.map((c) => (
                <button
                  key={c}
                  role="tab"
                  aria-selected={categoria === c}
                  className={`chip ${categoria === c ? 'active' : ''}`}
                  onClick={() => setCategoria(c)}
                  id={`filtro-${c.toLowerCase()}`}
                >
                  {c}
                </button>
              ))}
            </div>

            <label className="search">
              <span className="visually-hidden">Buscar evento</span>
              <IconSearch />
              <input
                id="busca-eventos"
                className="input"
                type="search"
                placeholder="Buscar por título ou local"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </label>
          </div>

          {erro ? (
            <div className="alert alert-error" role="alert"><IconAlert /> {erro}</div>
          ) : carregando ? (
            <div className="grid-eventos">
              {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 360 }} />)}
            </div>
          ) : filtrados.length === 0 ? (
            <div className="empty">
              <strong>Nenhum evento encontrado</strong>
              <p>Tente outra categoria ou termo de busca.</p>
            </div>
          ) : (
            <div className="grid-eventos">
              {filtrados.map((evento, i) => (
                <EventoCard key={evento.id} evento={evento} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
