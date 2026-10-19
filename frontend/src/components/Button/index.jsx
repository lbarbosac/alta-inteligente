// Arquivo: src/components/Button/index.jsx
import { Loader2 } from 'lucide-react';

const VARIANTES = {
  primary:   'bg-ink text-white hover:bg-neutral-800',
  secondary: 'bg-white text-ink border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400',
  ghost:     'text-neutral-700 hover:bg-neutral-100 hover:text-ink',
  // Vermelho só em confirmação destrutiva (specs/design.md §2)
  danger:    'bg-red-600 text-white hover:bg-red-700',
};

const TAMANHOS = {
  sm:   'h-9 px-3 text-sm gap-1.5 rounded-lg',
  md:   'h-10 px-4 text-sm gap-2 rounded-lg',
  lg:   'h-12 px-5 text-base gap-2 rounded-lg',
  xl:   'h-14 px-6 text-base gap-2.5 rounded-xl',
  icon: 'h-10 w-10 rounded-full',
};

/** Classes do botão — use em <Link> quando a ação for navegação. */
export function buttonClass({ variant = 'primary', size = 'md', className = '' } = {}) {
  return `inline-flex items-center justify-center font-medium whitespace-nowrap select-none
    transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none
    ${VARIANTES[variant]} ${TAMANHOS[size]} ${className}`;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  type = 'button',
  className = '',
  disabled,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass({ variant, size, className })}
      {...props}
    >
      {loading && <Loader2 size={16} strokeWidth={2} className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
