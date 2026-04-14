import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Users,
  GraduationCap,
  CalendarX2,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from 'lucide-react';
import './SecretaireDashboard.css';

/* ── Colors for the bar chart ── */
const BAR_COLORS = [
  '#667eea', '#764ba2', '#11998e', '#38ef7d',
  '#f093fb', '#f5576c', '#fa709a', '#fee140',
  '#4facfe', '#00f2fe', '#43e97b', '#f9d423',
];

const NIVEAU_MAP = {
  'ms': 'Petite Section',
  'mm': 'Moyenne Section',
  'gs': 'Grande Section',
  '1ap': '1ère Primaire',
  '2ap': '2ème Primaire',
  '3ap': '3ème Primaire',
  '4ap': '4ème Primaire',
  '5ap': '5ème Primaire',
  '6ap': '6ème Primaire',
  '1ac': '1ère Collège',
  '2ac': '2ème Collège',
  '3ac': '3ème Collège',
  'tc': 'Tronc Commun',
  '1bac': '1ère Bac',
  '2bac': '2ème Bac'
};

/* ── Custom tooltip for the absences chart ── */
function AbsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="sd-tooltip">
      <p className="sd-tooltip-label">{label}</p>
      <p className="sd-tooltip-value">
        <span className="sd-tooltip-dot" />
        Moyenne : <strong>{payload[0].value}</strong> abs / jour
      </p>
      <p className="sd-tooltip-total">
        Total : {payload[0].payload.total} absences
      </p>
    </div>
  );
}

/* ── Custom tooltip for the students-by-level chart ── */
function NiveauTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="sd-tooltip">
      <p className="sd-tooltip-label">{NIVEAU_MAP[payload[0].payload.niveau] || payload[0].payload.niveau}</p>
      <p className="sd-tooltip-value">
        <span className="sd-tooltip-dot" style={{ background: payload[0].payload.fill }} />
        <strong>{payload[0].value}</strong> étudiants
      </p>
    </div>
  );
}

export default function SecretaireDashboard() {
  const { user } = useAuth();
  const role = String(user?.role || '').toLowerCase();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    etudiants: 0,
    classes: 0,
  });
  const [absencesParMois, setAbsencesParMois] = useState([]);
  const [etudiantsParNiveau, setEtudiantsParNiveau] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
      setLoading(true);
      try {
        const [dashboardRes, reclamationsRes] = await Promise.all([
          axios.get(apiBaseUrl + '/api/secretaire/dashboard', {
            withCredentials: true,
            withXSRFToken: true,
            headers: { Accept: 'application/json' },
          }),
          axios.get(apiBaseUrl + '/api/secretaire/reclamations', {
            withCredentials: true,
            withXSRFToken: true,
            headers: { Accept: 'application/json' },
          }),
        ]);

        setStats(dashboardRes.data?.stats || {
          etudiants: 0,
          classes: 0,
        });

        const items = Array.isArray(reclamationsRes.data)
          ? reclamationsRes.data
          : (reclamationsRes.data?.reclamations || []);

        setRecentReclamations(items.slice(0, 5));
      } catch {
        // Keep default values when API is unavailable.
        setRecentReclamations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  /* ── Greeting based on time of day ── */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  /* ── Date string ── */
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  /* ── Stat cards config ── */
  const statCards = [
    {
      id: 'total-etudiants',
      label: 'Total Étudiants',
      value: stats.etudiants,
      icon: <Users size={24} />,
      color: 'blue',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      id: 'total-classes',
      label: 'Total Classes',
      value: stats.classes,
      icon: <GraduationCap size={24} />,
      color: 'emerald',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    },
    {
      id: 'absences-today',
      label: "Absences Aujourd'hui",
      value: stats.absences_aujourdhui,
      icon: <CalendarX2 size={24} />,
      color: 'amber',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      id: 'reclamations-sent',
      label: 'Réclamations Envoyées',
      value: stats.reclamations_envoyees,
      icon: <MessageSquare size={24} />,
      color: 'rose',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
  ];

  /* ── Trend calculation ── */
  const lastTwo = absencesParMois.slice(-2);
  const trend =
    lastTwo.length === 2
      ? lastTwo[1].moyenne - lastTwo[0].moyenne
      : 0;

  return (
    <div className="sd-dashboard">
      {/* ── Header / Greeting ── */}
      <div className="sd-header animate-fade-in">
        <div className="sd-header-text">
          <h1>
            {greeting},{' '}
            <span className="sd-header-name">
              {user?.prenom || user?.name || 'Secrétaire'}
            </span>
          </h1>
          <p className="sd-header-date">{today}</p>
        </div>
        <div className="sd-header-badge">
          <BarChart3 size={20} />
          <span>Tableau de bord</span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="sd-stats-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {statCards.map((card, i) => (
          <div
            className={`sd-stat-card sd-stat-${card.color}`}
            key={card.id}
            id={card.id}
            style={{ animationDelay: `${0.1 + i * 0.07}s` }}
          >
            <div className="sd-stat-icon" style={{ background: card.gradient }}>
              {card.icon}
            </div>
            <div className="sd-stat-content">
              <span className="sd-stat-value">
                {loading ? (
                  <TableSkeletonRows rowCount={2} colCount={2} />
                ) : (
                  <>
                    <tr><td>Etudiants</td><td>{stats.etudiants}</td></tr>
                    <tr><td>Classes</td><td>{stats.classes}</td></tr>
                  </>
                )}
              </span>
              <span className="sd-stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-row animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="card" style={{ flex: 1 }}>
          <div className="card-header"><h3>Reclamations recentes</h3></div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            {loading ? (
              <p>Chargement...</p>
            ) : recentReclamations.length === 0 ? (
              <p>Aucune reclamation recente.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                {recentReclamations.map((rec) => (
                  <li key={rec.id_reclamation} style={{ marginBottom: '0.7rem' }}>
                    <strong>{rec.sujet || 'Sans sujet'}</strong> - {rec.cible_label || 'Destinataire'}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
