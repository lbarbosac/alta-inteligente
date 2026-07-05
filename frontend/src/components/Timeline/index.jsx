// Arquivo: src/components/Timeline/index.jsx
import {
  AlertTriangle,
  CheckCircle2,
  Play,
  MessageSquare,
  Activity,
  XCircle,
} from 'lucide-react';

// ─── Configuração por tipo de evento ──────────────────────────────────────
const TIPO_CONFIG = {
  alerta: {
    icon:       AlertTriangle,
    dot:        'bg-red-500 ring-red-100',
    iconColor:  'text-red-500',
    titleColor: 'text-red-700',
  },
  checkin: {
    icon:       CheckCircle2,
    dot:        'bg-slate-700 ring-slate-100',
    iconColor:  'text-slate-600',
    titleColor: 'text-slate-900',
  },
  inicio: {
    icon:       Play,
    dot:        'bg-emerald-500 ring-emerald-100',
    iconColor:  'text-emerald-600',
    titleColor: 'text-emerald-700',
  },
  observacao: {
    icon:       MessageSquare,
    dot:        'bg-slate-400 ring-slate-100',
    iconColor:  'text-slate-500',
    titleColor: 'text-slate-700',
  },
  vital: {
    icon:       Activity,
    dot:        'bg-amber-500 ring-amber-100',
    iconColor:  'text-amber-600',
    titleColor: 'text-amber-700',
  },
  encerramento: {
    icon:       XCircle,
    dot:        'bg-slate-300 ring-slate-100',
    iconColor:  'text-slate-400',
    titleColor: 'text-slate-500',
  },
};

/**
 * Item individual da timeline.
 */
function TimelineItem({ item, isLast }) {
  const config = TIPO_CONFIG[item.tipo] ?? TIPO_CONFIG.observacao;
  const Icon   = config.icon;

  return (
    <li className="flex gap-4">

      {/* ── Dot + linha conectora ──────────────────────────────────── */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-8 h-8 rounded-full ring-4 flex items-center
          justify-center flex-shrink-0 ${config.dot}`}>
          <Icon size={14} strokeWidth={1.5} className="text-white" />
        </div>
        {/* Linha vertical — escondida no último item */}
        {!isLast && (
          <div className="w-px flex-1 bg-slate-100 mt-1 min-h-[2rem]" />
        )}
      </div>

      {/* ── Conteúdo do evento ─────────────────────────────────────── */}
      <div className={`pb-6 ${isLast ? '' : ''}`}>
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className={`text-sm font-semibold leading-none ${config.titleColor}`}>
            {item.titulo}
          </p>
          <span className="text-slate-400 text-[10px] font-light">
            {item.data}
          </span>
        </div>
        {item.descricao && (
          <p className="text-slate-500 text-xs font-light mt-1.5 leading-relaxed">
            {item.descricao}
          </p>
        )}
        {/* Badge de nível de dor, se houver */}
        {item.nivelDor !== undefined && (
          <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5
            rounded-full bg-red-50 text-red-700 text-[10px] font-medium ring-1 ring-red-100">
            Dor: {item.nivelDor}/10
          </span>
        )}
      </div>
    </li>
  );
}

/**
 * Timeline vertical com histórico de eventos do paciente.
 *
 * @param {Array} eventos - Lista de eventos ordenados do mais recente ao mais antigo
 */
export default function Timeline({ eventos = [] }) {
  if (eventos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <Activity size={18} strokeWidth={1.5} className="text-slate-400" />
        </div>
        <p className="text-slate-500 text-sm font-medium">
          Nenhum evento registrado ainda.
        </p>
        <p className="text-slate-400 text-xs font-light">
          O histórico aparecerá aqui após o primeiro check-in.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-0">
      {eventos.map((evento, index) => (
        <TimelineItem
          key={evento.id}
          item={evento}
          isLast={index === eventos.length - 1}
        />
      ))}
    </ul>
  );
}