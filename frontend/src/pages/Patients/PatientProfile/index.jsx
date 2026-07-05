// Arquivo: src/pages/Patients/PatientProfile/index.jsx
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Calendar,
  Copy,
  ClipboardList,
  XCircle,
  CheckCircle2,
  Link as LinkIcon,
  User,
} from 'lucide-react';
import PainScale              from '../../../components/PainScale';
import Timeline               from '../../../components/Timeline';
import RecoveryStatusBadge    from '../../../components/RecoveryStatusBadge';

// ─── Banco de mock por ID ──────────────────────────────────────────────────
const MOCK_PACIENTES = {
  '1': {
    id:            '1',
    nome:          'Carlos Ferreira',
    idade:         34,
    telefone:      '(51) 99123-4567',
    procedimento:  'Cirurgia periodontal',
    dataCirurgia:  '03/07/2026',
    diaPos:        3,
    totalDias:     7,
    nivelDor:      9,
    status:        'critico',
    ultimaAtualizacao: 'Hoje, 14h22',
    tokenLink:     'http://localhost:5173/p/abc123def456',
    observacoes:   'Paciente relata inchaço persistente e dificuldade para mastigar. Medicação analgésica não demonstrou efeito satisfatório.',
  },
  '2': {
    id:            '2',
    nome:          'Ana Costa',
    idade:         28,
    telefone:      '(51) 98765-4321',
    procedimento:  'Extração de sisos',
    dataCirurgia:  '30/06/2026',
    diaPos:        5,
    totalDias:     7,
    nivelDor:      7,
    status:        'atencao',
    ultimaAtualizacao: 'Hoje, 09h14',
    tokenLink:     'http://localhost:5173/p/xyz789ghi012',
    observacoes:   'Paciente descreve desconforto ao abrir a boca. Edema em redução.',
  },
};

// Mock de eventos de timeline por paciente
const MOCK_TIMELINE = {
  '1': [
    {
      id:        1,
      tipo:      'alerta',
      titulo:    'Alerta de dor crítica',
      descricao: 'Nível de dor reportado: 9/10. Intervenção recomendada.',
      data:      'Hoje, 14h22',
      nivelDor:  9,
    },
    {
      id:        2,
      tipo:      'checkin',
      titulo:    'Check-in Dia 3 recebido',
      descricao: '"Inchaço ainda presente, dificuldade para mastigar. Tomei todos os medicamentos."',
      data:      'Hoje, 14h20',
    },
    {
      id:        3,
      tipo:      'checkin',
      titulo:    'Check-in Dia 2 recebido',
      descricao: '"Dor intensa nas primeiras horas, melhorou um pouco à noite."',
      data:      '04/07/2026, 19h05',
      nivelDor:  8,
    },
    {
      id:        4,
      tipo:      'checkin',
      titulo:    'Check-in Dia 1 recebido',
      descricao: '"Acordei com muita dor. Tomei o antibiótico e analgésico conforme indicado."',
      data:      '03/07/2026, 21h47',
      nivelDor:  9,
    },
    {
      id:        5,
      tipo:      'inicio',
      titulo:    'Tratamento iniciado',
      descricao: 'Protocolo "Cirurgia Periodontal 7 dias" vinculado ao paciente.',
      data:      '03/07/2026, 10h00',
    },
  ],
  '2': [
    {
      id:        1,
      tipo:      'checkin',
      titulo:    'Check-in Dia 5 recebido',
      descricao: '"Bem melhor hoje! Ainda sinto um leve desconforto mas consigo comer."',
      data:      'Hoje, 09h14',
      nivelDor:  7,
    },
    {
      id:        2,
      tipo:      'checkin',
      titulo:    'Check-in Dia 4 recebido',
      descricao: '"Inchaço diminuiu bastante. Continuando com o protocolo."',
      data:      '04/07/2026, 20h30',
      nivelDor:  5,
    },
    {
      id:        3,
      tipo:      'inicio',
      titulo:    'Tratamento iniciado',
      descricao: 'Protocolo "Pós-Extração 7 dias" vinculado ao paciente.',
      data:      '30/06/2026, 15h00',
    },
  ],
};

