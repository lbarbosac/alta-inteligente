// Arquivo: frontend/src/pages/PatientPortal/Checkin/index.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, CheckCircle2, AlertCircle, Clock, RefreshCw, Camera, X, ShieldCheck } from 'lucide-react';
import Button from '../../../components/Button';
import InlineAlert from '../../../components/InlineAlert';
import { inputClass } from '../../../components/Field';
import { validateToken, submitCheckin, registrarConsentimento } from '../../../services/patientPortalService';
import { zonaDor, COR_ZONA, descricaoDor } from '../../../utils/painLevelColor';
import { comprimirFoto } from '../../../utils/comprimirFoto';

const LIMITE_FOTOS = 3;

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

// ─── Termo de consentimento (LGPD) ─────────────────────────────────────────
// Aparece no primeiro acesso ao link, antes de qualquer dado de saúde ser enviado.
// Os dois aceites são separados: o termo é obrigatório; o lembrete é escolha livre e começa desmarcado.
function TermoConsentimento({ token, dados, onAceito }) {
  const [concordo, setConcordo] = useState(false);
  const [lembretes, setLembretes] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const profissional = dados.profissional?.nome ?? 'seu profissional de saúde';

  async function continuar(e) {
    e.preventDefault();
    if (!concordo) { setErro('Para continuar, marque que leu e concorda.'); return; }
    setEnviando(true);
    setErro('');
    try {
      await registrarConsentimento(token, lembretes);
      onAceito();
    } catch (err) {
      setErro(err.response?.data?.message || 'Não foi possível registrar. Tente novamente.');
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={continuar} noValidate className="space-y-8">
      <header>
        <p className="text-base text-neutral-600">Olá, {dados.paciente?.nome}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Antes de começar</h1>
      </header>

      <section className="space-y-4 text-base leading-relaxed text-ink">
        <p>
          Por aqui você conta todos os dias como está a sua recuperação.
          Quem recebe essas informações é <strong>{profissional}</strong>.
        </p>
        <ul className="space-y-3">
          {[
            'Seu nível de dor, as orientações que você cumpriu e o que escrever.',
            'Fotos da região tratada, se você quiser enviar.',
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <Check size={20} strokeWidth={2} className="mt-0.5 flex-shrink-0 text-ink" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-3 rounded-xl border border-line bg-neutral-50 p-4 text-sm text-neutral-700">
          <ShieldCheck size={20} strokeWidth={1.75} className="flex-shrink-0 text-ink" aria-hidden="true" />
          <p>
            São dados de saúde, protegidos pela LGPD. Só o seu profissional vê, e eles servem apenas para o seu
            acompanhamento. Você pode pedir a ele para ver, corrigir ou apagar seus dados.
          </p>
        </div>
      </section>

      <fieldset className="space-y-4">
        <legend className="sr-only">Autorizações</legend>
        <label className="flex cursor-pointer items-start gap-3 text-base text-ink">
          <input type="checkbox" checked={concordo} onChange={(e) => { setConcordo(e.target.checked); setErro(''); }} className="mt-0.5 h-6 w-6 flex-shrink-0 cursor-pointer accent-ink" />
          <span>
            Li e concordo com a{' '}
            <Link to="/privacidade" target="_blank" className="font-medium underline underline-offset-2">Política de Privacidade</Link>.
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-base text-ink">
          <input type="checkbox" checked={lembretes} onChange={(e) => setLembretes(e.target.checked)} className="mt-0.5 h-6 w-6 flex-shrink-0 cursor-pointer accent-ink" />
          <span>
            Quero receber um lembrete pelo WhatsApp quando esquecer o check-in do dia.
            <span className="block text-sm text-neutral-600">Opcional. Você pode desligar quando quiser, nesta mesma página.</span>
          </span>
        </label>
      </fieldset>

      <div className="space-y-3">
        {erro && <InlineAlert>{erro}</InlineAlert>}
        <Button type="submit" size="xl" loading={enviando} className="w-full">
          {enviando ? 'Registrando…' : 'Continuar'}
        </Button>
      </div>
    </form>
  );
}

// ─── Ligar ou desligar lembretes ───────────────────────────────────────────
// Retirar o consentimento tem que ser tão fácil quanto dar (LGPD art. 8º, §5º).
// Cada mudança vira um novo registro de consentimento, com data.
function PreferenciaLembrete({ token, aceita, onMudou }) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  async function alternar() {
    setSalvando(true);
    setErro('');
    try {
      await registrarConsentimento(token, !aceita);
      onMudou(!aceita);
    } catch {
      setErro('Não foi possível alterar agora. Tente de novo.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="mt-10 border-t border-line pt-5 text-sm text-neutral-600">
      <p>
        Lembrete diário pelo WhatsApp: <strong className="font-medium text-ink">{aceita ? 'ligado' : 'desligado'}</strong>.{' '}
        <button type="button" onClick={alternar} disabled={salvando} className="font-medium text-ink underline underline-offset-2 disabled:opacity-50">
          {salvando ? 'Salvando…' : aceita ? 'Desligar' : 'Ligar'}
        </button>
      </p>
      {erro && <p className="mt-1 text-red-700" role="alert">{erro}</p>}
    </div>
  );
}

// ─── Fotos opcionais do check-in ───────────────────────────────────────────
function SeletorFotos({ fotos, onChange }) {
  const inputRef = useRef(null);
  const [preparando, setPreparando] = useState(false);
  const [aviso, setAviso] = useState('');
  const [previas, setPrevias] = useState([]);

  // Pré-visualização a partir dos arquivos já reduzidos; libera a memória ao trocar
  useEffect(() => {
    const urls = fotos.map((f) => URL.createObjectURL(f));
    setPrevias(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [fotos]);

  async function adicionar(e) {
    const escolhidos = [...e.target.files].filter((f) => f.type.startsWith('image/'));
    e.target.value = '';
    if (!escolhidos.length) return;
    const espaco = LIMITE_FOTOS - fotos.length;
    setAviso(escolhidos.length > espaco ? `Você pode enviar até ${LIMITE_FOTOS} fotos. Ficaram as primeiras.` : '');
    setPreparando(true);
    const reduzidas = await Promise.all(escolhidos.slice(0, espaco).map(comprimirFoto));
    setPreparando(false);
    onChange([...fotos, ...reduzidas]);
  }

  return (
    <section aria-labelledby="titulo-fotos">
      <h2 id="titulo-fotos" className="text-lg font-semibold text-ink">
        Fotos <span className="text-base font-normal text-neutral-600">(opcional)</span>
      </h2>
      <p className="mt-1 text-base text-neutral-600">Se o seu profissional pediu, fotografe a região tratada com boa luz. Até {LIMITE_FOTOS} fotos.</p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {previas.map((url, i) => (
          <div key={url} className="relative aspect-square overflow-hidden rounded-xl border border-line bg-neutral-100">
            <img src={url} alt={`Foto ${i + 1} escolhida`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(fotos.filter((_, j) => j !== i))}
              aria-label={`Remover foto ${i + 1}`}
              className="absolute right-1.5 top-1.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink/80 text-white"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        ))}
        {fotos.length < LIMITE_FOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={preparando}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong text-sm font-medium text-ink transition-colors hover:bg-neutral-50 disabled:opacity-60"
          >
            <Camera size={24} strokeWidth={1.75} aria-hidden="true" />
            {preparando ? 'Preparando…' : 'Adicionar'}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={adicionar} className="sr-only" tabIndex={-1} aria-hidden="true" />
      {aviso && <p className="mt-2 text-sm text-neutral-600" role="status">{aviso}</p>}
    </section>
  );
}

// ─── Formulário do check-in ────────────────────────────────────────────────
function FormCheckin({ token, dadosPortal, onEnviado }) {
  const [tarefasMarcadas, setTarefasMarcadas] = useState({});
  const [nivelDor,        setNivelDor]        = useState(null);
  const [observacoes,     setObservacoes]     = useState('');
  const [fotos,           setFotos]           = useState([]);
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
        fotos,
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

      <SeletorFotos fotos={fotos} onChange={setFotos} />

      <div className="space-y-3">
        {erroForm && <InlineAlert>{erroForm}</InlineAlert>}
        <Button type="submit" size="xl" loading={enviando} className="w-full">
          {enviando ? (fotos.length ? 'Enviando check-in e fotos…' : 'Enviando check-in…') : 'Enviar check-in'}
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
      } else if (dados.status === 'consentimento_pendente') {
        setDadosPortal(dados);
        setStatusPortal('consentimento_pendente');
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

  const lembrete = dadosPortal?.aceitaLembretes !== undefined && (
    <PreferenciaLembrete
      token={token}
      aceita={dadosPortal.aceitaLembretes}
      onMudou={(aceitaLembretes) => setDadosPortal((d) => ({ ...d, aceitaLembretes }))}
    />
  );

  if (enviado && dadosPortal) {
    const primeiroNome = dadosPortal.paciente.nome?.split(' ')[0];
    return (
      <>
        <EstadoCentral icone={Check} destaque titulo="Check-in enviado">
          <p>Obrigado, {primeiroNome}. Seu relato do Dia {dadosPortal.recuperacao.diaAtual} foi registrado.</p>
          <p className="mt-3">Registre um check-in por dia para que seu profissional acompanhe a sua evolução.</p>
        </EstadoCentral>
        {lembrete}
      </>
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

  if (statusPortal === 'consentimento_pendente' && dadosPortal) {
    return <TermoConsentimento token={token} dados={dadosPortal} onAceito={carregarPortal} />;
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
        <>
          <EstadoCentral icone={Check} destaque titulo="Check-in de hoje enviado">
            Você já enviou o check-in do Dia {dadosPortal.recuperacao.diaAtual}. Volte amanhã para registrar o próximo.
          </EstadoCentral>
          {lembrete}
        </>
      );
    }
    return (
      <>
        <FormCheckin token={token} dadosPortal={dadosPortal} onEnviado={() => setEnviado(true)} />
        {lembrete}
      </>
    );
  }

  return null;
}
