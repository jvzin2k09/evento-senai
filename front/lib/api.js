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

export const CATEGORIAS_SENAI = [
  { id: 1, nome: 'Palestra' },
  { id: 2, nome: 'Oficina' },
  { id: 3, nome: 'Workshop' },
];

export const api = {
  // Eventos
  listarEventos: () => request('/eventos'),
  buscarEvento: (id) => request(`/eventos/${id}`),
  listarInscritos: (id) => request(`/eventos/${id}/inscritos`),
  criarEvento: (dados) =>
    request('/eventos', { method: 'POST', body: JSON.stringify(dados) }),
  atualizarEvento: (id, dados) =>
    request(`/eventos/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
  excluirEvento: (id) => request(`/eventos/${id}`, { method: 'DELETE' }),

  // Participantes
  listarParticipantes: () => request('/participantes'),
  buscarParticipante: (id) => request(`/participantes/${id}`),
  criarParticipante: (dados) =>
    request('/participantes', { method: 'POST', body: JSON.stringify(dados) }),
  atualizarParticipante: (id, dados) =>
    request(`/participantes/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
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

export function seguraData(valor) {
  if (!valor) return new Date();
  if (valor instanceof Date) return valor;
  const str = String(valor).trim().replace(' ', 'T');
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date(valor) : d;
}

export function partesData(valor) {
  const d = seguraData(valor);
  return {
    dia: String(d.getDate()).padStart(2, '0'),
    mes: MESES[d.getMonth()] || '',
  };
}

export function formatarData(valor) {
  return seguraData(valor).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatarHora(valor) {
  return seguraData(valor).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatarDataCurta(valor) {
  return seguraData(valor).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatarParaInputDatetime(valor) {
  if (!valor) return '';
  const d = seguraData(valor);
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export function converterInputParaApiDatetime(valorInput) {
  if (!valorInput) return '';
  const partes = valorInput.split('T');
  if (partes.length === 2) {
    const hora = partes[1].length === 5 ? `${partes[1]}:00` : partes[1];
    return `${partes[0]} ${hora}`;
  }
  return valorInput;
}

export function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] || '') + (partes.length > 1 ? partes.at(-1)[0] : '')).toUpperCase();
}
