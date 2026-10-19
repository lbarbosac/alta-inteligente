// Arquivo: src/pages/EsqueciSenha/index.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import Brand from '../../components/Brand';
import Button from '../../components/Button';
import Field, { inputClass } from '../../components/Field';
import InlineAlert from '../../components/InlineAlert';
import { esqueciSenha } from '../../services/authService';

export default function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState('PROFESSIONAL');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState('');
  const [erro, setErro] = useState('');

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErro('Informe um e-mail válido.'); return; }
    setEnviando(true);
    try {
      setEnviado(await esqueciSenha(email.trim(), perfil));
    } catch (err) {
      setErro(err.response?.data?.message || 'Não foi possível enviar agora. Tente novamente em alguns minutos.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white px-6">
      <header className="flex h-16 items-center"><Link to="/login" aria-label="Voltar para o login"><Brand /></Link></header>
      <main className="flex flex-1 items-start justify-center pt-10 sm:items-center sm:pt-0">
        <div className="w-full max-w-sm pb-16">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-ink">
            <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
            Voltar para o login
          </Link>

          {enviado ? (
            <div className="mt-8">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white">
                <Mail size={20} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">Verifique seu e-mail</h1>
              <p className="mt-2 text-base leading-relaxed text-neutral-600">
                {enviado} O link vale por 60 minutos. Confira também a caixa de spam.
              </p>
            </div>
          ) : (
            <>
              <h1 className="mt-8 text-3xl font-semibold tracking-tight text-ink">Esqueci minha senha</h1>
              <p className="mt-2 text-sm text-neutral-600">Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha.</p>

              <div role="group" aria-label="Perfil de acesso" className="mt-8 grid grid-cols-2 gap-1 rounded-lg bg-neutral-100 p-1">
                {[{ label: 'Profissional', value: 'PROFESSIONAL' }, { label: 'Administrador', value: 'ADMIN' }].map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={perfil === value}
                    onClick={() => setPerfil(value)}
                    className={`h-9 rounded-md text-sm font-medium transition-colors ${perfil === value ? 'bg-white text-ink ring-1 ring-line' : 'text-neutral-600 hover:text-ink'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <form onSubmit={enviar} noValidate className="mt-6 space-y-5">
                <Field label="E-mail">
                  <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass(false, { className: 'h-11' })} />
                </Field>
                {erro && <InlineAlert>{erro}</InlineAlert>}
                <Button type="submit" size="lg" loading={enviando} className="w-full">{enviando ? 'Enviando…' : 'Enviar link'}</Button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
