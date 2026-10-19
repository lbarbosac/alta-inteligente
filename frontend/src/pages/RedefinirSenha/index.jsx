// Arquivo: src/pages/RedefinirSenha/index.jsx
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Eye, EyeOff } from 'lucide-react';
import Brand from '../../components/Brand';
import Button, { buttonClass } from '../../components/Button';
import Field, { inputClass } from '../../components/Field';
import InlineAlert from '../../components/InlineAlert';
import { redefinirSenha } from '../../services/authService';

export default function RedefinirSenha() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [visivel, setVisivel] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [erro, setErro] = useState('');

  const tokenValido = /^[a-f0-9]{64}$/.test(token);

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    if (senha.length < 8) { setErro('A senha deve ter ao menos 8 caracteres.'); return; }
    if (senha !== confirmacao) { setErro('As duas senhas não são iguais.'); return; }
    setEnviando(true);
    try {
      await redefinirSenha(token, senha);
      setConcluido(true);
    } catch (err) {
      setErro(err.response?.data?.message || 'Não foi possível redefinir a senha. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white px-6">
      <header className="flex h-16 items-center"><Link to="/login" aria-label="Ir para o login"><Brand /></Link></header>
      <main className="flex flex-1 items-start justify-center pt-10 sm:items-center sm:pt-0">
        <div className="w-full max-w-sm pb-16">
          {concluido ? (
            <div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white">
                <Check size={20} strokeWidth={2} aria-hidden="true" />
              </span>
              <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">Senha redefinida</h1>
              <p className="mt-2 text-base text-neutral-600">Entre com a sua nova senha.</p>
              <Link to="/login" className={buttonClass({ size: 'lg', className: 'mt-8 w-full' })}>Ir para o login</Link>
            </div>
          ) : !tokenValido ? (
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-ink">Link inválido</h1>
              <p className="mt-2 text-base text-neutral-600">Este link de redefinição está incompleto. Peça um novo.</p>
              <Link to="/esqueci-senha" className={buttonClass({ size: 'lg', className: 'mt-8 w-full' })}>Pedir novo link</Link>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-semibold tracking-tight text-ink">Nova senha</h1>
              <p className="mt-2 text-sm text-neutral-600">Use pelo menos 8 caracteres. Uma frase curta é mais segura e mais fácil de lembrar.</p>
              <form onSubmit={salvar} noValidate className="mt-8 space-y-5">
                <Field label="Nova senha" htmlFor="nova-senha">
                  <div className="relative">
                    <input
                      id="nova-senha"
                      type={visivel ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className={inputClass(false, { className: 'h-11 pr-12' })}
                    />
                    <button
                      type="button"
                      onClick={() => setVisivel((v) => !v)}
                      aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
                      aria-pressed={visivel}
                      className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-ink"
                    >
                      {visivel ? <EyeOff size={17} strokeWidth={1.75} /> : <Eye size={17} strokeWidth={1.75} />}
                    </button>
                  </div>
                </Field>
                <Field label="Repita a nova senha">
                  <input type={visivel ? 'text' : 'password'} autoComplete="new-password" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} className={inputClass(false, { className: 'h-11' })} />
                </Field>
                {erro && (
                  <InlineAlert action={erro.includes('expirado') ? <Link to="/esqueci-senha" className="text-sm font-medium underline underline-offset-2">Pedir novo</Link> : null}>
                    {erro}
                  </InlineAlert>
                )}
                <Button type="submit" size="lg" loading={enviando} className="w-full">{enviando ? 'Salvando…' : 'Salvar nova senha'}</Button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
