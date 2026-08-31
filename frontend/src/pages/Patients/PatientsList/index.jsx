// Arquivo: src/pages/Patients/PatientsList/index.jsx
import { useState, useMemo, useCallback } from 'react';
import { useNavigate }        from 'react-router-dom';
import { useForm }            from 'react-hook-form';
import { zodResolver }        from '@hookform/resolvers/zod';
import { z }                  from 'zod';
import { UserPlus, ChevronRight, Frown, RefreshCw, Loader2 } from 'lucide-react';
import SearchInput            from '../../../components/SearchInput';
import RecoveryStatusBadge    from '../../../components/RecoveryStatusBadge';
import Modal                  from '../../../components/Modal';
import { usePatients }        from '../../../hooks/usePatients';
import { createPatient }      from '../../../services/patientService';

// ─── Máscara de telefone ───────────────────────────────────────────────────
function mascaraTelefone(valor) {
  return valor
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
    .slice(0, 15);
}

// ─── Schema de validação ───────────────────────────────────────────────────
const novoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres.'),
  dataNascimento: z.coerce
    .date({ message: 'Data inválida. Use AAAA-MM-DD.' })
    .max(new Date(), { message: 'Data de nascimento não pode ser no futuro.' })
    .refine(d => d.getFullYear() >= 1900, { message: 'Ano inválido (mínimo: 1900).' }),
  telefone: z.string().min(8, 'Telefone inválido.'),
  email:    z.string().email('E-mail inválido.').optional().or(z.literal('')).nullable(),
  observacoes: z.string().optional().nullable(),
});

// ─── Utilitários ───────────────────────────────────────────────────────────
function calcularIdade(dataNascimento) {
  if (!dataNascimento) return null;
  const hoje = new Date();
  const nasc = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

function formatarData(dataIso) {
  if (!dataIso) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(dataIso));
}

