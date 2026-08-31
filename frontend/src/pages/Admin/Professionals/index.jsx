// Arquivo: src/pages/Admin/Professionals/index.jsx
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  UserPlus, RefreshCw, CheckCircle2,
  XCircle, MoreHorizontal, Loader2, Eye, EyeOff,
} from 'lucide-react';
import Modal from '../../../components/Modal';
import {
  getProfessionals,
  createProfessional,
  toggleProfessionalStatus,
} from '../../../services/professionalService';

// ─── Schema de cadastro ────────────────────────────────────────────────────
const cadastroSchema = z.object({
  nome:          z.string().min(2, 'Nome deve ter ao menos 2 caracteres.'),
  email:         z.string().email('Informe um e-mail válido.'),
  senha:         z.string().min(6, 'A senha deve ter ao menos 6 caracteres.'),
  telefone:      z.string().min(8, 'Telefone inválido.'),
  especialidade: z.string().min(2, 'Informe a especialidade.'),
});

// ─── Skeleton da tabela ────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {['Profissional', 'Especialidade', 'Contato', 'Status', ''].map((col) => (
                <th key={col} className="px-5 py-3.5 text-left text-[11px] font-semibold
                  text-slate-400 uppercase tracking-wider">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {[1, 2, 3].map((i) => (
              <tr key={i}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full skeleton flex-shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-32 skeleton" />
                      <div className="h-3 w-40 skeleton" />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4"><div className="h-3.5 w-28 skeleton" /></td>
                <td className="px-5 py-4"><div className="h-3.5 w-24 skeleton" /></td>
                <td className="px-5 py-4"><div className="h-5 w-16 skeleton rounded-full" /></td>
                <td className="px-5 py-4"><div className="h-8 w-8 skeleton rounded-lg ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Campo de input reutilizável ───────────────────────────────────────────
