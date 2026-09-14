// Arquivo: src/layouts/AdminLayout/index.jsx
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutGrid, Users } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar, { PularParaConteudo } from '../../components/Navbar';

const MENU = [
  { to: '/admin',               label: 'Visão geral',   icon: LayoutGrid, end: true },
  { to: '/admin/professionals', label: 'Profissionais', icon: Users },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-canvas lg:flex">
      <PularParaConteudo />
      <Sidebar items={MENU} perfil="Admin" />
      <div className="min-w-0 flex-1">
        <Navbar items={MENU} perfil="Admin" />
        <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-7xl px-4 py-6 focus:outline-none sm:px-6 lg:px-10 lg:py-10">
          <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
