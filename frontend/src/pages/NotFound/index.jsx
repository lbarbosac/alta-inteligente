// Arquivo: src/pages/NotFound/index.jsx
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Brand from '../../components/Brand';
import Button, { buttonClass } from '../../components/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-white px-6">
      <header className="flex h-16 items-center">
        <Link to="/" aria-label="Ir para o início"><Brand /></Link>
      </header>

      <main className="flex flex-1 items-center justify-center pb-16">
        <div className="max-w-sm text-center">
          <p className="text-8xl font-semibold leading-none tracking-tight text-ink tabular-nums" aria-hidden="true">404</p>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">Página não encontrada</h1>
          <p className="mt-2 text-base text-neutral-600">O endereço que você tentou acessar não existe ou foi movido.</p>
          <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
              Voltar
            </Button>
            <Link to="/" className={buttonClass()}>Ir para o início</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
