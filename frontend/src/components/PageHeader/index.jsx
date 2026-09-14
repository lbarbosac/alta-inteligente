// Arquivo: src/components/PageHeader/index.jsx

/**
 * Cabeçalho de página: um único h1 por tela, descrição curta e ações à direita.
 */
export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-sm text-neutral-600 first-letter:uppercase">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink text-balance sm:text-3xl">
          {title}
        </h1>
        {description && <p className="mt-1.5 text-sm text-neutral-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
