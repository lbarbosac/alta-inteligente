// Arquivo: src/components/RecoveryStatusBadge/index.jsx

/**
 * Status clínico (calculado a partir do último check-in) e estados do tratamento.
 * Cor só em atenção e crítico — specs/design.md §2. O rótulo sempre acompanha a cor.
 *
 * recuperacao   → dor 1–3
 * estabilizacao → dor 4–6
 * atencao       → dor 7–8 ou mais de 48h sem check-in
 * critico       → dor 9–10
 */
const STATUS_MAP = {
  recuperacao:    { label: 'Recuperação',    ponto: 'bg-ink',                                 badge: 'border-line bg-white text-ink' },
  estabilizacao:  { label: 'Estabilização',  ponto: 'bg-neutral-400',                         badge: 'border-line bg-white text-neutral-700' },
  atencao:        { label: 'Atenção',        ponto: 'bg-amber-500',                           badge: 'border-amber-200 bg-amber-50 text-amber-800' },
  critico:        { label: 'Crítico',        ponto: 'bg-red-600',                             badge: 'border-red-200 bg-red-50 text-red-700' },
  sem_checkin:    { label: 'Sem check-in',   ponto: 'bg-white ring-1 ring-inset ring-neutral-400', badge: 'border-line bg-white text-neutral-600' },
  sem_tratamento: { label: 'Sem tratamento', ponto: 'bg-white ring-1 ring-inset ring-neutral-400', badge: 'border-line bg-white text-neutral-600' },
  encerrado:      { label: 'Encerrado',      ponto: 'bg-neutral-300',                         badge: 'border-line bg-neutral-50 text-neutral-600' },
};

export default function RecoveryStatusBadge({ status, size = 'md' }) {
  const config = STATUS_MAP[status] ?? STATUS_MAP.sem_checkin;
  const tamanho = size === 'sm' ? 'h-6 px-2 text-xs gap-1.5' : 'h-7 px-2.5 text-xs gap-2';

  return (
    <span className={`inline-flex flex-shrink-0 items-center whitespace-nowrap rounded-full border font-medium ${tamanho} ${config.badge}`}>
      <span className={`h-2 w-2 flex-shrink-0 rounded-full ${config.ponto}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}
