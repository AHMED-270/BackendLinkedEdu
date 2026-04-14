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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    etudiants: 0,
    classes: 0,
    absences_aujourdhui: 0,
    reclamations_envoyees: 0,
  });
  const [absencesParMois, setAbsencesParMois] = useState([]);
  const [etudiantsParNiveau, setEtudiantsParNiveau] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      const apiBaseUrl =
        import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
      setLoading(true);
      try {
        const res = await axios.get(apiBaseUrl + '/api/secretaire/dashboard', {
          withCredentials: true,
          withXSRFToken: true,
          headers: { Accept: 'application/json' },
        });

        setStats(
          res.data?.stats || {
            etudiants: 0,
            classes: 0,
            absences_aujourdhui: 0,
            reclamations_envoyees: 0,
          }
        );
        setAbsencesParMois(res.data?.absences_par_mois || []);

        // Add colors to each niveau entry
        const niveaux = (res.data?.etudiants_par_niveau || []).map((item, idx) => ({
          ...item,
          fill: BAR_COLORS[idx % BAR_COLORS.length],
        }));
        setEtudiantsParNiveau(niveaux);
      } catch {
        // Keep default values when API is unavailable.
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
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
                  <span className="sd-skeleton-num" />
                ) : (
                  card.value.toLocaleString('fr-FR')
                )}
              </span>
              <span className="sd-stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="sd-charts-row">
        {/* ── Absences Chart ── */}
        <div className="sd-chart-card sd-chart-wide animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <div className="sd-chart-header">
            <div>
              <h3 className="sd-chart-title">Moyenne des absences par mois</h3>
              <p className="sd-chart-subtitle">
                Absences moyennes par jour de classe — 12 derniers mois
              </p>
            </div>
            {!loading && (
              <div className={`sd-trend-badge ${trend > 0 ? 'sd-trend-up' : 'sd-trend-down'}`}>
                {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{trend > 0 ? '+' : ''}{trend.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="sd-chart-body">
            {loading ? (
              <div className="sd-chart-skeleton">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="sd-chart-skeleton-bar"
                    style={{ height: `${30 + Math.random() * 50}%` }}
                  />
                ))}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                  data={absencesParMois}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="absGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,0,0,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="mois"
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    dx={-5}
                    allowDecimals={false}
                  />
                  <Tooltip content={<AbsTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="moyenne"
                    stroke="#667eea"
                    strokeWidth={3}
                    fill="url(#absGradient)"
                    dot={{ r: 5, fill: '#fff', stroke: '#667eea', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#667eea', stroke: '#fff', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Students by Level Chart ── */}
        <div className="sd-chart-card sd-chart-narrow animate-fade-in" style={{ animationDelay: '0.35s' }}>
          <div className="sd-chart-header">
            <div>
              <h3 className="sd-chart-title">Étudiants par niveau</h3>
              <p className="sd-chart-subtitle">Répartition des élèves</p>
            </div>
          </div>

          <div className="sd-chart-body">
            {loading ? (
              <div className="sd-chart-skeleton sd-chart-skeleton-horiz">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="sd-chart-skeleton-bar-h"
                    style={{ width: `${40 + Math.random() * 50}%` }}
                  />
                ))}
              </div>
            ) : etudiantsParNiveau.length === 0 ? (
              <div className="sd-chart-empty">
                <Users size={40} strokeWidth={1.2} />
                <p>Aucune donnée disponible</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={etudiantsParNiveau}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                  barCategoryGap="25%"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,0,0,0.06)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    dataKey="niveau"
                    type="category"
                    tickFormatter={(val) => NIVEAU_MAP[val] || val}
                    tick={{ fontSize: 10, fill: '#374151', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip content={<NiveauTooltip />} cursor={{ fill: 'rgba(102,126,234,0.06)' }} />
                  <Bar dataKey="total" radius={[0, 8, 8, 0]} barSize={28}>
                    {etudiantsParNiveau.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
