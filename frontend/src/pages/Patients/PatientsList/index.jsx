// Arquivo: src/pages/Patients/PatientsList/index.jsx
import { useState, useMemo } from 'react';
import { Link }               from 'react-router-dom';
import { useForm }            from 'react-hook-form';
import { zodResolver }        from '@hookform/resolvers/zod';
import { z }                  from 'zod';
import { UserPlus, Users }     from 'lucide-react';
import PageHeader             from '../../../components/PageHeader';
import Card                   from '../../../components/Card';
import Button                 from '../../../components/Button';
import Field, { inputClass }  from '../../../components/Field';
import InlineAlert            from '../../../components/InlineAlert';
import Avatar                 from '../../../components/Avatar';
import PainLevel              from '../../../components/PainLevel';
import SearchInput            from '../../../components/SearchInput';
import EmptyState             from '../../../components/EmptyState';
import RecoveryStatusBadge    from '../../../components/RecoveryStatusBadge';
import Modal                  from '../../../components/Modal';
import { usePatients }        from '../../../hooks/usePatients';
import { createPatient }      from '../../../services/patientService';
import { calcularIdade }      from '../../../utils/formatDate';

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

const FILTROS = [
  { id: 'todos',     label: 'Todos',              aceita: () => true },
  { id: 'atencao',   label: 'Precisam de atenção', aceita: p => p.statusClinico === 'atencao' || p.statusClinico === 'critico' },
  { id: 'andamento', label: 'Em tratamento',       aceita: p => p.tratamentoAtual?.status === 'ativo' },
  { id: 'sem',       label: 'Sem tratamento',      aceita: p => !p.tratamentoAtual },
];

// ─── Skeleton ──────────────────────────────────────────────────────────────
function ListaSkeleton() {
  return (
    <div aria-busy="true" className="divide-y divide-line">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="skeleton h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-44" />
            <div className="skeleton h-3 w-24" />
          </div>
          <div className="skeleton hidden h-6 w-24 rounded-full sm:block" />
        </div>
      ))}
    </div>
  );
}

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
    <Modal isOpen={isOpen} onClose={handleClose} title="Novo paciente">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

        <Field label="Nome completo" error={errors.nome?.message}>
          <input type="text" autoComplete="off" {...register('nome')} className={inputClass(errors.nome)} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Data de nascimento" error={errors.dataNascimento?.message}>
            <input type="date" max={hoje} min="1900-01-01" {...register('dataNascimento')} className={inputClass(errors.dataNascimento)} />
          </Field>

          <Field label="Telefone" error={errors.telefone?.message}>
            <input type="tel" inputMode="tel" placeholder="(51) 99999-9999" value={telefone} onChange={handleTelefone} className={inputClass(errors.telefone)} />
          </Field>
        </div>

        <Field label="E-mail" opcional error={errors.email?.message}>
          <input type="email" placeholder="paciente@email.com" {...register('email')} className={inputClass(errors.email)} />
        </Field>

        <Field label="Observações" opcional hint="Alergias, condições, cuidados especiais." error={errors.observacoes?.message}>
          <textarea rows={3} {...register('observacoes')} className={inputClass(errors.observacoes, { className: 'resize-none' })} />
        </Field>

        {erroServidor && <InlineAlert>{erroServidor}</InlineAlert>}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button type="submit" loading={isSubmitting}>{isSubmitting ? 'Cadastrando…' : 'Cadastrar paciente'}</Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Tratamento na linha ───────────────────────────────────────────────────
