// Arquivo: frontend/src/pages/PatientPortal/Checkin/index.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  CheckCircle2, Send, Loader2, CalendarDays,
  ClipboardList, MessageSquare, AlertCircle,
  Heart, RefreshCw, Clock,
} from 'lucide-react';
import { validateToken, submitCheckin } from '../../../services/patientPortalService';

function getDorConfig(nivel) {
  if (!nivel) return { bg: 'bg-slate-100', text: 'text-slate-400', ring: 'ring-slate-200' };
  if (nivel <= 3) return { bg: 'bg-emerald-500', text: 'text-white', ring: 'ring-emerald-300' };
  if (nivel <= 6) return { bg: 'bg-amber-500',   text: 'text-white', ring: 'ring-amber-300'  };
  if (nivel <= 8) return { bg: 'bg-orange-500',  text: 'text-white', ring: 'ring-orange-300' };
  return             { bg: 'bg-red-500',          text: 'text-white', ring: 'ring-red-300'    };
}

function getDorLabel(nivel) {
  if (!nivel)     return 'Selecione seu nível de dor';
  if (nivel <= 3) return 'Ótimo! Dor leve ou sem dor.';
  if (nivel <= 6) return 'Dor moderada. Siga o protocolo.';
  if (nivel <= 8) return 'Dor significativa. Fique atento.';
  return 'Dor intensa. Informe seu profissional.';
}

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

function LinkInvalido({ mensagem, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-red-50 ring-8 ring-red-100 flex items-center justify-center">
        <AlertCircle size={28} strokeWidth={1.5} className="text-red-400" />
      </div>
      <div>
        <h2 className="text-slate-700 text-lg font-semibold">Link não disponível</h2>
        <p className="text-slate-400 text-sm font-light mt-1 max-w-xs leading-relaxed">
          {mensagem || 'Link inválido ou expirado. Entre em contato com seu profissional de saúde.'}
        </p>
      </div>
      <button type="button" onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950
          text-white text-sm font-medium hover:bg-slate-800 transition-colors">
        <RefreshCw size={14} strokeWidth={1.5} />
        Tentar novamente
      </button>
    </div>
  );
}

function TratamentoEncerrado({ mensagem }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 ring-8 ring-slate-50 flex items-center justify-center">
        <CheckCircle2 size={28} strokeWidth={1.5} className="text-slate-400" />
      </div>
      <div>
        <h2 className="text-slate-700 text-lg font-semibold">Tratamento encerrado</h2>
        <p className="text-slate-400 text-sm font-light mt-1 max-w-xs leading-relaxed">
          {mensagem || 'Este tratamento foi concluído pelo seu profissional.'}
        </p>
      </div>
      <div className="w-full bg-white border border-slate-100 rounded-2xl p-5 text-left">
        <div className="flex items-center gap-2">
          <Heart size={14} strokeWidth={1.5} className="text-emerald-500" />
          <p className="text-sm font-medium text-slate-700">Continue cuidando da sua saúde.</p>
        </div>
      </div>
    </div>
  );
}

function AguardandoProtocolo() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-5">
      <div className="w-20 h-20 rounded-full bg-amber-50 ring-8 ring-amber-100 flex items-center justify-center">
        <Clock size={36} strokeWidth={1.5} className="text-amber-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-slate-950 text-xl font-extrabold">Portal em preparação</h2>
        <p className="text-slate-500 text-sm font-light leading-relaxed max-w-xs">
          Olá! Seu portal será ativado assim que seu profissional vincular
          o seu protocolo de recuperação.
        </p>
      </div>
      <div className="w-full bg-white border border-slate-100 rounded-2xl p-5 text-left space-y-2">
        <div className="flex items-center gap-2">
          <Heart size={14} strokeWidth={1.5} className="text-emerald-500" />
          <p className="text-sm font-medium text-slate-700">Fique tranquilo(a).</p>
        </div>
        <p className="text-xs text-slate-400 font-light leading-relaxed">
          Assim que o protocolo for configurado, você poderá acessar suas
          orientações diárias e enviar check-ins por aqui.
        </p>
      </div>
    </div>
  );
}

function CheckinJaFeito({ dia }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-emerald-50 ring-8 ring-emerald-100 flex items-center justify-center">
        <CheckCircle2 size={28} strokeWidth={1.5} className="text-emerald-500" />
      </div>
      <div>
        <h2 className="text-slate-700 text-lg font-semibold">Check-in já realizado</h2>
        <p className="text-slate-400 text-sm font-light mt-1 max-w-xs">
          Você já enviou o check-in do Dia {dia}. Volte amanhã para registrar o próximo.
        </p>
      </div>
    </div>
  );
}

