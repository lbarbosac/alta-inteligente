// Arquivo: src/pages/Admin/Professionals/index.jsx
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, UserPlus, Users } from 'lucide-react';
import PageHeader from '../../../components/PageHeader';
import Card from '../../../components/Card';
import Avatar from '../../../components/Avatar';
import Button from '../../../components/Button';
import EmptyState from '../../../components/EmptyState';
import Field, { inputClass } from '../../../components/Field';
import InlineAlert from '../../../components/InlineAlert';
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

function BadgeConta({ ativo }) {
  return ativo ? (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-line bg-white px-2 text-xs font-medium text-ink">
      <span className="h-2 w-2 rounded-full bg-ink" aria-hidden="true" />Ativo
    </span>
  ) : (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-line bg-neutral-100 px-2 text-xs font-medium text-neutral-700">
      <span className="h-2 w-2 rounded-full bg-white ring-1 ring-inset ring-neutral-400" aria-hidden="true" />Bloqueado
    </span>
  );
}

function ListaSkeleton() {
  return (
    <div aria-busy="true" className="divide-y divide-line">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-3 px-5 py-4">
          <div className="skeleton h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2"><div className="skeleton h-4 w-40" /><div className="skeleton h-3 w-56" /></div>
          <div className="skeleton h-9 w-24" />
        </div>
      ))}
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Cadastrar profissional">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

        <Field label="Nome completo" error={errors.nome?.message}>
          <input type="text" autoComplete="off" {...register('nome')} className={inputClass(errors.nome)} />
        </Field>

        <Field label="E-mail" error={errors.email?.message}>
          <input type="email" autoComplete="off" {...register('email')} className={inputClass(errors.email)} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telefone" error={errors.telefone?.message}>
            <input type="tel" inputMode="tel" placeholder="(51) 99999-9999" {...register('telefone')} className={inputClass(errors.telefone)} />
          </Field>
          <Field label="Especialidade" error={errors.especialidade?.message}>
            <input type="text" placeholder="Ex.: Odontologia" {...register('especialidade')} className={inputClass(errors.especialidade)} />
          </Field>
        </div>

        <Field label="Senha inicial" htmlFor="senha-inicial" hint="Mínimo de 6 caracteres." error={errors.senha?.message}>
          <div className="relative">
            <input
              id="senha-inicial"
              type={senhaVisivel ? 'text' : 'password'}
              autoComplete="new-password"
              aria-invalid={errors.senha ? true : undefined}
              aria-describedby={errors.senha ? 'senha-inicial-erro' : 'senha-inicial-dica'}
              {...register('senha')}
              className={inputClass(errors.senha, { className: 'pr-12' })}
            />
            <button
              type="button"
              onClick={() => setSenhaVisivel(v => !v)}
              aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={senhaVisivel}
              className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center
                rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-ink"
            >
              {senhaVisivel ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
            </button>
          </div>
        </Field>

        {erroServidor && <InlineAlert>{erroServidor}</InlineAlert>}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button type="submit" loading={isSubmitting}>{isSubmitting ? 'Cadastrando…' : 'Cadastrar profissional'}</Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────
export default function AdminProfessionals() {
  const [profissionais, setProfissionais] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [erro,          setErro]          = useState('');
  const [erroAcao,      setErroAcao]      = useState('');
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
    setErroAcao('');
    try {
      const atualizado = await toggleProfessionalStatus(id);
      setProfissionais((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ativo: atualizado.ativo } : p))
      );
    } catch (err) {
      setErroAcao(err.response?.data?.message || 'Erro ao alterar o acesso.');
    } finally {
      setToggling(null);
    }
  }

  const ativos     = profissionais.filter((p) => p.ativo).length;
  const bloqueados = profissionais.length - ativos;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profissionais"
        description={loading ? 'Carregando…'
          : `${profissionais.length} cadastrado${profissionais.length !== 1 ? 's' : ''} · ${ativos} ativo${ativos !== 1 ? 's' : ''} · ${bloqueados} bloqueado${bloqueados !== 1 ? 's' : ''}`}
        actions={
          <Button onClick={() => setModalAberto(true)}>
            <UserPlus size={16} strokeWidth={1.75} aria-hidden="true" />
            Cadastrar profissional
          </Button>
        }
      />

      {erro && !loading && (
        <InlineAlert action={<Button size="sm" variant="secondary" onClick={buscar}>Tentar novamente</Button>}>{erro}</InlineAlert>
      )}
      {erroAcao && <InlineAlert>{erroAcao}</InlineAlert>}

      <Card padded={false}>
        {loading ? <ListaSkeleton /> : profissionais.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum profissional cadastrado"
            subtitle="Cadastre o primeiro profissional para ele começar a acompanhar pacientes."
            action={<Button onClick={() => setModalAberto(true)}><UserPlus size={16} strokeWidth={1.75} aria-hidden="true" />Cadastrar profissional</Button>}
          />
        ) : (
          <>
            <table className="hidden w-full text-left md:table">
              <thead>
                <tr className="border-b border-line text-xs text-neutral-500">
                  <th scope="col" className="px-5 py-3 font-medium">Profissional</th>
                  <th scope="col" className="px-5 py-3 font-medium">Especialidade</th>
                  <th scope="col" className="hidden px-5 py-3 font-medium lg:table-cell">Telefone</th>
                  <th scope="col" className="px-5 py-3 font-medium">Acesso</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium"><span className="sr-only">Ação</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {profissionais.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar nome={p.nome} />
                        <div className="min-w-0">
                          <p className="font-medium text-ink">{p.nome}</p>
                          <p className="text-sm text-neutral-500">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-ink">{p.especialidade ?? '—'}</td>
                    <td className="hidden whitespace-nowrap px-5 py-3.5 text-sm text-neutral-600 tabular-nums lg:table-cell">{p.telefone ?? '—'}</td>
                    <td className="px-5 py-3.5"><BadgeConta ativo={p.ativo} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={toggling === p.id}
                        onClick={() => handleToggle(p.id)}
                        className={p.ativo ? 'hover:border-red-600 hover:text-red-700' : ''}
                        aria-label={`${p.ativo ? 'Bloquear' : 'Ativar'} acesso de ${p.nome}`}
                      >
                        {p.ativo ? 'Bloquear' : 'Ativar'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="divide-y divide-line md:hidden">
              {profissionais.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-4 py-3.5">
                  <Avatar nome={p.nome} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{p.nome}</p>
                    <p className="truncate text-sm text-neutral-500">{p.especialidade}</p>
                    <div className="mt-1.5"><BadgeConta ativo={p.ativo} /></div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={toggling === p.id}
                    onClick={() => handleToggle(p.id)}
                    aria-label={`${p.ativo ? 'Bloquear' : 'Ativar'} acesso de ${p.nome}`}
                  >
                    {p.ativo ? 'Bloquear' : 'Ativar'}
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <ModalCadastro
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSuccess={buscar}
      />
    </div>
  );
}
