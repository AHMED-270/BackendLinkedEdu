import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import AdminDashboard from './components/AdminDashboard';
import Dashboard from './pages/Dashboard';
import Devoirs from './pages/Devoirs';
import Ressources from './pages/Ressources';
import EmploiDuTemps from './pages/EmploiDuTemps';
import Annonces from './pages/Annonces';
import Eleves from './pages/Eleves';
import Appel from './pages/Appel';
import Notes from './pages/Notes';
import Avancement from './pages/Avancement';
import Reclamation from './pages/Reclamation';
import Parametres from './pages/Parametres';
import Login from './pages/Login';
import './App.css';

const getHomeRouteByRole = (role) => {
  if (role === 'admin' || role === 'directeur') return '/admin';
  if (role === 'professeur') return '/dashboard';
  return '/login';
};

// Root Route - Redirects based on auth status
const RootRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="loading-screen">Chargement...</div>;
  return user ? <Navigate to={getHomeRouteByRole(user?.role)} replace /> : <Navigate to="/login" replace />;
};

// Protected Layout Wrapper
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="loading-screen">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomeRouteByRole(user.role)} replace />;
  }
  
  return children;
};

// Title updates per route
const AppRoutes = () => {
  const { user, loading, logout } = useAuth();

  if (loading) return <div className="loading-screen">Chargement...</div>;

  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={user ? <Navigate to={getHomeRouteByRole(user?.role)} replace /> : <Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'directeur']}>
            <AdminDashboard onLogout={logout} userRole={user?.role || 'admin'} user={user} />
          </ProtectedRoute>
        }
      />
      
      {/* Professeur routes */}
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['professeur']}><Layout title="Tableau de Bord"><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/devoirs" element={<ProtectedRoute allowedRoles={['professeur']}><Layout title="Devoirs & Ressources"><Devoirs /></Layout></ProtectedRoute>} />
      <Route path="/ressources" element={<ProtectedRoute allowedRoles={['professeur']}><Layout title="Publier une Ressource"><Ressources /></Layout></ProtectedRoute>} />
      <Route path="/emploi-du-temps" element={<ProtectedRoute allowedRoles={['professeur']}><Layout title="Emploi du Temps"><EmploiDuTemps /></Layout></ProtectedRoute>} />
      <Route path="/annonces" element={<ProtectedRoute allowedRoles={['professeur']}><Layout title="Annonces"><Annonces /></Layout></ProtectedRoute>} />
      <Route path="/mes-classes" element={<ProtectedRoute allowedRoles={['professeur']}><Layout title="Mes Classes"><Eleves /></Layout></ProtectedRoute>} />
      <Route path="/appel" element={<ProtectedRoute allowedRoles={['professeur']}><Layout title="Feuille d'Appel"><Appel /></Layout></ProtectedRoute>} />
      <Route path="/notes-absences" element={<ProtectedRoute allowedRoles={['professeur']}><Layout title="Notes & Absences"><Notes /></Layout></ProtectedRoute>} />
      <Route path="/avancement" element={<ProtectedRoute allowedRoles={['professeur']}><Layout title="Avancement"><Avancement /></Layout></ProtectedRoute>} />
      <Route path="/reclamation" element={<ProtectedRoute allowedRoles={['professeur']}><Layout title="Réclamation"><Reclamation /></Layout></ProtectedRoute>} />
      <Route path="/profil" element={<ProtectedRoute allowedRoles={['professeur']}><Layout title="Profil"><Parametres /></Layout></ProtectedRoute>} />
      <Route path="/parametres" element={<ProtectedRoute allowedRoles={['professeur']}><Layout title="Paramètres"><Parametres /></Layout></ProtectedRoute>} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? getHomeRouteByRole(user?.role) : '/login'} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