function SuccessState({ nome, dia }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-5">
      <div className="w-20 h-20 rounded-full bg-emerald-50 ring-8 ring-emerald-100 flex items-center justify-center">
        <CheckCircle2 size={36} strokeWidth={1.5} className="text-emerald-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-slate-950 text-xl font-extrabold">Check-in enviado!</h2>
        <p className="text-slate-500 text-sm font-light leading-relaxed">
          Obrigado, {nome?.split(' ')[0]}. Seu relato do Dia {dia} foi registrado com sucesso.
        </p>
      </div>
      <div className="w-full bg-white border border-slate-100 rounded-2xl p-5 text-left space-y-2">
        <div className="flex items-center gap-2">
          <Heart size={14} strokeWidth={1.5} className="text-emerald-500" />
          <p className="text-sm font-medium text-slate-700">Continue seguindo o protocolo amanhã.</p>
        </div>
        <p className="text-xs text-slate-400 font-light leading-relaxed">
          Lembre-se de registrar seu check-in diariamente para que seu profissional
          acompanhe sua evolução.
        </p>
      </div>
    </div>
  );
}

function FormCheckin({ token, dadosPortal, onEnviado }) {
  const [tarefasMarcadas, setTarefasMarcadas] = useState({});
  const [nivelDor,        setNivelDor]        = useState(null);
  const [observacoes,     setObservacoes]      = useState('');
  const [enviando,        setEnviando]         = useState(false);
  const [erroForm,        setErroForm]         = useState('');

  const { paciente, tratamento, recuperacao, tarefasHoje } = dadosPortal;
  const primeiroNome = paciente.nome?.split(' ')[0] ?? 'Paciente';

  function toggleTarefa(id) {
    setTarefasMarcadas(prev => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleSubmit() {
    setErroForm('');
    if (!nivelDor) {
      setErroForm('Por favor, informe seu nível de dor antes de enviar.');
      return;
    }
    setEnviando(true);
    try {
      const respostas = (tarefasHoje ?? []).map(tarefa => ({
        tarefaDiaProtocoloId: tarefa.id,
        concluido: !!tarefasMarcadas[tarefa.id],
      }));
      await submitCheckin({
        token,
        nivelDor,
        observacoes:    observacoes || null,
        respostas,
      });
      onEnviado();
    } catch (err) {
      setErroForm(err.response?.data?.message || 'Erro ao enviar check-in. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-5">

      <div className="space-y-1 pt-2">
        <p className="text-slate-400 text-sm font-light">Olá, {primeiroNome} 👋</p>
        <h1 className="text-slate-950 text-2xl font-extrabold tracking-tight">
          Como você está hoje?
        </h1>
        <p className="text-slate-500 text-sm font-light">{tratamento.nomeProcedimento}</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} strokeWidth={1.5} className="text-slate-400" />
            <span className="text-slate-600 text-sm font-medium">Dia da Recuperação</span>
          </div>
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl
            bg-slate-950 text-white text-sm font-extrabold">
            D{recuperacao.diaAtual}
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-slate-700 transition-all duration-700"
              style={{ width: `${recuperacao.progresso}%` }} />
          </div>
          <p className="text-slate-400 text-xs font-light text-right">
            {recuperacao.diaAtual} de {recuperacao.totalDias} dias
          </p>
        </div>
      </div>

      {tarefasHoje.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-50">
            <ClipboardList size={16} strokeWidth={1.5} className="text-slate-400" />
            <h2 className="text-slate-800 text-sm font-semibold">Orientações de Hoje</h2>
          </div>
          <ul className="divide-y divide-slate-50">
            {tarefasHoje.map(tarefa => {
              const marcada = !!tarefasMarcadas[tarefa.id];
              return (
                <li key={tarefa.id}>
                  <button type="button" onClick={() => toggleTarefa(tarefa.id)}
                    style={{ minHeight: '60px' }}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left
                      hover:bg-slate-50/70 active:bg-slate-100 transition-colors">
                    <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0
                      flex items-center justify-center transition-all duration-200
                      ${marcada ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'}`}>
                      {marcada && <CheckCircle2 size={14} strokeWidth={2.5} className="text-white" />}
                    </div>
                    <span className={`text-sm leading-snug transition-all
                      ${marcada ? 'text-slate-400 line-through' : 'text-slate-800 font-medium'}`}>
                      {tarefa.descricao}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-50">
            <p className="text-xs text-slate-400 font-light">
              {Object.values(tarefasMarcadas).filter(Boolean).length} de {tarefasHoje.length} tarefas concluídas
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-5 space-y-4">
        <div>
          <h2 className="text-slate-800 text-sm font-semibold">Nível de Dor Atual</h2>
          <p className={`text-xs font-medium mt-1 transition-colors duration-200
            ${nivelDor
              ? nivelDor <= 3 ? 'text-emerald-600'
              : nivelDor <= 6 ? 'text-amber-600'
              : nivelDor <= 8 ? 'text-orange-600'
              : 'text-red-600'
              : 'text-slate-400'}`}>
            {getDorLabel(nivelDor)}
          </p>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(nivel => {
            const sel    = nivelDor === nivel;
            const config = getDorConfig(nivel);
            return (
              <button key={nivel} type="button" onClick={() => setNivelDor(nivel)}
                style={{ minHeight: '52px' }}
                className={`rounded-xl text-base font-bold transition-all duration-150
                  active:scale-95 ring-2
                  ${sel
                    ? `${config.bg} ${config.text} ${config.ring} scale-105 shadow-md`
                    : 'bg-slate-50 text-slate-500 ring-slate-100 hover:bg-slate-100'}`}>
                {nivel}
              </button>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
          <span>Sem dor</span>
          <span>Dor máxima</span>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare size={15} strokeWidth={1.5} className="text-slate-400" />
          <h2 className="text-slate-800 text-sm font-semibold">
            Observações <span className="text-slate-400 font-normal">(opcional)</span>
          </h2>
        </div>
        <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={3}
          placeholder="Conte como está se sentindo. Ex: 'Inchaço diminuiu, mas ainda sinto dor ao abrir a boca.'"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50
            text-sm text-slate-800 placeholder:text-slate-400 font-light outline-none
            resize-none transition-all focus:border-slate-400 focus:bg-white
            focus:ring-2 focus:ring-slate-950/5" />
      </div>

      {erroForm && (
        <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle size={15} strokeWidth={1.5} className="text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm font-medium">{erroForm}</p>
        </div>
      )}

      <button type="button" onClick={handleSubmit} disabled={enviando}
        style={{ minHeight: '56px' }}
        className="w-full flex items-center justify-center gap-2.5 rounded-xl
          bg-slate-950 text-white text-base font-semibold
          hover:bg-slate-800 active:scale-[0.98]
          disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150">
        {enviando
          ? <><Loader2 size={18} strokeWidth={2} className="animate-spin" /> Enviando check-in…</>
          : <><Send size={16} strokeWidth={1.5} /> Concluir Check-in</>}
      </button>
      <div className="h-4" />
    </div>
  );
}

export default function PatientCheckin() {
  const { token } = useParams();

  const [statusPortal, setStatusPortal] = useState(null);
  const [mensagem,     setMensagem]     = useState('');
  const [dadosPortal,  setDadosPortal]  = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [enviado,      setEnviado]      = useState(false);

  async function carregarPortal() {
    setLoading(true);
    setStatusPortal(null);
    try {
      const dados = await validateToken(token);
      if (dados.status === 'invalido' || dados.status === 'encerrado') {
        setStatusPortal(dados.status);
        setMensagem(dados.mensagem ?? '');
      } else if (dados.status === 'ativo') {
        setDadosPortal(dados);
        setStatusPortal('ativo');
      } else {
        setStatusPortal('invalido');
        setMensagem('Não foi possível carregar o portal.');
      }
    } catch (err) {
      setStatusPortal('invalido');
      setMensagem(
        err.response?.data?.message ||
        'Não foi possível conectar ao servidor.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregarPortal(); }, [token]);

  if (loading) return <PortalSkeleton />;

  if (enviado && dadosPortal) {
    return (
      <SuccessState
        nome={dadosPortal.paciente.nome}
        dia={dadosPortal.recuperacao.diaAtual}
      />
    );
  }

  if (statusPortal === 'invalido')       return <LinkInvalido mensagem={mensagem} onRetry={carregarPortal} />;
  if (statusPortal === 'encerrado')      return <TratamentoEncerrado mensagem={mensagem} />;
  if (statusPortal === 'sem_tratamento') return <AguardandoProtocolo />;

  if (statusPortal === 'ativo' && dadosPortal) {
    if (dadosPortal.checkinHojeFeito) {
      return <CheckinJaFeito dia={dadosPortal.recuperacao.diaAtual} />;
    }
    return <FormCheckin token={token} dadosPortal={dadosPortal} onEnviado={() => setEnviado(true)} />;
  }

  return null;
}