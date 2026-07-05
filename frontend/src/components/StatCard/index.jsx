// Arquivo: src/components/StatCard/index.jsx

// ─── Mapa de cores por variante ────────────────────────────────────────────
const COLOR_MAP = {
  slate: {
    container: 'bg-slate-100',
    icon:      'text-slate-600',
  },
  green: {
    container: 'bg-emerald-50',
    icon:      'text-emerald-600',
  },
  amber: {
    container: 'bg-amber-50',
    icon:      'text-amber-600',
  },
  red: {
    container: 'bg-red-50',
    icon:      'text-red-600',
  },
};

/**
 * Card de métrica reutilizável para o dashboard.
 *
 * @param {string}          title       - Rótulo da métrica
 * @param {string|number}   value       - Valor principal (grande)
 * @param {React.Component} icon        - Ícone Lucide
 * @param {'slate'|'green'|'amber'|'red'} color - Variante de cor
 * @param {string}          [description] - Texto auxiliar abaixo do valor
 * @param {boolean}         [loading]   - Exibe skeleton enquanto carrega
 */
export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'slate',
  description,
  loading = false,
}) {
  const { container, icon } = COLOR_MAP[color] ?? COLOR_MAP.slate;

  if (loading) {
    return (
      <article className="bg-white border border-slate-100 rounded-2xl p-5 shadow-card">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-3 w-24 skeleton" />
            <div className="h-8 w-16 skeleton" />
            {description && <div className="h-3 w-32 skeleton" />}
          </div>
          <div className="w-10 h-10 skeleton rounded-xl" />
        </div>
      </article>
    );
  }

  return (
    <article className="bg-white border border-slate-100 rounded-2xl p-5 shadow-card
      hover:shadow-float transition-shadow duration-200">
      <div className="flex items-start justify-between gap-4">

        {/* Valores */}
        <div className="space-y-1 min-w-0">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
            {title}
          </p>
          <p className="text-slate-950 text-3xl font-extrabold leading-none tracking-tight">
            {value ?? '—'}
          </p>
          {description && (
            <p className="text-slate-400 text-xs font-light leading-snug pt-0.5">
              {description}
            </p>
          )}
        </div>

        {/* Ícone */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center
          flex-shrink-0 ${container}`}>
          <Icon size={18} strokeWidth={1.5} className={icon} />
        </div>

      </div>
    </article>
  );
}