// Arquivo: src/components/PainLevel/index.jsx
import { zonaDor, COR_ZONA } from '../../utils/painLevelColor';

const TAMANHOS = {
  sm: 'h-7 min-w-7 text-xs',
  md: 'h-9 min-w-9 text-sm',
  lg: 'h-12 min-w-12 text-xl',
};

/** Número de dor com a cor da zona. Neutro até 6, âmbar em 7–8, vermelho em 9–10. */
export default function PainLevel({ nivel, size = 'md', className = '' }) {
  const zona = zonaDor(nivel);

  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg px-1.5 font-semibold tabular-nums
        ${TAMANHOS[size]} ${COR_ZONA[zona].chip} ${className}`}
    >
      <span className="sr-only">Dor </span>
      {nivel ?? '—'}
      {nivel !== null && nivel !== undefined && <span className="sr-only"> de 10</span>}
    </span>
  );
}
