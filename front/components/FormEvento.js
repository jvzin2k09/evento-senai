'use client';

import { useState } from 'react';
import {
  api,
  CATEGORIAS_SENAI,
  formatarParaInputDatetime,
  converterInputParaApiDatetime,
} from '@/lib/api';
import { IconAlert, IconCheck } from './Icons';

export default function FormEvento({ eventoInicial = null, onSalvo, onCancelar }) {
  const editando = Boolean(eventoInicial?.id);

  const [titulo, setTitulo] = useState(eventoInicial?.titulo || '');
  const [descricao, setDescricao] = useState(eventoInicial?.descricao || '');
  const [dataEvento, setDataEvento] = useState(
    eventoInicial?.data_evento ? formatarParaInputDatetime(eventoInicial.data_evento) : ''
  );
  const [local, setLocal] = useState(eventoInicial?.local || '');
  const [vagas, setVagas] = useState(eventoInicial?.vagas ? String(eventoInicial.vagas) : '20');
  const [categoriaId, setCategoriaId] = useState(
    eventoInicial?.categoria_id ? String(eventoInicial.categoria_id) : '1'
  );

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');

    const vagasNum = parseInt(vagas, 10);
    const catIdNum = parseInt(categoriaId, 10);

    if (!titulo.trim()) {
      setErro('Informe o título do evento.');
      return;
    }
    if (!dataEvento) {
      setErro('Informe a data e o horário do evento.');
      return;
    }
    if (!local.trim()) {
      setErro('Informe o local do evento.');
      return;
    }
    if (isNaN(vagasNum) || vagasNum <= 0) {
      setErro('A quantidade de vagas deve ser maior que zero.');
      return;
    }

    const payload = {
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      data_evento: converterInputParaApiDatetime(dataEvento),
      local: local.trim(),
      vagas: vagasNum,
      categoria_id: catIdNum,
    };

    setEnviando(true);

    try {
      if (editando) {
        await api.atualizarEvento(eventoInicial.id, payload);
        setSucesso('Evento atualizado com sucesso!');
        onSalvo?.({ ...eventoInicial, ...payload });
      } else {
        const res = await api.criarEvento(payload);
        setSucesso('Evento cadastrado com sucesso!');
        onSalvo?.({ id: res.id, ...payload });
      }
    } catch (err) {
      setErro(err.message || 'Erro ao salvar evento');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} id="form-evento">
      <div className="field">
        <label className="label" htmlFor="evento-titulo">Título do evento</label>
        <input
          id="evento-titulo"
          className="input"
          type="text"
          placeholder="Ex.: Workshop de Inteligência Artificial"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={120}
          required
        />
      </div>

      <div className="field-grid-2">
        <div className="field">
          <label className="label" htmlFor="evento-categoria">Categoria</label>
          <select
            id="evento-categoria"
            className="select"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            required
          >
            {CATEGORIAS_SENAI.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="evento-vagas">Total de vagas</label>
          <input
            id="evento-vagas"
            className="input"
            type="number"
            min="1"
            placeholder="Ex.: 30"
            value={vagas}
            onChange={(e) => setVagas(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="field-grid-2">
        <div className="field">
          <label className="label" htmlFor="evento-data">Data e Horário</label>
          <input
            id="evento-data"
            className="input"
            type="datetime-local"
            value={dataEvento}
            onChange={(e) => setDataEvento(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="evento-local">Local</label>
          <input
            id="evento-local"
            className="input"
            type="text"
            placeholder="Ex.: Auditório Principal ou Lab 2"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            maxLength={100}
            required
          />
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="evento-descricao">Descrição (opcional)</label>
        <textarea
          id="evento-descricao"
          className="input textarea"
          rows={3}
          placeholder="Descreva os objetivos, pré-requisitos e tópicos abordados..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
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
            id="btn-cancelar-evento"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          style={{ flex: 1 }}
          disabled={enviando}
          id="btn-salvar-evento"
        >
          {enviando ? <span className="spinner" /> : editando ? 'Salvar alterações' : 'Cadastrar evento'}
        </button>
      </div>
    </form>
  );
}
