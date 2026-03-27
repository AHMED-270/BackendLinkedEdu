import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiCalendar, FiUsers, FiStar, FiFileText, FiMessageCircle, FiSettings, FiLogOut } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', label: 'Tableau de bord', icon: FiGrid },
  { path: '/emploi-du-temps', label: 'Emploi du temps', icon: FiCalendar },
  { path: '/mes-classes', label: 'Mes Classes', icon: FiUsers },
  { path: '/notes-absences', label: 'Notes & Absences', icon: FiStar },
  { path: '/devoirs', label: 'Devoirs & Ressources', icon: FiFileText },
  { path: '/annonces', label: 'Annonces', icon: FiMessageCircle },
  { path: '/parametres', label: 'Paramètres', icon: FiSettings },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const initials = (user?.name || 'P').trim().charAt(0).toUpperCase();

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

      await axios.get(apiBaseUrl + '/sanctum/csrf-cookie', {
        withCredentials: true,
        withXSRFToken: true,
      });

      await axios.post(apiBaseUrl + '/api/admin/logout', {}, {
        withCredentials: true,
        withXSRFToken: true,
        headers: {
          Accept: 'application/json',
        }
      });
    } catch (error) {
      // Always continue with local logout even if API logout fails.
    } finally {
      logout();
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      navigate('/login', { replace: true });
    }
  };

  return (
    <>
      {showLogoutModal && (
        <div className="logout-modal-backdrop">
          <div className="logout-modal-card">
            <div className="logout-modal-icon">
              <FiLogOut size={44} color="#f43f5e" />
            </div>
            <h3>Etes-vous sur de vouloir vous deconnecter ?</h3>
            <p>Vous devrez saisir a nouveau vos identifiants pour revenir sur cet espace.</p>
            <div className="logout-modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
              >
                Annuler
              </button>
              <button
                className="btn-confirm-logout"
                onClick={handleLogoutConfirm}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Deconnexion...' : 'Oui, me deconnecter'}
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className="sidebar">
        <div className="sidebar-profile">
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt="Profil" className="sidebar-avatar" />
          ) : (
            <div className="sidebar-avatar sidebar-avatar-fallback">{initials}</div>
          )}
          <div className="sidebar-user-info">
            <span className="sidebar-name">{user?.name || 'Utilisateur'}</span>
            <span className="sidebar-role">{user?.role || 'membre'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} className="sidebar-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="sidebar-logout" onClick={() => setShowLogoutModal(true)}>
            <FiLogOut size={18} className="sidebar-icon" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </aside>
    </>
  );
}
