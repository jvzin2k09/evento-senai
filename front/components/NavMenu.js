'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const LINKS = [
  { href: '/', label: 'Eventos', match: (p) => p === '/' || p.startsWith('/eventos') },
  { href: '/participantes', label: 'Participantes', match: (p) => p.startsWith('/participantes') },
  { href: '/inscricoes', label: 'Inscrições', match: (p) => p.startsWith('/inscricoes') },
];

export function NavMenu({ pathname = '' }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        id="menu-toggle"
        className="menu-toggle"
        aria-label="Abrir menu"
        aria-expanded={open}
        aria-controls="menu-principal"
        onClick={() => setOpen((v) => !v)}
      >
        <span />
      </button>

      <nav aria-label="Principal">
        <ul id="menu-principal" className={`nav ${open ? 'open' : ''}`}>
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                id={`nav-${link.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`}
                href={link.href}
                className={`nav-link ${link.match(pathname) ? 'active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

// Versão que lê a rota atual (fica dentro de <Suspense> por causa do cacheComponents)
export function NavMenuAtivo() {
  const pathname = usePathname();
  return <NavMenu pathname={pathname} />;
}
