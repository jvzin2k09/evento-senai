import Link from 'next/link';
import { partesData, formatarHora } from '@/lib/api';
import { IconArrowRight, IconClock, IconPin } from './Icons';

export function statusVagas(evento) {
  const restantes = Number(evento.vagas_restantes);
  if (restantes <= 0) return { label: 'Esgotado', className: 'badge' };
  if (restantes <= 5) return { label: 'Últimas vagas', className: 'badge badge-red' };
  return null;
}

export default function EventoCard({ evento, index = 0 }) {
  const { dia, mes } = partesData(evento.data_evento);
  const total = Number(evento.vagas);
  const restantes = Math.max(0, Number(evento.vagas_restantes));
  const ocupacao = total > 0 ? ((total - restantes) / total) * 100 : 0;
  const status = statusVagas(evento);

  return (
    <article
      className="evento-card reveal"
      style={{ animationDelay: `${index * 70}ms` }}
      id={`evento-${evento.id}`}
    >
      <div className="evento-card-top">
        <div className="date-block" aria-label={`Dia ${dia} de ${mes}`}>
          <strong>{dia}</strong>
          <span>{mes}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {status && <span className={status.className}>{status.label}</span>}
          <span className="badge">{evento.categoria}</span>
        </div>
      </div>

      <h3>
        <Link href={`/eventos/${evento.id}`} className="card-link">
          {evento.titulo}
        </Link>
      </h3>
      {evento.descricao && <p className="desc">{evento.descricao}</p>}

      <div className="meta">
        <span className="meta-item">
          <IconClock /> {formatarHora(evento.data_evento)}
        </span>
        <span className="meta-item">
          <IconPin /> {evento.local}
        </span>
      </div>

      <div className="evento-card-footer">
        <div className="vagas-row">
          <span>
            <strong>{restantes}</strong> de {total} vagas disponíveis
          </span>
        </div>
        <div className="progress" role="progressbar" aria-valuenow={Math.round(ocupacao)} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${ocupacao}%` }} />
        </div>
        <span className="card-cta">
          Ver detalhes <IconArrowRight />
        </span>
      </div>
    </article>
  );
}
