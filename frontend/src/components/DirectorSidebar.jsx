import React from 'react';
import { FiGrid, FiUsers, FiBookOpen, FiAlertTriangle, FiFileText, FiFlag, FiCalendar, FiChevronRight, FiLogOut } from 'react-icons/fi';
import logo from '../assets/images/linkedu-logo.png';

const menuItems = [
  { name: 'Tableau de bord', icon: FiGrid },
  { name: 'Liste des Professeurs', icon: FiUsers },
  { name: 'Liste des Etudiants', icon: FiBookOpen },
  { name: 'Liste des Classes', icon: FiBookOpen },
  { name: 'Reclamations', icon: FiAlertTriangle },
  { name: 'Notes & Examens', icon: FiFileText },
  { name: 'Annonces', icon: FiFlag },
  { name: 'Emploi du temps', icon: FiCalendar },
];

function DirectorSidebar({ user, activeMenu, setActiveMenu, onRequestLogout, isLoggingOut = false }) {
  const fullName = `${String(user?.prenom || '').trim()} ${String(user?.nom || '').trim()}`.trim()
    || String(user?.name || '').trim()
    || 'Directeur';

  const initials = (() => {
    const parts = [user?.prenom, user?.nom]
      .map((part) => String(part || '').trim())
      .filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }

    const fallback = fullName
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (fallback.length >= 2) {
      return `${fallback[0].charAt(0)}${fallback[1].charAt(0)}`.toUpperCase();
    }

    return (fallback[0] || 'D').charAt(0).toUpperCase();
  })();

  return (
    <aside className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center py-6 mb-2">
        <div className="relative group cursor-pointer">
          <div className="absolute inset-0 bg-brand-teal/20 blur-2xl rounded-full group-hover:bg-brand-teal/40 transition-all duration-700" />
          <img src={logo} alt="LinkEdu" className="h-9 w-auto relative z-10 drop-shadow-xl transition-transform duration-500 group-hover:scale-110" />
        </div>
      </div>

      {/* User profile card */}
      <div className="px-3 mb-6">
        <div className="rounded-[1.5rem] border border-white/60 bg-white/40 p-4 backdrop-blur-md shadow-glass-sm group hover:bg-white/60 transition-all duration-500">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-teal flex items-center justify-center text-white font-bold shadow-premium ring-2 ring-white transition-transform group-hover:rotate-3">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 animate-pulse-glow shadow-sm" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black text-brand-navy tracking-tight">{fullName}</div>
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-brand-teal/70">
                Direction
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation label */}
      <div className="px-5 mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Navigation</div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 px-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.name;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => setActiveMenu(item.name)}
              className={`group relative flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-brand-navy text-white shadow-premium'
                  : 'text-slate-500 hover:bg-white/50 hover:text-brand-navy'
              }`}
            >
              <Icon size={18} className={`${isActive ? 'text-brand-teal' : 'text-slate-400 group-hover:text-brand-teal'} transition-colors duration-300`} />
              <span className="flex-1 tracking-tight text-left">{item.name}</span>
              {isActive ? (
                <div className="h-1.5 w-1.5 rounded-full bg-brand-teal shadow-glow" />
              ) : (
                <FiChevronRight className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-slate-300" size={14} />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 mt-auto">
        <button
          onClick={() => onRequestLogout && onRequestLogout()}
          disabled={isLoggingOut}
          className="flex w-full items-center justify-center gap-3 rounded-[1.4rem] bg-red-50/50 px-4 py-3.5 text-sm font-bold text-red-500 border border-red-100/50 transition-all hover:bg-red-50 hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed group"
        >
          <FiLogOut size={18} className="group-hover:rotate-12 transition-transform" />
          <span>Quitter LinkEdu</span>
        </button>
      </div>
    </aside>
  );
}

export default DirectorSidebar;
