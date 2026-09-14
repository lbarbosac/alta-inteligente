// Arquivo: src/pages/Login/index.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Brand from '../../components/Brand';
import Button from '../../components/Button';
import Field, { inputClass } from '../../components/Field';
import InlineAlert from '../../components/InlineAlert';

// ─── Schema de validação ───────────────────────────────────────────────────
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail é obrigatório.')
    .email('Informe um e-mail válido.'),
  senha: z
    .string()
    .min(6, 'A senha deve ter ao menos 6 caracteres.'),
  perfil: z.enum(['PROFESSIONAL', 'ADMIN']),
});

// ─── Curva de recuperação (ilustração da marca, não é dado real) ───────────
const DIAS_EXEMPLO = [8, 7, 6, 5, 4, 3, 2];

// Catmull-Rom convertido em curvas de Bézier: passa por todos os pontos sem formar degraus
function caminhoSuave(pontos) {
  return pontos.reduce((d, [x, y], i, todos) => {
    if (i === 0) return `M ${x} ${y}`;
    const [x0, y0] = todos[i - 2] ?? todos[i - 1];
    const [x1, y1] = todos[i - 1];
    const [x3, y3] = todos[i + 1] ?? [x, y];
    const c1 = [x1 + (x - x0) / 6, y1 + (y - y0) / 6];
    const c2 = [x - (x3 - x1) / 6, y - (y3 - y1) / 6];
    return `${d} C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${x} ${y}`;
  }, '');
}

function CurvaRecuperacao() {
  const pontos = DIAS_EXEMPLO.map((dor, i) => [16 + i * 61.3, 132 - dor * 12]);

  return (
    <figure aria-hidden="true" className="w-full max-w-md">
      <svg viewBox="0 0 400 160" className="w-full">
        {[36, 72, 108, 144].map((y) => (
          <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="#262626" strokeWidth="1" />
        ))}
        <path d={caminhoSuave(pontos)} fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        {pontos.map(([x, y], i) => (
          <circle key={x} cx={x} cy={y} r={i === 0 ? 5 : 3.5} fill={i === 0 ? '#F59E0B' : '#FFFFFF'} stroke="#0A0A0A" strokeWidth="2" />
        ))}
      </svg>
      <figcaption className="mt-3 flex justify-between text-xs text-neutral-400 tabular-nums">
        {DIAS_EXEMPLO.map((_, i) => <span key={i}>D{i + 1}</span>)}
      </figcaption>
    </figure>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────
export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [erroServidor, setErroServidor] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { perfil: 'PROFESSIONAL' },
  });

  const perfilAtual = watch('perfil');

  async function onSubmit(dados) {
    setErroServidor('');
    try {
      const usuario = await login(dados.email, dados.senha, dados.perfil);
      navigate(usuario.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      const mensagem =
        err.response?.data?.message ||
        'Não foi possível conectar. Verifique sua conexão.';
      setErroServidor(mensagem);
    }
  }

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[1.1fr_1fr]">

      {/* ── Painel da marca (desktop) ─────────────────────────────────── */}
      <aside className="on-dark hidden flex-col justify-between bg-ink p-12 text-white lg:flex xl:p-16">
        <Brand tone="claro" size="lg" />

        <div className="max-w-lg">
          <p className="text-5xl font-semibold leading-[1.05] tracking-tight text-balance xl:text-6xl">
            Acompanhe cada dia da recuperação.
          </p>
          <p className="mt-6 max-w-md text-base leading-relaxed text-neutral-400">
            Check-ins diários, alertas por nível de dor e protocolos por procedimento,
            para nenhum paciente ficar sem acompanhamento.
          </p>
        </div>

        <CurvaRecuperacao />
      </aside>

      {/* ── Formulário ────────────────────────────────────────────────── */}
      <main className="flex min-h-screen items-center justify-center px-6 py-12 lg:min-h-0">
        <div className="w-full max-w-sm">

          <div className="mb-12 lg:hidden">
            <Brand size="lg" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-ink">Entrar</h1>
          <p className="mt-2 text-sm text-neutral-600">Escolha o seu perfil e informe seus dados de acesso.</p>

          {/* Seletor de perfil */}
          <div role="group" aria-label="Perfil de acesso" className="mt-8 grid grid-cols-2 gap-1 rounded-lg bg-neutral-100 p-1">
            {[
              { label: 'Profissional', value: 'PROFESSIONAL' },
              { label: 'Administrador', value: 'ADMIN' },
            ].map(({ label, value }) => (
              <button
                key={value}
                type="button"
                aria-pressed={perfilAtual === value}
                onClick={() => setValue('perfil', value)}
                className={`h-9 rounded-md text-sm font-medium transition-colors duration-150
                  ${perfilAtual === value
                    ? 'bg-white text-ink ring-1 ring-line'
                    : 'text-neutral-600 hover:text-ink'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">

            <Field label="E-mail" error={errors.email?.message}>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                {...register('email')}
                className={inputClass(errors.email, { className: 'h-11' })}
              />
            </Field>

            <Field label="Senha" htmlFor="senha" error={errors.senha?.message}>
              <div className="relative">
                <input
                  id="senha"
                  type={senhaVisivel ? 'text' : 'password'}
                  autoComplete="current-password"
                  aria-invalid={errors.senha ? true : undefined}
                  aria-describedby={errors.senha ? 'senha-erro' : undefined}
                  {...register('senha')}
                  className={inputClass(errors.senha, { className: 'h-11 pr-12' })}
                />
                <button
                  type="button"
                  onClick={() => setSenhaVisivel((v) => !v)}
                  aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={senhaVisivel}
                  className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center
                    rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-ink"
                >
                  {senhaVisivel
                    ? <EyeOff size={17} strokeWidth={1.75} />
                    : <Eye    size={17} strokeWidth={1.75} />}
                </button>
              </div>
            </Field>

            {erroServidor && <InlineAlert>{erroServidor}</InlineAlert>}

            <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
              {isSubmitting ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>

          <p className="mt-12 text-xs text-neutral-500">AltaInteligente © {new Date().getFullYear()}</p>
        </div>
      </main>
    </div>
  );
}
