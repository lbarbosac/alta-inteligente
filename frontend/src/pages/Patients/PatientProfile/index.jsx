// Arquivo: src/pages/Patients/PatientProfile/index.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ArrowLeft, Phone, Calendar, Copy, ClipboardList, XCircle, CheckCircle2, Link as LinkIcon, User, Loader2, RefreshCw, AlertCircle, Play, Save, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import PainScale from '../../../components/PainScale';
import RecoveryStatusBadge from '../../../components/RecoveryStatusBadge';
import Modal from '../../../components/Modal';
import { createTreatment, updateTreatment } from '../../../services/treatmentService';
import { getProtocols } from '../../../services/protocolService';
import { usePatientProfile } from '../../../hooks/usePatientProfile';

const getInitials = n => { const p=n?.trim().split(' ').filter(Boolean)??[]; return !p.length?'?':p.length===1?p[0][0].toUpperCase():(p[0][0]+p[p.length-1][0]).toUpperCase(); };
const calcularIdade = d => { if(!d)return null; const h=new Date(),n=new Date(d); let i=h.getFullYear()-n.getFullYear(); const m=h.getMonth()-n.getMonth(); if(m<0||(m===0&&h.getDate()<n.getDate()))i--; return i; };
const fmtData = d => d?new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(d)):'—';
const fmtHora = d => d?new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(d)):'—';
const dorColor = n => !n?'#94a3b8':n<=3?'#10b981':n<=6?'#f59e0b':n<=8?'#f97316':'#ef4444';
const INPUT = `w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-300 outline-none transition-all focus:border-slate-950 focus:ring-2 focus:ring-slate-950/8`;

function Skeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
      <div className="h-5 w-32 skeleton"/>
      <div className="bg-white border border-slate-100 rounded-2xl p-6"><div className="flex items-center gap-5"><div className="w-16 h-16 rounded-2xl skeleton flex-shrink-0"/><div className="flex-1 space-y-3"><div className="h-5 w-48 skeleton"/><div className="h-4 w-32 skeleton"/></div></div></div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-5">{[1,2,3].map(i=><div key={i} className="h-40 bg-white border border-slate-100 rounded-2xl skeleton"/>)}</div>
        <div className="xl:col-span-2 space-y-4"><div className="h-60 bg-white border border-slate-100 rounded-2xl skeleton"/><div className="h-48 bg-white border border-slate-100 rounded-2xl skeleton"/></div>
      </div>
    </div>
  );
}

function TooltipDor({ active, payload }) {
  if (!active||!payload?.length) return null;
  const d=payload[0].payload;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-float px-4 py-3 text-xs">
      <p className="font-semibold text-slate-800">Dia {d.dia}</p>
      <p className="text-slate-500 mt-0.5">{d.data}</p>
      <p className="font-bold mt-1" style={{color:dorColor(d.dor)}}>Dor: {d.dor}/10</p>
    </div>
  );
}

