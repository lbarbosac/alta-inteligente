// Arquivo: src/components/Navbar/index.jsx
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Brand from '../Brand';
import { ConteudoMenu } from '../Sidebar';

/** Link de pular direto para o conteúdo — aparece só ao receber foco pelo teclado. */
export function PularParaConteudo() {
  return (
    <a
      href="#conteudo"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg
        focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
    >
      Pular para o conteúdo
    </a>
  );
}

/**
 * Barra superior + gaveta de menu para telas menores que 1024px.
 * Antes o menu só existia no desktop: no celular e no tablet não havia como navegar.
 */
export default function Navbar({ items, perfil }) {
  const [aberto, setAberto] = useState(false);
  const { pathname } = useLocation();
  const botaoAbrirRef = useRef(null);
  const botaoFecharRef = useRef(null);

  // Fecha ao trocar de página
  useEffect(() => { setAberto(false); }, [pathname]);

  useEffect(() => {
    if (!aberto) return;
    const botaoAbrir = botaoAbrirRef.current;
    document.body.style.overflow = 'hidden';
    botaoFecharRef.current?.focus();

    function onKeyDown(e) { if (e.key === 'Escape') setAberto(false); }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      botaoAbrir?.focus();
    };
  }, [aberto]);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <Brand />
        <button
          ref={botaoAbrirRef}
          type="button"
          onClick={() => setAberto(true)}
          aria-label="Abrir menu"
          aria-expanded={aberto}
          aria-controls="menu-celular"
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-neutral-100"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>
      </header>

      {aberto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setAberto(false)} aria-hidden="true" />
          <div
            id="menu-celular"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white"
          >
            <ConteudoMenu
              items={items}
              perfil={perfil}
              acaoTopo={
                <button
                  ref={botaoFecharRef}
                  type="button"
                  onClick={() => setAberto(false)}
                  aria-label="Fechar menu"
                  className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-neutral-100"
                >
                  <X size={20} strokeWidth={1.75} />
                </button>
              }
            />
          </div>
        </div>
      )}
    </>
  );
}
