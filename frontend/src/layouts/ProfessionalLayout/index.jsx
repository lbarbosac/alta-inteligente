// Arquivo: src/layouts/ProfessionalLayout/index.jsx
import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutGrid, Users, ClipboardList, Settings } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar, { PularParaConteudo } from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { getPreferencias } from '../../services/accountService';

const MENU = [
  { to: '/dashboard', label: 'Painel',        icon: LayoutGrid },
  { to: '/patients',  label: 'Pacientes',     icon: Users },
  { to: '/protocols', label: 'Protocolos',    icon: ClipboardList },
  { to: '/settings',  label: 'Configurações', icon: Settings },
];

export default function ProfessionalLayout() {
  const { atualizarUsuario } = useAuth();

  // Sessões abertas antes de uma nova versão dos termos: confere no servidor ao abrir o painel.
  // Se precisar de aceite, o PrivateRoute leva para a tela de aceite.
  useEffect(() => {
    getPreferencias()
      .then((p) => { if (p.precisaAceitarTermos) atualizarUsuario({ precisaAceitarTermos: true }); })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      <PularParaConteudo />
      <Sidebar items={MENU} />
      <div className="min-w-0 flex-1">
        <Navbar items={MENU} />
        <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-7xl px-4 py-6 focus:outline-none sm:px-6 lg:px-10 lg:py-10">
          <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
