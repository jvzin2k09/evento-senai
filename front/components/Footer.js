import Link from 'next/link';
import { Logo } from './Header';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <Logo />
          <ul className="footer-links">
            <li><Link href="/">Eventos</Link></li>
            <li><Link href="/participantes">Participantes</Link></li>
            <li><Link href="/inscricoes">Inscrições</Link></li>
          </ul>
        </div>
        <div className="footer-bottom">
          <span>© 2026 EventoSENAI · Projeto acadêmico</span>
          <span>Serviço Nacional de Aprendizagem Industrial</span>
        </div>
      </div>
    </footer>
  );
}