function FormField({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}

// ─── Modal de cadastro ─────────────────────────────────────────────────────
function ModalCadastro({ isOpen, onClose, onSuccess }) {
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erroServidor, setErroServidor] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(cadastroSchema) });

  function handleClose() {
    reset();
    setErroServidor('');
    setSenhaVisivel(false);
    onClose();
  }

  async function onSubmit(dados) {
    setErroServidor('');
    try {
      await createProfessional(dados);
      reset();
      onSuccess();
      handleClose();
    } catch (err) {
      setErroServidor(
        err.response?.data?.message ||
        'Erro ao cadastrar profissional. Tente novamente.'
      );
    }
  }

  const inputClass = (hasError) =>
    `w-full px-4 py-3 rounded-xl border text-sm text-slate-900
     placeholder:text-slate-300 bg-white outline-none
     transition-all duration-150 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/8
     ${hasError ? 'border-red-400 bg-red-50' : 'border-slate-200'}`;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Cadastrar Profissional" size="md">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

        <FormField label="Nome completo" error={errors.nome?.message}>
          <input
            type="text"
            placeholder="Dr. João Silva"
            {...register('nome')}
            className={inputClass(errors.nome)}
          />
        </FormField>

        <FormField label="E-mail" error={errors.email?.message}>
          <input
            type="email"
            placeholder="joao@email.com"
            {...register('email')}
            className={inputClass(errors.email)}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Telefone" error={errors.telefone?.message}>
            <input
              type="tel"
              placeholder="(51) 99999-9999"
              {...register('telefone')}
              className={inputClass(errors.telefone)}
            />
          </FormField>

          <FormField label="Especialidade" error={errors.especialidade?.message}>
            <input
              type="text"
              placeholder="Odontologia"
              {...register('especialidade')}
              className={inputClass(errors.especialidade)}
            />
          </FormField>
        </div>

        <FormField label="Senha inicial" error={errors.senha?.message}>
          <div className="relative">
            <input
              type={senhaVisivel ? 'text' : 'password'}
              placeholder="Mínimo 6 caracteres"
              {...register('senha')}
              className={`${inputClass(errors.senha)} pr-11`}
            />
            <button
              type="button"
              onClick={() => setSenhaVisivel((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2
                text-slate-400 hover:text-slate-600 transition-colors p-1"
              tabIndex={-1}
            >
              {senhaVisivel
                ? <EyeOff size={15} strokeWidth={1.5} />
                : <Eye    size={15} strokeWidth={1.5} />}
            </button>
          </div>
        </FormField>

        {erroServidor && (
          <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 rounded-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium">{erroServidor}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700
              text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
              bg-slate-950 text-white text-sm font-medium
              hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed
              transition-all duration-150"
          >
            {isSubmitting
              ? <><Loader2 size={15} strokeWidth={2} className="animate-spin" /> Cadastrando…</>
              : 'Cadastrar Profissional'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Linha da tabela ───────────────────────────────────────────────────────
function ProfessionalRow({ profissional, onToggle, toggling }) {
  const initials = profissional.nome?.split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  return (
    <tr className="hover:bg-slate-50/60 transition-colors duration-100">

      {/* Nome + email */}
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center
            flex-shrink-0 text-sm font-semibold
            ${profissional.ativo ? 'bg-slate-100 text-slate-600' : 'bg-red-50 text-red-400'}`}>
            {initials}
          </div>
          <div>
            <p className="text-slate-950 font-medium leading-none">{profissional.nome}</p>
            <p className="text-slate-400 text-xs font-light mt-0.5">{profissional.email}</p>
          </div>
        </div>
      </td>

      {/* Especialidade */}
      <td className="px-5 py-4 whitespace-nowrap">
        <p className="text-slate-700 text-sm">{profissional.especialidade ?? '—'}</p>
      </td>

      {/* Telefone */}
      <td className="px-5 py-4 whitespace-nowrap">
        <p className="text-slate-600 text-sm">{profissional.telefone ?? '—'}</p>
      </td>

      {/* Status */}
      <td className="px-5 py-4 whitespace-nowrap">
        {profissional.ativo ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
            bg-emerald-50 text-emerald-700 text-xs font-medium ring-1 ring-emerald-100">
            <CheckCircle2 size={11} strokeWidth={2} />
            Ativo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
            bg-red-50 text-red-700 text-xs font-medium ring-1 ring-red-100">
            <XCircle size={11} strokeWidth={2} />
            Bloqueado
          </span>
        )}
      </td>

      {/* Ação toggle */}
      <td className="px-5 py-4 whitespace-nowrap text-right">
        <button
          type="button"
          onClick={() => onToggle(profissional.id)}
          disabled={toggling === profissional.id}
          title={profissional.ativo ? 'Bloquear acesso' : 'Ativar acesso'}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            text-xs font-medium transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            ${profissional.ativo
              ? 'text-red-600 hover:bg-red-50 border border-red-100'
              : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-100'
            }`}
        >
          {toggling === profissional.id
            ? <Loader2 size={12} strokeWidth={2} className="animate-spin" />
            : profissional.ativo
              ? <><XCircle size={12} strokeWidth={1.5} /> Bloquear</>
              : <><CheckCircle2 size={12} strokeWidth={1.5} /> Ativar</>}
        </button>
      </td>
    </tr>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────
export default function AdminProfessionals() {
  const [profissionais, setProfissionais] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [erro,          setErro]          = useState('');
  const [modalAberto,   setModalAberto]   = useState(false);
  const [toggling,      setToggling]      = useState(null);

  const buscar = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const dados = await getProfessionals();
      setProfissionais(dados ?? []);
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao carregar profissionais.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { buscar(); }, [buscar]);

  async function handleToggle(id) {
    setToggling(id);
    try {
      const atualizado = await toggleProfessionalStatus(id);
      setProfissionais((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ativo: atualizado.ativo } : p))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao alterar status.');
    } finally {
      setToggling(null);
    }
  }

  const ativos   = profissionais.filter((p) => p.ativo).length;
  const bloqueados = profissionais.length - ativos;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-slate-950 text-2xl font-extrabold tracking-tight">
            Profissionais
          </h1>
          <p className="text-slate-400 text-sm font-light mt-1">
            {loading ? 'Carregando…'
              : `${profissionais.length} cadastrado${profissionais.length !== 1 ? 's' : ''} · ${ativos} ativo${ativos !== 1 ? 's' : ''} · ${bloqueados} bloqueado${bloqueados !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalAberto(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
            bg-slate-950 text-white text-sm font-medium
            hover:bg-slate-800 active:scale-[0.98]
            transition-all duration-150 self-start sm:self-auto"
        >
          <UserPlus size={16} strokeWidth={1.5} />
          Cadastrar Profissional
        </button>
      </div>

      {/* Erro */}
      {erro && !loading && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-red-700 text-sm font-medium">{erro}</p>
          <button type="button" onClick={buscar}
            className="inline-flex items-center gap-1.5 text-red-600 text-xs font-medium hover:text-red-800">
            <RefreshCw size={13} strokeWidth={1.5} />
            Tentar novamente
          </button>
        </div>
      )}

      {/* Tabela */}
      {loading ? <TableSkeleton /> : (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Profissional', 'Especialidade', 'Telefone', 'Status', 'Ação'].map((col) => (
                    <th key={col} className="px-5 py-3.5 text-left text-[11px] font-semibold
                      text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {profissionais.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                          <MoreHorizontal size={22} strokeWidth={1.5} className="text-slate-400" />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">
                          Nenhum profissional cadastrado ainda.
                        </p>
                        <button type="button" onClick={() => setModalAberto(true)}
                          className="text-sm text-slate-950 font-semibold underline underline-offset-2">
                          Cadastrar o primeiro profissional
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : profissionais.map((p) => (
                  <ProfessionalRow
                    key={p.id}
                    profissional={p}
                    onToggle={handleToggle}
                    toggling={toggling}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de cadastro */}
      <ModalCadastro
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSuccess={buscar}
      />
    </div>
  );
}