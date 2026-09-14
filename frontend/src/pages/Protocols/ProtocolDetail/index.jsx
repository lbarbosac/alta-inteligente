// Arquivo: frontend/src/pages/Protocols/ProtocolDetail/index.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Archive, ChevronDown, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import ConfirmDialog from '../../../components/ConfirmDialog';
import Field, { inputClass } from '../../../components/Field';
import InlineAlert from '../../../components/InlineAlert';
import { getProtocol, archiveProtocol, unarchiveProtocol, editarProtocolo } from '../../../services/protocolService';

function Skeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6" aria-busy="true">
      <div className="skeleton h-5 w-24" />
      <div className="space-y-2"><div className="skeleton h-8 w-64" /><div className="skeleton h-4 w-80 max-w-full" /></div>
      <div className="skeleton h-72 rounded-xl" />
    </div>
  );
}

function BadgeSituacao({ ativo }) {
  return ativo ? (
    <span className="inline-flex h-7 items-center gap-2 rounded-full border border-line bg-white px-2.5 text-xs font-medium text-ink">
      <span className="h-2 w-2 rounded-full bg-ink" aria-hidden="true" />Ativo
    </span>
  ) : (
    <span className="inline-flex h-7 items-center gap-2 rounded-full border border-line bg-neutral-100 px-2.5 text-xs font-medium text-neutral-600">
      <Archive size={12} strokeWidth={2} aria-hidden="true" />Arquivado
    </span>
  );
}

