import { useState } from 'react';
import './App.css';
import AuthHero from './components/AuthHero';
import LoginCard from './components/LoginCard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setUserRole(user?.role || 'admin');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
  };

  if (isLoggedIn) {
    if (userRole === 'admin' || userRole === 'directeur') {
      return <AdminDashboard onLogout={handleLogout} userRole={userRole} />;
    }
    // Ajoutez d'autres dashboards ici (eleve, prof, etc.) au besoin
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Bienvenue ! Vous êtes connecté.</h2>
        <button onClick={handleLogout}>Déconnexion</button>
      </div>
    );
  }

  return (
    <main className="auth-page">
      <AuthHero />
      <LoginCard onLoginSuccess={handleLoginSuccess} />
    </main>
  );
}

export default App;
