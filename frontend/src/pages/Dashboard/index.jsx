// Arquivo: frontend/src/pages/Dashboard/index.jsx
import { Link } from 'react-router-dom';
import { Phone, RefreshCw, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import StatCard from '../../components/StatCard';
import PainLevel from '../../components/PainLevel';
import RecoveryStatusBadge from '../../components/RecoveryStatusBadge';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import InlineAlert from '../../components/InlineAlert';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../contexts/AuthContext';
import { dataPorExtenso, formatarRelativo, nomeCurto, saudacao } from '../../utils/formatDate';

function ListaSkeleton({ linhas = 3 }) {
  return (
    <div aria-busy="true" className="divide-y divide-line">
      {Array.from({ length: linhas }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="skeleton h-10 w-10" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-40" />
            <div className="skeleton h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Quem precisa de atenção — primeiro na leitura ─────────────────────────
function PrecisamDeAtencao({ alertas, loading }) {
  return (
    <Card
      padded={false}
      title="Precisam de atenção"
      description="Dor 7 ou mais nas últimas 48 horas"
      actions={alertas.length > 0 && (
        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-red-600 px-2 text-sm font-semibold text-white tabular-nums">
          {alertas.length}<span className="sr-only"> pacientes</span>
        </span>
      )}
      className="h-full"
    >
      {loading ? <ListaSkeleton linhas={3} /> : alertas.length === 0 ? (
        <div className="flex items-center gap-3 px-5 py-10">
          <CheckCircle2 size={20} strokeWidth={1.75} className="flex-shrink-0 text-ink" aria-hidden="true" />
          <p className="text-sm text-neutral-600">Nenhum paciente com dor alta nas últimas 48 horas.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {alertas.map((a) => (
            <li key={a.checkinId} className="relative flex items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50">
              <PainLevel nivel={a.nivelDor} size="lg" />
              <div className="min-w-0 flex-1">
                <Link
                  to={`/patients/${a.paciente.id}`}
                  className="font-medium text-ink after:absolute after:inset-0 hover:underline"
                >
                  {a.paciente.nome}
                </Link>
                <p className="mt-0.5 truncate text-sm text-neutral-600">
                  {a.tratamento.nomeProcedimento} · Dia {a.diaRecuperacao} · {formatarRelativo(a.enviadoEm)}
                </p>
                {a.observacoes && (
                  <p className="mt-1 line-clamp-1 text-sm text-neutral-500">“{a.observacoes}”</p>
                )}
              </div>
              <div className="hidden flex-shrink-0 sm:block">
                <RecoveryStatusBadge status={a.statusClinico} size="sm" />
              </div>
              {a.paciente.telefone && (
                <a
                  href={`tel:${a.paciente.telefone.replace(/\D/g, '')}`}
                  aria-label={`Ligar para ${a.paciente.nome}`}
                  title="Ligar"
                  className="relative z-10 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full
                    border border-neutral-300 bg-white text-ink transition-colors hover:border-ink"
                >
                  <Phone size={16} strokeWidth={1.75} />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ─── Resumo — o bloco escuro da tela ───────────────────────────────────────
function Resumo({ cards, loading }) {
  return (
    <section aria-labelledby="titulo-resumo" className="on-dark flex h-full flex-col justify-between rounded-xl bg-ink p-5 text-white sm:p-6">
      <div>
        <h2 id="titulo-resumo" className="text-sm font-medium text-neutral-400">Tratamentos em andamento</h2>
        {loading
          ? <div className="mt-4 h-14 w-24 animate-pulse rounded-md bg-neutral-800" />
          : <p className="mt-3 text-6xl font-semibold leading-none tracking-tight tabular-nums">{cards?.totalTratamentosAtivos ?? 0}</p>}
      </div>
      <div className="mt-8 grid grid-cols-3 gap-2">
        <StatCard tone="escuro" title="Check-ins" value={cards?.checkinsHoje ?? 0} description="hoje" loading={loading} />
        <StatCard tone="escuro" title="Dor alta" value={cards?.totalAlertas ?? 0} alerta={cards?.totalAlertas > 0} description="últimas 48 h" loading={loading} />
        <StatCard tone="escuro" title="Sem check-in" value={cards?.semCheckinRecente ?? 0} description="há mais de 48 h" loading={loading} />
      </div>
    </section>
  );
}

// ─── Últimos check-ins ─────────────────────────────────────────────────────
function UltimosCheckins({ checkins, loading }) {
  return (
    <Card padded={false} title="Últimos check-ins">
      {loading ? <ListaSkeleton linhas={4} /> : checkins.length === 0 ? (
        <p className="px-5 py-10 text-sm text-neutral-600">Nenhum check-in recebido ainda.</p>
      ) : (
        <>
          <div className="hidden grid-cols-12 gap-4 border-b border-line px-5 py-2.5 text-xs font-medium text-neutral-500 md:grid" aria-hidden="true">
            <span className="col-span-4">Paciente</span>
            <span className="col-span-3">Procedimento</span>
            <span className="col-span-1">Dia</span>
            <span className="col-span-1">Dor</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-1 text-right">Enviado</span>
          </div>
          <ul className="divide-y divide-line">
            {checkins.map((c) => (
              <li key={c.checkinId} className="relative grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-3.5 transition-colors hover:bg-neutral-50 md:grid-cols-12">
                <div className="flex min-w-0 items-center gap-3 md:col-span-4">
                  <Avatar nome={c.paciente.nome} size="sm" />
                  <Link to={`/patients/${c.paciente.id}`} className="hidden truncate text-sm font-medium text-ink after:absolute after:inset-0 hover:underline md:inline">
                    {c.paciente.nome}
                  </Link>
                </div>
                <div className="min-w-0 md:hidden">
                  <Link to={`/patients/${c.paciente.id}`} className="block truncate text-sm font-medium text-ink after:absolute after:inset-0">
                    {c.paciente.nome}
                  </Link>
                  <p className="truncate text-sm text-neutral-600">Dia {c.diaRecuperacao} · {formatarRelativo(c.enviadoEm)}</p>
                </div>
                <p className="hidden truncate text-sm text-neutral-600 md:col-span-3 md:block">{c.tratamento.nomeProcedimento}</p>
                <p className="hidden text-sm tabular-nums text-ink md:col-span-1 md:block">{c.diaRecuperacao}</p>
                <div className="md:col-span-1"><PainLevel nivel={c.nivelDor} size="sm" /></div>
                <div className="hidden md:col-span-2 md:block"><RecoveryStatusBadge status={c.statusClinico} size="sm" /></div>
                <p className="hidden text-right text-sm text-neutral-500 md:col-span-1 md:block">{formatarRelativo(c.enviadoEm)}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

export default function Dashboard() {
  const { usuario } = useAuth();
  const { dados, loading, erro, refetch } = useDashboard();

  const cabecalho = (
    <PageHeader
      eyebrow={dataPorExtenso()}
      title={`${saudacao()}, ${nomeCurto(usuario?.nome) || 'bem-vindo'}`}
      actions={
        <Button variant="secondary" onClick={refetch} disabled={loading}>
          <RefreshCw size={16} strokeWidth={1.75} aria-hidden="true" />
          Atualizar
        </Button>
      }
    />
  );

  if (erro) {
    return (
      <div className="space-y-8">
        {cabecalho}
        <InlineAlert action={<Button size="sm" variant="secondary" onClick={refetch}>Tentar novamente</Button>}>
          {erro}
        </InlineAlert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {cabecalho}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PrecisamDeAtencao alertas={dados?.alertasCriticos ?? []} loading={loading} />
        </div>
        <div className="lg:col-span-5">
          <Resumo cards={dados?.cards} loading={loading} />
        </div>
      </div>
      <UltimosCheckins checkins={dados?.checkinsRecentes ?? []} loading={loading} />
    </div>
  );
}
