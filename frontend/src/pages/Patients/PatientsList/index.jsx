// Arquivo: src/pages/Patients/PatientsList/index.jsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ChevronRight, Frown } from 'lucide-react';
import SearchInput from '../../../components/SearchInput';
import RecoveryStatusBadge from '../../../components/RecoveryStatusBadge';

// ─── Dados mockados (substituídos por API na próxima fase) ─────────────────
const MOCK_PACIENTES = [
  {
    id:           '1',
    nome:         'Carlos Ferreira',
    idade:        34,
    procedimento: 'Cirurgia periodontal',
    dataCirurgia: '2026-07-03',
    diaPos:       1,
    nivelDor:     9,
    status:       'critico',
  },
  {
    id:           '2',
    nome:         'Ana Costa',
    idade:        28,
    procedimento: 'Extração de sisos',
    dataCirurgia: '2026-06-30',
    diaPos:       4,
    nivelDor:     7,
    status:       'atencao',
  },
  {
    id:           '3',
    nome:         'Roberto Lima',
    idade:        45,
    procedimento: 'Implante dentário',
    dataCirurgia: '2026-07-02',
    diaPos:       2,
    nivelDor:     8,
    status:       'atencao',
  },
  {
    id:           '4',
    nome:         'Lucas Almeida',
    idade:        22,
    procedimento: 'Extração de sisos',
    dataCirurgia: '2026-07-01',
    diaPos:       3,
    nivelDor:     2,
    status:       'recuperacao',
  },
  {
    id:           '5',
    nome:         'Maria Santos',
    idade:        51,
    procedimento: 'Implante dentário',
    dataCirurgia: '2026-06-27',
    diaPos:       7,
    nivelDor:     4,
    status:       'estabilizacao',
  },
  {
    id:           '6',
    nome:         'Pedro Oliveira',
    idade:        38,
    procedimento: 'Enxerto ósseo',
    dataCirurgia: '2026-06-29',
    diaPos:       5,
    nivelDor:     3,
    status:       'recuperacao',
  },
  {
    id:           '7',
    nome:         'Fernanda Souza',
    idade:        29,
    procedimento: 'Extração de sisos',
    dataCirurgia: '2026-06-28',
    diaPos:       6,
    nivelDor:     1,
    status:       'recuperacao',
  },
  {
    id:           '8',
    nome:         'Thiago Ramos',
    idade:        41,
    procedimento: 'Cirurgia de gengiva',
    dataCirurgia: '2026-07-02',
    diaPos:       2,
    nivelDor:     5,
    status:       'estabilizacao',
  },
  {
    id:           '9',
    nome:         'Juliana Mendes',
    idade:        33,
    procedimento: 'Implante dentário',
    dataCirurgia: '2026-07-04',
    diaPos:       0,
    nivelDor:     null,
    status:       'sem_checkin',
  },
];

// ─── Utilitários ───────────────────────────────────────────────────────────
function formatarData(dataIso) {
  return new Intl.DateTimeFormat('pt-BR', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  }).format(new Date(dataIso));
}

function getInitials(nome) {
  const partes = nome.trim().split(' ').filter(Boolean);
  if (partes.length === 1) return partes[0][0].toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

// ─── Barra de dor visual ───────────────────────────────────────────────────
function PainBar({ nivel }) {
  if (nivel === null || nivel === undefined) {
    return <span className="text-slate-300 text-xs">—</span>;
  }

  const cor =
    nivel >= 9 ? 'bg-red-500'
    : nivel >= 7 ? 'bg-orange-500'
    : nivel >= 4 ? 'bg-amber-500'
    : 'bg-emerald-500';

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${cor}`}
          style={{ width: `${(nivel / 10) * 100}%` }}
        />
      </div>
      <span className="text-slate-700 text-xs font-medium tabular-nums w-4">
        {nivel}
      </span>
    </div>
  );
}

// ─── Avatar do paciente ────────────────────────────────────────────────────
function PatientAvatar({ nome, status }) {
  const colorMap = {
    recuperacao:   'bg-emerald-50  text-emerald-700',
    estabilizacao: 'bg-amber-50    text-amber-700',
    atencao:       'bg-orange-50   text-orange-700',
    critico:       'bg-red-50      text-red-700',
    sem_checkin:   'bg-slate-100   text-slate-500',
  };
  const color = colorMap[status] ?? colorMap.sem_checkin;

  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center
      flex-shrink-0 text-sm font-semibold ${color}`}>
      {getInitials(nome)}
    </div>
  );
}

