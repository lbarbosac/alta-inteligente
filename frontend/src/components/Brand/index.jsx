// Arquivo: src/components/Brand/index.jsx

/**
 * Marca em texto, provisória. Quando o logo SVG chegar, ele entra aqui
 * e todas as telas trocam juntas. Não improvisar ícone no lugar do logo.
 */
export default function Brand({ tone = 'escuro', size = 'md', className = '' }) {
  const cor = tone === 'claro' ? 'text-white' : 'text-ink';
  const tamanho = size === 'lg' ? 'text-xl' : 'text-base';

  return (
    <span className={`inline-flex items-baseline leading-none tracking-tight ${tamanho} ${cor} ${className}`}>
      <span className="font-semibold">Alta</span>
      <span className="font-normal">Inteligente</span>
    </span>
  );
}
