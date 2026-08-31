// Arquivo: src/components/EmptyState/index.jsx
import { Inbox } from 'lucide-react';

/**
 * Estado vazio reutilizável para listas e tabelas.
 *
 * @param {React.Component} [icon]     - Ícone Lucide (padrão: Inbox)
 * @param {string}          title      - Título principal
 * @param {string}          [subtitle] - Texto de apoio
 * @param {node}            [action]   - Botão ou link de ação
 */
export default function EmptyState({ icon: Icon = Inbox, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
        <Icon size={24} strokeWidth={1.5} className="text-slate-400" />
      </div>
      <div className="space-y-1 max-w-xs">
        <p className="text-slate-700 text-sm font-semibold">{title}</p>
        {subtitle && (
          <p className="text-slate-400 text-xs font-light leading-relaxed">{subtitle}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}