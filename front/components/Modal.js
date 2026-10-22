'use client';

import { useEffect } from 'react';
import { IconClose } from './Icons';

export default function Modal({ aberto, fechar, titulo, subtitulo, children, larguraMax = 540 }) {
  useEffect(() => {
    if (!aberto) return;

    function onKeyDown(e) {
      if (e.key === 'Escape') fechar?.();
    }

    document.addEventListener('keydown', onKeyDown);
    const scrollOrig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = scrollOrig;
    };
  }, [aberto, fechar]);

  if (!aberto) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) fechar?.();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
    >
      <div className="modal-dialog" style={{ maxWidth: larguraMax }}>
        <div className="modal-head">
          <div className="modal-head-titles">
            <h3 id="modal-titulo">{titulo}</h3>
            {subtitulo && <p>{subtitulo}</p>}
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={fechar}
            aria-label="Fechar janela"
            id="btn-fechar-modal"
          >
            <IconClose />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
