// Arquivo: src/components/Avatar/index.jsx
import { getInitials } from '../../utils/formatDate';

const TAMANHOS = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' };
const TONS = {
  claro:  'bg-neutral-100 text-neutral-700',
  escuro: 'bg-ink text-white',
};

/** Iniciais do nome. Sem foto de propósito — não temos imagem dos usuários. */
export default function Avatar({ nome, size = 'md', tone = 'claro', className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex flex-shrink-0 items-center justify-center rounded-full font-semibold
        ${TAMANHOS[size]} ${TONS[tone]} ${className}`}
    >
      {getInitials(nome)}
    </span>
  );
}