// ─── Estado vazio ──────────────────────────────────────────────────────────
function EmptyState({ busca }) {
  return (
    <tr>
      <td colSpan={6}>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Frown size={22} strokeWidth={1.5} className="text-slate-400" />
          </div>
          <div className="text-center">
            <p className="text-slate-700 text-sm font-medium">
              {busca
                ? `Nenhum paciente encontrado para "${busca}"`
                : 'Nenhum paciente cadastrado ainda.'}
            </p>
            <p className="text-slate-400 text-xs font-light mt-1">
              {busca
                ? 'Tente um nome diferente ou limpe a busca.'
                : 'Adicione o primeiro paciente para começar.'}
            </p>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────
export default function PatientsList() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');

  const pacientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return MOCK_PACIENTES;
    return MOCK_PACIENTES.filter((p) =>
      p.nome.toLowerCase().includes(termo) ||
      p.procedimento.toLowerCase().includes(termo)
    );
  }, [busca]);

  // Ordenação: críticos e atenção primeiro
  const PRIORIDADE = { critico: 0, atencao: 1, sem_checkin: 2, estabilizacao: 3, recuperacao: 4 };
  const pacientesOrdenados = [...pacientesFiltrados].sort(
    (a, b) => (PRIORIDADE[a.status] ?? 5) - (PRIORIDADE[b.status] ?? 5)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Cabeçalho da página ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-slate-950 text-2xl font-extrabold tracking-tight">
            Pacientes
          </h1>
          <p className="text-slate-400 text-sm font-light mt-1">
            {MOCK_PACIENTES.length} paciente{MOCK_PACIENTES.length !== 1 ? 's' : ''} cadastrado{MOCK_PACIENTES.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
            bg-slate-950 text-white text-sm font-medium
            hover:bg-slate-800 active:scale-[0.98]
            transition-all duration-150 self-start sm:self-auto"
        >
          <UserPlus size={16} strokeWidth={1.5} />
          Novo Paciente
        </button>
      </div>

      {/* ── Busca ─────────────────────────────────────────────────────── */}
      <SearchInput
        value={busca}
        onChange={setBusca}
        placeholder="Buscar por nome ou procedimento…"
        className="max-w-sm"
      />

      {/* ── Tabela de pacientes ───────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            {/* Cabeçalho */}
            <thead>
              <tr className="border-b border-slate-100">
                {['Paciente', 'Procedimento', 'Pós-op', 'Dor', 'Status', ''].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3.5 text-left text-[11px] font-semibold
                      text-slate-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Corpo */}
            <tbody className="divide-y divide-slate-50">
              {pacientesOrdenados.length === 0
                ? <EmptyState busca={busca} />
                : pacientesOrdenados.map((paciente) => (
                  <tr
                    key={paciente.id}
                    className="hover:bg-slate-50/60 transition-colors duration-100 group cursor-pointer"
                    onClick={() => navigate(`/patients/${paciente.id}`)}
                  >
                    {/* Nome + idade */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <PatientAvatar nome={paciente.nome} status={paciente.status} />
                        <div>
                          <p className="text-slate-950 font-medium leading-none">
                            {paciente.nome}
                          </p>
                          <p className="text-slate-400 text-xs font-light mt-0.5">
                            {paciente.idade} anos
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Procedimento + data */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="text-slate-700 font-medium">
                        {paciente.procedimento}
                      </p>
                      <p className="text-slate-400 text-xs font-light mt-0.5">
                        {formatarData(paciente.dataCirurgia)}
                      </p>
                    </td>

                    {/* Dia pós-operatório */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center
                        w-9 h-9 rounded-xl bg-slate-100
                        text-slate-700 text-xs font-bold">
                        D{paciente.diaPos}
                      </span>
                    </td>

                    {/* Barra de dor */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <PainBar nivel={paciente.nivelDor} />
                    </td>

                    {/* Badge de status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <RecoveryStatusBadge status={paciente.status} />
                    </td>

                    {/* Botão de ação */}
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center
                          w-8 h-8 rounded-lg
                          text-slate-300 hover:text-slate-600 hover:bg-slate-100
                          transition-all duration-150"
                        aria-label={`Ver detalhes de ${paciente.nome}`}
                      >
                        <ChevronRight size={16} strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}