// Arquivo: src/components/Card/index.jsx

/**
 * Painel branco com borda fina, sem sombra.
 * `padded={false}` para listas e tabelas que vão de borda a borda — o cabeçalho ganha divisória.
 */
export default function Card({
  title,
  description,
  actions,
  padded = true,
  as: Tag = 'section',
  className = '',
  children,
}) {
  const temCabecalho = Boolean(title || actions);

  return (
    <Tag className={`rounded-xl border border-line bg-white ${className}`}>
      {temCabecalho && (
        <div className={`flex items-start justify-between gap-4 px-5 pt-5 ${padded ? 'pb-1' : 'pb-4 border-b border-line'}`}>
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-neutral-600">{description}</p>}
          </div>
          {actions && <div className="flex flex-shrink-0 items-center gap-1">{actions}</div>}
        </div>
      )}
      <div className={padded ? `px-5 pb-5 ${temCabecalho ? 'pt-4' : 'pt-5'}` : ''}>{children}</div>
    </Tag>
  );
}
