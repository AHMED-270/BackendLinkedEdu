import { FiUsers, FiBookOpen, FiClipboard, FiSend, FiUserX, FiRefreshCw, FiAlertTriangle, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const todaySchedule = [
  { time: '08:00 - 09:30', subject: 'Physique Chimie', class: '2BAC - G1', room: 'Salle A12', status: 'done' },
  { time: '09:30 - 11:00', subject: 'Mathématiques', class: '1BAC - G3', room: 'Salle B04', status: 'now' },
  { time: '11:00 - 12:30', subject: 'SVT', class: 'TCS - G2', room: 'Labo 2', status: 'upcoming' },
  { time: '14:00 - 15:30', subject: 'Physique Chimie', class: '2BAC - G2', room: 'Salle A12', status: 'upcoming' },
];

const myClasses = [
  { name: '2BAC Sciences - G1', present: 32, total: 35, progress: 91 },
  { name: '1BAC Sciences - G3', present: 28, total: 30, progress: 93 },
  { name: 'TCS - G2', present: 25, total: 38, progress: 66 },
  { name: '2BAC Sciences - G2', present: 30, total: 34, progress: 88 },
];

const upcomingEvents = [
  { date: '27 Mars', title: 'Conseil de classe 2BAC' },
  { date: '29 Mars', title: 'Remise des bulletins' },
  { date: '02 Avr', title: 'Journée pédagogique' },
  { date: '05 Avr', title: 'Examen régional blanc' },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      {/* Greeting */}
      <div className="dash-greeting animate-fade-in">
        <div>
          <h2>Bonjour, Dr. {user?.name?.split(' ').pop() || 'Professeur'} 👋</h2>
          <p>Voici un aperçu de votre journée du Mercredi 26 Mars 2026</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="stat-card">
          <div className="stat-icon blue"><FiUsers size={22} /></div>
          <div className="stat-info">
            <h4>142</h4>
            <p>Total Élèves</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FiBookOpen size={22} /></div>
          <div className="stat-info">
            <h4>6</h4>
            <p>Matières</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><FiClipboard size={22} /></div>
          <div className="stat-info">
            <h4>12</h4>
            <p>Tâches en attente</p>
          </div>
        </div>
      </div>

      {/* Schedule + Admin */}
      <div className="dash-row animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="card dash-schedule-card">
          <div className="card-header">
            <h3><span className="dot" style={{ background: 'var(--accent-green)' }}></span> Emploi du temps du jour</h3>
            <Link to="/emploi-du-temps" className="btn btn-sm btn-outline">
              Voir tout <FiChevronRight size={14} />
            </Link>
          </div>
          <div className="card-body">
            <div className="dash-schedule-list">
              {todaySchedule.map((s, i) => (
                <div key={i} className={`dash-schedule-item ${s.status}`}>
                  <div className="dash-schedule-time">{s.time}</div>
                  <div className="dash-schedule-info">
                    <span className="dash-schedule-subject">{s.subject}</span>
                    <span className="dash-schedule-meta">{s.class} • {s.room}</span>
                  </div>
                  {s.status === 'now' && <span className="badge badge-now">En cours</span>}
                  {s.status === 'done' && <span className="badge badge-green">Terminé</span>}
                  {s.status === 'upcoming' && <span className="badge badge-blue">À venir</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-admin-section">
          <h3 className="section-title"><span className="dot"></span> Administration</h3>
          <div className="dash-admin-grid">
            <Link to="/annonces" className="dash-admin-card">
              <div className="dash-admin-icon blue"><FiSend size={20} /></div>
              <span>Envoyer Annonce</span>
            </Link>
            <Link to="/appel" className="dash-admin-card">
              <div className="dash-admin-icon orange"><FiUserX size={20} /></div>
              <span>Saisir Absence</span>
            </Link>
            <div className="dash-admin-card">
              <div className="dash-admin-icon green"><FiRefreshCw size={20} /></div>
              <span>Mise à jour Logiciel</span>
            </div>
            <div className="dash-admin-card">
              <div className="dash-admin-icon red"><FiAlertTriangle size={20} /></div>
              <span>Signaler Blocage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Classes + Calendar */}
      <div className="dash-row animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="card" style={{ flex: 2 }}>
          <div className="card-header">
            <h3>Mes Classes</h3>
            <Link to="/eleves" className="btn btn-sm btn-outline">
              Détails <FiChevronRight size={14} />
            </Link>
          </div>
          <div className="card-body">
            <div className="dash-classes-grid">
              {myClasses.map((c, i) => (
                <div key={i} className="dash-class-item">
                  <div className="dash-class-header">
                    <span className="dash-class-name">{c.name}</span>
                    <span className="dash-class-count">{c.present}/{c.total}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${c.progress}%` }}></div>
                  </div>
                  <span className="dash-class-pct">{c.progress}% présents</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <div className="card-header">
            <h3>Mon Agenda</h3>
          </div>
          <div className="card-body">
            <div className="dash-agenda-list">
              {upcomingEvents.map((e, i) => (
                <div key={i} className="dash-agenda-item">
                  <div className="dash-agenda-date">{e.date}</div>
                  <span className="dash-agenda-title">{e.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
