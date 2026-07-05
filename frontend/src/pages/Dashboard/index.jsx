// Arquivo: src/pages/Dashboard/index.jsx
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import StatCard from '../../components/StatCard';

// ─── Dados mockados (substituídos por API na próxima fase) ─────────────────
const MOCK_STATS = [
  {
    title:       'Tratamentos Ativos',
    value:       12,
    icon:        Activity,
    color:       'slate',
    description: 'pacientes em recuperação',
  },
  {
    title:       'Alertas Críticos',
    value:       3,
    icon:        AlertTriangle,
    color:       'red',
    description: 'dor ≥ 7 nas últimas 48h',
  },
  {
    title:       'Check-ins Hoje',
    value:       8,
    icon:        CheckCircle2,
    color:       'green',
    description: 'de 12 pacientes ativos',
  },
  {
    title:       'Sem Check-in',
    value:       2,
    icon:        Clock,
    color:       'amber',
    description: 'há mais de 48 horas',
  },
];

const MOCK_ALERTAS = [
  {
    id:           1,
    nome:         'Carlos Ferreira',
    procedimento: 'Cirurgia periodontal',
    diaPos:       1,
    nivelDor:     9,
    status:       'critico',
    enviadoEm:    '14 min atrás',
  },
  {
    id:           2,
    nome:         'Ana Costa',
    procedimento: 'Extração de sisos',
    diaPos:       4,
    nivelDor:     7,
    status:       'atencao',
    enviadoEm:    '1h atrás',
  },
  {
    id:           3,
    nome:         'Roberto Lima',
    procedimento: 'Implante dentário',
    diaPos:       2,
    nivelDor:     8,
    status:       'atencao',
    enviadoEm:    '3h atrás',
  },
];

const MOCK_CHECKINS_RECENTES = [
  {
    id:           1,
    paciente:     'Lucas Almeida',
    procedimento: 'Extração de sisos',
    diaPos:       3,
    nivelDor:     2,
    status:       'recuperacao',
    enviadoEm:    '8 min atrás',
  },
  {
    id:           2,
    paciente:     'Maria Santos',
    procedimento: 'Implante dentário',
    diaPos:       7,
    nivelDor:     4,
    status:       'estabilizacao',
    enviadoEm:    '22 min atrás',
  },
  {
    id:           3,
    paciente:     'Pedro Oliveira',
    procedimento: 'Enxerto ósseo',
    diaPos:       5,
    nivelDor:     3,
    status:       'recuperacao',
    enviadoEm:    '45 min atrás',
  },
  {
    id:           4,
    paciente:     'Fernanda Souza',
    procedimento: 'Extração de sisos',
    diaPos:       6,
    nivelDor:     1,
    status:       'recuperacao',
    enviadoEm:    '1h atrás',
  },
  {
    id:           5,
    paciente:     'Thiago Ramos',
    procedimento: 'Cirurgia de gengiva',
    diaPos:       2,
    nivelDor:     5,
    status:       'estabilizacao',
    enviadoEm:    '2h atrás',
  },
];

// ─── Configuração de status clínico ───────────────────────────────────────
const STATUS_CONFIG = {
  recuperacao: {
    label: 'Recuperação',
    badge: 'bg-emerald-50 text-emerald-700',
    dot:   'bg-emerald-500',
  },
  estabilizacao: {
    label: 'Estabilização',
    badge: 'bg-amber-50 text-amber-700',
    dot:   'bg-amber-500',
  },
  atencao: {
    label: 'Atenção',
    badge: 'bg-orange-50 text-orange-700',
    dot:   'bg-orange-500',
  },
  critico: {
    label: 'Crítico',
    badge: 'bg-red-50 text-red-700',
    dot:   'bg-red-500',
  },
};

