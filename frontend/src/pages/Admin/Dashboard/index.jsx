// Arquivo: frontend/src/pages/Admin/Dashboard/index.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import PageHeader from '../../../components/PageHeader';
import Card from '../../../components/Card';
import StatCard from '../../../components/StatCard';
import Avatar from '../../../components/Avatar';
import Button, { buttonClass } from '../../../components/Button';
import InlineAlert from '../../../components/InlineAlert';
import { useAuth } from '../../../contexts/AuthContext';
import { getProfessionals } from '../../../services/professionalService';
import { nomeCurto } from '../../../utils/formatDate';

function BadgeConta({ ativo }) {
  return ativo ? (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-line bg-white px-2 text-xs font-medium text-ink">
      <span className="h-2 w-2 rounded-full bg-ink" aria-hidden="true" />Ativo
    </span>
  ) : (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-line bg-neutral-100 px-2 text-xs font-medium text-neutral-700">
      <span className="h-2 w-2 rounded-full bg-white ring-1 ring-inset ring-neutral-400" aria-hidden="true" />Bloqueado
    </span>
  );
}

export default function AdminDashboard() {
  const { usuario } = useAuth();
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState('');

  async function buscar() {
    setLoading(true); setErro('');
    try { setProfissionais(await getProfessionals() ?? []); }
    catch (err) { setErro(err.response?.data?.message || 'Erro ao carregar dados.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { buscar(); }, []);

  const ativos     = profissionais.filter(p => p.ativo).length;
  const bloqueados = profissionais.length - ativos;
  const taxa       = profissionais.length ? `${Math.round((ativos / profissionais.length) * 100)}%` : '—';

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Painel administrativo"
        title="Visão geral"
        description={`Olá, ${nomeCurto(usuario?.nome) || 'administrador'}. Resumo da plataforma.`}
        actions={
          <Button variant="secondary" onClick={buscar} disabled={loading}>
            <RefreshCw size={16} strokeWidth={1.75} aria-hidden="true" />
            Atualizar
          </Button>
        }
      />

      {erro && (
        <InlineAlert action={<Button size="sm" variant="secondary" onClick={buscar}>Tentar novamente</Button>}>{erro}</InlineAlert>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <section aria-labelledby="titulo-resumo-admin" className="on-dark flex flex-col justify-between rounded-xl bg-ink p-5 text-white sm:p-6 lg:col-span-5">
          <div>
            <h2 id="titulo-resumo-admin" className="text-sm font-medium text-neutral-400">Profissionais cadastrados</h2>
            {loading
              ? <div className="mt-4 h-14 w-24 animate-pulse rounded-md bg-neutral-800" />
              : <p className="mt-3 text-6xl font-semibold leading-none tracking-tight tabular-nums">{profissionais.length}</p>}
          </div>
          <div className="mt-8 grid grid-cols-3 gap-2">
            <StatCard tone="escuro" title="Ativos" value={ativos} loading={loading} />
            <StatCard tone="escuro" title="Bloqueados" value={bloqueados} loading={loading} />
            <StatCard tone="escuro" title="Atividade" value={taxa} loading={loading} />
          </div>
        </section>

        <Card
          padded={false}
          title="Profissionais"
          description="Cadastros mais recentes"
          actions={<Link to="/admin/professionals" className={buttonClass({ variant: 'ghost', size: 'sm' })}>Gerenciar</Link>}
          className="lg:col-span-7"
        >
          {loading ? (
            <div aria-busy="true" className="divide-y divide-line">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="skeleton h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2"><div className="skeleton h-4 w-40" /><div className="skeleton h-3 w-56" /></div>
                </div>
              ))}
            </div>
          ) : profissionais.length === 0 ? (
            <p className="px-5 py-10 text-sm text-neutral-600">Nenhum profissional cadastrado ainda.</p>
          ) : (
            <ul className="divide-y divide-line">
              {profissionais.slice(0, 6).map(p => (
                <li key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                  <Avatar nome={p.nome} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{p.nome}</p>
                    <p className="truncate text-sm text-neutral-500">{p.especialidade} · {p.email}</p>
                  </div>
                  <BadgeConta ativo={p.ativo} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
