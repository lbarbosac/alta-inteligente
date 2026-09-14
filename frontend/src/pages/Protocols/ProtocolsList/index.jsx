// Arquivo: frontend/src/pages/Protocols/ProtocolsList/index.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus } from 'lucide-react';
import PageHeader from '../../../components/PageHeader';
import Card from '../../../components/Card';
import Button, { buttonClass } from '../../../components/Button';
import EmptyState from '../../../components/EmptyState';
import InlineAlert from '../../../components/InlineAlert';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { getProtocols, archiveProtocol, unarchiveProtocol } from '../../../services/protocolService';

function ListaSkeleton() {
  return (
    <div aria-busy="true" className="divide-y divide-line">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="space-y-2"><div className="skeleton h-4 w-48" /><div className="skeleton h-3 w-72 max-w-full" /></div>
          <div className="skeleton h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

function LinhaProtocolo({ protocolo, onArquivar, onReativar }) {
  const versao    = protocolo.versoes?.[0];
  const totalDias = versao?.totalDias ?? protocolo.diasPadrao;

  return (
    <li className="relative flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-neutral-50 sm:flex-row sm:items-center sm:gap-6">
      <div className="min-w-0 flex-1">
        <Link to={`/protocols/${protocolo.id}`} className="font-medium text-ink after:absolute after:inset-0 hover:underline">
          {protocolo.nome}
        </Link>
        {protocolo.descricao && <p className="mt-0.5 line-clamp-1 text-sm text-neutral-600">{protocolo.descricao}</p>}
      </div>
      <p className="text-sm text-neutral-600 tabular-nums">
        {totalDias} dia{totalDias !== 1 ? 's' : ''}{versao && <> · Versão {versao.versao}</>}
      </p>
      <div className="relative z-10">
        {protocolo.ativo
          ? <Button variant="ghost" size="sm" onClick={() => onArquivar(protocolo)}>Arquivar</Button>
          : <Button variant="secondary" size="sm" onClick={() => onReativar(protocolo)}>Reativar</Button>}
      </div>
    </li>
  );
}

export default function ProtocolsList() {
  const [protocolos, setProtocolos] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [erro,       setErro]       = useState('');
  const [aba,        setAba]        = useState('ativos');
  const [alvo,       setAlvo]       = useState(null);
  const [modalArquivar, setModalArquivar] = useState(false);
  const [modalReativar, setModalReativar] = useState(false);

  const buscar = useCallback(async () => {
    setLoading(true); setErro('');
    try { setProtocolos(await getProtocols() ?? []); }
    catch (err) { setErro(err.response?.data?.message || 'Erro ao carregar protocolos.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { buscar(); }, [buscar]);

  function abrirArquivar(p) { setAlvo(p); setModalArquivar(true); }
  function abrirReativar(p) { setAlvo(p); setModalReativar(true); }

  const ativos     = protocolos.filter(p => p.ativo);
  const arquivados = protocolos.filter(p => !p.ativo);
  const visiveis   = aba === 'ativos' ? ativos : arquivados;

  const novoProtocolo = (
    <Link to="/protocols/new" className={buttonClass()}>
      <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
      Novo protocolo
    </Link>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Protocolos"
        description={loading ? 'Carregando…' : `${ativos.length} ativo${ativos.length !== 1 ? 's' : ''} · ${arquivados.length} arquivado${arquivados.length !== 1 ? 's' : ''}`}
        actions={novoProtocolo}
      />

      {erro && !loading && (
        <InlineAlert action={<Button size="sm" variant="secondary" onClick={buscar}>Tentar novamente</Button>}>{erro}</InlineAlert>
      )}

      <div role="group" aria-label="Mostrar protocolos" className="flex gap-1">
        {[
          { id: 'ativos',     label: 'Ativos',     total: ativos.length },
          { id: 'arquivados', label: 'Arquivados', total: arquivados.length },
        ].map(({ id, label, total }) => (
          <button
            key={id}
            type="button"
            aria-pressed={aba === id}
            onClick={() => setAba(id)}
            className={`inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors
              ${aba === id ? 'bg-ink text-white' : 'border border-line bg-white text-neutral-700 hover:border-neutral-400'}`}
          >
            {label}
            {!loading && <span className={`tabular-nums ${aba === id ? 'text-neutral-400' : 'text-neutral-500'}`}>{total}</span>}
          </button>
        ))}
      </div>

      <Card padded={false}>
        {loading ? <ListaSkeleton /> : visiveis.length === 0 ? (
          aba === 'ativos' ? (
            <EmptyState
              icon={ClipboardList}
              title="Nenhum protocolo ativo"
              subtitle="Crie um protocolo com as orientações de cada dia para vincular aos tratamentos."
              action={novoProtocolo}
            />
          ) : (
            <EmptyState icon={ClipboardList} title="Nenhum protocolo arquivado" />
          )
        ) : (
          <ul className="divide-y divide-line">
            {visiveis.map(p => <LinhaProtocolo key={p.id} protocolo={p} onArquivar={abrirArquivar} onReativar={abrirReativar} />)}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        isOpen={modalArquivar}
        titulo="Arquivar protocolo"
        descricao={`"${alvo?.nome}" não ficará disponível para novos tratamentos. Pacientes em andamento não são afetados.`}
        labelConfirmar="Arquivar"
        tom="danger"
        onClose={() => setModalArquivar(false)}
        onConfirmar={async () => { await archiveProtocol(alvo.id); await buscar(); }}
      />

      <ConfirmDialog
        isOpen={modalReativar}
        titulo="Reativar protocolo"
        descricao={`"${alvo?.nome}" voltará a ficar disponível para novos tratamentos.`}
        labelConfirmar="Reativar"
        onClose={() => setModalReativar(false)}
        onConfirmar={async () => { await unarchiveProtocol(alvo.id); await buscar(); }}
      />
    </div>
  );
}