// ─── Dia em modo visualização ──────────────────────────────────────────────
function DiaView({ dia }) {
  const [aberto, setAberto] = useState(false);
  const total = dia.tarefas?.length ?? 0;

  return (
    <li>
      <button
        type="button"
        onClick={() => setAberto(v => !v)}
        aria-expanded={aberto}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-neutral-50 focus-visible:-outline-offset-2"
      >
        <span className="inline-flex h-8 min-w-10 items-center justify-center rounded-md bg-neutral-100 px-2 text-xs font-semibold text-ink tabular-nums">D{dia.numeroDia}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">{dia.titulo || `Dia ${dia.numeroDia}`}</span>
          <span className="block text-sm text-neutral-500">{total > 0 ? `${total} orientaç${total !== 1 ? 'ões' : 'ão'}` : 'Sem orientações'}</span>
        </span>
        <ChevronDown size={16} strokeWidth={1.75} className={`text-neutral-500 transition-transform ${aberto ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {aberto && (
        <div className="bg-neutral-50 px-5 pb-4 pt-3">
          {total > 0 ? (
            <ol className="space-y-2">
              {dia.tarefas.map((t, i) => (
                <li key={t.id} className="flex gap-3 text-sm">
                  <span className="w-5 flex-shrink-0 text-right text-neutral-500 tabular-nums">{i + 1}.</span>
                  <span className="leading-snug text-ink">{t.descricao}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-neutral-600">Nenhuma orientação cadastrada.</p>
          )}
        </div>
      )}
    </li>
  );
}

// ─── Dia em modo edição ────────────────────────────────────────────────────
function DiaEdit({ dia, onChange, onRemove }) {
  const [aberto, setAberto] = useState(false);
  const tarefas = dia.tarefas || [];

  function addTarefa() { onChange({ ...dia, tarefas: [...tarefas, { descricao: '' }] }); }
  function setTarefa(idx, descricao) { onChange({ ...dia, tarefas: tarefas.map((t, i) => i === idx ? { ...t, descricao } : t) }); }
  function removeTarefa(idx) { onChange({ ...dia, tarefas: tarefas.filter((_, i) => i !== idx) }); }

  return (
    <li>
      <div className="flex items-center gap-2 pr-3">
        <button
          type="button"
          onClick={() => setAberto(v => !v)}
          aria-expanded={aberto}
          className="flex min-w-0 flex-1 items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-neutral-50 focus-visible:-outline-offset-2"
        >
          <span className="inline-flex h-8 min-w-10 items-center justify-center rounded-md bg-neutral-100 px-2 text-xs font-semibold text-ink tabular-nums">D{dia.numeroDia}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink">{dia.titulo || `Dia ${dia.numeroDia}`}</span>
            <span className="block text-sm text-neutral-500">{tarefas.length} orientaç{tarefas.length !== 1 ? 'ões' : 'ão'}</span>
          </span>
          <ChevronDown size={16} strokeWidth={1.75} className={`text-neutral-500 transition-transform ${aberto ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remover dia ${dia.numeroDia}`}
          className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-red-700"
        >
          <Trash2 size={16} strokeWidth={1.75} />
        </button>
      </div>

      {aberto && (
        <div className="space-y-4 bg-neutral-50 px-5 pb-5 pt-4">
          <Field label="Título do dia" opcional>
            <input type="text" value={dia.titulo || ''} onChange={e => onChange({ ...dia, titulo: e.target.value })} placeholder="Ex.: Cuidados iniciais" className={inputClass()} />
          </Field>
          <div className="space-y-2">
            <p className="text-sm font-medium text-ink">Orientações ao paciente</p>
            {tarefas.map((t, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-5 flex-shrink-0 text-right text-sm text-neutral-500 tabular-nums">{idx + 1}.</span>
                <input
                  type="text"
                  value={t.descricao}
                  onChange={e => setTarefa(idx, e.target.value)}
                  placeholder="Ex.: Tomar amoxicilina 500 mg a cada 8 horas"
                  aria-label={`Orientação ${idx + 1} do dia ${dia.numeroDia}`}
                  className={inputClass(false, { className: 'flex-1' })}
                />
                <button
                  type="button"
                  onClick={() => removeTarefa(idx)}
                  aria-label={`Remover orientação ${idx + 1}`}
                  className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-white hover:text-red-700"
                >
                  <Trash2 size={16} strokeWidth={1.75} />
                </button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={addTarefa}>
              <Plus size={15} strokeWidth={2} aria-hidden="true" />
              Adicionar orientação
            </Button>
          </div>
        </div>
      )}
    </li>
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

  if (loading) return <Skeleton />;

  if (erro) return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/protocols" className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-ink"><ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />Protocolos</Link>
      <InlineAlert action={<Button size="sm" variant="secondary" onClick={buscar}>Tentar novamente</Button>}>{erro}</InlineAlert>
    </div>
  );

  const versao = protocolo?.versoes?.[0];
  const dias   = versao?.dias ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/protocols" className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 transition-colors hover:text-ink">
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
        Protocolos
      </Link>

      {modoEdicao ? (
        <>
          <header>
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Editar protocolo</h1>
            <p className="mt-1.5 text-sm text-neutral-600">{protocolo.nome} · Versão {versao?.versao ?? 1}</p>
          </header>

          <InlineAlert tone="neutro">
            Se você mudar dias ou orientações, será criada a versão {(versao?.versao ?? 0) + 1}.
            Pacientes já em tratamento continuam com a versão atual; tratamentos novos usam a nova.
          </InlineAlert>

          <Card title="Informações">
            <div className="space-y-4">
              <Field label="Nome">
                <input type="text" value={editNome} onChange={e => setEditNome(e.target.value)} className={inputClass()} />
              </Field>
              <Field label="Descrição" opcional>
                <textarea rows={2} value={editDescricao} onChange={e => setEditDescricao(e.target.value)} className={inputClass(false, { className: 'resize-none' })} />
              </Field>
            </div>
          </Card>

          <Card
            padded={false}
            title="Orientações por dia"
            description={`${editDiasArr.length} dia${editDiasArr.length !== 1 ? 's' : ''}`}
            actions={
              <Button variant="secondary" size="sm" onClick={addDia}>
                <Plus size={15} strokeWidth={2} aria-hidden="true" />
                Adicionar dia
              </Button>
            }
          >
            {editDiasArr.length === 0 ? (
              <p className="px-5 py-8 text-sm text-neutral-600">Clique em “Adicionar dia” para começar.</p>
            ) : (
              <ul className="divide-y divide-line">
                {editDiasArr.map(dia => (
                  <DiaEdit
                    key={dia.numeroDia}
                    dia={dia}
                    onChange={novo => setEditDiasArr(prev => prev.map(d => d.numeroDia === dia.numeroDia ? novo : d))}
                    onRemove={() => removeDia(dia.numeroDia)}
                  />
                ))}
              </ul>
            )}
          </Card>

          {erroEdicao && <InlineAlert>{erroEdicao}</InlineAlert>}

          <div className="flex flex-col-reverse gap-2 pb-8 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => { setModoEdicao(false); setErroEdicao(''); }}>Cancelar</Button>
            <Button loading={salvando} onClick={salvarEdicao}>{salvando ? 'Salvando…' : 'Salvar alterações'}</Button>
          </div>
        </>
      ) : (
        <>
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{protocolo.nome}</h1>
                <BadgeSituacao ativo={protocolo.ativo} />
              </div>
              <p className="mt-1.5 text-sm text-neutral-600 tabular-nums">
                {protocolo.diasPadrao} dias · {dias.length} configurado{dias.length !== 1 ? 's' : ''}{versao && ` · Versão ${versao.versao}`}
              </p>
              {protocolo.descricao && <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink">{protocolo.descricao}</p>}
            </div>
            <div className="flex flex-shrink-0 flex-wrap gap-2">
              {protocolo.ativo ? (
                <>
                  <Button variant="secondary" onClick={entrarEdicao}>
                    <Pencil size={15} strokeWidth={1.75} aria-hidden="true" />
                    Editar
                  </Button>
                  <Button variant="secondary" onClick={() => setModalArquivar(true)} className="hover:border-red-600 hover:text-red-700">
                    <Archive size={15} strokeWidth={1.75} aria-hidden="true" />
                    Arquivar
                  </Button>
                </>
              ) : (
                <Button variant="secondary" onClick={() => setModalReativar(true)}>
                  <RotateCcw size={15} strokeWidth={1.75} aria-hidden="true" />
                  Reativar
                </Button>
              )}
            </div>
          </header>

          <Card padded={false} title="Orientações por dia">
            {dias.length === 0 ? (
              <div className="flex flex-col items-start gap-3 px-5 py-8">
                <p className="text-sm text-neutral-600">Nenhum dia configurado.</p>
                {protocolo.ativo && <Button variant="secondary" size="sm" onClick={entrarEdicao}>Adicionar orientações</Button>}
              </div>
            ) : (
              <ul className="divide-y divide-line">{dias.map(dia => <DiaView key={dia.id} dia={dia} />)}</ul>
            )}
          </Card>
        </>
      )}

      <ConfirmDialog
        isOpen={modalArquivar}
        titulo="Arquivar protocolo"
        descricao="Ao arquivar, este protocolo não fica disponível para novos tratamentos. Pacientes em andamento não são afetados."
        labelConfirmar="Arquivar"
        tom="danger"
        onClose={() => setModalArquivar(false)}
        onConfirmar={async () => { await archiveProtocol(id); navigate('/protocols'); }}
      />

      <ConfirmDialog
        isOpen={modalReativar}
        titulo="Reativar protocolo"
        descricao="Este protocolo voltará a ficar disponível para novos tratamentos."
        labelConfirmar="Reativar"
        onClose={() => setModalReativar(false)}
        onConfirmar={async () => { await unarchiveProtocol(id); await buscar(); }}
      />
    </div>
  );
}