function GraficoDor({ checkins }) {
  if (!checkins.length) return null;
  const data = checkins.map(c=>({dia:c.diaRecuperacao,label:`D${c.diaRecuperacao}`,dor:c.nivelDor,data:fmtHora(c.enviadoEm)}));
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2"><Activity size={16} strokeWidth={1.5} className="text-slate-400"/><h2 className="text-slate-950 text-sm font-semibold">Evolução da Dor</h2></div>
        <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500">
          {[['bg-emerald-500','1–3'],['bg-amber-500','4–6'],['bg-orange-500','7–8'],['bg-red-500','9–10']].map(([c,l])=>(
            <span key={l} className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${c} inline-block`}/>{l}</span>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{top:8,right:8,left:-20,bottom:0}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
          <XAxis dataKey="label" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
          <YAxis domain={[0,10]} tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false} ticks={[0,2,4,6,8,10]}/>
          <Tooltip content={<TooltipDor/>}/>
          <ReferenceLine y={3} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.4}/>
          <ReferenceLine y={6} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.4}/>
          <ReferenceLine y={8} stroke="#f97316" strokeDasharray="4 4" strokeOpacity={0.4}/>
          <Line type="monotone" dataKey="dor" stroke="#0f172a" strokeWidth={2.5}
            dot={({cx,cy,payload})=><circle key={payload.label} cx={cx} cy={cy} r={5} fill={dorColor(payload.dor)} stroke="white" strokeWidth={2}/>}
            activeDot={{r:7,stroke:'white',strokeWidth:2}}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function CheckinCard({ checkin }) {
  const [aberto,setAberto]=useState(false);
  const ok=checkin.respostas?.filter(r=>r.concluido).length??0;
  const total=checkin.respostas?.length??0;
  const cor=dorColor(checkin.nivelDor);
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
      <button type="button" onClick={()=>setAberto(v=>!v)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors text-left">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-950 text-white text-xs font-bold flex-shrink-0">D{checkin.diaRecuperacao}</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold" style={{background:cor+'15',color:cor,border:`1px solid ${cor}30`}}>{checkin.nivelDor}/10</span>
          {total>0&&<span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ok===total?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-600'}`}>{ok}/{total} tarefas</span>}
          <span className="text-slate-400 text-xs font-light">{fmtHora(checkin.enviadoEm)}</span>
        </div>
        {aberto?<ChevronUp size={15} strokeWidth={1.5} className="text-slate-400 flex-shrink-0"/>:<ChevronDown size={15} strokeWidth={1.5} className="text-slate-400 flex-shrink-0"/>}
      </button>
      {aberto&&(
        <div className="border-t border-slate-50 px-5 pb-5 pt-4 space-y-4 bg-slate-50/30">
          {checkin.observacoes
            ?<div className="space-y-1"><p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Observação</p><p className="text-slate-700 text-sm font-light leading-relaxed bg-white border border-slate-100 rounded-xl px-4 py-3">"{checkin.observacoes}"</p></div>
            :<p className="text-slate-400 text-xs font-light italic">Nenhuma observação registrada.</p>}
          {checkin.respostas?.length>0&&(
            <div className="space-y-2">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Orientações</p>
              <ul className="space-y-1.5">
                {checkin.respostas.map((r,i)=>(
                  <li key={r.id??i} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${r.concluido?'bg-emerald-500':'bg-slate-200'}`}>
                      {r.concluido?<CheckCircle2 size={12} strokeWidth={2.5} className="text-white"/>:<XCircle size={12} strokeWidth={2} className="text-slate-400"/>}
                    </div>
                    <span className={`text-sm leading-snug ${r.concluido?'text-slate-700':'text-slate-400 line-through'}`}>{r.tarefaDiaProtocolo?.descricao??`Tarefa ${i+1}`}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Historico({ checkins, loading, erro, onRefresh }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-slate-950 text-sm font-semibold">Histórico de Check-ins</h2>
        <button type="button" onClick={onRefresh} className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium hover:text-slate-800 transition-colors">
          <RefreshCw size={13} strokeWidth={1.5}/>Atualizar
        </button>
      </div>
      {loading?(
        <div className="space-y-3 animate-pulse">{[1,2,3].map(i=><div key={i} className="h-16 bg-white border border-slate-100 rounded-2xl skeleton"/>)}</div>
      ):erro?(
        <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center space-y-2">
          <AlertCircle size={22} strokeWidth={1.5} className="text-red-400 mx-auto"/>
          <p className="text-slate-600 text-sm font-medium">{erro}</p>
          <button type="button" onClick={onRefresh} className="text-xs text-slate-950 font-semibold underline underline-offset-2">Tentar novamente</button>
        </div>
      ):checkins.length===0?(
        <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center">
          <ClipboardList size={22} strokeWidth={1.5} className="text-slate-300 mx-auto mb-2"/>
          <p className="text-slate-400 text-sm font-light">Nenhum check-in recebido ainda.</p>
          <p className="text-slate-400 text-xs font-light mt-1">Se o paciente já enviou, clique em "Atualizar".</p>
        </div>
      ):(
        <div className="space-y-3">{[...checkins].reverse().map(c=><CheckinCard key={c.id} checkin={c}/>)}</div>
      )}
    </div>
  );
}

function AcoesCardSemTratamento({ onVincular }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-5 space-y-3">
      <h3 className="text-slate-950 text-sm font-semibold">Ações Rápidas</h3>
      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl"><p className="text-amber-800 text-xs font-medium leading-relaxed">Paciente sem protocolo ativo. Inicie um tratamento para ativar o portal.</p></div>
      <button type="button" onClick={onVincular} className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 active:scale-[0.98] transition-all">
        <Play size={15} strokeWidth={1.5}/>Vincular Protocolo / Iniciar Tratamento
      </button>
    </div>
  );
}

function AcoesCardComTratamento({ tratamento, onAjustar, onEncerrar }) {
  const [copiado,setCopiado]=useState(false);
  const tokenLink=tratamento.tokenPaciente?`${window.location.origin}/p/${tratamento.tokenPaciente}`:null;
  function copiar(){navigator.clipboard.writeText(tokenLink).then(()=>{setCopiado(true);setTimeout(()=>setCopiado(false),2000);});}
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-5 space-y-3">
      <h3 className="text-slate-950 text-sm font-semibold">Ações Rápidas</h3>
      <button type="button" onClick={copiar} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left group">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-200 transition-colors"><Copy size={14} strokeWidth={1.5} className="text-slate-600"/></div>
        <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-800">{copiado?'✓ Link copiado!':'Copiar link do paciente'}</p><p className="text-[11px] text-slate-400 font-light truncate">{tokenLink}</p></div>
        <LinkIcon size={13} strokeWidth={1.5} className="text-slate-300 flex-shrink-0"/>
      </button>
      <button type="button" onClick={onAjustar} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left group">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-200 transition-colors"><ClipboardList size={14} strokeWidth={1.5} className="text-slate-600"/></div>
        <p className="text-sm font-medium text-slate-800">Ajustar Protocolo</p>
      </button>
      <button type="button" onClick={onEncerrar} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-100 hover:border-red-200 hover:bg-red-50 transition-all text-left group">
        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors"><XCircle size={14} strokeWidth={1.5} className="text-red-500"/></div>
        <p className="text-sm font-medium text-red-700">Encerrar tratamento</p>
      </button>
    </div>
  );
}

function ModalVincular({ isOpen, pacienteId, onClose, onSuccess }) {
  const [prots,setProts]=useState([]);
  const [load,setLoad]=useState(false);
  const [form,setForm]=useState({protocoloId:'',nomeProcedimento:'',dataProcedimento:''});
  const [saving,setSaving]=useState(false);
  const [erro,setErro]=useState('');

  // FIX: useEffect (não useState) para carregar protocolos ao abrir modal
  useEffect(()=>{
    if(!isOpen)return;
    setLoad(true);setErro('');setForm({protocoloId:'',nomeProcedimento:'',dataProcedimento:''});
    getProtocols().then(d=>setProts(d.filter(p=>p.ativo)??[])).catch(()=>setErro('Erro ao carregar protocolos.')).finally(()=>setLoad(false));
  },[isOpen]);

  async function submit(e){
    e.preventDefault();
    if(!form.protocoloId||!form.nomeProcedimento||!form.dataProcedimento){setErro('Preencha todos os campos.');return;}
    setSaving(true);setErro('');
    try{await createTreatment({pacienteId,protocoloId:form.protocoloId,nomeProcedimento:form.nomeProcedimento.trim(),dataProcedimento:form.dataProcedimento});onSuccess();onClose();}
    catch(err){setErro(err.response?.data?.message||'Erro ao iniciar tratamento.');}
    finally{setSaving(false);}
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vincular Protocolo / Iniciar Tratamento">
      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Protocolo *</label>
          {load?<div className="h-12 skeleton rounded-xl"/>:prots.length===0
            ?<div className="p-3.5 bg-amber-50 border border-amber-100 rounded-xl"><p className="text-amber-800 text-xs font-medium">Nenhum protocolo ativo. <a href="/protocols/new" className="underline font-semibold">Criar protocolo</a></p></div>
            :<select value={form.protocoloId} onChange={e=>setForm(p=>({...p,protocoloId:e.target.value}))} className={`${INPUT} cursor-pointer`}>
              <option value="">Selecione…</option>
              {prots.map(p=><option key={p.id} value={p.id}>{p.nome} ({p.diasPadrao} dias)</option>)}
            </select>}
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Nome do Procedimento *</label>
          <input type="text" placeholder="Ex: Extração de sisos" value={form.nomeProcedimento} onChange={e=>setForm(p=>({...p,nomeProcedimento:e.target.value}))} className={INPUT}/>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Data do Procedimento *</label>
          <input type="date" max={new Date().toISOString().split('T')[0]} value={form.dataProcedimento} onChange={e=>setForm(p=>({...p,dataProcedimento:e.target.value}))} className={INPUT}/>
          <p className="text-xs text-slate-400 font-light">Dia 1 = data desta cirurgia.</p>
        </div>
        {erro&&<div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 rounded-xl"><div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"/><p className="text-sm text-red-700 font-medium">{erro}</p></div>}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={saving||prots.length===0} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all">
            {saving?<><Loader2 size={15} strokeWidth={2} className="animate-spin"/>Iniciando…</>:<><Play size={15} strokeWidth={1.5}/>Iniciar Tratamento</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ModalAjustar({ isOpen, tratamento, onClose, onSuccess }) {
  const [nome,setNome]=useState('');const[saving,setSaving]=useState(false);const[erro,setErro]=useState('');

  // FIX: useEffect (não useState)
  useEffect(()=>{if(isOpen&&tratamento){setNome(tratamento.nomeProcedimento??'');setErro('');}},[isOpen,tratamento]);

  async function submit(e){e.preventDefault();if(!nome.trim()){setErro('Nome obrigatório.');return;}setSaving(true);setErro('');try{await updateTreatment(tratamento.id,{nomeProcedimento:nome.trim()});onSuccess();onClose();}catch(err){setErro(err.response?.data?.message||'Erro.');}finally{setSaving(false);}}
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajustar Protocolo">
      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl"><p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Protocolo</p><p className="text-slate-800 text-sm font-semibold mt-0.5">{tratamento?.versaoProtocolo?.protocolo?.nome??'—'}</p></div>
        <div className="space-y-1.5"><label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Nome do Procedimento</label><input type="text" value={nome} onChange={e=>setNome(e.target.value)} className={INPUT}/></div>
        {erro&&<div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 rounded-xl"><div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"/><p className="text-sm text-red-700 font-medium">{erro}</p></div>}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all">
            {saving?<><Loader2 size={15} strokeWidth={2} className="animate-spin"/>Salvando…</>:<><Save size={15} strokeWidth={1.5}/>Salvar</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ModalEncerrar({ isOpen, tratamento, onClose, onSuccess }) {
  const [enc,setEnc]=useState(false);const[erro,setErro]=useState('');
  async function handle(){setEnc(true);setErro('');try{await updateTreatment(tratamento.id,{status:'finalizado'});onSuccess();onClose();}catch(err){setErro(err.response?.data?.message||'Erro.');}finally{setEnc(false);}}
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Encerrar Tratamento" size="sm">
      <div className="space-y-4">
        <p className="text-slate-600 text-sm font-light leading-relaxed">Ao encerrar, o link do paciente será desativado e check-ins não poderão mais ser enviados.</p>
        {erro&&<div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 rounded-xl"><div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"/><p className="text-sm text-red-700 font-medium">{erro}</p></div>}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
          <button type="button" onClick={handle} disabled={enc} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-all">
            {enc?<><Loader2 size={15} strokeWidth={2} className="animate-spin"/>Encerrando…</>:<><XCircle size={15} strokeWidth={1.5}/>Encerrar</>}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { paciente, tratamento, checkins, loading, loadingCheckins, erro, erroCheckins, refetch, refetchCheckins } = usePatientProfile(id);
  const [modalVincular,setModalVincular]=useState(false);
  const [modalAjustar, setModalAjustar] =useState(false);
  const [modalEncerrar,setModalEncerrar]=useState(false);

  if (loading) return <Skeleton/>;
  if (erro) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 max-w-7xl mx-auto">
      <AlertCircle size={32} strokeWidth={1.5} className="text-red-400"/>
      <p className="text-slate-700 text-sm font-semibold">{erro}</p>
      <div className="flex gap-3">
        <button type="button" onClick={()=>navigate('/patients')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"><ArrowLeft size={14} strokeWidth={1.5}/>Voltar</button>
        <button type="button" onClick={refetch} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 text-white text-sm font-medium hover:bg-slate-800 transition-colors"><RefreshCw size={14} strokeWidth={1.5}/>Tentar novamente</button>
      </div>
    </div>
  );
  if (!paciente) return null;

  const ultimoCheckin=checkins.length>0?checkins[checkins.length-1]:null;
  const idade=calcularIdade(paciente.dataNascimento);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <button type="button" onClick={()=>navigate('/patients')} className="inline-flex items-center gap-2 text-slate-500 text-sm font-medium hover:text-slate-800 transition-colors">
        <ArrowLeft size={16} strokeWidth={1.5}/>Voltar para Pacientes
      </button>

      <header className="bg-white border border-slate-100 rounded-2xl shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-2xl font-extrabold text-slate-600">{getInitials(paciente.nome)}</div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-slate-950 text-xl font-extrabold tracking-tight">{paciente.nome}</h1>
              <RecoveryStatusBadge status="sem_checkin"/>
            </div>
            {tratamento?<p className="text-slate-500 text-sm font-light">{tratamento.nomeProcedimento}</p>:<p className="text-amber-600 text-sm font-medium">Sem protocolo vinculado</p>}
            <div className="flex flex-wrap items-center gap-4">
              {tratamento&&<div className="flex items-center gap-1.5"><span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-950 text-white text-[11px] font-bold">D{tratamento.diaAtual}</span><span className="text-slate-500 text-xs font-light">de {tratamento.totalDias} dias</span></div>}
              {idade!==null&&<span className="text-slate-400 text-xs font-light">{idade} anos</span>}
              {checkins.length>0&&<span className="text-slate-400 text-xs font-light">{checkins.length} check-in{checkins.length!==1?'s':''} recebido{checkins.length!==1?'s':''}</span>}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-5">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-5">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-4">Nível de Dor Atual</p>
            <PainScale nivel={ultimoCheckin?.nivelDor??null} ultimaAtualizacao={ultimoCheckin?`Dia ${ultimoCheckin.diaRecuperacao}`:'Sem registros ainda.'}/>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-5 space-y-4">
            <h3 className="text-slate-950 text-sm font-semibold">Informações</h3>
            <ul className="space-y-3">
              {[{icon:User,label:'Idade',value:idade!==null?`${idade} anos`:'—'},{icon:Phone,label:'Telefone',value:paciente.telefone??'—'},{icon:Calendar,label:'Nascimento',value:fmtData(paciente.dataNascimento)}].map(({icon:Icon,label,value})=>(
                <li key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0"><Icon size={14} strokeWidth={1.5} className="text-slate-400"/></div>
                  <div><p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{label}</p><p className="text-slate-800 text-sm font-medium">{value}</p></div>
                </li>
              ))}
              {tratamento&&<li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0"><CheckCircle2 size={14} strokeWidth={1.5} className="text-slate-400"/></div>
                <div><p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Progresso</p>
                  <div className="flex items-center gap-2 mt-1"><div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-slate-700" style={{width:`${Math.min((tratamento.diaAtual/tratamento.totalDias)*100,100)}%`}}/></div><span className="text-slate-700 text-xs font-medium">D{tratamento.diaAtual}/{tratamento.totalDias}</span></div>
                </div>
              </li>}
            </ul>
            {paciente.observacoes&&<div className="pt-3 border-t border-slate-50"><p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1.5">Observações</p><p className="text-slate-600 text-xs font-light leading-relaxed">"{paciente.observacoes}"</p></div>}
          </div>
          {tratamento
            ?<AcoesCardComTratamento tratamento={tratamento} onAjustar={()=>setModalAjustar(true)} onEncerrar={()=>setModalEncerrar(true)}/>
            :<AcoesCardSemTratamento onVincular={()=>setModalVincular(true)}/>}
        </div>

        <div className="xl:col-span-2 space-y-5">
          {checkins.length>0&&<GraficoDor checkins={checkins}/>}
          <Historico checkins={checkins} loading={loadingCheckins} erro={erroCheckins} onRefresh={refetchCheckins}/>
        </div>
      </div>

      <ModalVincular isOpen={modalVincular} pacienteId={id} onClose={()=>setModalVincular(false)} onSuccess={refetch}/>
      <ModalAjustar  isOpen={modalAjustar}  tratamento={tratamento} onClose={()=>setModalAjustar(false)} onSuccess={refetch}/>
      <ModalEncerrar isOpen={modalEncerrar} tratamento={tratamento} onClose={()=>setModalEncerrar(false)} onSuccess={refetch}/>
    </div>
  );
}