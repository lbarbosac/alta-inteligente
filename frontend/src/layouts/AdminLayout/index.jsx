// Arquivo: src/layouts/AdminLayout/index.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Activity,
  LayoutDashboard,
  Users,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/admin',               label: 'Visão Geral',   icon: LayoutDashboard, end: true },
  { to: '/admin/professionals', label: 'Profissionais', icon: Users },
];

function getInitials(nome) {
  const partes = nome?.trim().split(' ').filter(Boolean) ?? [];
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0][0].toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function AdminSidebar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-slate-950 sticky top-0 h-screen flex-shrink-0">

      {/* Logo + badge admin */}
      <div className="px-6 py-7 border-b border-white/5 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <Activity size={14} strokeWidth={2} className="text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-none tracking-tight">Alta</p>
            <p className="text-white/40 text-[10px] font-light tracking-widest uppercase leading-none mt-0.5">
              Inteligente
            </p>
          </div>
        </div>
        {/* Badge de administrador */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 w-fit">
          <Shield size={11} strokeWidth={2} className="text-amber-400" />
          <span className="text-amber-400 text-[10px] font-semibold tracking-widest uppercase">
            Administrador
          </span>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-5 space-y-0.5" aria-label="Navegação administrativa">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
               transition-all duration-150 group
               ${isActive
                 ? 'bg-white/10 text-white'
                 : 'text-white/40 hover:text-white/70 hover:bg-white/5'
               }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={17}
                  strokeWidth={1.5}
                  className={`flex-shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-white/40 group-hover:text-white/70'
                  }`}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Perfil + logout */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-amber-400 text-xs font-semibold">
              {getInitials(usuario?.nome)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate leading-none">
              {usuario?.nome ?? '—'}
            </p>
            <p className="text-white/30 text-[10px] font-light mt-0.5">Admin</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
            font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10
            transition-all duration-150"
        >
          <LogOut size={16} strokeWidth={1.5} className="flex-shrink-0" />
          Sair da plataforma
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}