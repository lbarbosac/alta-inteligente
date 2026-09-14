// Arquivo: src/components/SearchInput/index.jsx
import { Search, X } from 'lucide-react';

/**
 * Busca com ícone e botão de limpar.
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar paciente por nome',
  label = 'Buscar',
  className = '',
}) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        strokeWidth={1.75}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-10 w-full rounded-lg border border-line-strong bg-white pl-10 pr-10 text-sm text-ink
          placeholder:text-neutral-500 transition-colors duration-150
          focus-visible:outline-none focus:border-ink focus:ring-1 focus:ring-ink
          [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
          className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center
            rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-ink"
        >
          <X size={15} strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}
