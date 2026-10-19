// Arquivo: src/layouts/PatientPortalLayout/index.jsx
import { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Brand from '../../components/Brand';

/**
 * Portal do paciente: celular primeiro, fundo branco, uma coluna estreita.
 * Sem menu e sem nada administrativo — a pessoa pode estar com dor e medicada.
 */
export default function PatientPortalLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex h-14 flex-shrink-0 items-center justify-center border-b border-line px-4">
        <Brand />
      </header>

      <main className="flex-1 px-4 pb-10 pt-6 sm:pt-10">
        <div className="mx-auto w-full max-w-md">
          <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      <footer className="px-4 pb-6 text-center text-xs text-neutral-500">
        Acompanhamento pós-operatório ·{' '}
        <Link to="/privacidade" target="_blank" className="underline underline-offset-2 hover:text-ink">Privacidade</Link>
      </footer>
    </div>
  );
}
