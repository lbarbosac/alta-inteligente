// Arquivo: frontend/src/routes/AppRoutes.jsx
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Cada tela vira um arquivo separado no build. O paciente, que abre o link no celular,
// não baixa o painel do profissional, o Recharts nem os formulários.
const ProfessionalLayout  = lazy(() => import('../layouts/ProfessionalLayout'));
const PatientPortalLayout = lazy(() => import('../layouts/PatientPortalLayout'));
const AdminLayout         = lazy(() => import('../layouts/AdminLayout'));
const Login               = lazy(() => import('../pages/Login'));
const Dashboard           = lazy(() => import('../pages/Dashboard'));
const PatientsList        = lazy(() => import('../pages/Patients/PatientsList'));
const PatientProfile      = lazy(() => import('../pages/Patients/PatientProfile'));
const ProtocolsList       = lazy(() => import('../pages/Protocols/ProtocolsList'));
const ProtocolForm        = lazy(() => import('../pages/Protocols/ProtocolForm'));
const ProtocolDetail      = lazy(() => import('../pages/Protocols/ProtocolDetail'));
const Settings            = lazy(() => import('../pages/Settings'));
const PatientCheckin      = lazy(() => import('../pages/PatientPortal/Checkin'));
const AdminDashboard      = lazy(() => import('../pages/Admin/Dashboard'));
const AdminProfessionals  = lazy(() => import('../pages/Admin/Professionals'));
const NotFound            = lazy(() => import('../pages/NotFound'));

function TelaEmBranco() {
  return <div className="min-h-screen bg-canvas" aria-busy="true" />;
}

function PrivateRoute({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return <TelaEmBranco />;
  return usuario ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return <TelaEmBranco />;
  if (usuario) return <Navigate to={usuario.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
}

function AdminRoute({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return <TelaEmBranco />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<TelaEmBranco />}>
      <Routes>

        {/* Pública */}
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />

        {/* Portal do paciente */}
        <Route element={<PatientPortalLayout />}>
          <Route path="/p/:token" element={<PatientCheckin />} />
        </Route>

        {/* Profissional */}
        <Route element={<PrivateRoute><ProfessionalLayout /></PrivateRoute>}>
          <Route path="/dashboard"         element={<Dashboard />} />
          <Route path="/patients"          element={<PatientsList />} />
          <Route path="/patients/:id"      element={<PatientProfile />} />
          <Route path="/protocols"         element={<ProtocolsList />} />
          <Route path="/protocols/new"     element={<ProtocolForm />} />
          <Route path="/protocols/:id"     element={<ProtocolDetail />} />
          <Route path="/settings"          element={<Settings />} />
        </Route>

        {/* Admin */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin"                element={<AdminDashboard />} />
          <Route path="/admin/professionals"  element={<AdminProfessionals />} />
        </Route>

        {/* Fallbacks */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<NotFound />} />

      </Routes>
    </Suspense>
  );
}
