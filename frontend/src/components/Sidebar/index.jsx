// Arquivo: src/components/Sidebar/index.jsx
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// ─── Itens de navegação ────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/patients',  label: 'Pacientes',      icon: Users },
  { to: '/protocols', label: 'Protocolos',     icon: ClipboardList },
  { to: '/settings',  label: 'Configurações',  icon: Settings },
];

// ─── Utilitário de iniciais ────────────────────────────────────────────────
function getInitials(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(' ').filter(Boolean);
  if (partes.length === 1) return partes[0][0].toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

// ─── Componente ────────────────────────────────────────────────────────────
export default function Sidebar() {
  const { usuario } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-slate-950 sticky top-0 h-screen flex-shrink-0">

      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <div className="px-6 py-7 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <Activity size={14} strokeWidth={2} className="text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-none tracking-tight">
              Alta
            </p>
            <p className="text-white/40 text-[10px] font-light tracking-widest uppercase leading-none mt-0.5">
              Inteligente
            </p>
          </div>
        </div>
      </div>

      {/* ── Navegação ────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-5 space-y-0.5" aria-label="Navegação principal">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
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
                  className={`flex-shrink-0 transition-colors duration-150
                    ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Perfil do usuário ─────────────────────────────────────────── */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2">
          {/* Avatar com iniciais */}
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {getInitials(usuario?.nome)}
            </span>
          </div>
          {/* Nome e especialidade */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate leading-none">
              {usuario?.nome ?? '—'}
            </p>
            <p className="text-white/30 text-[10px] font-light mt-0.5 truncate">
              {usuario?.especialidade ?? 'Profissional'}
            </p>
          </div>
        </div>
      </div>

    </aside>
  );
}