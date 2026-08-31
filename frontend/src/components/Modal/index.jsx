// Arquivo: src/components/Modal/index.jsx
import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modal reutilizável com overlay escuro e fechamento por backdrop.
 *
 * @param {boolean}  isOpen   - Controla visibilidade
 * @param {Function} onClose  - Callback ao fechar
 * @param {string}   title    - Título do header
 * @param {node}     children - Conteúdo interno
 * @param {'sm'|'md'|'lg'} [size='md'] - Largura do modal
 */
export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  // Bloqueia scroll do body enquanto modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Fecha com Escape
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxW = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-md';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Painel */}
      <div className={`relative bg-white rounded-2xl shadow-float w-full ${maxW}
        max-h-[90vh] flex flex-col overflow-hidden`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-slate-950 text-base font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-slate-400 hover:text-slate-600 hover:bg-slate-100
              transition-all duration-150"
            aria-label="Fechar modal"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Conteúdo (scrollável) */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}