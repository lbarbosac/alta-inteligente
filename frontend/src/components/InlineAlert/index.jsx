// Arquivo: src/components/InlineAlert/index.jsx
import { AlertCircle, Info } from 'lucide-react';

const TONS = {
  erro:   { caixa: 'border-red-200 bg-red-50 text-red-700',          Icone: AlertCircle, role: 'alert' },
  neutro: { caixa: 'border-line bg-neutral-50 text-neutral-700',     Icone: Info,        role: 'status' },
};

/** Mensagem curta dentro da tela: erro de formulário, falha de carregamento, aviso neutro. */
export default function InlineAlert({ tone = 'erro', action, className = '', children }) {
  const { caixa, Icone, role } = TONS[tone] ?? TONS.erro;

  return (
    <div role={role} className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${caixa} ${className}`}>
      <Icone size={16} strokeWidth={2} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1 font-medium leading-snug">{children}</div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
