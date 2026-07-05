// Arquivo: src/pages/PatientPortal/Checkin/index.jsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  Send,
  Loader2,
  CalendarDays,
  ClipboardList,
  MessageSquare,
  AlertCircle,
  Heart,
} from 'lucide-react';

// ─── Mock de dados do portal (substituído por API via token) ───────────────
const MOCK_PORTAL = {
  paciente:  { nome: 'Lucas Almeida' },
  tratamento: {
    id:               '1',
    nomeProcedimento: 'Extração de sisos',
  },
  recuperacao: {
    diaAtual:   3,
    totalDias:  7,
    progresso:  43,
  },
  tarefasHoje: [
    { id: 't1', descricao: 'Tomar Amoxicilina 500mg (1 comprimido)' },
    { id: 't2', descricao: 'Aplicar compressa de gelo por 15 minutos' },
    { id: 't3', descricao: 'Evitar alimentos quentes, duros ou ácidos' },
    { id: 't4', descricao: 'Não realizar esforço físico ou exercícios' },
    { id: 't5', descricao: 'Fazer bochechos com soro fisiológico morno' },
  ],
  checkinHojeFeito: false,
};

// ─── Configuração de cores da escala de dor ────────────────────────────────
function getDorConfig(nivel) {
  if (!nivel) return { bg: 'bg-slate-100', text: 'text-slate-400', ring: 'ring-slate-200' };
  if (nivel <= 3) return { bg: 'bg-emerald-500', text: 'text-white',       ring: 'ring-emerald-300' };
  if (nivel <= 6) return { bg: 'bg-amber-500',   text: 'text-white',       ring: 'ring-amber-300'   };
  if (nivel <= 8) return { bg: 'bg-orange-500',  text: 'text-white',       ring: 'ring-orange-300'  };
  return               { bg: 'bg-red-500',       text: 'text-white',       ring: 'ring-red-300'     };
}

function getDorLabel(nivel) {
  if (!nivel)    return 'Selecione seu nível de dor';
  if (nivel <= 3) return 'Ótimo! Dor leve ou sem dor.';
  if (nivel <= 6) return 'Dor moderada. Siga o protocolo.';
  if (nivel <= 8) return 'Dor significativa. Fique atento.';
  return 'Dor intensa. Informe seu profissional.';
}

// ─── Skeleton de loading ───────────────────────────────────────────────────
function PortalSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-40 bg-slate-200 rounded-lg" />
      <div className="h-4 w-56 bg-slate-100 rounded" />
      <div className="h-24 bg-slate-100 rounded-2xl mt-6" />
      <div className="h-48 bg-slate-100 rounded-2xl" />
      <div className="h-36 bg-slate-100 rounded-2xl" />
    </div>
  );
}

// ─── Tela de sucesso pós-envio ─────────────────────────────────────────────
function SuccessState({ nome, dia }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-5">
      <div className="w-20 h-20 rounded-full bg-emerald-50 ring-8 ring-emerald-100
        flex items-center justify-center">
        <CheckCircle2 size={36} strokeWidth={1.5} className="text-emerald-500" />
      </div>

      <div className="space-y-2">
        <h2 className="text-slate-950 text-xl font-extrabold">
          Check-in enviado!
        </h2>
        <p className="text-slate-500 text-sm font-light leading-relaxed">
          Obrigado, {nome.split(' ')[0]}. Seu relato do Dia {dia} foi
          registrado com sucesso e seu profissional já foi notificado.
        </p>
      </div>

      <div className="w-full bg-white border border-slate-100 rounded-2xl p-5 text-left space-y-2">
        <div className="flex items-center gap-2 text-slate-500">
          <Heart size={14} strokeWidth={1.5} className="text-emerald-500" />
          <p className="text-sm font-medium text-slate-700">
            Continue seguindo o protocolo amanhã.
          </p>
        </div>
        <p className="text-xs text-slate-400 font-light leading-relaxed">
          Lembre-se de registrar seu check-in diariamente para que seu profissional
          acompanhe sua evolução de perto.
        </p>
      </div>
    </div>
  );
}

