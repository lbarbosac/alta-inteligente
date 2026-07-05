// Arquivo: src/components/PainScale/index.jsx

// ─── Configuração por faixa de dor ────────────────────────────────────────
function getNivelConfig(nivel) {
  if (nivel === null || nivel === undefined) {
    return { label: 'Sem dados', cor: 'text-slate-400', anel: 'ring-slate-100 bg-slate-50' };
  }
  if (nivel <= 3) return { label: 'Recuperação normal',  cor: 'text-emerald-600', anel: 'ring-emerald-100 bg-emerald-50' };
  if (nivel <= 6) return { label: 'Estabilização',       cor: 'text-amber-600',   anel: 'ring-amber-100   bg-amber-50'   };
  if (nivel <= 8) return { label: 'Atenção necessária',  cor: 'text-orange-600',  anel: 'ring-orange-100  bg-orange-50'  };
  return             { label: 'Estado crítico',          cor: 'text-red-600',     anel: 'ring-red-100     bg-red-50'     };
}

// Cor de preenchimento de cada segmento da barra
function getSegmentColor(pos) {
  if (pos <= 3) return 'bg-emerald-400';
  if (pos <= 6) return 'bg-amber-400';
  if (pos <= 8) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * Componente de escala de dor visual.
 *
 * @param {number|null} nivel        - Nível de dor (1–10) ou null
 * @param {string}      [ultimaAtualizacao] - Texto de quando foi registrado
 */
export default function PainScale({ nivel, ultimaAtualizacao }) {
  const config   = getNivelConfig(nivel);
  const segmentos = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="space-y-5">

      {/* ── Número grande + classificação ─────────────────────────────── */}
      <div className="flex items-end gap-4">
        <div className={`w-20 h-20 rounded-2xl ring-2 flex flex-col items-center
          justify-center flex-shrink-0 ${config.anel}`}>
          <span className={`text-3xl font-extrabold leading-none ${config.cor}`}>
            {nivel ?? '—'}
          </span>
          <span className="text-slate-400 text-[10px] font-medium mt-0.5">
            / 10
          </span>
        </div>

        <div className="space-y-0.5 pb-1">
          <p className={`text-base font-semibold ${config.cor}`}>
            {config.label}
          </p>
          {ultimaAtualizacao && (
            <p className="text-slate-400 text-xs font-light">
              Último registro: {ultimaAtualizacao}
            </p>
          )}
        </div>
      </div>

      {/* ── Barra segmentada 1–10 ─────────────────────────────────────── */}
      <div className="space-y-1.5">
        <div className="flex gap-1">
          {segmentos.map((pos) => (
            <div
              key={pos}
              className={`flex-1 rounded-full transition-all duration-300 ${
                nivel !== null && nivel !== undefined && pos <= nivel
                  ? `${getSegmentColor(pos)} ${pos === nivel ? 'h-3' : 'h-2'}`
                  : 'h-2 bg-slate-100'
              }`}
            />
          ))}
        </div>

        {/* Labels da escala */}
        <div className="flex justify-between">
          <span className="text-[10px] text-slate-400 font-medium">Sem dor</span>
          <span className="text-[10px] text-slate-400 font-medium">Dor máxima</span>
        </div>
      </div>

    </div>
  );
}