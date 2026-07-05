// Arquivo: src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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

// ─── Elemento-assinatura: timeline de recuperação ──────────────────────────
function RecoveryTimeline() {
  const dias = [1, 2, 3, 4, 5, 6, 7];
  return (
    <div className="flex items-end gap-0">
      {dias.map((dia, i) => (
        <div key={dia} className="flex items-center">
          <div className="flex flex-col items-center gap-2">
            {/* Barra de altura variável — evoca progresso clínico */}
            <div
              className="w-px bg-white/20 rounded-full"
              style={{ height: `${16 + i * 6}px` }}
            />
            <div
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i < 4 ? 'bg-white/50' : 'bg-white/20'
              }`}
            />
            <span className="text-white/30 text-[9px] font-medium tracking-widest uppercase">
              D{dia}
            </span>
          </div>
          {/* Linha conectora entre dots */}
          {i < dias.length - 1 && (
            <div className="w-5 h-px bg-white/10 mb-5" />
          )}
        </div>
      ))}
    </div>
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
    <div className="min-h-screen flex">

      {/* ── Painel esquerdo — identidade da marca ─────────────────────── */}
      <aside className="hidden lg:flex flex-col justify-between w-2/5 bg-slate-950 p-12 select-none">

        {/* Logo */}
        <div>
          <p className="text-white/50 text-xs font-medium tracking-widest uppercase mb-1">
            Alta
          </p>
          <p className="text-white text-xs font-light tracking-widest uppercase">
            Inteligente
          </p>
        </div>

        {/* Headline central */}
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-white/30 text-xs font-medium tracking-widest uppercase">
              Plataforma de monitoramento
            </p>
            <h1 className="text-white text-4xl font-extrabold leading-tight tracking-tight text-balance">
              Acompanhe cada dia da recuperação.
            </h1>
          </div>

          <p className="text-white/40 text-sm font-light leading-relaxed max-w-xs">
            Check-ins diários, alertas inteligentes e protocolos personalizados
            para que nenhum paciente fique sem acompanhamento.
          </p>

          {/* Três pilares — dados mínimos, alto impacto */}
          <div className="flex flex-col gap-3 pt-2">
            {[
              'Check-ins diários automatizados',
              'Alertas por nível de dor',
              'Protocolos por procedimento',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-clinical-green flex-shrink-0" />
                <span className="text-white/40 text-xs font-light">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Elemento-assinatura: timeline de recuperação */}
        <div className="space-y-4">
          <p className="text-white/20 text-[10px] font-medium tracking-widest uppercase">
            Evolução do paciente
          </p>
          <RecoveryTimeline />
        </div>
      </aside>

      {/* ── Painel direito — formulário de login ──────────────────────── */}
      <main className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-sm space-y-8">

          {/* Logo mobile (visível apenas em telas pequenas) */}
          <div className="lg:hidden text-center space-y-1">
            <p className="text-slate-950 text-lg font-extrabold tracking-tight">
              AltaInteligente
            </p>
            <p className="text-slate-400 text-xs font-light">
              Monitoramento pós-operatório
            </p>
          </div>

          {/* Cabeçalho do form */}
          <div className="space-y-1">
            <h2 className="text-slate-950 text-2xl font-extrabold tracking-tight">
              Entrar na plataforma
            </h2>
            <p className="text-slate-400 text-sm font-light">
              Selecione seu perfil e informe as credenciais.
            </p>
          </div>

          {/* Seletor de perfil — tab pills */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
            {[
              { label: 'Profissional', value: 'PROFESSIONAL' },
              { label: 'Administrador', value: 'ADMIN' },
            ].map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue('perfil', value)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  perfilAtual === value
                    ? 'bg-white text-slate-950 shadow-card'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* Campo E-mail */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                {...register('email')}
                className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900
                  placeholder:text-slate-300 bg-white
                  transition-all duration-200 outline-none
                  focus:border-slate-950 focus:shadow-input
                  ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div className="space-y-1.5">
              <label
                htmlFor="senha"
                className="block text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={senhaVisivel ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('senha')}
                  className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm text-slate-900
                    placeholder:text-slate-300 bg-white
                    transition-all duration-200 outline-none
                    focus:border-slate-950 focus:shadow-input
                    ${errors.senha ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                />
                <button
                  type="button"
                  onClick={() => setSenhaVisivel((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400
                    hover:text-slate-600 transition-colors p-1"
                  tabIndex={-1}
                  aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {senhaVisivel
                    ? <EyeOff size={16} strokeWidth={1.5} />
                    : <Eye    size={16} strokeWidth={1.5} />}
                </button>
              </div>
              {errors.senha && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.senha.message}
                </p>
              )}
            </div>

            {/* Erro de servidor (credenciais inválidas, etc.) */}
            {erroServidor && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                <p className="text-sm text-red-700 font-medium leading-snug">
                  {erroServidor}
                </p>
              </div>
            )}

            {/* Botão de submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2.5
                py-3.5 px-4 rounded-xl
                bg-slate-950 text-white text-sm font-semibold
                transition-all duration-200
                hover:bg-slate-800 active:scale-[0.98]
                disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} strokeWidth={2} className="animate-spin" />
                  <span>Entrando…</span>
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Rodapé discreto */}
          <p className="text-center text-xs text-slate-300 font-light">
            AltaInteligente © {new Date().getFullYear()}
          </p>
        </div>
      </main>
    </div>
  );
}