// Arquivo: src/pages/Protocols/ProtocolForm/index.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Loader2, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../../components/PageHeader';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Field, { inputClass } from '../../../components/Field';
import InlineAlert from '../../../components/InlineAlert';
import { createProtocol, getProtocol, updateProtocol } from '../../../services/protocolService';

export default function ProtocolForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // ID da URL se for edição (/protocols/:id)
  const isEditing = Boolean(id);

  const [nome,       setNome]       = useState('');
  const [descricao,  setDescricao]  = useState('');
  const [diasPadrao, setDiasPadrao] = useState('');
  const [dias,       setDias]       = useState([]);
  const [diaAberto,  setDiaAberto]  = useState(1);
  const [carregando, setCarregando] = useState(false); // carregando dados do banco
  const [salvando,   setSalvando]   = useState(false);
  const [erro,       setErro]       = useState('');
  const [erros,      setErros]      = useState({});

  // 1. Se for edição, busca os dados do protocolo ao montar a tela
  useEffect(() => {
    if (!isEditing) return;

    async function carregarProtocolo() {
      setCarregando(true);
      setErro('');
      try {
        const dados = await getProtocol(id);
        setNome(dados.nome || '');
        setDescricao(dados.descricao || '');
        setDiasPadrao(dados.diasPadrao ? String(dados.diasPadrao) : '');

        const diasCarregados = Array.from({ length: dados.diasPadrao }, (_, i) => {
          const diaNum = i + 1;
          const diaBanco = dados.dias?.find(d => d.numeroDia === diaNum);
          return {
            numeroDia: diaNum,
            titulo: diaBanco?.titulo || '',
            tarefas: diaBanco?.tarefas || []
          };
        });

        setDias(diasCarregados);
      } catch (err) {
        setErro('Erro ao carregar os dados do protocolo.');
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }

    carregarProtocolo();
  }, [id, isEditing]);

  // 2. Gera os dias conforme a duração (fora do carregamento da edição)
  useEffect(() => {
    if (carregando) return;

    const num = parseInt(diasPadrao) || 0;
    if (num > 0 && num <= 365) {
      setDias(prev =>
        Array.from({ length: num }, (_, i) => {
          const existente = prev.find(d => d.numeroDia === i + 1);
          return existente ?? { numeroDia: i + 1, titulo: '', tarefas: [] };
        })
      );
      setDiaAberto(1);
    } else {
      setDias([]);
    }
  }, [diasPadrao, carregando]);

  function toggleDia(n) {
    setDiaAberto(prev => (prev === n ? null : n));
  }

  function setTitulo(numeroDia, titulo) {
    setDias(prev => prev.map(d => d.numeroDia === numeroDia ? { ...d, titulo } : d));
  }

  function addTarefa(numeroDia) {
    setDias(prev => prev.map(d =>
      d.numeroDia === numeroDia
        ? { ...d, tarefas: [...d.tarefas, { descricao: '', numeroOrdem: d.tarefas.length + 1 }] }
        : d
    ));
  }

  function setTarefa(numeroDia, idx, descricao) {
    setDias(prev => prev.map(d =>
      d.numeroDia === numeroDia
        ? { ...d, tarefas: d.tarefas.map((t, i) => i === idx ? { ...t, descricao } : t) }
        : d
    ));
  }

  function removeTarefa(numeroDia, idx) {
    setDias(prev => prev.map(d =>
      d.numeroDia === numeroDia
        ? {
            ...d,
            tarefas: d.tarefas
              .filter((_, i) => i !== idx)
              .map((t, i) => ({ ...t, numeroOrdem: i + 1 })),
          }
        : d
    ));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const novosErros = {};
    if (!nome.trim()) novosErros.nome = 'Nome é obrigatório.';
    if (!diasPadrao || parseInt(diasPadrao) < 1) novosErros.diasPadrao = 'Informe um número válido de dias.';
    if (Object.keys(novosErros).length) { setErros(novosErros); return; }

    setErros({});
    setErro('');
    setSalvando(true);
    try {
      const diasPayload = dias
        .map(d => ({
          numeroDia: d.numeroDia,
          titulo:    d.titulo.trim() || null,
          tarefas:   d.tarefas
            .filter(t => t.descricao.trim())
            .map((t, i) => ({ descricao: t.descricao.trim(), numeroOrdem: i + 1 })),
        }))
        .filter(d => d.titulo || d.tarefas.length > 0);

      const payload = {
        nome:       nome.trim(),
        descricao:  descricao.trim() || null,
        diasPadrao: parseInt(diasPadrao),
        dias:       diasPayload,
      };

      if (isEditing) {
        await updateProtocol(id, payload);
      } else {
        await createProtocol(payload);
      }

      navigate('/protocols');
    } catch (err) {
      setErro(err.response?.data?.message || `Erro ao ${isEditing ? 'salvar' : 'criar'} protocolo. Tente novamente.`);
    } finally {
      setSalvando(false);
    }
  }

  const numDias = parseInt(diasPadrao) || 0;

  if (carregando) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3" aria-busy="true">
        <Loader2 size={24} className="animate-spin text-neutral-600" aria-hidden="true" />
        <p className="text-sm text-neutral-600">Carregando dados do protocolo…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/protocols" className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 transition-colors hover:text-ink">
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
        Protocolos
      </Link>

      <PageHeader
        title={isEditing ? 'Editar protocolo' : 'Novo protocolo'}
        description={isEditing
          ? 'Altere as orientações deste protocolo conforme necessário.'
          : 'Defina a duração e as orientações de cada dia de recuperação.'}
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Card title="Informações">
          <div className="space-y-4">
            <Field label="Nome" error={erros.nome}>
              <input
                type="text"
                value={nome}
                onChange={e => { setNome(e.target.value); setErros(p => ({ ...p, nome: '' })); }}
                placeholder="Ex.: Pós-operatório de extração de sisos"
                className={inputClass(erros.nome)}
              />
            </Field>

            <Field label="Descrição" opcional hint="Objetivo e indicações do protocolo.">
              <textarea
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                rows={2}
                className={inputClass(false, { className: 'resize-none' })}
              />
            </Field>

            <Field label="Duração em dias" htmlFor="duracao-dias" error={erros.diasPadrao}>
              <div className="flex items-center gap-3">
                <input
                  id="duracao-dias"
                  aria-describedby={erros.diasPadrao ? "duracao-dias-erro" : undefined}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="365"
                  value={diasPadrao}
                  onChange={e => { setDiasPadrao(e.target.value); setErros(p => ({ ...p, diasPadrao: '' })); }}
                  placeholder="7"
                  className={inputClass(erros.diasPadrao, { className: 'w-24 text-center font-semibold tabular-nums' })}
                />
                <span className="text-sm text-neutral-600">
                  {numDias > 0 ? `${numDias} dia${numDias !== 1 ? 's' : ''} de recuperação` : 'Informe a duração'}
                </span>
              </div>
            </Field>
          </div>
        </Card>

        {numDias > 0 && (
          <Card padded={false} title="Orientações por dia" description="O paciente vê as orientações do dia em que está.">
            <ul className="divide-y divide-line">
              {dias.map(dia => {
                const aberto         = diaAberto === dia.numeroDia;
                const tarefasValidas = dia.tarefas.filter(t => t.descricao.trim()).length;
                const idPainel       = `dia-${dia.numeroDia}`;

                return (
                  <li key={dia.numeroDia}>
                    <button
                      type="button"
                      onClick={() => toggleDia(dia.numeroDia)}
                      aria-expanded={aberto}
                      aria-controls={idPainel}
                      className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-neutral-50 focus-visible:-outline-offset-2"
                    >
                      <span className="inline-flex h-8 min-w-10 items-center justify-center rounded-md bg-neutral-100 px-2 text-xs font-semibold text-ink tabular-nums">
                        D{dia.numeroDia}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{dia.titulo.trim() || `Dia ${dia.numeroDia}`}</span>
                        <span className="block text-sm text-neutral-500">
                          {tarefasValidas > 0 ? `${tarefasValidas} orientaç${tarefasValidas !== 1 ? 'ões' : 'ão'}` : 'Sem orientações'}
                        </span>
                      </span>
                      <ChevronDown size={16} strokeWidth={1.75} className={`text-neutral-500 transition-transform ${aberto ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>

                    {aberto && (
                      <div id={idPainel} className="space-y-4 bg-neutral-50 px-5 pb-5 pt-4">
                        <Field label="Título do dia" opcional>
                          <input
                            type="text"
                            value={dia.titulo}
                            onChange={e => setTitulo(dia.numeroDia, e.target.value)}
                            placeholder={`Ex.: Cuidados iniciais`}
                            className={inputClass()}
                          />
                        </Field>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-ink">Orientações ao paciente</p>
                          {dia.tarefas.map((tarefa, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-5 flex-shrink-0 text-right text-sm text-neutral-500 tabular-nums">{idx + 1}.</span>
                              <input
                                type="text"
                                value={tarefa.descricao}
                                onChange={e => setTarefa(dia.numeroDia, idx, e.target.value)}
                                placeholder="Ex.: Tomar amoxicilina 500 mg a cada 8 horas"
                                aria-label={`Orientação ${idx + 1} do dia ${dia.numeroDia}`}
                                className={inputClass(false, { className: 'flex-1' })}
                              />
                              <button
                                type="button"
                                onClick={() => removeTarefa(dia.numeroDia, idx)}
                                aria-label={`Remover orientação ${idx + 1}`}
                                className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-white hover:text-red-700"
                              >
                                <Trash2 size={16} strokeWidth={1.75} />
                              </button>
                            </div>
                          ))}
                          <Button variant="ghost" size="sm" onClick={() => addTarefa(dia.numeroDia)}>
                            <Plus size={15} strokeWidth={2} aria-hidden="true" />
                            Adicionar orientação
                          </Button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        )}

        {erro && <InlineAlert>{erro}</InlineAlert>}

        <div className="flex flex-col-reverse gap-2 pb-8 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => navigate('/protocols')}>Cancelar</Button>
          <Button type="submit" loading={salvando} disabled={!nome.trim() || numDias < 1}>
            {salvando ? 'Salvando…' : isEditing ? 'Salvar alterações' : 'Salvar protocolo'}
          </Button>
        </div>
      </form>
    </div>
  );
}