// ─── Badge de status ───────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.recuperacao;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1
      rounded-full text-xs font-medium ${config.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

// ─── Iniciais do paciente ──────────────────────────────────────────────────
function AvatarInicial({ nome, status }) {
  const initial = nome?.[0]?.toUpperCase() ?? '?';
  const config  = STATUS_CONFIG[status] ?? STATUS_CONFIG.recuperacao;
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center
      flex-shrink-0 text-sm font-semibold ${config.badge}`}>
      {initial}
    </div>
  );
}

// ─── Seção de alertas críticos ─────────────────────────────────────────────
function AlertasCriticos({ alertas }) {
  return (
    <section className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
        <div className="flex items-center gap-2.5">
          <AlertTriangle size={16} strokeWidth={1.5} className="text-red-500" />
          <h2 className="text-slate-950 text-sm font-semibold">
            Alertas Críticos
          </h2>
          <span className="inline-flex items-center justify-center w-5 h-5
            rounded-full bg-red-500 text-white text-[10px] font-bold">
            {alertas.length}
          </span>
        </div>
        <button type="button"
          className="text-xs text-slate-400 hover:text-slate-600
            font-medium flex items-center gap-1 transition-colors duration-150">
          Ver todos
          <ChevronRight size={14} strokeWidth={1.5} />
        </button>
      </div>

      {/* Lista */}
      <ul className="divide-y divide-slate-50">
        {alertas.map((alerta) => (
          <li key={alerta.id}
            className="flex items-center gap-4 px-6 py-4
              hover:bg-slate-50/60 transition-colors duration-150 cursor-pointer group">

            <AvatarInicial nome={alerta.nome} status={alerta.status} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-slate-950 text-sm font-medium truncate">
                  {alerta.nome}
                </p>
                <StatusBadge status={alerta.status} />
              </div>
              <p className="text-slate-400 text-xs font-light mt-0.5 truncate">
                {alerta.procedimento} · Dia {alerta.diaPos}
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-slate-950 text-sm font-bold">
                {alerta.nivelDor}
                <span className="text-slate-400 text-xs font-light">/10</span>
              </p>
              <p className="text-slate-400 text-[10px] font-light mt-0.5">
                {alerta.enviadoEm}
              </p>
            </div>

            <ChevronRight size={14} strokeWidth={1.5}
              className="text-slate-300 group-hover:text-slate-500
                transition-colors duration-150 flex-shrink-0" />
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Feed de check-ins recentes ────────────────────────────────────────────
function CheckinsRecentes({ checkins }) {
  return (
    <section className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
        <div className="flex items-center gap-2.5">
          <TrendingUp size={16} strokeWidth={1.5} className="text-slate-400" />
          <h2 className="text-slate-950 text-sm font-semibold">
            Últimos Check-ins
          </h2>
        </div>
      </div>

      {/* Lista */}
      <ul className="divide-y divide-slate-50">
        {checkins.map((checkin) => (
          <li key={checkin.id}
            className="flex items-center gap-4 px-6 py-3.5
              hover:bg-slate-50/60 transition-colors duration-150 cursor-pointer group">

            <AvatarInicial nome={checkin.paciente} status={checkin.status} />

            <div className="flex-1 min-w-0">
              <p className="text-slate-900 text-sm font-medium truncate">
                {checkin.paciente}
              </p>
              <p className="text-slate-400 text-xs font-light mt-0.5 truncate">
                {checkin.procedimento} · Dia {checkin.diaPos}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <StatusBadge status={checkin.status} />
              <p className="text-slate-400 text-[10px] font-light">
                {checkin.enviadoEm}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────
export default function Dashboard() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Cabeçalho da página */}
      <div>
        <h1 className="text-slate-950 text-2xl font-extrabold tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-400 text-sm font-light mt-1">
          Acompanhe a evolução dos seus pacientes em tempo real.
        </p>
      </div>

      {/* Grid de StatCards */}
      <section
        aria-label="Métricas principais"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {MOCK_STATS.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      {/* Painéis inferiores — alertas + check-ins */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3">
          <AlertasCriticos alertas={MOCK_ALERTAS} />
        </div>
        <div className="xl:col-span-2">
          <CheckinsRecentes checkins={MOCK_CHECKINS_RECENTES} />
        </div>
      </div>

    </div>
  );
}