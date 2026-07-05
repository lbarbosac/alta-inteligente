// Arquivo: src/components/SearchInput/index.jsx
import { Search, X } from 'lucide-react';

/**
 * Input de busca reutilizável com ícone de lupa e botão de limpar.
 *
 * @param {string}   value       - Valor controlado
 * @param {Function} onChange    - Handler de mudança (recebe a string)
 * @param {string}   [placeholder]
 * @param {string}   [className] - Classes extras para o container
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar paciente por nome…',
  className = '',
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Ícone de busca */}
      <Search
        size={16}
        strokeWidth={1.5}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white
          text-sm text-slate-900 placeholder:text-slate-400
          outline-none transition-all duration-150
          focus:border-slate-950 focus:ring-2 focus:ring-slate-950/8"
      />

      {/* Botão de limpar — visível apenas quando há texto */}
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
          className="absolute right-3 top-1/2 -translate-y-1/2
            text-slate-400 hover:text-slate-600 transition-colors duration-150 p-0.5"
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}