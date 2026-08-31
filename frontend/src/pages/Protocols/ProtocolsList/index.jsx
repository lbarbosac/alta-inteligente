// Arquivo: frontend/src/pages/Protocols/ProtocolsList/index.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, RefreshCw, Archive, ChevronRight, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import EmptyState from '../../../components/EmptyState';
import Modal from '../../../components/Modal';
import { getProtocols, archiveProtocol, unarchiveProtocol } from '../../../services/protocolService';

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-card space-y-3 animate-pulse">
      <div className="h-4 w-40 skeleton"/><div className="h-3 w-56 skeleton"/>
      <div className="flex gap-2 mt-4"><div className="h-6 w-16 skeleton rounded-full"/><div className="h-6 w-20 skeleton rounded-full"/></div>
    </div>
  );
}

function ModalConfirmar({ isOpen, titulo, descricao, labelConfirmar, corBotao, onClose, onConfirmar }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function handle() {
    setCarregando(true); setErro('');
    try { await onConfirmar(); onClose(); }
    catch (err) { setErro(err.response?.data?.message || 'Erro ao realizar ação.'); }
    finally { setCarregando(false); }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titulo} size="sm">
      <div className="space-y-4">
        <p className="text-slate-600 text-sm font-light leading-relaxed">{descricao}</p>
        {erro && (
          <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 rounded-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"/>
            <p className="text-sm text-red-700 font-medium">{erro}</p>
          </div>
        )}
        <div className="flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button type="button" onClick={handle} disabled={carregando}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all ${corBotao}`}>
            {carregando ? <><Loader2 size={15} strokeWidth={2} className="animate-spin"/>Aguarde…</> : labelConfirmar}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ProtocolCard({ protocolo, onArquivar, onReativar }) {
  const navigate  = useNavigate();
  const versao    = protocolo.versoes?.[0];
  const totalDias = versao?.totalDias ?? protocolo.diasPadrao;

  return (
    <article className="bg-white border border-slate-100 rounded-2xl p-5 shadow-card hover:shadow-float transition-shadow duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-slate-950 text-sm font-semibold">{protocolo.nome}</h3>
            {!protocolo.ativo && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">
                <Archive size={9} strokeWidth={2}/>Arquivado
              </span>
            )}
          </div>
          {protocolo.descricao && (
            <p className="text-slate-400 text-xs font-light mt-1 line-clamp-2">{protocolo.descricao}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 text-xs font-medium ring-1 ring-slate-100">
          <Clock size={11} strokeWidth={1.5}/>{totalDias} dia{totalDias !== 1 ? 's' : ''}
        </span>
        {versao && <span className="text-slate-400 text-[11px] font-light">v{versao.versao}</span>}
        {protocolo.ativo
          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium ring-1 ring-emerald-100"><CheckCircle2 size={10} strokeWidth={2}/>Ativo</span>
          : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-medium">Arquivado</span>}
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
        <button type="button" onClick={() => navigate(`/protocols/${protocolo.id}`)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-all">
          <ChevronRight size={13} strokeWidth={1.5}/>Ver detalhes
        </button>
        {protocolo.ativo ? (
          <button type="button" onClick={() => onArquivar(protocolo)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-500 text-xs font-medium hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all">
            <Archive size={13} strokeWidth={1.5}/>Arquivar
          </button>
        ) : (
          <button type="button" onClick={() => onReativar(protocolo)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 text-emerald-700 text-xs font-medium hover:bg-emerald-50 transition-all">
            <CheckCircle2 size={13} strokeWidth={1.5}/>Reativar
          </button>
        )}
      </div>
    </article>
  );
}

export default function ProtocolsList() {
  const navigate = useNavigate();
  const [protocolos, setProtocolos] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [erro,       setErro]       = useState('');
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-slate-950 text-2xl font-extrabold tracking-tight">Protocolos</h1>
          <p className="text-slate-400 text-sm font-light mt-1">
            {loading ? 'Carregando…' : `${protocolos.length} protocolo${protocolos.length !== 1 ? 's' : ''} · ${ativos.length} ativo${ativos.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button type="button" onClick={() => navigate('/protocols/new')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 text-white text-sm font-medium hover:bg-slate-800 active:scale-[0.98] transition-all self-start sm:self-auto">
          <Plus size={16} strokeWidth={1.5}/>Novo Protocolo
        </button>
      </div>

      {erro && !loading && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-red-700 text-sm font-medium">{erro}</p>
          <button type="button" onClick={buscar} className="inline-flex items-center gap-1.5 text-red-600 text-xs font-medium">
            <RefreshCw size={13} strokeWidth={1.5}/>Tentar novamente
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => <SkeletonCard key={i}/>)}
        </div>
      ) : protocolos.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-card">
          <EmptyState icon={ClipboardList} title="Nenhum protocolo criado ainda."
            subtitle="Crie o primeiro protocolo para começar a acompanhar pacientes."
            action={
              <button type="button" onClick={() => navigate('/protocols/new')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 text-white text-sm font-medium hover:bg-slate-800 transition-all">
                <Plus size={15} strokeWidth={1.5}/>Criar primeiro protocolo
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {ativos.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ativos ({ativos.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {ativos.map(p => <ProtocolCard key={p.id} protocolo={p} onArquivar={abrirArquivar} onReativar={abrirReativar}/>)}
              </div>
            </section>
          )}
          {arquivados.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Arquivados ({arquivados.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {arquivados.map(p => <ProtocolCard key={p.id} protocolo={p} onArquivar={abrirArquivar} onReativar={abrirReativar}/>)}
              </div>
            </section>
          )}
        </div>
      )}

      <ModalConfirmar
        isOpen={modalArquivar}
        titulo="Arquivar Protocolo"
        descricao={`"${alvo?.nome}" não estará disponível para novos tratamentos. Pacientes em andamento não serão afetados.`}
        labelConfirmar="Arquivar"
        corBotao="bg-red-600 hover:bg-red-700"
        onClose={() => setModalArquivar(false)}
        onConfirmar={async () => { await archiveProtocol(alvo.id); await buscar(); }}
      />

      <ModalConfirmar
        isOpen={modalReativar}
        titulo="Reativar Protocolo"
        descricao={`"${alvo?.nome}" voltará a ficar disponível para novos tratamentos.`}
        labelConfirmar="Reativar"
        corBotao="bg-emerald-600 hover:bg-emerald-700"
        onClose={() => setModalReativar(false)}
        onConfirmar={async () => { await unarchiveProtocol(alvo.id); await buscar(); }}
      />
    </div>
  );
}