function ResumoTratamento({ tratamento }) {
  if (!tratamento) return <span className="text-sm text-neutral-500">Sem tratamento</span>;

  const progresso = tratamento.totalDias ? Math.min((tratamento.diaAtual / tratamento.totalDias) * 100, 100) : 0;
  return (
    <div className="min-w-0">
      <p className="truncate text-sm text-ink">{tratamento.nomeProcedimento}</p>
      {tratamento.status === 'ativo' ? (
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1 w-20 overflow-hidden rounded-full bg-neutral-200">
            <div className="h-full rounded-full bg-ink" style={{ width: `${progresso}%` }} />
          </div>
          <span className="text-xs text-neutral-600 tabular-nums">
            Dia {tratamento.diaAtual}{tratamento.totalDias ? ` de ${tratamento.totalDias}` : ''}
          </span>
        </div>
      ) : (
        <p className="mt-0.5 text-xs text-neutral-500">Tratamento encerrado</p>
      )}
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────
export default function PatientsList() {
  const { pacientes, loading, erro, refetch } = usePatients();
  const [busca,       setBusca]       = useState('');
  const [filtro,      setFiltro]      = useState('todos');
  const [modalAberto, setModalAberto] = useState(false);

  const contagem = useMemo(
    () => Object.fromEntries(FILTROS.map(f => [f.id, pacientes.filter(f.aceita).length])),
    [pacientes]
  );

  const pacientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const regra = FILTROS.find(f => f.id === filtro)?.aceita ?? (() => true);
    return pacientes.filter(p =>
      regra(p) && (!termo ||
        p.nome?.toLowerCase().includes(termo) ||
        p.email?.toLowerCase().includes(termo) ||
        p.telefone?.includes(termo))
    );
  }, [busca, filtro, pacientes]);

  const vazio = !loading && pacientesFiltrados.length === 0;

  return (
    <div className="space-y-6">

      <PageHeader
        title="Pacientes"
        description={loading ? 'Carregando…' : `${pacientes.length} paciente${pacientes.length !== 1 ? 's' : ''} cadastrado${pacientes.length !== 1 ? 's' : ''}`}
        actions={
          <Button onClick={() => setModalAberto(true)}>
            <UserPlus size={16} strokeWidth={1.75} aria-hidden="true" />
            Novo paciente
          </Button>
        }
      />

      {erro && (
        <InlineAlert action={<Button size="sm" variant="secondary" onClick={refetch}>Tentar novamente</Button>}>
          {erro}
        </InlineAlert>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filtrar pacientes" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:pb-0">
          {FILTROS.map(f => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filtro === f.id}
              onClick={() => setFiltro(f.id)}
              className={`inline-flex h-9 flex-shrink-0 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors
                ${filtro === f.id ? 'bg-ink text-white' : 'border border-line bg-white text-neutral-700 hover:border-neutral-400'}`}
            >
              {f.label}
              {!loading && <span className={`tabular-nums ${filtro === f.id ? 'text-neutral-400' : 'text-neutral-500'}`}>{contagem[f.id]}</span>}
            </button>
          ))}
        </div>
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar por nome, e-mail ou telefone" label="Buscar paciente" className="w-full lg:max-w-xs" />
      </div>

      <Card padded={false}>
        {loading ? <ListaSkeleton /> : vazio ? (
          <EmptyState
            icon={Users}
            title={busca ? `Nenhum resultado para “${busca}”` : filtro !== 'todos' ? 'Nenhum paciente neste filtro' : 'Nenhum paciente cadastrado ainda'}
            subtitle={busca || filtro !== 'todos' ? 'Tente outro termo ou filtro.' : 'Cadastre o primeiro paciente para começar o acompanhamento.'}
            action={!busca && filtro === 'todos' && (
              <Button onClick={() => setModalAberto(true)}>
                <UserPlus size={16} strokeWidth={1.75} aria-hidden="true" />
                Novo paciente
              </Button>
            )}
          />
        ) : (
          <>
            {/* Tabela — tablet e desktop */}
            <table className="hidden w-full text-left md:table">
              <thead>
                <tr className="border-b border-line text-xs font-medium text-neutral-500">
                  <th scope="col" className="px-5 py-3 font-medium">Paciente</th>
                  <th scope="col" className="px-5 py-3 font-medium">Tratamento</th>
                  <th scope="col" className="px-5 py-3 font-medium">Última dor</th>
                  <th scope="col" className="px-5 py-3 font-medium">Status</th>
                  <th scope="col" className="hidden px-5 py-3 font-medium xl:table-cell">Telefone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pacientesFiltrados.map(paciente => {
                  const idade = calcularIdade(paciente.dataNascimento);
                  return (
                    <tr key={paciente.id} className="relative transition-colors hover:bg-neutral-50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar nome={paciente.nome} />
                          <div className="min-w-0">
                            <Link to={`/patients/${paciente.id}`} className="font-medium text-ink after:absolute after:inset-0 hover:underline">
                              {paciente.nome}
                            </Link>
                            <p className="text-sm text-neutral-500">{idade !== null ? `${idade} anos` : '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-64 px-5 py-3.5"><ResumoTratamento tratamento={paciente.tratamentoAtual} /></td>
                      <td className="px-5 py-3.5">
                        {paciente.ultimoCheckin ? <PainLevel nivel={paciente.ultimoCheckin.nivelDor} size="sm" /> : <span className="text-sm text-neutral-500">—</span>}
                      </td>
                      <td className="px-5 py-3.5"><RecoveryStatusBadge status={paciente.statusClinico} size="sm" /></td>
                      <td className="hidden whitespace-nowrap px-5 py-3.5 text-sm text-neutral-600 tabular-nums xl:table-cell">{paciente.telefone ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Lista — celular */}
            <ul className="divide-y divide-line md:hidden">
              {pacientesFiltrados.map(paciente => (
                <li key={paciente.id} className="relative flex items-center gap-3 px-4 py-3.5">
                  <Avatar nome={paciente.nome} />
                  <div className="min-w-0 flex-1">
                    <Link to={`/patients/${paciente.id}`} className="block truncate font-medium text-ink after:absolute after:inset-0">
                      {paciente.nome}
                    </Link>
                    <div className="mt-1"><RecoveryStatusBadge status={paciente.statusClinico} size="sm" /></div>
                  </div>
                  {paciente.ultimoCheckin && <PainLevel nivel={paciente.ultimoCheckin.nivelDor} size="sm" />}
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <ModalNovoPaciente
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSuccess={refetch}
      />
    </div>
  );
}
