// Arquivo: frontend/src/pages/Admin/Dashboard/index.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, Activity, Shield, RefreshCw, ChevronRight } from 'lucide-react';
import StatCard from '../../../components/StatCard';
import { useAuth } from '../../../contexts/AuthContext';
import { getProfessionals } from '../../../services/professionalService';

export default function AdminDashboard() {
  const { usuario } = useAuth();
  const navigate    = useNavigate();
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState('');

  async function buscar() {
    setLoading(true); setErro('');
    try { setProfissionais(await getProfessionals()??[]); }
    catch(err){ setErro(err.response?.data?.message||'Erro ao carregar dados.'); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ buscar(); },[]);

  const ativos    = profissionais.filter(p=>p.ativo).length;
  const bloqueados = profissionais.length - ativos;
  const stats = [
    { title:'Profissionais Ativos',    value:loading?null:ativos,              icon:UserCheck, color:'green', description:'contas habilitadas'   },
    { title:'Profissionais Bloqueados',value:loading?null:bloqueados,          icon:UserX,     color:'red',   description:'acesso suspenso'       },
    { title:'Total de Profissionais',  value:loading?null:profissionais.length,icon:Users,     color:'slate', description:'cadastrados no sistema' },
    { title:'Taxa de Atividade',       value:loading?null:(profissionais.length?`${Math.round((ativos/profissionais.length)*100)}%`:'—'), icon:Activity, color:'amber', description:'profissionais ativos' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1"><Shield size={16} strokeWidth={1.5} className="text-amber-500"/><span className="text-amber-600 text-xs font-semibold uppercase tracking-wider">Painel Administrativo</span></div>
          <h1 className="text-slate-950 text-2xl font-extrabold tracking-tight">Visão Geral</h1>
          <p className="text-slate-400 text-sm font-light mt-1">Bem-vindo, {usuario?.nome?.split(' ')[0]}. Resumo da plataforma.</p>
        </div>
        <button type="button" onClick={buscar} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mt-1"><RefreshCw size={13} strokeWidth={1.5}/>Atualizar</button>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s=><StatCard key={s.title} {...s} loading={loading}/>)}
      </section>

      {erro && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-red-700 text-sm font-medium">{erro}</p>
          <button type="button" onClick={buscar} className="inline-flex items-center gap-1.5 text-red-600 text-xs font-medium"><RefreshCw size={13} strokeWidth={1.5}/>Tentar novamente</button>
        </div>
      )}

      <section className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
          <div><h2 className="text-slate-950 text-sm font-semibold">Profissionais Cadastrados</h2><p className="text-slate-400 text-xs font-light mt-0.5">Todos os profissionais da plataforma</p></div>
          <button type="button" onClick={()=>navigate('/admin/professionals')} className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium hover:text-slate-950 transition-colors">Gerenciar<ChevronRight size={13} strokeWidth={1.5}/></button>
        </div>
        {loading ? (
          <div className="animate-pulse">{[1,2,3].map(i=><div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-50"><div className="w-9 h-9 rounded-full skeleton flex-shrink-0"/><div className="flex-1 space-y-2"><div className="h-3.5 w-36 skeleton"/><div className="h-3 w-48 skeleton"/></div><div className="h-5 w-16 skeleton rounded-full"/></div>)}</div>
        ) : profissionais.length===0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2"><Users size={28} strokeWidth={1.5} className="text-slate-300"/><p className="text-slate-400 text-sm font-light">Nenhum profissional cadastrado ainda.</p></div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {profissionais.slice(0,10).map(p=>{
              const initials = p.nome?.split(' ').filter(Boolean).map(x=>x[0]).slice(0,2).join('').toUpperCase()??'?';
              return (
                <li key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${p.ativo?'bg-slate-100 text-slate-600':'bg-red-50 text-red-400'}`}>{initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 text-sm font-medium truncate">{p.nome}</p>
                    <p className="text-slate-400 text-xs font-light mt-0.5 truncate">{p.especialidade} · {p.email}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${p.ativo?'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100':'bg-red-50 text-red-700 ring-1 ring-red-100'}`}>{p.ativo?'Ativo':'Bloqueado'}</span>
                </li>
              );
            })}
            {profissionais.length>10 && (
              <li className="px-6 py-3 text-center"><button type="button" onClick={()=>navigate('/admin/professionals')} className="text-xs text-slate-500 font-medium hover:text-slate-800 transition-colors">Ver todos os {profissionais.length} profissionais →</button></li>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}