function getInitials(nome) {
  const partes = nome?.trim().split(' ').filter(Boolean) ?? [];
  if (!partes.length) return '?';
  if (partes.length === 1) return partes[0][0].toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

// ─── Skeleton ──────────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {['Paciente', 'Contato', 'Cadastrado em', 'Status', ''].map(col => (
              <th key={col} className="px-5 py-3.5 text-left text-[11px] font-semibold
                text-slate-400 uppercase tracking-wider">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {[1,2,3,4,5].map(i => (
            <tr key={i}>
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full skeleton flex-shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-32 skeleton" />
                    <div className="h-3 w-16 skeleton" />
                  </div>
                </div>
              </td>
              <td className="px-5 py-4"><div className="h-3.5 w-28 skeleton" /></td>
              <td className="px-5 py-4"><div className="h-3.5 w-24 skeleton" /></td>
              <td className="px-5 py-4"><div className="h-5 w-20 skeleton rounded-full" /></td>
              <td className="px-5 py-4"><div className="h-7 w-7 skeleton rounded-lg ml-auto" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Campo de formulário ───────────────────────────────────────────────────
function FormField({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

const inputClass = hasError =>
  `w-full px-4 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-300 bg-white
   outline-none transition-all duration-150 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/8
   ${hasError ? 'border-red-400 bg-red-50' : 'border-slate-200'}`;

// ─── Modal de novo paciente ────────────────────────────────────────────────
function ModalNovoPaciente({ isOpen, onClose, onSuccess }) {
  const [erroServidor, setErroServidor] = useState('');
  const [telefone, setTelefone] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(novoSchema) });

  function handleClose() {
    reset();
    setErroServidor('');
    setTelefone('');
    onClose();
  }

  function handleTelefone(e) {
    const masked = mascaraTelefone(e.target.value);
    setTelefone(masked);
    setValue('telefone', masked, { shouldValidate: true });
  }

  async function onSubmit(dados) {
    setErroServidor('');
    try {
      const payload = {
        ...dados,
        telefone,
        email:       dados.email       || null,
        observacoes: dados.observacoes || null,
      };
      await createPatient(payload);
      reset();
      setTelefone('');
      onSuccess();
      handleClose();
    } catch (err) {
      setErroServidor(
        err.response?.data?.message || 'Erro ao cadastrar paciente. Tente novamente.'
      );
    }
  }

  const hoje = new Date().toISOString().split('T')[0];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Novo Paciente" size="md">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

        <FormField label="Nome completo" error={errors.nome?.message}>
          <input type="text" placeholder="Nome do paciente"
            {...register('nome')} className={inputClass(errors.nome)} />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Data de Nascimento" error={errors.dataNascimento?.message}>
            <input
              type="date"
              max={hoje}
              min="1900-01-01"
              {...register('dataNascimento')}
              className={inputClass(errors.dataNascimento)}
            />
          </FormField>

          <FormField label="Telefone" error={errors.telefone?.message}>
            <input
              type="tel"
              placeholder="(51) 99999-9999"
              value={telefone}
              onChange={handleTelefone}
              className={inputClass(errors.telefone)}
            />
          </FormField>
        </div>

        <FormField label="E-mail (opcional)" error={errors.email?.message}>
          <input type="email" placeholder="paciente@email.com"
            {...register('email')} className={inputClass(errors.email)} />
        </FormField>

        <FormField label="Observações (opcional)" error={errors.observacoes?.message}>
          <textarea rows={3}
            placeholder="Informações relevantes sobre o paciente…"
            {...register('observacoes')}
            className={`${inputClass(errors.observacoes)} resize-none`} />
        </FormField>

        {erroServidor && (
          <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-100 rounded-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium">{erroServidor}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={handleClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700
              text-sm font-medium hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
              bg-slate-950 text-white text-sm font-medium hover:bg-slate-800
              disabled:opacity-60 transition-all">
            {isSubmitting
              ? <><Loader2 size={15} strokeWidth={2} className="animate-spin" /> Cadastrando…</>
              : 'Cadastrar Paciente'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────
export default function PatientsList() {
  const navigate = useNavigate();
  const { pacientes, loading, erro, refetch } = usePatients();
  const [busca,       setBusca]       = useState('');
  const [modalAberto, setModalAberto] = useState(false);

  const pacientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return pacientes;
    return pacientes.filter(p =>
      p.nome?.toLowerCase().includes(termo) ||
      p.email?.toLowerCase().includes(termo) ||
      p.telefone?.includes(termo)
    );
  }, [busca, pacientes]);

  if (erro) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <h1 className="text-slate-950 text-2xl font-extrabold tracking-tight">Pacientes</h1>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-slate-600 text-sm font-medium">{erro}</p>
          <button type="button" onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950
              text-white text-sm font-medium hover:bg-slate-800 transition-colors">
            <RefreshCw size={14} strokeWidth={1.5} /> Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-slate-950 text-2xl font-extrabold tracking-tight">Pacientes</h1>
          <p className="text-slate-400 text-sm font-light mt-1">
            {loading
              ? 'Carregando…'
              : `${pacientes.length} paciente${pacientes.length !== 1 ? 's' : ''} cadastrado${pacientes.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button type="button" onClick={() => setModalAberto(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950
            text-white text-sm font-medium hover:bg-slate-800 active:scale-[0.98]
            transition-all self-start sm:self-auto">
          <UserPlus size={16} strokeWidth={1.5} /> Novo Paciente
        </button>
      </div>

      <SearchInput value={busca} onChange={setBusca}
        placeholder="Buscar por nome, e-mail ou telefone…" className="max-w-sm" />

      {loading ? <TableSkeleton /> : (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Paciente', 'Contato', 'Cadastrado em', 'Status', ''].map(col => (
                    <th key={col} className="px-5 py-3.5 text-left text-[11px] font-semibold
                      text-slate-400 uppercase tracking-wider whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pacientesFiltrados.length === 0 ? (
                  <tr><td colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <Frown size={22} strokeWidth={1.5} className="text-slate-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-slate-700 text-sm font-medium">
                          {busca ? `Nenhum resultado para "${busca}"` : 'Nenhum paciente cadastrado ainda.'}
                        </p>
                        <p className="text-slate-400 text-xs font-light mt-1">
                          {busca ? 'Tente outro termo.' : 'Clique em "Novo Paciente" para começar.'}
                        </p>
                      </div>
                    </div>
                  </td></tr>
                ) : pacientesFiltrados.map(paciente => {
                  const idade = calcularIdade(paciente.dataNascimento);
                  return (
                    <tr key={paciente.id}
                      onClick={() => navigate(`/patients/${paciente.id}`)}
                      className="hover:bg-slate-50/60 transition-colors duration-100
                        group cursor-pointer">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center
                            justify-center flex-shrink-0 text-sm font-semibold text-slate-600">
                            {getInitials(paciente.nome)}
                          </div>
                          <div>
                            <p className="text-slate-950 font-medium leading-none">
                              {paciente.nome}
                            </p>
                            <p className="text-slate-400 text-xs font-light mt-0.5">
                              {idade !== null ? `${idade} anos` : '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="text-slate-700 font-medium">{paciente.telefone ?? '—'}</p>
                        {paciente.email && (
                          <p className="text-slate-400 text-xs font-light mt-0.5 truncate max-w-[180px]">
                            {paciente.email}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="text-slate-600 text-sm">{formatarData(paciente.criadoEm)}</p>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <RecoveryStatusBadge status="sem_checkin" />
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <button type="button"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg
                            text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all">
                          <ChevronRight size={16} strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ModalNovoPaciente
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSuccess={refetch}
      />
    </div>
  );
}