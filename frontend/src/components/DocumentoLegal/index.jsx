// Arquivo: src/components/DocumentoLegal/index.jsx
import { Link } from 'react-router-dom';
import Brand from '../Brand';
import { DATA_VERSAO_POR_EXTENSO } from '../../config/legal';

/** Página pública de documento legal: leitura confortável, uma coluna, sem menu. */
export default function DocumentoLegal({ titulo, resumo, children }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
          <Link to="/" aria-label="Ir para o início"><Brand /></Link>
          <nav aria-label="Documentos" className="flex gap-4 text-sm">
            <Link to="/privacidade" className="text-neutral-600 hover:text-ink">Privacidade</Link>
            <Link to="/termos" className="text-neutral-600 hover:text-ink">Termos</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-10">
        <p className="text-sm text-neutral-600">Versão de {DATA_VERSAO_POR_EXTENSO}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{titulo}</h1>
        {resumo && <p className="mt-4 max-w-prose text-base leading-relaxed text-neutral-600">{resumo}</p>}
        <div className="documento-legal mt-10 max-w-prose space-y-8 text-base leading-relaxed text-ink">{children}</div>
      </main>
    </div>
  );
}

export function Secao({ titulo, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-ink">{titulo}</h2>
      {children}
    </section>
  );
}

export function Lista({ itens }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 marker:text-neutral-400">
      {itens.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}
