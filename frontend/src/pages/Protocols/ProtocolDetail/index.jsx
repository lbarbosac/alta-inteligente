// Arquivo: frontend/src/pages/Protocols/ProtocolDetail/index.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ChevronDown, ChevronUp, ClipboardList, Clock,
  RefreshCw, Archive, CheckCircle2, AlertCircle, Edit3,
  Save, X, Plus, Trash2, Loader2,
} from 'lucide-react';
import Modal from '../../../components/Modal';
import { getProtocol, archiveProtocol, unarchiveProtocol, editarProtocolo } from '../../../services/protocolService';

function Skeleton() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-pulse">
      <div className="h-5 w-32 skeleton"/>
      <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-3">
        <div className="h-6 w-48 skeleton"/><div className="h-4 w-72 skeleton"/>
        <div className="flex gap-2 mt-4"><div className="h-6 w-20 skeleton rounded-full"/><div className="h-6 w-16 skeleton rounded-full"/></div>
      </div>
      {[1,2,3].map(i=><div key={i} className="bg-white border border-slate-100 rounded-2xl p-5"><div className="h-4 w-24 skeleton"/></div>)}
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
        {erro && <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 rounded-xl"><div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"/><p className="text-sm text-red-700 font-medium">{erro}</p></div>}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
          <button type="button" onClick={handle} disabled={carregando}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all ${corBotao}`}>
            {carregando ? <><Loader2 size={15} strokeWidth={2} className="animate-spin"/>Aguarde…</> : labelConfirmar}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Dia em modo visualização ──────────────────────────────────────────────
function DiaView({ dia }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
      <button type="button" onClick={() => setAberto(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors text-left">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-950 text-white text-xs font-bold flex-shrink-0">D{dia.numeroDia}</span>
          <div>
            <p className="text-slate-800 text-sm font-medium leading-none">{dia.titulo || `Dia ${dia.numeroDia}`}</p>
            <p className="text-slate-400 text-xs font-light mt-0.5">{dia.tarefas?.length > 0 ? `${dia.tarefas.length} orientaç${dia.tarefas.length !== 1 ? 'ões' : 'ão'}` : 'Sem orientações'}</p>
          </div>
        </div>
        {aberto ? <ChevronUp size={16} strokeWidth={1.5} className="text-slate-400"/> : <ChevronDown size={16} strokeWidth={1.5} className="text-slate-400"/>}
      </button>
      {aberto && (
        dia.tarefas?.length > 0
          ? <ul className="border-t border-slate-50 divide-y divide-slate-50">
              {dia.tarefas.map((t, i) => (
                <li key={t.id} className="flex items-start gap-3 px-5 py-3.5">
                  <span className="text-slate-300 text-xs font-semibold w-5 text-right flex-shrink-0 mt-0.5">{i + 1}.</span>
                  <p className="text-slate-700 text-sm font-light leading-snug">{t.descricao}</p>
                </li>
              ))}
            </ul>
          : <div className="border-t border-slate-50 px-5 py-4"><p className="text-slate-400 text-xs font-light">Nenhuma orientação cadastrada.</p></div>
      )}
    </div>
  );
}

// ─── Dia em modo edição ────────────────────────────────────────────────────
function DiaEdit({ dia, onChange, onRemove }) {
  const [aberto, setAberto] = useState(false);

  function addTarefa() { onChange({ ...dia, tarefas: [...(dia.tarefas || []), { descricao: '' }] }); }
  function setTarefa(idx, descricao) { onChange({ ...dia, tarefas: dia.tarefas.map((t, i) => i === idx ? { ...t, descricao } : t) }); }
  function removeTarefa(idx) { onChange({ ...dia, tarefas: dia.tarefas.filter((_, i) => i !== idx) }); }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <button type="button" onClick={() => setAberto(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors text-left">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-950 text-white text-xs font-bold flex-shrink-0">D{dia.numeroDia}</span>
          <div>
            <p className="text-slate-800 text-sm font-medium leading-none">{dia.titulo || `Dia ${dia.numeroDia}`}</p>
            <p className="text-slate-400 text-xs font-light mt-0.5">{(dia.tarefas || []).length} orientaç{(dia.tarefas || []).length !== 1 ? 'ões' : 'ão'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
            <Trash2 size={14} strokeWidth={1.5}/>
          </button>
          {aberto ? <ChevronUp size={16} strokeWidth={1.5} className="text-slate-400"/> : <ChevronDown size={16} strokeWidth={1.5} className="text-slate-400"/>}
        </div>
      </button>

      {aberto && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4 space-y-4 bg-slate-50/30">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">Título do dia (opcional)</label>
            <input type="text" value={dia.titulo || ''} onChange={e => onChange({ ...dia, titulo: e.target.value })}
              placeholder={`Ex: Cuidados Iniciais — Dia ${dia.numeroDia}`}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-300 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/8 transition-all"/>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">Orientações do paciente</label>
            {(dia.tarefas || []).map((t, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-slate-300 text-xs font-semibold w-5 text-right flex-shrink-0">{idx + 1}.</span>
                <input type="text" value={t.descricao} onChange={e => setTarefa(idx, e.target.value)}
                  placeholder="Ex: Tomar Amoxicilina 500mg a cada 8 horas"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-300 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/8 transition-all"/>
                <button type="button" onClick={() => removeTarefa(idx)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0">
                  <Trash2 size={14} strokeWidth={1.5}/>
                </button>
              </div>
            ))}
            <button type="button" onClick={addTarefa}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium hover:text-slate-800 transition-colors mt-1">
              <Plus size={13} strokeWidth={2}/>Adicionar orientação
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────
export default function ProtocolDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [protocolo,  setProtocolo]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [erro,       setErro]       = useState('');
  const [modoEdicao, setModoEdicao] = useState(false);
  const [salvando,   setSalvando]   = useState(false);
  const [erroEdicao, setErroEdicao] = useState('');
  const [modalArquivar, setModalArquivar] = useState(false);
  const [modalReativar, setModalReativar] = useState(false);

  // Estado de edição
  const [editNome,      setEditNome]      = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editDiasArr,   setEditDiasArr]   = useState([]);

  async function buscar() {
    setLoading(true); setErro('');
    try { setProtocolo(await getProtocol(id)); }
    catch (err) { setErro(err.response?.data?.message || 'Protocolo não encontrado.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { buscar(); }, [id]);

  function entrarEdicao() {
    if (!protocolo) return;
    const v = protocolo.versoes?.[0];
    setEditNome(protocolo.nome || '');
    setEditDescricao(protocolo.descricao || '');
    setEditDiasArr((v?.dias || []).map(d => ({
      numeroDia: d.numeroDia,
      titulo:    d.titulo || '',
      tarefas:   (d.tarefas || []).map(t => ({ id: t.id, descricao: t.descricao })),
    })));
    setErroEdicao('');
    setModoEdicao(true);
  }

  function addDia() {
    const proximo = Math.max(0, ...editDiasArr.map(d => d.numeroDia)) + 1;
    setEditDiasArr(prev => [...prev, { numeroDia: proximo, titulo: '', tarefas: [] }]);
  }

  function removeDia(numeroDia) {
    const novos = editDiasArr
      .filter(d => d.numeroDia !== numeroDia)
      .map((d, i) => ({ ...d, numeroDia: i + 1 }));
    setEditDiasArr(novos);
  }

  async function salvarEdicao() {
    if (!editNome.trim()) { setErroEdicao('Nome é obrigatório.'); return; }
    setSalvando(true); setErroEdicao('');
    try {
      await editarProtocolo(id, {
        nome:       editNome.trim(),
        descricao:  editDescricao.trim() || null,
        diasPadrao: editDiasArr.length || protocolo.diasPadrao,
        dias: editDiasArr.map(d => ({
          numeroDia: d.numeroDia,
          titulo:    d.titulo || null,
          tarefas:   (d.tarefas || []).filter(t => t.descricao?.trim()).map((t, i) => ({ descricao: t.descricao.trim(), numeroOrdem: i + 1 })),
        })),
      });
      await buscar();
      setModoEdicao(false);
    } catch (err) {
      setErroEdicao(err.response?.data?.message || 'Erro ao salvar. Tente novamente.');
    } finally { setSalvando(false); }
  }

  if (loading) return <Skeleton/>;

  if (erro) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 max-w-3xl mx-auto">
      <AlertCircle size={32} strokeWidth={1.5} className="text-red-400"/>
      <p className="text-slate-700 text-sm font-semibold">{erro}</p>
      <div className="flex gap-3">
        <button type="button" onClick={() => navigate('/protocols')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"><ArrowLeft size={14} strokeWidth={1.5}/>Voltar</button>
        <button type="button" onClick={buscar} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 text-white text-sm font-medium hover:bg-slate-800 transition-colors"><RefreshCw size={14} strokeWidth={1.5}/>Tentar novamente</button>
      </div>
    </div>
  );

  const versao = protocolo?.versoes?.[0];
  const dias   = versao?.dias ?? [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <button type="button" onClick={() => navigate('/protocols')}
        className="inline-flex items-center gap-2 text-slate-500 text-sm font-medium hover:text-slate-800 transition-colors">
        <ArrowLeft size={16} strokeWidth={1.5}/>Voltar para Protocolos
      </button>

      {/* Header */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-6 space-y-4">
        {modoEdicao ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-950 text-sm font-semibold">Editando Protocolo</h2>
              <button type="button" onClick={() => { setModoEdicao(false); setErroEdicao(''); }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors">
                <X size={14} strokeWidth={1.5}/>Cancelar
              </button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Nome *</label>
                <input type="text" value={editNome} onChange={e => setEditNome(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/8 transition-all"/>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Descrição (opcional)</label>
                <textarea rows={2} value={editDescricao} onChange={e => setEditDescricao(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none resize-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/8 transition-all"/>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-slate-950 text-xl font-extrabold tracking-tight">{protocolo.nome}</h1>
                {!protocolo.ativo
                  ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium"><Archive size={9} strokeWidth={2}/>Arquivado</span>
                  : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium ring-1 ring-emerald-100"><CheckCircle2 size={10} strokeWidth={2}/>Ativo</span>}
              </div>
              {protocolo.descricao && <p className="text-slate-500 text-sm font-light leading-relaxed">{protocolo.descricao}</p>}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 text-xs font-medium ring-1 ring-slate-100">
            <Clock size={12} strokeWidth={1.5}/>{modoEdicao ? editDiasArr.length : protocolo.diasPadrao} dias
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 text-xs font-medium ring-1 ring-slate-100">
            <ClipboardList size={12} strokeWidth={1.5}/>{modoEdicao ? editDiasArr.length : dias.length} dia{dias.length !== 1 ? 's' : ''} configurado{dias.length !== 1 ? 's' : ''}
          </span>
          {versao && <span className="text-slate-400 text-xs font-light">Versão {versao.versao}</span>}
        </div>

        {/* Botões de ação — modo visualização */}
        {!modoEdicao && (
          <div className="flex gap-2 pt-2 border-t border-slate-50 flex-wrap">
            {protocolo.ativo && (
              <button type="button" onClick={entrarEdicao}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-all">
                <Edit3 size={13} strokeWidth={1.5}/>Editar Protocolo
              </button>
            )}
            {protocolo.ativo ? (
              <button type="button" onClick={() => setModalArquivar(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-500 text-xs font-medium hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all">
                <Archive size={13} strokeWidth={1.5}/>Arquivar protocolo
              </button>
            ) : (
              <button type="button" onClick={() => setModalReativar(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 text-emerald-700 text-xs font-medium hover:bg-emerald-50 transition-all">
                <CheckCircle2 size={13} strokeWidth={1.5}/>Reativar protocolo
              </button>
            )}
          </div>
        )}

        {/* Erro + botões de salvar — modo edição */}
        {modoEdicao && (
          <>
            {erroEdicao && (
              <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"/>
                <p className="text-sm text-red-700 font-medium">{erroEdicao}</p>
              </div>
            )}
            <div className="flex gap-3 pt-2 border-t border-slate-50">
              <button type="button" onClick={() => { setModoEdicao(false); setErroEdicao(''); }}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button type="button" onClick={salvarEdicao} disabled={salvando}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all">
                {salvando ? <><Loader2 size={15} strokeWidth={2} className="animate-spin"/>Salvando…</> : <><Save size={15} strokeWidth={1.5}/>Salvar Alterações</>}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Dias */}
      {modoEdicao ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Orientações por Dia ({editDiasArr.length})</h2>
            <button type="button" onClick={addDia}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium hover:text-slate-950 transition-colors">
              <Plus size={13} strokeWidth={2}/>Adicionar dia
            </button>
          </div>
          <div className="space-y-2">
            {editDiasArr.map(dia => (
              <DiaEdit
                key={dia.numeroDia}
                dia={dia}
                onChange={novo => setEditDiasArr(prev => prev.map(d => d.numeroDia === dia.numeroDia ? novo : d))}
                onRemove={() => removeDia(dia.numeroDia)}
              />
            ))}
            {editDiasArr.length === 0 && (
              <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center">
                <p className="text-slate-400 text-sm font-light">Clique em "Adicionar dia" para começar.</p>
              </div>
            )}
          </div>
        </section>
      ) : dias.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-card p-12 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center"><ClipboardList size={22} strokeWidth={1.5} className="text-slate-400"/></div>
          <p className="text-slate-500 text-sm font-medium">Nenhum dia configurado.</p>
          {protocolo.ativo && (
            <button type="button" onClick={entrarEdicao}
              className="text-xs text-slate-950 font-semibold underline underline-offset-2 hover:text-slate-600 transition-colors">
              Editar protocolo para adicionar orientações
            </button>
          )}
        </div>
      ) : (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Orientações por dia</h2>
          <div className="space-y-2">{dias.map(dia => <DiaView key={dia.id} dia={dia}/>)}</div>
        </section>
      )}

      <ModalConfirmar
        isOpen={modalArquivar}
        titulo="Arquivar Protocolo"
        descricao="Ao arquivar, este protocolo não estará disponível para novos tratamentos. Pacientes em andamento não serão afetados."
        labelConfirmar="Arquivar"
        corBotao="bg-red-600 hover:bg-red-700"
        onClose={() => setModalArquivar(false)}
        onConfirmar={async () => { await archiveProtocol(id); navigate('/protocols'); }}
      />

      <ModalConfirmar
        isOpen={modalReativar}
        titulo="Reativar Protocolo"
        descricao="Este protocolo voltará a ficar disponível para novos tratamentos."
        labelConfirmar="Reativar"
        corBotao="bg-emerald-600 hover:bg-emerald-700"
        onClose={() => setModalReativar(false)}
        onConfirmar={async () => { await unarchiveProtocol(id); await buscar(); }}
      />
    </div>
  );
}