// ─── Tela de tratamento encerrado ──────────────────────────────────────────
function TratamentoEncerrado() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
        <AlertCircle size={28} strokeWidth={1.5} className="text-slate-400" />
      </div>
      <h2 className="text-slate-700 text-lg font-semibold">
        Link não disponível
      </h2>
      <p className="text-slate-400 text-sm font-light leading-relaxed max-w-xs">
        Este tratamento foi encerrado ou o link não está mais ativo.
        Entre em contato com seu profissional de saúde.
      </p>
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────
export default function PatientCheckin() {
  const { token } = useParams();

  // Estados da página
  const [loading]  = useState(false);
  const [erro]     = useState(false);
  const [enviado,  setEnviado]  = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Estado do formulário
  const [tarefasMarcadas, setTarefasMarcadas] = useState({});
  const [nivelDor,        setNivelDor]        = useState(null);
  const [observacoes,     setObservacoes]      = useState('');
  const [erroForm,        setErroForm]         = useState('');

  const dados = MOCK_PORTAL;

  // ── Handlers ─────────────────────────────────────────────────────────────
  function toggleTarefa(id) {
    setTarefasMarcadas((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleSubmit() {
    setErroForm('');

    if (!nivelDor) {
      setErroForm('Por favor, informe seu nível de dor antes de enviar.');
      return;
    }

    setEnviando(true);

    // Simula chamada à API (substituir por api.post('/checkins', ...) real)
    await new Promise((r) => setTimeout(r, 1800));

    setEnviando(false);
    setEnviado(true);
  }

  // ── Renderização condicional ──────────────────────────────────────────────
  if (loading) return <PortalSkeleton />;
  if (erro)    return <TratamentoEncerrado />;

  if (enviado) {
    return (
      <SuccessState
        nome={dados.paciente.nome}
        dia={dados.recuperacao.diaAtual}
      />
    );
  }

  const { paciente, tratamento, recuperacao, tarefasHoje } = dados;
  const primeiroNome = paciente.nome.split(' ')[0];
  const dorConfig    = getDorConfig(nivelDor);

  return (
    <div className="space-y-5">

      {/* ── Saudação ─────────────────────────────────────────────────── */}
      <div className="space-y-1 pt-2">
        <p className="text-slate-400 text-sm font-light">
          Olá, {primeiroNome} 👋
        </p>
        <h1 className="text-slate-950 text-2xl font-extrabold tracking-tight">
          Como você está hoje?
        </h1>
        <p className="text-slate-500 text-sm font-light">
          {tratamento.nomeProcedimento}
        </p>
      </div>

      {/* ── Card do dia ──────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} strokeWidth={1.5} className="text-slate-400" />
            <span className="text-slate-600 text-sm font-medium">
              Dia da Recuperação
            </span>
          </div>
          <span className="inline-flex items-center justify-center
            w-10 h-10 rounded-xl bg-slate-950 text-white
            text-sm font-extrabold">
            D{recuperacao.diaAtual}
          </span>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-1.5">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-slate-700 transition-all duration-700"
              style={{ width: `${recuperacao.progresso}%` }}
            />
          </div>
          <p className="text-slate-400 text-xs font-light text-right">
            {recuperacao.diaAtual} de {recuperacao.totalDias} dias
          </p>
        </div>
      </div>

      {/* ── Checklist do dia ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
          <ClipboardList size={16} strokeWidth={1.5} className="text-slate-400" />
          <h2 className="text-slate-800 text-sm font-semibold">
            Orientações de Hoje
          </h2>
        </div>

        <ul className="divide-y divide-slate-50">
          {tarefasHoje.map((tarefa) => {
            const marcada = !!tarefasMarcadas[tarefa.id];
            return (
              <li key={tarefa.id}>
                <button
                  type="button"
                  onClick={() => toggleTarefa(tarefa.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left
                    hover:bg-slate-50/70 active:bg-slate-100
                    transition-colors duration-100"
                  style={{ minHeight: '60px' }}
                >
                  {/* Checkbox grande e tátil */}
                  <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0
                    flex items-center justify-center transition-all duration-200
                    ${marcada
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-slate-300 bg-white'
                    }`}>
                    {marcada && (
                      <CheckCircle2 size={14} strokeWidth={2.5} className="text-white" />
                    )}
                  </div>

                  <span className={`text-sm leading-snug transition-all duration-150
                    ${marcada
                      ? 'text-slate-400 line-through'
                      : 'text-slate-800 font-medium'
                    }`}>
                    {tarefa.descricao}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Progresso das tarefas */}
        <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-50">
          <p className="text-xs text-slate-400 font-light">
            {Object.values(tarefasMarcadas).filter(Boolean).length} de{' '}
            {tarefasHoje.length} tarefas concluídas
          </p>
        </div>
      </div>

      {/* ── Escala de dor interativa ──────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-5 space-y-4">
        <div>
          <h2 className="text-slate-800 text-sm font-semibold">
            Nível de Dor Atual
          </h2>
          <p className={`text-xs font-medium mt-1 transition-colors duration-200
            ${nivelDor
              ? nivelDor <= 3 ? 'text-emerald-600'
              : nivelDor <= 6 ? 'text-amber-600'
              : nivelDor <= 8 ? 'text-orange-600'
              : 'text-red-600'
              : 'text-slate-400'
            }`}>
            {getDorLabel(nivelDor)}
          </p>
        </div>

        {/* Botões de dor — grandes e táteis */}
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((nivel) => {
            const selecionado = nivelDor === nivel;
            const config = getDorConfig(nivel);
            return (
              <button
                key={nivel}
                type="button"
                onClick={() => setNivelDor(nivel)}
                style={{ minHeight: '52px' }}
                className={`rounded-xl text-base font-bold transition-all duration-150
                  active:scale-95 ring-2
                  ${selecionado
                    ? `${config.bg} ${config.text} ${config.ring} scale-105 shadow-md`
                    : 'bg-slate-50 text-slate-500 ring-slate-100 hover:bg-slate-100'
                  }`}
              >
                {nivel}
              </button>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
          <span>Sem dor</span>
          <span>Dor máxima</span>
        </div>
      </div>

      {/* ── Observações opcionais ─────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare size={15} strokeWidth={1.5} className="text-slate-400" />
          <h2 className="text-slate-800 text-sm font-semibold">
            Observações
            <span className="text-slate-400 font-normal ml-1">(opcional)</span>
          </h2>
        </div>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={3}
          placeholder="Conte como está se sentindo. Ex: 'Inchaço diminuiu, mas ainda sinto dor ao abrir a boca.'"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
            text-sm text-slate-800 placeholder:text-slate-400 font-light
            outline-none resize-none transition-all duration-150
            focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-950/5"
        />
      </div>

      {/* ── Erro de validação ─────────────────────────────────────────── */}
      {erroForm && (
        <div className="flex items-center gap-2.5 p-4 bg-red-50
          border border-red-100 rounded-xl">
          <AlertCircle size={15} strokeWidth={1.5} className="text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm font-medium">{erroForm}</p>
        </div>
      )}

      {/* ── Botão de envio ────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={enviando}
        style={{ minHeight: '56px' }}
        className="w-full flex items-center justify-center gap-2.5
          rounded-xl bg-slate-950 text-white text-base font-semibold
          hover:bg-slate-800 active:scale-[0.98]
          disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
          transition-all duration-150 focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
      >
        {enviando ? (
          <>
            <Loader2 size={18} strokeWidth={2} className="animate-spin" />
            Enviando check-in…
          </>
        ) : (
          <>
            <Send size={16} strokeWidth={1.5} />
            Concluir Check-in
          </>
        )}
      </button>

      {/* Espaço extra no final para não ficar colado no rodapé mobile */}
      <div className="h-4" />

    </div>
  );
}