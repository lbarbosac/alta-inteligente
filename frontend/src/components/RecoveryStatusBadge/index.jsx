// Arquivo: src/components/RecoveryStatusBadge/index.jsx

/**
 * Mapeamento completo de status clínicos.
 * Baseado em doc 02-regras-negocio.md seção 15 e frontend-spec.md.
 *
 * recuperacao  → dor 1–3    → verde menta
 * estabilizacao→ dor 4–6    → âmbar clínico
 * atencao      → dor 7–8    → laranja
 * critico      → dor 9–10   → carmesim
 * sem_checkin  → sem dados  → slate neutro
 */
const STATUS_MAP = {
  recuperacao: {
    label: 'Recuperação',
    dot:   'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  },
  estabilizacao: {
    label: 'Estabilização',
    dot:   'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 ring-amber-100',
  },
  atencao: {
    label: 'Atenção',
    dot:   'bg-orange-500',
    badge: 'bg-orange-50 text-orange-700 ring-orange-100',
  },
  critico: {
    label: 'Crítico',
    dot:   'bg-red-500',
    badge: 'bg-red-50 text-red-700 ring-red-100',
  },
  sem_checkin: {
    label: 'Sem check-in',
    dot:   'bg-slate-400',
    badge: 'bg-slate-50 text-slate-500 ring-slate-100',
  },
};

/**
 * Badge visual de status clínico do paciente.
 *
 * @param {'recuperacao'|'estabilizacao'|'atencao'|'critico'|'sem_checkin'} status
 * @param {'sm'|'md'} [size='md'] - Tamanho do badge
 */
export default function RecoveryStatusBadge({ status, size = 'md' }) {
  const config = STATUS_MAP[status] ?? STATUS_MAP.sem_checkin;

  const sizeClass = size === 'sm'
    ? 'px-2 py-0.5 text-[10px] gap-1'
    : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ring-1
        ${config.badge} ${sizeClass}`}
    >
      <span className={`rounded-full flex-shrink-0 ${config.dot}
        ${size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5'}`}
      />
      {config.label}
    </span>
  );
}