// Arquivo: src/components/StatCard/index.jsx

/**
 * Número de destaque. `tone="escuro"` é o bloco interno do painel escuro (um por tela).
 * `alerta` pinta o número de vermelho quando há algo a olhar — só para status clínico.
 *
 * Contraste medido (specs/design.md §2): neutral-400 sobre neutral-800 = 6,00:1; red-400 sobre ink = 7,16:1.
 */
export default function StatCard({ title, value, description, tone = 'claro', alerta = false, loading = false }) {
  const escuro = tone === 'escuro';

  const caixa = escuro ? 'bg-neutral-800' : 'border border-line bg-white';
  const corTitulo = escuro ? 'text-neutral-400' : 'text-neutral-600';
  const corValor = alerta ? (escuro ? 'text-red-400' : 'text-red-600') : (escuro ? 'text-white' : 'text-ink');
  const corDescricao = escuro ? 'text-neutral-400' : 'text-neutral-500';

  return (
    <div className={`flex flex-col rounded-lg p-4 ${caixa}`}>
      {/* Título com altura de duas linhas: os números ficam alinhados mesmo quando um título quebra */}
      <p className={`line-clamp-2 min-h-10 text-sm font-medium leading-5 ${corTitulo}`}>{title}</p>
      {loading ? (
        <div className={`mt-3 h-9 w-14 animate-pulse rounded-md ${escuro ? 'bg-neutral-700' : 'bg-neutral-200'}`} />
      ) : (
        <div className="mt-3">
          <p className={`text-3xl font-semibold leading-none tracking-tight tabular-nums sm:text-4xl ${corValor}`}>{value ?? '—'}</p>
          <p className={`mt-2 min-h-4 text-xs leading-4 ${corDescricao}`}>{description}</p>
        </div>
      )}
    </div>
  );
}
