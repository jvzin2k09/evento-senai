import Link from 'next/link';
import { Suspense } from 'react';
import { NavMenu, NavMenuAtivo } from './NavMenu';
import { IconExternal } from './Icons';

const GRUPO = [
  { label: 'FIESP', href: 'https://www.fiesp.com.br/' },
  { label: 'CIESP', href: 'https://www.ciesp.com.br/' },
  { label: 'SESI', href: 'https://www.sesisp.org.br/' },
  { label: 'SENAI', href: 'https://www.sp.senai.br/', active: true },
];

export function Logo() {
  return (
    <Link href="/" className="brand" id="logo-home" aria-label="EventoSENAI — página inicial">
      <span className="logo-senai">SENAI</span>
      <span className="brand-sub">
        <strong>Eventos</strong>
        <span>Escola SENAI</span>
      </span>
    </Link>
  );
}

export default function Header() {
  return (
    <>
      {/* Barra do grupo, como no portal sp.senai.br */}
      <div className="topbar">
        <div className="container">
          <ul>
            {GRUPO.map((g) => (
              <li key={g.label}>
                <a href={g.href} target="_blank" rel="noreferrer" className={g.active ? 'active' : ''}>
                  {g.label}
                </a>
              </li>
            ))}
          </ul>
          <ul>
            <li>
              <a href="https://www.sp.senai.br/" target="_blank" rel="noreferrer">
                Portal SENAI-SP <IconExternal style={{ verticalAlign: '-1px' }} />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <header className="header">
        <div className="container">
          <Logo />
          <Suspense fallback={<NavMenu />}>
            <NavMenuAtivo />
          </Suspense>
        </div>
      </header>
    </>
  );
}
