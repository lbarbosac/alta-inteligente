// Arquivo: src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth }           from '../contexts/AuthContext';
import ProfessionalLayout    from '../layouts/ProfessionalLayout';
import Login                 from '../pages/Login';
import Dashboard             from '../pages/Dashboard';
import PatientsList          from '../pages/Patients/PatientsList';
import PatientProfile        from '../pages/Patients/PatientProfile';

// ─── Guards de rota ────────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-50" />;
  return usuario ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-50" />;
  if (usuario) {
    return <Navigate to={usuario.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-50" />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

// ─── Árvore de rotas ───────────────────────────────────────────────────────
export default function AppRoutes() {
  return (
    <Routes>

      {/* Rota pública */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />

      {/* Rotas do profissional — ProfessionalLayout como layout route */}
      <Route
        element={
          <PrivateRoute>
            <ProfessionalLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard"     element={<Dashboard />} />
        <Route path="/patients"      element={<PatientsList />} />
        <Route path="/patients/:id"  element={<PatientProfile />} />
        <Route path="/protocols"     element={
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-400 text-sm">Módulo de Protocolos — em breve.</p>
          </div>
        } />
        <Route path="/settings"      element={
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-400 text-sm">Configurações — em breve.</p>
          </div>
        } />
      </Route>

      {/* Rotas do admin */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <p className="text-slate-400 text-sm">Painel Admin — em breve.</p>
            </div>
          </AdminRoute>
        }
      />

      {/* Fallback */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/login"     replace />} />

    </Routes>
  );
}