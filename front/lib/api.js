// Cliente HTTP da API EventoSENAI
// Defina NEXT_PUBLIC_API_URL no front/.env.local (padrão: http://localhost:3333)
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

async function request(path, options = {}) {
  let res;

  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      cache: 'no-store',
    });
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique se ela está rodando.');
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.erro || `Erro ${res.status}`);
  }

  return data;
}

export const api = {
  // Eventos
  listarEventos: () => request('/eventos'),
  buscarEvento: (id) => request(`/eventos/${id}`),
  listarInscritos: (id) => request(`/eventos/${id}/inscritos`),

  // Participantes
  listarParticipantes: () => request('/participantes'),
  criarParticipante: (dados) =>
    request('/participantes', { method: 'POST', body: JSON.stringify(dados) }),
  excluirParticipante: (id) => request(`/participantes/${id}`, { method: 'DELETE' }),

  // Inscrições
  listarInscricoes: () => request('/inscricoes'),
  criarInscricao: (evento_id, participante_id) =>
    request('/inscricoes', {
      method: 'POST',
      body: JSON.stringify({ evento_id, participante_id }),
    }),
  cancelarInscricao: (id) => request(`/inscricoes/${id}`, { method: 'DELETE' }),
};

// ---------- Helpers de formatação ----------
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function partesData(valor) {
  const d = new Date(valor);
  return {
    dia: String(d.getDate()).padStart(2, '0'),
    mes: MESES[d.getMonth()],
  };
}

export function formatarData(valor) {
  return new Date(valor).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatarHora(valor) {
  return new Date(valor).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatarDataCurta(valor) {
  return new Date(valor).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] || '') + (partes.length > 1 ? partes.at(-1)[0] : '')).toUpperCase();
}