// ─── Utilitários ───────────────────────────────────────────────────────────
function getInitials(nome) {
  const partes = nome.trim().split(' ').filter(Boolean);
  if (partes.length === 1) return partes[0][0].toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

const AVATAR_COLOR = {
  recuperacao:   'bg-emerald-100 text-emerald-700',
  estabilizacao: 'bg-amber-100   text-amber-700',
  atencao:       'bg-orange-100  text-orange-700',
  critico:       'bg-red-100     text-red-700',
  sem_checkin:   'bg-slate-100   text-slate-500',
};

// ─── Card de informações do paciente ──────────────────────────────────────
function InfoCard({ paciente }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-5 space-y-4">
      <h3 className="text-slate-950 text-sm font-semibold">
        Informações do Paciente
      </h3>
      <ul className="space-y-3">
        <li className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
            <User size={15} strokeWidth={1.5} className="text-slate-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Idade
            </p>
            <p className="text-slate-800 text-sm font-medium">
              {paciente.idade} anos
            </p>
          </div>
        </li>
        <li className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
            <Phone size={15} strokeWidth={1.5} className="text-slate-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Telefone
            </p>
            <p className="text-slate-800 text-sm font-medium">
              {paciente.telefone}
            </p>
          </div>
        </li>
        <li className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
            <Calendar size={15} strokeWidth={1.5} className="text-slate-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Data da Cirurgia
            </p>
            <p className="text-slate-800 text-sm font-medium">
              {paciente.dataCirurgia}
            </p>
          </div>
        </li>
        <li className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={15} strokeWidth={1.5} className="text-slate-400" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Progresso do Protocolo
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-slate-700 transition-all"
                  style={{
                    width: `${Math.min((paciente.diaPos / paciente.totalDias) * 100, 100)}%`,
                  }}
                />
              </div>
              <span className="text-slate-700 text-xs font-medium">
                Dia {paciente.diaPos} / {paciente.totalDias}
              </span>
            </div>
          </div>
        </li>
      </ul>

      {/* Observações */}
      {paciente.observacoes && (
        <div className="pt-3 border-t border-slate-50">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1.5">
            Observações do paciente
          </p>
          <p className="text-slate-600 text-xs font-light leading-relaxed">
            "{paciente.observacoes}"
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Card de ações rápidas ─────────────────────────────────────────────────
function AcoesCard({ tokenLink }) {
  function copiarLink() {
    navigator.clipboard.writeText(tokenLink);
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-5 space-y-3">
      <h3 className="text-slate-950 text-sm font-semibold">
        Ações Rápidas
      </h3>

      {/* Copiar link seguro */}
      <button
        type="button"
        onClick={copiarLink}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
          border border-slate-200 text-slate-700 text-sm font-medium
          hover:border-slate-300 hover:bg-slate-50
          transition-all duration-150 text-left group"
      >
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0
          group-hover:bg-slate-200 transition-colors">
          <Copy size={14} strokeWidth={1.5} className="text-slate-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800">
            Copiar link do paciente
          </p>
          <p className="text-[11px] text-slate-400 font-light truncate">
            {tokenLink}
          </p>
        </div>
        <LinkIcon size={14} strokeWidth={1.5} className="text-slate-300 flex-shrink-0" />
      </button>

      {/* Ajustar protocolo */}
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
          border border-slate-200 text-slate-700 text-sm font-medium
          hover:border-slate-300 hover:bg-slate-50
          transition-all duration-150 text-left group"
      >
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0
          group-hover:bg-slate-200 transition-colors">
          <ClipboardList size={14} strokeWidth={1.5} className="text-slate-600" />
        </div>
        <p className="text-sm font-medium text-slate-800">
          Ajustar protocolo
        </p>
      </button>

      {/* Encerrar tratamento — destrutivo */}
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
          border border-red-100 text-red-700 text-sm font-medium
          hover:border-red-200 hover:bg-red-50
          transition-all duration-150 text-left group"
      >
        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0
          group-hover:bg-red-100 transition-colors">
          <XCircle size={14} strokeWidth={1.5} className="text-red-500" />
        </div>
        <p className="text-sm font-medium text-red-700">
          Encerrar tratamento
        </p>
      </button>
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────
export default function PatientProfile() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const paciente = MOCK_PACIENTES[id] ?? MOCK_PACIENTES['1'];
  const timeline = MOCK_TIMELINE[id]  ?? MOCK_TIMELINE['1'];

  const avatarColor = AVATAR_COLOR[paciente.status] ?? AVATAR_COLOR.sem_checkin;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Botão voltar ──────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => navigate('/patients')}
        className="inline-flex items-center gap-2 text-slate-500 text-sm font-medium
          hover:text-slate-800 transition-colors duration-150"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Voltar para Pacientes
      </button>

      {/* ── Cabeçalho do paciente ─────────────────────────────────────── */}
      <header className="bg-white border border-slate-100 rounded-2xl shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">

          {/* Avatar grande */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center
            flex-shrink-0 text-2xl font-extrabold ${avatarColor}`}>
            {getInitials(paciente.nome)}
          </div>

          {/* Dados principais */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-slate-950 text-xl font-extrabold tracking-tight">
                {paciente.nome}
              </h1>
              <RecoveryStatusBadge status={paciente.status} />
            </div>
            <p className="text-slate-500 text-sm font-light">
              {paciente.procedimento}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-7 h-7
                  rounded-lg bg-slate-950 text-white text-[11px] font-bold">
                  D{paciente.diaPos}
                </span>
                <span className="text-slate-500 text-xs font-light">
                  de {paciente.totalDias} dias de protocolo
                </span>
              </div>
              <span className="text-slate-200 hidden sm:block">·</span>
              <span className="text-slate-500 text-xs font-light">
                Cirurgia em {paciente.dataCirurgia}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Grid principal ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Coluna esquerda (1/3): escala de dor + info + ações ─────── */}
        <div className="space-y-5">

          {/* Card: Nível de Dor */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-5 space-y-1">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Nível de Dor Atual
            </p>
            <div className="pt-2">
              <PainScale
                nivel={paciente.nivelDor}
                ultimaAtualizacao={paciente.ultimaAtualizacao}
              />
            </div>
          </div>

          {/* Card: Informações */}
          <InfoCard paciente={paciente} />

          {/* Card: Ações */}
          <AcoesCard tokenLink={paciente.tokenLink} />
        </div>

        {/* ── Coluna direita (2/3): timeline de histórico ──────────────── */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-6 h-full">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-slate-950 text-sm font-semibold">
                Histórico de Recuperação
              </h2>
              <span className="text-slate-400 text-xs font-light">
                {timeline.length} evento{timeline.length !== 1 ? 's' : ''}
              </span>
            </div>

            <Timeline eventos={timeline} />
          </div>
        </div>
      </div>
    </div>
  );
}