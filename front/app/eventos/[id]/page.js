import { Suspense } from 'react';
import EventoDetalhe, { DetalheSkeleton } from '@/components/EventoDetalhe';

export const metadata = {
  title: 'Detalhes do evento',
  description: 'Veja data, local, vagas e faça sua inscrição no evento SENAI.',
};

// O id só é conhecido na requisição; com cacheComponents o useParams precisa de Suspense.
export default function EventoPage() {
  return (
    <Suspense fallback={<DetalheSkeleton />}>
      <EventoDetalhe />
    </Suspense>
  );
}
