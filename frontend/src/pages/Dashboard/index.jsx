// Arquivo: frontend/src/pages/Dashboard/index.jsx
import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, CheckCircle2, Clock, ChevronRight, TrendingUp, RefreshCw } from 'lucide-react';
import StatCard            from '../../components/StatCard';
import RecoveryStatusBadge from '../../components/RecoveryStatusBadge';
import { useDashboard }    from '../../hooks/useDashboard';

function formatarRelativo(d) {
  if (!d) return '—';
  const min = Math.floor((Date.now()-new Date(d).getTime())/60000);
  if (min<1) return 'Agora mesmo';
  if (min<60) return `${min} min atrás`;
  const hrs = Math.floor(min/60);
  if (hrs<24) return `${hrs}h atrás`;
  return `${Math.floor(hrs/24)}d atrás`;
}

function Skeleton({ rows=3 }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-50"><div className="h-4 w-36 skeleton"/></div>
      {Array.from({length:rows}).map((_,i)=>(
        <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-50 animate-pulse">
          <div className="w-9 h-9 rounded-full skeleton flex-shrink-0"/><div className="flex-1 space-y-2"><div className="h-3.5 w-40 skeleton"/><div className="h-3 w-28 skeleton"/></div><div className="h-4 w-10 skeleton"/>
        </div>
      ))}
    </div>
  );
}

function AlertasCriticos({ alertas }) {
  const navigate = useNavigate();
  if (!alertas.length) return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-50"><AlertTriangle size={16} strokeWidth={1.5} className="text-slate-300"/><h2 className="text-slate-950 text-sm font-semibold">Alertas Críticos</h2></div>
      <div className="flex flex-col items-center justify-center py-12 gap-2"><CheckCircle2 size={28} strokeWidth={1.5} className="text-emerald-400"/><p className="text-slate-500 text-sm font-medium">Nenhum alerta no momento.</p></div>
    </div>
  );
  return (
    <section className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-50">
        <AlertTriangle size={16} strokeWidth={1.5} className="text-red-500"/><h2 className="text-slate-950 text-sm font-semibold">Alertas Críticos</h2>
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">{alertas.length}</span>
      </div>
      <ul className="divide-y divide-slate-50">
        {alertas.map(a=>(
          <li key={a.checkinId} onClick={()=>navigate(`/patients/${a.paciente.id}`)}
            className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-red-700">{a.paciente.nome?.[0]?.toUpperCase()??'?'}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><p className="text-slate-950 text-sm font-medium truncate">{a.paciente.nome}</p><RecoveryStatusBadge status={a.statusClinico} size="sm"/></div>
              <p className="text-slate-400 text-xs font-light mt-0.5 truncate">{a.tratamento.nomeProcedimento} · Dia {a.diaRecuperacao}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-slate-950 text-sm font-bold">{a.nivelDor}<span className="text-slate-400 text-xs font-light">/10</span></p>
              <p className="text-slate-400 text-[10px] font-light mt-0.5">{formatarRelativo(a.enviadoEm)}</p>
            </div>
            <ChevronRight size={14} strokeWidth={1.5} className="text-slate-300 group-hover:text-slate-500 flex-shrink-0"/>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CheckinsRecentes({ checkins }) {
  const navigate = useNavigate();
  if (!checkins.length) return (
    <section className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-50"><TrendingUp size={16} strokeWidth={1.5} className="text-slate-400"/><h2 className="text-slate-950 text-sm font-semibold">Últimos Check-ins</h2></div>
      <div className="flex flex-col items-center justify-center py-10"><p className="text-slate-400 text-sm font-light">Nenhum check-in recebido ainda.</p></div>
    </section>
  );
  return (
    <section className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-50"><TrendingUp size={16} strokeWidth={1.5} className="text-slate-400"/><h2 className="text-slate-950 text-sm font-semibold">Últimos Check-ins</h2></div>
      <ul className="divide-y divide-slate-50">
        {checkins.map(c=>(
          <li key={c.checkinId} onClick={()=>navigate(`/patients/${c.paciente.id}`)}
            className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/60 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-slate-600">{c.paciente.nome?.[0]?.toUpperCase()??'?'}</div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 text-sm font-medium truncate">{c.paciente.nome}</p>
              <p className="text-slate-400 text-xs font-light mt-0.5 truncate">{c.tratamento.nomeProcedimento} · Dia {c.diaRecuperacao}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <RecoveryStatusBadge status={c.statusClinico} size="sm"/>
              <p className="text-slate-400 text-[10px] font-light">{formatarRelativo(c.enviadoEm)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Dashboard() {
  const { dados, loading, erro, refetch } = useDashboard();
  if (erro) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 max-w-7xl mx-auto">
      <AlertTriangle size={28} strokeWidth={1.5} className="text-red-400"/>
      <p className="text-slate-600 text-sm">{erro}</p>
      <button onClick={refetch} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 text-white text-sm hover:bg-slate-800 transition-colors"><RefreshCw size={14} strokeWidth={1.5}/>Tentar novamente</button>
    </div>
  );
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div><h1 className="text-slate-950 text-2xl font-extrabold tracking-tight">Dashboard</h1><p className="text-slate-400 text-sm font-light mt-1">Acompanhe a evolução dos seus pacientes em tempo real.</p></div>
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Tratamentos Ativos"  value={loading?null:dados?.cards.totalTratamentosAtivos??0} icon={Activity}      color="slate" description="pacientes em recuperação" loading={loading}/>
        <StatCard title="Alertas Críticos"    value={loading?null:dados?.cards.totalAlertas??0}           icon={AlertTriangle} color="red"   description="dor ≥ 7 nas últimas 48h"  loading={loading}/>
        <StatCard title="Check-ins Hoje"      value={loading?null:dados?.cards.checkinsHoje??0}           icon={CheckCircle2}  color="green" description="registros de hoje"         loading={loading}/>
        <StatCard title="Sem Check-in"        value={loading?null:dados?.cards.semCheckinRecente??0}      icon={Clock}         color="amber" description="há mais de 48 horas"      loading={loading}/>
      </section>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3">{loading?<Skeleton rows={3}/>:<AlertasCriticos alertas={dados?.alertasCriticos??[]}/>}</div>
        <div className="xl:col-span-2">{loading?<Skeleton rows={4}/>:<CheckinsRecentes checkins={dados?.checkinsRecentes??[]}/>}</div>
      </div>
    </div>
  );
}