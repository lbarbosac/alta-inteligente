// Arquivo: src/layouts/PatientPortalLayout/index.jsx
import { Outlet } from 'react-router-dom';
import { Activity } from 'lucide-react';

/**
 * Layout do Portal do Paciente.
 *
 * Completamente diferente do ProfessionalLayout:
 * - Sem sidebar
 * - Sem topbar administrativa
 * - Conteúdo centralizado em coluna estreita (mobile-first)
 * - Header mínimo apenas com a marca
 */
export default function PatientPortalLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── Header mínimo ─────────────────────────────────────────────── */}
      <header className="w-full bg-white border-b border-slate-100 px-6 py-4
        flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-950 flex items-center justify-center">
            <Activity size={12} strokeWidth={2} className="text-white" />
          </div>
          <span className="text-slate-950 text-sm font-semibold tracking-tight">
            AltaInteligente
          </span>
        </div>
      </header>

      {/* ── Conteúdo da página ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center py-8 px-4">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </main>

      {/* ── Rodapé discreto ───────────────────────────────────────────── */}
      <footer className="py-4 text-center">
        <p className="text-slate-300 text-xs font-light">
          AltaInteligente · Acompanhamento pós-operatório
        </p>
      </footer>

    </div>
  );
}