// Arquivo: src/components/Sidebar/index.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Brand from '../Brand';
import Avatar from '../Avatar';
import { useAuth } from '../../contexts/AuthContext';

function ItemMenu({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150
         ${isActive ? 'bg-ink text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-ink'}`
      }
    >
      <Icon size={18} strokeWidth={1.75} className="flex-shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  );
}

/**
 * Conteúdo do menu (marca, itens, usuário). Usado na barra lateral do desktop
 * e na gaveta do celular (components/Navbar).
 */
export function ConteudoMenu({ items, perfil, acaoTopo }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function sair() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 flex-shrink-0 items-center justify-between gap-2 px-5">
        <div className="flex items-center gap-2">
          <Brand />
          {perfil && (
            <span className="rounded-full border border-line px-2 py-0.5 text-xs font-medium text-neutral-600">{perfil}</span>
          )}
        </div>
        {acaoTopo}
      </div>

      <nav aria-label="Navegação principal" className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {items.map((item) => <ItemMenu key={item.to} {...item} />)}
      </nav>

      <div className="flex-shrink-0 border-t border-line p-3">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <Avatar nome={usuario?.nome} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{usuario?.nome ?? '—'}</p>
            <p className="truncate text-xs text-neutral-500">{usuario?.especialidade ?? perfil ?? 'Profissional'}</p>
          </div>
          <button
            type="button"
            onClick={sair}
            aria-label="Sair da plataforma"
            title="Sair"
            className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-neutral-600
              transition-colors hover:bg-neutral-100 hover:text-ink"
          >
            <LogOut size={17} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Barra lateral fixa do desktop. No celular quem aparece é o Navbar. */
export default function Sidebar({ items, perfil }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 border-r border-line bg-white lg:block">
      <ConteudoMenu items={items} perfil={perfil} />
    </aside>
  );
}
