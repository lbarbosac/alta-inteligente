// Arquivo: src/components/Modal/index.jsx
import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal acessível: role="dialog", Esc fecha, foco preso dentro e devolvido ao sair.
 * No celular abre como folha de baixo para cima.
 *
 * O efeito de foco depende só de `isOpen` — se dependesse de `onClose` (função nova a cada
 * render), o foco pularia para o primeiro campo a cada tecla digitada.
 */
export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const tituloId = useId();
  const painelRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    if (!isOpen) return;

    const origem = document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const primeiroCampo = painelRef.current?.querySelector('input:not([type=hidden]), select, textarea');
    (primeiroCampo ?? painelRef.current)?.focus();

    function onKeyDown(e) {
      if (e.key === 'Escape') { onCloseRef.current(); return; }
      if (e.key !== 'Tab' || !painelRef.current) return;
      const focaveis = [...painelRef.current.querySelectorAll(FOCAVEIS)];
      if (!focaveis.length) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflowAnterior;
      if (origem instanceof HTMLElement) origem.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const larguraMax = size === 'sm' ? 'sm:max-w-sm' : size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden="true" />

      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl
          focus:outline-none sm:rounded-xl ${larguraMax}`}
      >
        <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 id={tituloId} className="text-base font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-600
              transition-colors hover:bg-neutral-100 hover:text-ink"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
