// Arquivo: frontend/src/pages/PatientPortal/Checkin/index.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Check, CheckCircle2, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import Button from '../../../components/Button';
import InlineAlert from '../../../components/InlineAlert';
import { inputClass } from '../../../components/Field';
import { validateToken, submitCheckin } from '../../../services/patientPortalService';
import { zonaDor, COR_ZONA, descricaoDor } from '../../../utils/painLevelColor';

// ─── Estados de tela inteira (link inválido, encerrado, enviado…) ──────────
function EstadoCentral({ icone: Icone, titulo, destaque = false, acao, children }) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <span
        className={`inline-flex h-14 w-14 items-center justify-center rounded-full
          ${destaque ? 'bg-ink text-white' : 'border border-line bg-neutral-50 text-neutral-700'}`}
      >
        <Icone size={24} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">{titulo}</h1>
      <div className="mt-2 max-w-sm text-base leading-relaxed text-neutral-600">{children}</div>
      {acao && <div className="mt-8 w-full">{acao}</div>}
    </div>
  );
}

function PortalSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Carregando">
      <div className="space-y-2">
        <div className="skeleton h-5 w-24" />
        <div className="skeleton h-8 w-64" />
      </div>
      <div className="h-40 animate-pulse rounded-xl bg-neutral-200" />
      <div className="skeleton h-44 rounded-xl" />
      <div className="skeleton h-36 rounded-xl" />
    </div>
  );
}

