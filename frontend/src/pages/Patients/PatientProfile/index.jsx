// Arquivo: src/pages/Patients/PatientProfile/index.jsx
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { ArrowLeft, Check, ChevronDown, Copy, Pencil, Play, RefreshCw, XCircle, ClipboardList } from 'lucide-react';
import Avatar from '../../../components/Avatar';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import ConfirmDialog from '../../../components/ConfirmDialog';
import EmptyState from '../../../components/EmptyState';
import Field, { inputClass } from '../../../components/Field';
import InlineAlert from '../../../components/InlineAlert';
import Modal from '../../../components/Modal';
import PainLevel from '../../../components/PainLevel';
import PainScale from '../../../components/PainScale';
import RecoveryStatusBadge from '../../../components/RecoveryStatusBadge';
import { createTreatment, updateTreatment } from '../../../services/treatmentService';
import { getProtocols } from '../../../services/protocolService';
import { usePatientProfile } from '../../../hooks/usePatientProfile';
import { calculatePatientStatus } from '../../../utils/recoveryStatus';
import { zonaDor, COR_ZONA } from '../../../utils/painLevelColor';
import { calcularIdade, formatarDataCivil, formatarDataHora, formatarRelativo } from '../../../utils/formatDate';

// Cor do número de dor sobre o bloco escuro (red-400 7,16:1 e amber-400 11,86:1 sobre ink)
const COR_DOR_NO_ESCURO = { critico: 'text-red-400', atencao: 'text-amber-400', normal: 'text-white', vazia: 'text-white' };

function Skeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="skeleton h-5 w-24" />
      <div className="flex items-center gap-4">
        <div className="skeleton h-14 w-14 rounded-full" />
        <div className="space-y-2"><div className="skeleton h-7 w-56" /><div className="skeleton h-4 w-40" /></div>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8"><div className="skeleton h-80 rounded-xl" /><div className="skeleton h-48 rounded-xl" /></div>
        <div className="space-y-5 lg:col-span-4"><div className="h-64 animate-pulse rounded-xl bg-neutral-300" /><div className="skeleton h-48 rounded-xl" /></div>
      </div>
    </div>
  );
}

// ─── Gráfico de evolução da dor ────────────────────────────────────────────
function TooltipDor({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg bg-ink px-3 py-2 text-xs text-white">
      <p className="font-semibold">Dia {d.dia}</p>
      <p className="text-neutral-400">{d.data}</p>
      <p className={`mt-1 text-sm font-semibold ${COR_DOR_NO_ESCURO[zonaDor(d.dor)]}`}>Dor {d.dor}/10</p>
    </div>
  );
}

function PontoDor({ cx, cy, payload }) {
  if (cx == null || cy == null) return null;
  return <circle cx={cx} cy={cy} r={4.5} fill={COR_ZONA[zonaDor(payload.dor)].grafico} stroke="#FFFFFF" strokeWidth={2} />;
}

