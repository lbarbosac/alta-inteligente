// Arquivo: frontend/src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth }            from '../contexts/AuthContext';
import ProfessionalLayout     from '../layouts/ProfessionalLayout';
import PatientPortalLayout    from '../layouts/PatientPortalLayout';
import AdminLayout            from '../layouts/AdminLayout';
import Login                  from '../pages/Login';
import Dashboard              from '../pages/Dashboard';
import PatientsList           from '../pages/Patients/PatientsList';
import PatientProfile         from '../pages/Patients/PatientProfile';
import ProtocolsList          from '../pages/Protocols/ProtocolsList';
import ProtocolForm           from '../pages/Protocols/ProtocolForm';
import ProtocolDetail         from '../pages/Protocols/ProtocolDetail';
import Settings               from '../pages/Settings';
import PatientCheckin         from '../pages/PatientPortal/Checkin';
import AdminDashboard         from '../pages/Admin/Dashboard';
import AdminProfessionals     from '../pages/Admin/Professionals';
import NotFound               from '../pages/NotFound';

function PrivateRoute({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-50" />;
  return usuario ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-50" />;
  if (usuario) return <Navigate to={usuario.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
}

function AdminRoute({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-50" />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRoutes() {
  return (
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
  );
}