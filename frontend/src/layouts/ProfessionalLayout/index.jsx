// Arquivo: src/layouts/ProfessionalLayout/index.jsx
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Bell } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';

// ─── Saudação por hora do dia ──────────────────────────────────────────────
function getSaudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

// ─── Data formatada em pt-BR ───────────────────────────────────────────────
function getDataFormatada() {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  }).format(new Date());
}

// ─── Iniciais do usuário ───────────────────────────────────────────────────
function getInitials(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(' ').filter(Boolean);
  if (partes.length === 1) return partes[0][0].toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

// ─── Topbar ────────────────────────────────────────────────────────────────
function Topbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const primeiroNome = usuario?.nome?.split(' ')[0] ?? 'Profissional';

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center px-6 gap-4 flex-shrink-0">

      {/* ── Saudação ──────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <p className="text-slate-950 text-sm font-semibold leading-none">
          {getSaudacao()}, {primeiroNome}.
        </p>
        <p className="text-slate-400 text-xs font-light mt-1 capitalize">
          {getDataFormatada()}
        </p>
      </div>

      {/* ── Ações direita ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">

        {/* Notificações (placeholder para etapa futura) */}
        <button
          type="button"
          className="w-9 h-9 rounded-xl flex items-center justify-center
            text-slate-400 hover:text-slate-600 hover:bg-slate-50
            transition-all duration-150"
          aria-label="Notificações"
        >
          <Bell size={17} strokeWidth={1.5} />
        </button>

        {/* Separador */}
        <div className="w-px h-5 bg-slate-100" />

        {/* Avatar + nome + logout */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {getInitials(usuario?.nome)}
            </span>
          </div>
          <span className="text-slate-700 text-sm font-medium hidden sm:block">
            {primeiroNome}
          </span>
        </div>

        {/* Botão logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-9 h-9 rounded-xl flex items-center justify-center
            text-slate-400 hover:text-red-500 hover:bg-red-50
            transition-all duration-150"
          aria-label="Sair da plataforma"
          title="Sair"
        >
          <LogOut size={16} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}

// ─── Layout principal ──────────────────────────────────────────────────────
export default function ProfessionalLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Sidebar fixa à esquerda */}
      <Sidebar />

      {/* Área de conteúdo: topbar + página */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
}