// ─── Formulário do check-in ────────────────────────────────────────────────
function FormCheckin({ token, dadosPortal, onEnviado }) {
  const [tarefasMarcadas, setTarefasMarcadas] = useState({});
  const [nivelDor,        setNivelDor]        = useState(null);
  const [observacoes,     setObservacoes]     = useState('');
  const [enviando,        setEnviando]        = useState(false);
  const [erroForm,        setErroForm]        = useState('');

  const { paciente, tratamento, recuperacao, tarefasHoje } = dadosPortal;
  const primeiroNome = paciente.nome?.split(' ')[0] ?? 'Paciente';
  const feitas = Object.values(tarefasMarcadas).filter(Boolean).length;

  function toggleTarefa(id) {
    setTarefasMarcadas(prev => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErroForm('');
    if (!nivelDor) {
      setErroForm('Escolha um número de 1 a 10 para a sua dor antes de enviar.');
      document.getElementById('titulo-dor')?.scrollIntoView({ block: 'center' });
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
      setErroForm(err.response?.data?.message || 'Não foi possível enviar o check-in. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  const zona = zonaDor(nivelDor);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-9">

      <header>
        <p className="text-base text-neutral-600">Olá, {primeiroNome}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Como você está hoje?</h1>
      </header>

      {/* Dia da recuperação — o único bloco escuro da tela */}
      <section aria-label="Dia da recuperação" className="on-dark rounded-xl bg-ink p-5 text-white">
        <p className="text-sm text-neutral-400">{tratamento.nomeProcedimento}</p>
        <div className="mt-5 flex items-end justify-between gap-4">
          <p className="flex items-baseline gap-2 leading-none">
            <span className="text-base text-neutral-400">Dia</span>
            <span className="text-6xl font-semibold tracking-tight tabular-nums">{recuperacao.diaAtual}</span>
          </p>
          <p className="pb-1 text-sm text-neutral-400 tabular-nums">de {recuperacao.totalDias} dias</p>
        </div>
        <div
          className="mt-5 h-1.5 overflow-hidden rounded-full bg-neutral-800"
          role="progressbar"
          aria-label="Progresso da recuperação"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={recuperacao.progresso}
        >
          <div className="h-full rounded-full bg-white transition-[width] duration-500" style={{ width: `${recuperacao.progresso}%` }} />
        </div>
      </section>

      {/* Orientações de hoje */}
      {tarefasHoje.length > 0 && (
        <section aria-labelledby="titulo-orientacoes">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="titulo-orientacoes" className="text-lg font-semibold text-ink">Orientações de hoje</h2>
            <p className="text-sm text-neutral-600 tabular-nums">{feitas} de {tarefasHoje.length}</p>
          </div>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line">
            {tarefasHoje.map(tarefa => {
              const marcada = !!tarefasMarcadas[tarefa.id];
              return (
                <li key={tarefa.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={marcada}
                    onClick={() => toggleTarefa(tarefa.id)}
                    className="flex min-h-16 w-full items-center gap-4 px-4 py-3 text-left transition-colors
                      hover:bg-neutral-50 focus-visible:-outline-offset-2"
                  >
                    <span
                      aria-hidden="true"
                      className={`inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors
                        ${marcada ? 'border-ink bg-ink text-white' : 'border-line-strong bg-white'}`}
                    >
                      {marcada && <Check size={16} strokeWidth={2.5} />}
                    </span>
                    <span className={`text-base leading-snug ${marcada ? 'text-neutral-600' : 'text-ink'}`}>
                      {tarefa.descricao}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Nível de dor */}
      <section aria-labelledby="titulo-dor">
        <h2 id="titulo-dor" className="text-lg font-semibold text-ink">Qual é a sua dor agora?</h2>
        <p className={`mt-1 min-h-6 text-base ${nivelDor ? COR_ZONA[zona].texto : 'text-neutral-600'}`} aria-live="polite">
          {descricaoDor(nivelDor)}
        </p>
        <div className="mt-4 grid grid-cols-5 gap-2" role="group" aria-labelledby="titulo-dor">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(nivel => {
            const selecionado = nivelDor === nivel;
            return (
              <button
                key={nivel}
                type="button"
                aria-pressed={selecionado}
                aria-label={`Dor ${nivel}`}
                onClick={() => { setNivelDor(nivel); setErroForm(''); }}
                className={`h-14 rounded-xl text-xl font-semibold tabular-nums transition-colors duration-150
                  ${selecionado
                    ? COR_ZONA[zonaDor(nivel)].selecionado
                    : 'border border-line bg-white text-ink hover:border-neutral-400 hover:bg-neutral-50'}`}
              >
                {nivel}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-sm text-neutral-600">
          <span>Sem dor</span>
          <span>Dor máxima</span>
        </div>
      </section>

      {/* Observações */}
      <section>
        <label htmlFor="observacoes" className="block text-lg font-semibold text-ink">
          Observações <span className="text-base font-normal text-neutral-600">(opcional)</span>
        </label>
        <textarea
          id="observacoes"
          rows={3}
          value={observacoes}
          onChange={e => setObservacoes(e.target.value)}
          placeholder="Conte como está se sentindo. Ex.: o inchaço diminuiu, mas ainda dói ao abrir a boca."
          className={inputClass(false, { grande: true, className: 'mt-3 resize-none' })}
        />
      </section>

      <div className="space-y-3">
        {erroForm && <InlineAlert>{erroForm}</InlineAlert>}
        <Button type="submit" size="xl" loading={enviando} className="w-full">
          {enviando ? 'Enviando check-in…' : 'Enviar check-in'}
        </Button>
      </div>
    </form>
  );
}

// ─── Página ────────────────────────────────────────────────────────────────
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
    const primeiroNome = dadosPortal.paciente.nome?.split(' ')[0];
    return (
      <EstadoCentral icone={Check} destaque titulo="Check-in enviado">
        <p>Obrigado, {primeiroNome}. Seu relato do Dia {dadosPortal.recuperacao.diaAtual} foi registrado.</p>
        <p className="mt-3">Registre um check-in por dia para que seu profissional acompanhe a sua evolução.</p>
      </EstadoCentral>
    );
  }

  if (statusPortal === 'invalido') {
    return (
      <EstadoCentral
        icone={AlertCircle}
        titulo="Link não disponível"
        acao={
          <Button variant="secondary" size="lg" onClick={carregarPortal} className="w-full">
            <RefreshCw size={16} strokeWidth={1.75} aria-hidden="true" />
            Tentar novamente
          </Button>
        }
      >
        {mensagem || 'Link inválido ou expirado. Entre em contato com seu profissional de saúde.'}
      </EstadoCentral>
    );
  }

  if (statusPortal === 'encerrado') {
    return (
      <EstadoCentral icone={CheckCircle2} titulo="Tratamento encerrado">
        {mensagem || 'Este tratamento foi concluído pelo seu profissional.'}
      </EstadoCentral>
    );
  }

  if (statusPortal === 'sem_tratamento') {
    return (
      <EstadoCentral icone={Clock} titulo="Portal em preparação">
        Seu portal será ativado assim que seu profissional vincular o seu protocolo de recuperação.
      </EstadoCentral>
    );
  }

  if (statusPortal === 'ativo' && dadosPortal) {
    if (dadosPortal.checkinHojeFeito) {
      return (
        <EstadoCentral icone={Check} destaque titulo="Check-in de hoje enviado">
          Você já enviou o check-in do Dia {dadosPortal.recuperacao.diaAtual}. Volte amanhã para registrar o próximo.
        </EstadoCentral>
      );
    }
    return <FormCheckin token={token} dadosPortal={dadosPortal} onEnviado={() => setEnviado(true)} />;
  }

  return null;
}