function GraficoDor({ checkins }) {
  const data = checkins.map(c => ({ dia: c.diaRecuperacao, label: `D${c.diaRecuperacao}`, dor: c.nivelDor, data: formatarDataHora(c.enviadoEm) }));
  const resumo = checkins.map(c => `dia ${c.diaRecuperacao}: ${c.nivelDor}`).join(', ');

  return (
    <figure>
      <div className="h-64" role="img" aria-label={`Evolução da dor por dia de recuperação — ${resumo}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
            <ReferenceArea y1={7} y2={10} fill="#FEF2F2" fillOpacity={1} />
            <CartesianGrid vertical={false} stroke="#E5E5E5" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#737373' }} axisLine={false} tickLine={false} dy={6} />
            <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 12, fill: '#737373' }} axisLine={false} tickLine={false} width={36} />
            <Tooltip content={<TooltipDor />} cursor={{ stroke: '#A3A3A3', strokeDasharray: '3 3' }} />
            <Line type="monotone" dataKey="dor" stroke="#0A0A0A" strokeWidth={2} dot={<PontoDor />} activeDot={{ r: 6, fill: '#0A0A0A', stroke: '#FFFFFF', strokeWidth: 2 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-3 flex items-center gap-2 text-xs text-neutral-600">
        <span className="h-3 w-3 rounded-sm border border-red-200 bg-red-50" aria-hidden="true" />
        Faixa de dor 7 ou mais
      </figcaption>
    </figure>
  );
}

// ─── Histórico de check-ins ────────────────────────────────────────────────
function LinhaCheckin({ checkin }) {
  const [aberto, setAberto] = useState(false);
  const feitas = checkin.respostas?.filter(r => r.concluido).length ?? 0;
  const total = checkin.respostas?.length ?? 0;
  const idPainel = `checkin-${checkin.id}`;

  return (
    <li>
      <button
        type="button"
        onClick={() => setAberto(v => !v)}
        aria-expanded={aberto}
        aria-controls={idPainel}
        className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-neutral-50 focus-visible:-outline-offset-2"
      >
        <PainLevel nivel={checkin.nivelDor} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">Dia {checkin.diaRecuperacao}</p>
          <p className="text-sm text-neutral-500">{formatarDataHora(checkin.enviadoEm)}</p>
        </div>
        {total > 0 && <span className="hidden text-sm text-neutral-600 tabular-nums sm:inline">{feitas} de {total} orientaç{total !== 1 ? 'ões' : 'ão'}</span>}
        {checkin.observacoes && <span className="hidden rounded-full border border-line px-2 py-0.5 text-xs text-neutral-600 md:inline">Com observação</span>}
        <ChevronDown size={16} strokeWidth={1.75} className={`flex-shrink-0 text-neutral-500 transition-transform ${aberto ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {aberto && (
        <div id={idPainel} className="space-y-4 bg-neutral-50 px-5 pb-5 pt-4">
          {checkin.observacoes ? (
            <blockquote className="border-l-2 border-ink pl-3 text-sm leading-relaxed text-ink">“{checkin.observacoes}”</blockquote>
          ) : (
            <p className="text-sm text-neutral-500">Sem observação.</p>
          )}
          {total > 0 && (
            <ul className="space-y-2">
              {checkin.respostas.map((r, i) => (
                <li key={r.id ?? i} className="flex items-start gap-3 text-sm">
                  <span
                    className={`mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full
                      ${r.concluido ? 'bg-ink text-white' : 'border border-line-strong bg-white'}`}
                    aria-hidden="true"
                  >
                    {r.concluido && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className={r.concluido ? 'text-ink' : 'text-neutral-600'}>
                    {r.tarefaDiaProtocolo?.descricao ?? `Tarefa ${i + 1}`}
                    <span className="sr-only">{r.concluido ? ' — feita' : ' — não feita'}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

function Historico({ checkins, loading, erro, onRefresh }) {
  return (
    <Card
      padded={false}
      title="Check-ins"
      description={checkins.length ? `${checkins.length} recebido${checkins.length !== 1 ? 's' : ''}` : undefined}
      actions={
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCw size={14} strokeWidth={1.75} aria-hidden="true" />
          Atualizar
        </Button>
      }
    >
      {loading ? (
        <div className="space-y-2 p-5" aria-busy="true">{[1, 2, 3].map(i => <div key={i} className="skeleton h-12" />)}</div>
      ) : erro ? (
        <div className="p-5"><InlineAlert action={<Button size="sm" variant="secondary" onClick={onRefresh}>Tentar novamente</Button>}>{erro}</InlineAlert></div>
      ) : checkins.length === 0 ? (
        <p className="px-5 py-8 text-sm text-neutral-600">Nenhum check-in recebido ainda. Se o paciente já enviou, clique em Atualizar.</p>
      ) : (
        <ul className="divide-y divide-line">{[...checkins].reverse().map(c => <LinhaCheckin key={c.id} checkin={c} />)}</ul>
      )}
    </Card>
  );
}

// ─── Blocos da coluna lateral ──────────────────────────────────────────────
function BlocoRecuperacao({ tratamento, ultimoCheckin }) {
  const ativo = tratamento.status === 'ativo';
  const progresso = Math.min((tratamento.diaAtual / tratamento.totalDias) * 100, 100);
  const nivel = ultimoCheckin?.nivelDor ?? null;

  return (
    <section aria-label="Recuperação" className="on-dark rounded-xl bg-ink p-5 text-white sm:p-6">
      <p className="text-sm text-neutral-400">{ativo ? 'Recuperação' : 'Tratamento encerrado'}</p>
      <p className="mt-3 flex items-baseline gap-2 leading-none">
        <span className="text-base text-neutral-400">Dia</span>
        <span className="text-6xl font-semibold tracking-tight tabular-nums">{tratamento.diaAtual}</span>
        <span className="text-sm text-neutral-400 tabular-nums">de {tratamento.totalDias}</span>
      </p>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-neutral-800" role="progressbar" aria-label="Progresso do protocolo" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progresso)}>
        <div className="h-full rounded-full bg-white" style={{ width: `${progresso}%` }} />
      </div>

      <div className="mt-6 border-t border-neutral-800 pt-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-neutral-400">Dor no último check-in</p>
            <p className={`mt-1 text-4xl font-semibold leading-none tabular-nums ${COR_DOR_NO_ESCURO[zonaDor(nivel)]}`}>
              {nivel ?? '—'}<span className="text-base font-normal text-neutral-400">/10</span>
            </p>
          </div>
          <p className="text-right text-sm text-neutral-400">
            {ultimoCheckin ? <>Dia {ultimoCheckin.diaRecuperacao}<br />{formatarRelativo(ultimoCheckin.enviadoEm)}</> : 'Nenhum check-in'}
          </p>
        </div>
        <div className="mt-4"><PainScale nivel={nivel} tone="escuro" /></div>
      </div>
    </section>
  );
}

function ListaDados({ itens }) {
  return (
    <dl className="divide-y divide-line">
      {itens.filter(Boolean).map(({ termo, valor }) => (
        <div key={termo} className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
          <dt className="text-sm text-neutral-500">{termo}</dt>
          <dd className="min-w-0 text-right text-sm text-ink">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

// ─── Modais ────────────────────────────────────────────────────────────────
function ModalVincular({ isOpen, pacienteId, onClose, onSuccess }) {
  const [prots,  setProts]  = useState([]);
  const [load,   setLoad]   = useState(false);
  const [form,   setForm]   = useState({ protocoloId: '', nomeProcedimento: '', dataProcedimento: '' });
  const [saving, setSaving] = useState(false);
  const [erro,   setErro]   = useState('');

  // useEffect (não useState) para carregar protocolos ao abrir o modal
  useEffect(() => {
    if (!isOpen) return;
    setLoad(true); setErro(''); setForm({ protocoloId: '', nomeProcedimento: '', dataProcedimento: '' });
    getProtocols().then(d => setProts(d.filter(p => p.ativo) ?? [])).catch(() => setErro('Erro ao carregar protocolos.')).finally(() => setLoad(false));
  }, [isOpen]);

  async function submit(e) {
    e.preventDefault();
    if (!form.protocoloId || !form.nomeProcedimento || !form.dataProcedimento) { setErro('Preencha todos os campos.'); return; }
    setSaving(true); setErro('');
    try {
      await createTreatment({ pacienteId, protocoloId: form.protocoloId, nomeProcedimento: form.nomeProcedimento.trim(), dataProcedimento: form.dataProcedimento });
      onSuccess(); onClose();
    } catch (err) { setErro(err.response?.data?.message || 'Erro ao iniciar tratamento.'); }
    finally { setSaving(false); }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Iniciar tratamento">
      <form onSubmit={submit} noValidate className="space-y-4">
        {load ? <div className="skeleton h-16" /> : prots.length === 0 ? (
          <InlineAlert tone="neutro">
            Nenhum protocolo ativo. <Link to="/protocols/new" className="underline underline-offset-2">Criar protocolo</Link>
          </InlineAlert>
        ) : (
          <Field label="Protocolo">
            <select value={form.protocoloId} onChange={e => setForm(p => ({ ...p, protocoloId: e.target.value }))} className={inputClass(false, { className: 'cursor-pointer' })}>
              <option value="">Selecione</option>
              {prots.map(p => <option key={p.id} value={p.id}>{p.nome} ({p.diasPadrao} dias)</option>)}
            </select>
          </Field>
        )}
        <Field label="Nome do procedimento">
          <input type="text" placeholder="Ex.: Extração de sisos" value={form.nomeProcedimento} onChange={e => setForm(p => ({ ...p, nomeProcedimento: e.target.value }))} className={inputClass()} />
        </Field>
        <Field label="Data do procedimento" hint="O Dia 1 da recuperação é a data do procedimento.">
          <input type="date" max={new Date().toISOString().split('T')[0]} value={form.dataProcedimento} onChange={e => setForm(p => ({ ...p, dataProcedimento: e.target.value }))} className={inputClass()} />
        </Field>
        {erro && <InlineAlert>{erro}</InlineAlert>}
        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={saving} disabled={prots.length === 0}>
            {!saving && <Play size={15} strokeWidth={1.75} aria-hidden="true" />}
            {saving ? 'Iniciando…' : 'Iniciar tratamento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ModalEditarProcedimento({ isOpen, tratamento, onClose, onSuccess }) {
  const [nome, setNome] = useState('');
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');

  // useEffect (não useState)
  useEffect(() => { if (isOpen && tratamento) { setNome(tratamento.nomeProcedimento ?? ''); setErro(''); } }, [isOpen, tratamento]);

  async function submit(e) {
    e.preventDefault();
    if (!nome.trim()) { setErro('Informe o nome do procedimento.'); return; }
    setSaving(true); setErro('');
    try { await updateTreatment(tratamento.id, { nomeProcedimento: nome.trim() }); onSuccess(); onClose(); }
    catch (err) { setErro(err.response?.data?.message || 'Erro ao salvar.'); }
    finally { setSaving(false); }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar procedimento" size="sm">
      <form onSubmit={submit} noValidate className="space-y-4">
        <p className="text-sm text-neutral-600">Protocolo: <span className="font-medium text-ink">{tratamento?.versaoProtocolo?.protocolo?.nome ?? '—'}</span></p>
        <Field label="Nome do procedimento">
          <input type="text" value={nome} onChange={e => setNome(e.target.value)} className={inputClass()} />
        </Field>
        {erro && <InlineAlert>{erro}</InlineAlert>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={saving}>{saving ? 'Salvando…' : 'Salvar'}</Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Página ────────────────────────────────────────────────────────────────
export default function PatientProfile() {
  const { id } = useParams();
  const { paciente, tratamento, checkins, loading, loadingCheckins, erro, erroCheckins, refetch, refetchCheckins } = usePatientProfile(id);
  const [modalVincular, setModalVincular] = useState(false);
  const [modalEditar,   setModalEditar]   = useState(false);
  const [modalEncerrar, setModalEncerrar] = useState(false);
  const [copia,         setCopia]         = useState('');

  if (loading) return <Skeleton />;
  if (erro) return (
    <div className="space-y-6">
      <Link to="/patients" className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-ink"><ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />Pacientes</Link>
      <InlineAlert action={<Button size="sm" variant="secondary" onClick={refetch}>Tentar novamente</Button>}>{erro}</InlineAlert>
    </div>
  );
  if (!paciente) return null;

  const ultimoCheckin = checkins.length > 0 ? checkins[checkins.length - 1] : null;
  const idade = calcularIdade(paciente.dataNascimento);
  const ativo = tratamento?.status === 'ativo';
  const statusClinico = !tratamento ? 'sem_tratamento' : !ativo ? 'encerrado' : calculatePatientStatus(ultimoCheckin);
  const linkPaciente = tratamento?.tokenPaciente ? `${window.location.origin}/p/${tratamento.tokenPaciente}` : null;

  function copiarLink() {
    navigator.clipboard.writeText(linkPaciente)
      .then(() => { setCopia('ok'); setTimeout(() => setCopia(''), 2000); })
      .catch(() => setCopia('erro'));
  }

  return (
    <div className="space-y-6">
      <Link to="/patients" className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 transition-colors hover:text-ink">
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
        Pacientes
      </Link>

      <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar nome={paciente.nome} size="lg" tone="escuro" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{paciente.nome}</h1>
              <RecoveryStatusBadge status={statusClinico} />
            </div>
            <p className="mt-1 text-sm text-neutral-600">
              {tratamento ? tratamento.nomeProcedimento : 'Sem tratamento'}
              {idade !== null && ` · ${idade} anos`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {ativo ? (
            <>
              <Button variant="secondary" onClick={copiarLink}>
                {copia === 'ok' ? <Check size={16} strokeWidth={2} aria-hidden="true" /> : <Copy size={16} strokeWidth={1.75} aria-hidden="true" />}
                {copia === 'ok' ? 'Link copiado' : 'Copiar link do paciente'}
              </Button>
              <Button variant="secondary" onClick={() => setModalEditar(true)}>
                <Pencil size={15} strokeWidth={1.75} aria-hidden="true" />
                Editar procedimento
              </Button>
              <Button variant="secondary" onClick={() => setModalEncerrar(true)} className="hover:border-red-600 hover:text-red-700">
                <XCircle size={16} strokeWidth={1.75} aria-hidden="true" />
                Encerrar
              </Button>
            </>
          ) : (
            <Button onClick={() => setModalVincular(true)}>
              <Play size={15} strokeWidth={1.75} aria-hidden="true" />
              {tratamento ? 'Iniciar novo tratamento' : 'Iniciar tratamento'}
            </Button>
          )}
        </div>
      </header>

      {copia === 'erro' && (
        <InlineAlert tone="neutro">Não foi possível copiar automaticamente. Link do paciente: <span className="break-all font-normal">{linkPaciente}</span></InlineAlert>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="min-w-0 space-y-5 lg:col-span-8">
          {tratamento ? (
            <>
              <Card title="Evolução da dor" description="Nível informado pelo paciente em cada check-in">
                {checkins.length > 0
                  ? <GraficoDor checkins={checkins} />
                  : <p className="py-10 text-center text-sm text-neutral-600">O gráfico aparece a partir do primeiro check-in.</p>}
              </Card>
              <Historico checkins={checkins} loading={loadingCheckins} erro={erroCheckins} onRefresh={refetchCheckins} />
            </>
          ) : (
            <Card>
              <EmptyState
                icon={ClipboardList}
                title="Nenhum tratamento"
                subtitle="Inicie um tratamento para gerar o link do paciente e começar a receber check-ins."
                action={<Button onClick={() => setModalVincular(true)}><Play size={15} strokeWidth={1.75} aria-hidden="true" />Iniciar tratamento</Button>}
              />
            </Card>
          )}
        </div>

        <aside className="space-y-5 lg:col-span-4" aria-label="Resumo do paciente">
          {tratamento && <BlocoRecuperacao tratamento={tratamento} ultimoCheckin={ultimoCheckin} />}

          <Card title="Paciente">
            <ListaDados itens={[
              { termo: 'Idade',      valor: idade !== null ? `${idade} anos` : '—' },
              { termo: 'Nascimento', valor: formatarDataCivil(paciente.dataNascimento) },
              { termo: 'Telefone',   valor: paciente.telefone ? <a href={`tel:${paciente.telefone.replace(/\D/g, '')}`} className="underline-offset-2 hover:underline">{paciente.telefone}</a> : '—' },
              paciente.email && { termo: 'E-mail', valor: <span className="break-all">{paciente.email}</span> },
            ]} />
            {paciente.observacoes && (
              <div className="mt-4 border-t border-line pt-4">
                <p className="text-sm text-neutral-500">Observações</p>
                <p className="mt-1 text-sm leading-relaxed text-ink">{paciente.observacoes}</p>
              </div>
            )}
          </Card>

          {tratamento && (
            <Card title="Tratamento">
              <ListaDados itens={[
                { termo: 'Procedimento', valor: tratamento.nomeProcedimento },
                { termo: 'Protocolo',    valor: `${tratamento.versaoProtocolo?.protocolo?.nome ?? '—'} · v${tratamento.versaoProtocolo?.versao ?? 1}` },
                { termo: 'Data',         valor: formatarDataCivil(tratamento.dataProcedimento) },
                { termo: 'Situação',     valor: ativo ? 'Em andamento' : 'Encerrado' },
              ]} />
            </Card>
          )}
        </aside>
      </div>

      <ModalVincular isOpen={modalVincular} pacienteId={id} onClose={() => setModalVincular(false)} onSuccess={refetch} />
      <ModalEditarProcedimento isOpen={modalEditar} tratamento={tratamento} onClose={() => setModalEditar(false)} onSuccess={refetch} />
      <ConfirmDialog
        isOpen={modalEncerrar}
        titulo="Encerrar tratamento"
        descricao="Ao encerrar, o link do paciente é desativado e novos check-ins não poderão ser enviados."
        labelConfirmar="Encerrar tratamento"
        tom="danger"
        onClose={() => setModalEncerrar(false)}
        onConfirmar={async () => { await updateTreatment(tratamento.id, { status: 'finalizado' }); refetch(); }}
      />
    </div>
  );
}
