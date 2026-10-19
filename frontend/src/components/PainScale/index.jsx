// Arquivo: src/components/PainScale/index.jsx
import { zonaDor } from '../../utils/painLevelColor';

// Segmento pintado pela zona da própria posição: 1–6 neutro, 7–8 âmbar, 9–10 vermelho.
function corSegmento(posicao, escuro) {
  const zona = zonaDor(posicao);
  if (zona === 'critico') return 'bg-red-500';
  if (zona === 'atencao') return 'bg-amber-400';
  return escuro ? 'bg-white' : 'bg-ink';
}

/**
 * Barra de dor em 10 segmentos. Mostra onde o nível está e em qual zona ele cai.
 */
export default function PainScale({ nivel, tone = 'claro' }) {
  const escuro = tone === 'escuro';
  const vazio = escuro ? 'bg-neutral-700' : 'bg-neutral-200';
  const legenda = escuro ? 'text-neutral-400' : 'text-neutral-600';

  return (
    <div>
      <div className="flex gap-1" role="img" aria-label={nivel ? `Dor ${nivel} de 10` : 'Sem registro de dor'}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((pos) => (
          <span
            key={pos}
            className={`h-2 flex-1 rounded-full ${nivel && pos <= nivel ? corSegmento(pos, escuro) : vazio}`}
          />
        ))}
      </div>
      <div className={`mt-2 flex justify-between text-xs ${legenda}`}>
        <span>Sem dor</span>
        <span>Dor máxima</span>
      </div>
    </div>
  );
}
