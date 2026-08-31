// Arquivo: src/pages/Protocols/ProtocolForm/index.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Importamos o useParams
import {
  ArrowLeft, Plus, Trash2,
  ChevronDown, ChevronUp, Loader2, Save,
} from 'lucide-react';
import { createProtocol, getProtocol, updateProtocol } from '../../../services/protocolService'; // Importamos as novas funções

export default function ProtocolForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // Pega o ID da URL se for edição (/protocols/:id)
  const isEditing = Boolean(id);

  const [nome,       setNome]       = useState('');
  const [descricao,  setDescricao]  = useState('');
  const [diasPadrao, setDiasPadrao] = useState('');
  const [dias,       setDias]       = useState([]);
  const [diaAberto,  setDiaAberto]  = useState(1);
  const [carregando, setCarregando] = useState(false); // Estado para carregar dados do banco
  const [salvando,   setSalvando]   = useState(false);
  const [erro,       setErro]       = useState('');
  const [erros,      setErros]      = useState({});

  // 1. Se for edição, busca os dados do protocolo no backend ao montar a tela
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
        
        // Mapeia os dias e tarefas vindos do banco
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

  // 2. Controla a geração de novos dias (apenas se não estiver carregando os dados da edição)
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

      // Se for edição chama UPDATE, senão chama CREATE
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

  const inputBase = `w-full px-4 py-3 rounded-xl border text-sm text-slate-900
    placeholder:text-slate-300 outline-none transition-all
    focus:border-slate-950 focus:ring-2 focus:ring-slate-950/8`;

  // Tela de Carregamento Bonita
  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
        <p className="text-slate-500 text-sm">Carregando dados do protocolo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <button type="button" onClick={() => navigate('/protocols')}
          className="inline-flex items-center gap-2 text-slate-500 text-sm font-medium
            hover:text-slate-800 transition-colors mb-4">
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar para Protocolos
        </button>
        <h1 className="text-slate-950 text-2xl font-extrabold tracking-tight">
          {isEditing ? 'Editar Protocolo' : 'Novo Protocolo'}
        </h1>
        <p className="text-slate-400 text-sm font-light mt-1">
          {isEditing 
            ? 'Altere as orientações deste protocolo conforme necessário.' 
            : 'Defina o protocolo e as orientações de cada dia de recuperação.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <section className="bg-white border border-slate-100 rounded-2xl shadow-card p-6 space-y-4">
          <h2 className="text-slate-950 text-sm font-semibold">Informações do Protocolo</h2>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
              Nome *
            </label>
            <input
              type="text"
              value={nome}
              onChange={e => { setNome(e.target.value); setErros(p => ({ ...p, nome: '' })); }}
              placeholder="Ex: Pós-operatório de Extração de Sisos"
              className={`${inputBase} ${erros.nome ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`}
            />
            {erros.nome && <p className="text-xs text-red-500 font-medium">{erros.nome}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
              Descrição (opcional)
            </label>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              rows={2}
              placeholder="Descreva o objetivo e indicações deste protocolo…"
              className={`${inputBase} border-slate-200 bg-white resize-none`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
              Duração (dias) *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="365"
                value={diasPadrao}
                onChange={e => { setDiasPadrao(e.target.value); setErros(p => ({ ...p, diasPadrao: '' })); }}
                placeholder="7"
                className={`w-28 px-4 py-3 rounded-xl border text-sm text-slate-900
                  text-center font-semibold placeholder:text-slate-300 outline-none transition-all
                  focus:border-slate-950 focus:ring-2 focus:ring-slate-950/8
                  ${erros.diasPadrao ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`}
              />
              <p className="text-slate-500 text-sm font-light">
                {numDias > 0
                  ? `${numDias} dia${numDias !== 1 ? 's' : ''} de recuperação`
                  : 'Informe a duração do protocolo'}
              </p>
            </div>
            {erros.diasPadrao && <p className="text-xs text-red-500 font-medium">{erros.diasPadrao}</p>}
          </div>
        </section>

        {numDias > 0 && (
          <section className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50">
              <h2 className="text-slate-950 text-sm font-semibold">Orientações por Dia</h2>
            </div>

            <div className="divide-y divide-slate-50">
              {dias.map(dia => {
                const aberto         = diaAberto === dia.numeroDia;
                const tarefasValidas = dia.tarefas.filter(t => t.descricao.trim()).length;

                return (
                  <div key={dia.numeroDia}>
                    <button
                      type="button"
                      onClick={() => toggleDia(dia.numeroDia)}
                      className="w-full flex items-center justify-between px-6 py-4
                        hover:bg-slate-50/60 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-8 h-8
                          rounded-xl bg-slate-950 text-white text-xs font-bold flex-shrink-0">
                          D{dia.numeroDia}
                        </span>
                        <div>
                          <p className="text-slate-800 text-sm font-medium leading-none">
                            {dia.titulo.trim() || `Dia ${dia.numeroDia}`}
                          </p>
                          <p className="text-slate-400 text-xs font-light mt-0.5">
                            {tarefasValidas > 0
                              ? `${tarefasValidas} orientaç${tarefasValidas !== 1 ? 'ões' : 'ão'}`
                              : 'Nenhuma orientação adicionada'}
                          </p>
                        </div>
                      </div>
                      {aberto
                        ? <ChevronUp size={16} strokeWidth={1.5} className="text-slate-400" />
                        : <ChevronDown size={16} strokeWidth={1.5} className="text-slate-400" />}
                    </button>

                    {aberto && (
                      <div className="px-6 pb-6 pt-2 bg-slate-50/30 space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                            Título do dia (opcional)
                          </label>
                          <input
                            type="text"
                            value={dia.titulo}
                            onChange={e => setTitulo(dia.numeroDia, e.target.value)}
                            placeholder={`Ex: Cuidados Iniciais — Dia ${dia.numeroDia}`}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white
                              text-sm text-slate-900 placeholder:text-slate-300 outline-none
                              transition-all focus:border-slate-950 focus:ring-2 focus:ring-slate-950/8"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                            Orientações do paciente
                          </label>
                          {dia.tarefas.map((tarefa, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-slate-300 text-xs font-semibold w-5 text-right flex-shrink-0">
                                {idx + 1}.
                              </span>
                              <input
                                type="text"
                                value={tarefa.descricao}
                                onChange={e => setTarefa(dia.numeroDia, idx, e.target.value)}
                                placeholder="Ex: Tomar Amoxicilina 500mg a cada 8 horas"
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white
                                  text-sm text-slate-900 placeholder:text-slate-300 outline-none
                                  transition-all focus:border-slate-950 focus:ring-2 focus:ring-slate-950/8"
                              />
                              <button
                                type="button"
                                onClick={() => removeTarefa(dia.numeroDia, idx)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg
                                  text-slate-300 hover:text-red-500 hover:bg-red-50
                                  transition-all flex-shrink-0"
                              >
                                <Trash2 size={14} strokeWidth={1.5} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addTarefa(dia.numeroDia)}
                            className="inline-flex items-center gap-1.5 text-xs text-slate-500
                              font-medium hover:text-slate-800 transition-colors mt-1"
                          >
                            <Plus size={13} strokeWidth={2} />
                            Adicionar orientação
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {erro && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium">{erro}</p>
          </div>
        )}

        <div className="flex gap-3 pb-8">
          <button
            type="button"
            onClick={() => navigate('/protocols')}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700
              text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando || !nome.trim() || numDias < 1}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
              bg-slate-950 text-white text-sm font-semibold
              hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-150"
          >
            {salvando
              ? <><Loader2 size={15} strokeWidth={2} className="animate-spin" /> Salvando…</>
              : <><Save size={15} strokeWidth={1.5} /> {isEditing ? 'Salvar Alterações' : 'Salvar Protocolo'}</>}
          </button>
        </div>
      </form>
    </div>
  );
}