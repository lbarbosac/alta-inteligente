// Arquivo: src/components/EmptyState/index.jsx
import { Inbox } from 'lucide-react';

/**
 * Estado vazio para listas e tabelas: diz o que falta e qual é o próximo passo.
 */
export default function EmptyState({ icon: Icon = Inbox, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-neutral-50">
        <Icon size={20} strokeWidth={1.75} className="text-neutral-600" aria-hidden="true" />
      </span>
      <div className="max-w-sm space-y-1">
        <p className="text-sm font-semibold text-ink">{title}</p>
        {subtitle && <p className="text-sm leading-relaxed text-neutral-600">{subtitle}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
