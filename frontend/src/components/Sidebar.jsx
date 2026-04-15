import { useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiCalendar, FiUsers, FiStar, FiFileText, FiMessageCircle, FiLogOut, FiAlertCircle, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/linkedu-logo.png';

const navItems = [
  { path: '/dashboard', label: 'Tableau de bord', icon: FiGrid },
  { path: '/emploi-du-temps', label: 'Emploi du temps', icon: FiCalendar },
  { path: '/mes-classes', label: 'Mes Classes', icon: FiUsers },
  { path: '/notes-absences', label: 'Notes', icon: FiStar },
  { path: '/appel', label: 'Absences', icon: FiCalendar },
  { path: '/devoirs', label: 'Devoirs & Ressources', icon: FiFileText },
  { path: '/reclamation', label: 'Réclamations', icon: FiAlertCircle },
  { path: '/annonces', label: 'Annonces', icon: FiMessageCircle },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const initials = (user?.name || 'P').trim().charAt(0).toUpperCase();

  async function handleLogoutConfirm() {
    setIsLoggingOut(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
      await axios.post(apiBaseUrl + '/api/admin/logout', {}, { withCredentials: true });
    } catch (error) { /* Ignorer l'erreur pour forcer le logout local */ }
    finally {
      logout();
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      navigate('/login', { replace: true });
    }
  }

  // --- MODAL DE DECONNEXION (UPGRADE LUXURY) ---
  const logoutModal = showLogoutModal && typeof document !== 'undefined'
    ? createPortal(
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-brand-navy/30 backdrop-blur-md animate-fade-in" onClick={() => setShowLogoutModal(false)} />
        
        <div className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-white/90 p-8 text-center shadow-2xl backdrop-blur-xl animate-scale-up border border-white">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-inner">
            <FiLogOut size={28} />
          </div>
          <h3 className="mb-2 text-xl font-black text-brand-navy tracking-tight">Déconnexion</h3>
          <p className="mb-8 text-sm font-medium text-slate-500 leading-relaxed">
            Êtes-vous sûr de vouloir quitter votre session <span className="text-brand-navy">LinkEdu</span> ?
          </p>
          
          <div className="flex gap-3">
            <button
              className="flex-1 rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200 active:scale-95"
              onClick={() => setShowLogoutModal(false)}
            >
              Annuler
            </button>
            <button
              className="flex-1 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
              onClick={handleLogoutConfirm}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? '...' : 'Oui, sortir'}
            </button>
          </div>
        </div>
      </div>,
      document.body
    ) : null;

  return (
    <>
      {logoutModal}

      <aside className="flex h-full flex-col">
        <div className="flex items-center justify-center py-6 mb-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="relative group cursor-pointer"
            title="Aller au tableau de bord"
          >
            <div className="absolute inset-0 bg-brand-teal/20 blur-2xl rounded-full group-hover:bg-brand-teal/40 transition-all duration-700" />
            <img src={logo} alt="LinkEdu" className="h-10 w-auto relative z-10 drop-shadow-xl transition-transform duration-500 group-hover:scale-110" />
          </button>
        </div>

        {/* USER PROFILE CARD (ELITE LOOK) */}
        <div className="px-4 mb-8">
          <div className="relative overflow-hidden rounded-[1.8rem] border border-white/60 bg-white/40 p-4 shadow-glass-sm backdrop-blur-md group hover:bg-white/60 transition-all duration-500">
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-teal flex items-center justify-center text-white font-bold shadow-premium ring-2 ring-white transition-transform group-hover:rotate-3">
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 animate-pulse-glow shadow-sm"></div>
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-black text-brand-navy tracking-tight">{user?.name || 'Professeur'}</div>
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-brand-teal/70">
                   {user?.role || 'Staff'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="px-6 mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Menu</div>
        
        <nav className="flex-1 space-y-1 px-3 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-500 ${
                    isActive
                      ? 'bg-brand-navy text-white shadow-premium'
                      : 'text-slate-500 hover:bg-white/50 hover:text-brand-navy'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={`${isActive ? 'text-brand-teal' : 'text-slate-400 group-hover:text-brand-teal'} transition-colors duration-300`} />
                    <span className="flex-1 tracking-tight">{item.label}</span>
                    {isActive ? (
                       <motion.div layoutId="activePill" className="absolute right-3 h-1.5 w-1.5 rounded-full bg-brand-teal shadow-glow" />
                    ) : (
                      <FiChevronRight className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-slate-300" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="p-4 mt-auto">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex w-full items-center justify-center gap-3 rounded-[1.4rem] bg-red-50/50 px-4 py-4 text-sm font-bold text-red-500 border border-red-100/50 transition-all hover:bg-red-50 hover:shadow-md active:scale-95 group"
          >
            <FiLogOut size={18} className="group-hover:rotate-12 transition-transform" />
            <span>Quitter LinkEdu</span>
          </button>
        </div>
      </aside>
    </>
  );
}
