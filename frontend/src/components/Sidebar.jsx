import { NavLink } from 'react-router-dom';
import { FiGrid, FiCalendar, FiUsers, FiStar, FiFileText, FiMessageCircle, FiSettings } from 'react-icons/fi';
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
  return (
    <aside className="sidebar">
      <div className="sidebar-profile">
        <img src="https://i.pravatar.cc/150?u=12" alt="Profil" className="sidebar-avatar" />
        <div className="sidebar-user-info">
          <span className="sidebar-name">Dr. Space</span>
          <span className="sidebar-role">Professeur Principal</span>
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
    </aside>
  );
}
