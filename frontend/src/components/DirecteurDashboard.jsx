import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { FiLogOut } from 'react-icons/fi';
import DirectorSidebar from './DirectorSidebar'
import DirectoryReclamations from './DirectoryReclamations';
import DirectoryProfessors from './DirectoryProfessors';
import DirectoryFallback from './DirectoryFallback';
import DirectoryReports from './DirectoryReports';
import DirectoryStudents from './DirectoryStudents';
import DirectoryClasses from './DirectoryClasses';
import DirectoryGrades from './DirectoryGrades';
import DirectorySettings from './DirectorySettings';
import DirectoryTimetable from './DirectoryTimetable';
import DirectoryAnnonces from './DirectoryAnnonces';
import { getRoleLabel } from '../constants/roles';

const AUTH_TOKEN_KEY = 'linkedu_token';

function getStoredToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function DirecteurDashboard({ user, onLogout }) {
  const [stats, setStats] = useState(null)
  const [recentReclamations, setRecentReclamations] = useState([])
  const [recentClasses, setRecentClasses] = useState([])
  const [totalSecretaires, setTotalSecretaires] = useState(0)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const location = useLocation()
  const navigate = useNavigate()

  const basePath = '/directeur';

  const pathToMenuMap = {
    '/': 'Tableau de bord',
    '/professeurs': 'Liste des Professeurs',
    '/etudiants': 'Liste des Etudiants',
    '/classes': 'Liste des Classes',
    '/reclamations': 'Reclamations',
    '/notes': 'Notes & Examens',
    '/parametres': 'Parametres',
    '/communication': 'Communication',
    '/rapports': 'Rapports',
    '/annonces': 'Annonces',
    '/emploi-du-temps': 'Emploi du temps'
  };

  const menuToPathMap = {
    'Tableau de bord': '/',
    'Liste des Professeurs': '/professeurs',
    'Liste des Etudiants': '/etudiants',
    'Liste des Classes': '/classes',
    'Reclamations': '/reclamations',
    'Notes & Examens': '/notes',
    'Parametres': '/parametres',
    'Communication': '/communication',
    'Rapports': '/rapports',
    'Annonces': '/annonces',
    'Emploi du temps': '/emploi-du-temps'
  };

  const relativePath = location.pathname.startsWith(basePath)
    ? location.pathname.slice(basePath.length) || '/'
    : location.pathname;
  const activeMenu = pathToMenuMap[relativePath] || 'Tableau de bord';
  const setActiveMenu = (menuName) => {
    const p = menuToPathMap[menuName] || '/';
    navigate(`${basePath}${p}`);
  };

  const fallbackUserName = `le ${String(getRoleLabel(user?.role) || 'Utilisateur').toLowerCase()}`;
  const directorDisplayName = `${String(user?.prenom || '').trim()} ${String(user?.nom || '').trim()}`.trim()
    || String(user?.name || '').trim()
    || fallbackUserName;

  const directorInitials = useMemo(() => {
    const sourceParts = [user?.prenom, user?.nom]
      .map((part) => String(part || '').trim())
      .filter(Boolean);

    if (sourceParts.length >= 2) {
      return `${sourceParts[0].charAt(0)}${sourceParts[1].charAt(0)}`.toUpperCase();
    }

    const fallbackParts = String(user?.name || '')
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (fallbackParts.length >= 2) {
      return `${fallbackParts[0].charAt(0)}${fallbackParts[1].charAt(0)}`.toUpperCase();
    }

    if (fallbackParts.length === 1) {
      return fallbackParts[0].charAt(0).toUpperCase();
    }

    return 'D';
  }, [user?.name, user?.nom, user?.prenom]);

  useEffect(() => {
    const loadDashboard = async () => {
      const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'
      const token = getStoredToken() ?? user?.token ?? null;

      try {
        const authConfig = {
          withCredentials: true,
          withXSRFToken: true,
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }

        const [dashboardResponse, reclamationsResponse, classesResponse, secretairesResponse] = await Promise.all([
          axios.get(`${apiBaseUrl}/api/directeur/dashboard`, authConfig),
          axios.get(`${apiBaseUrl}/api/directeur/reclamations`, authConfig),
          axios.get(`${apiBaseUrl}/api/secretaire/classes`, authConfig),
          axios.get(`${apiBaseUrl}/api/directeur/secretaires`, authConfig),
        ])

        setStats(dashboardResponse.data?.stats ?? null)

        const recent = Array.isArray(reclamationsResponse.data)
          ? reclamationsResponse.data
          : (reclamationsResponse.data?.reclamations || [])

        setRecentReclamations(recent.slice(0, 5))

        const classesList = Array.isArray(classesResponse.data?.classes)
          ? classesResponse.data.classes
          : []
        setRecentClasses(classesList.slice(0, 6))

        const secretairesList = Array.isArray(secretairesResponse.data?.secretaires)
          ? secretairesResponse.data.secretaires
          : []
        setTotalSecretaires(secretairesList.length)
      } catch (requestError) {
        setError(requestError?.response?.data?.message ?? 'Impossible de charger le dashboard directeur.')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [user?.id, user?.role])

  return (
    <div className="director-layout">
      <header className="director-header">
        <div className="director-header-logo">
          <span className="logo-link">Linked</span><span className="logo-edu">U</span>
        </div>
        <div className="director-header-actions">
          <button
            type="button"
            className="director-header-profile"
            onClick={() => setActiveMenu('Parametres')}
            title="Ouvrir le profil"
          >
            <span className="director-header-avatar">{directorInitials}</span>
            <span className="director-header-profile-meta">
              <span className="director-header-profile-label">Profil</span>
              <span className="director-header-profile-name">{directorDisplayName}</span>
            </span>
          </button>
          <button
            type="button"
            className="director-header-logout"
            onClick={onLogout}
            aria-label="Se deconnecter"
            title="Se deconnecter"
          >
            <FiLogOut size={18} />
          </button>
        </div>
      </header>

      <main className="director-body">
        <DirectorSidebar user={user} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

        <section className="director-page-content">
          {isLoading && <p className="director-info">Chargement des donnees...</p>}
          {error && <p className="auth-feedback auth-feedback-error">{error}</p>}

          {!isLoading && !error && activeMenu === 'Tableau de bord' && (
            <div className="page-dashboard">
              <header className="page-dashboard-header">
                <div>
                  <h1>Bonjour, {user?.prenom ?? 'M.'} {user?.nom ?? fallbackUserName}</h1>
                  <p>Resume du jour avec les indicateurs essentiels.</p>
                </div>
              </header>

              <section className="kpi-grid">
                <article className="kpi-card">
                  <p>Nombre de classes</p>
                  <h3>{stats?.classes ?? 0}</h3>
                </article>
                <article className="kpi-card">
                  <p>Nombre d'etudiants</p>
                  <h3>{stats?.etudiants ?? 0}</h3>
                </article>
                <article className="kpi-card">
                  <p>Nombre de professeurs</p>
                  <h3>{stats?.professeurs ?? 0}</h3>
                </article>
                <article className="kpi-card">
                  <p>Nombre de secretaires</p>
                  <h3>{totalSecretaires}</h3>
                </article>
              </section>

              <div className="dashboard-content-split">
                <article className="recent-claims-card">
                  <div className="card-header">
                    <h2>Reclamations recentes</h2>
                    <a href="#" onClick={(event) => { event.preventDefault(); setActiveMenu('Reclamations'); }}>Voir toutes</a>
                  </div>
                  <div className="claims-list">
                    {recentReclamations.length === 0 ? (
                      <p className="director-info">Aucune reclamation recente.</p>
                    ) : (
                      recentReclamations.map((claim) => {
                        const label = String(claim.cible_label || 'Parent');
                        const initial = label.substring(0, 2).toUpperCase();
                        const claimDate = claim.date_reclamation
                          ? new Date(claim.date_reclamation).toLocaleDateString('fr-FR')
                          : '-';

                        return (
                          <div className="claim-item" key={claim.id_reclamation}>
                            <div className="claim-avatar">{initial}</div>
                            <div className="claim-content">
                              <div className="claim-head">
                                <strong>{claim.sujet || 'Sans sujet'}</strong>
                                <span>{label}</span>
                              </div>
                              <p>{claim.description || 'Aucun detail'}</p>
                              <div className="claim-footer">
                                <span className="claim-time">{claimDate}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </article>

                <article className="classes-overview-card">
                  <div className="card-header">
                    <h2>Liste des classes</h2>
                    <a href="#" onClick={(event) => { event.preventDefault(); setActiveMenu('Liste des Classes'); }}>Voir toutes</a>
                  </div>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>CLASSE</th>
                          <th>PRIX (DH)</th>
                          <th>ETUDIANTS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentClasses.length === 0 ? (
                          <tr>
                            <td colSpan="3" style={{ textAlign: 'center', padding: '1rem 0', color: '#64748b' }}>
                              Aucune classe disponible.
                            </td>
                          </tr>
                        ) : (
                          recentClasses.map((classe) => (
                            <tr key={classe.id_classe}>
                              <td><strong>{classe.nom || '-'}</strong></td>
                              <td>{Number(classe.pricing ?? 0).toLocaleString('fr-FR')} DH</td>
                              <td>{classe.total_etudiants ?? 0}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </article>
                </div>
            </div>
          )}

          {/* Fallback for other modes unstyled yet */}
          {!isLoading && !error && activeMenu === 'Reclamations' && (
              <DirectoryReclamations />
            )}
            {!isLoading && !error && activeMenu === 'Liste des Professeurs' && (
              <DirectoryProfessors userRole={user?.role} />
            )}
            {!isLoading && !error && activeMenu === 'Liste des Etudiants' && (
                <DirectoryStudents userRole={user?.role} />
              )}
              {!isLoading && !error && activeMenu === 'Liste des Classes' && (
                <DirectoryClasses userRole={user?.role} />
              )}
              {!isLoading && !error && activeMenu === 'Notes & Examens' && (
                <DirectoryGrades userRole={user?.role} />
              )}
              {!isLoading && !error && activeMenu === 'Parametres' && (
                <DirectorySettings userRole={user?.role} />
              )}
              {!isLoading && !error && activeMenu === 'Communication' && (
                <DirectoryFallback activeMenu={activeMenu} userRole={user?.role} />
              )}
              {!isLoading && !error && activeMenu === 'Rapports' && (<DirectoryReports />)}
              {!isLoading && !error && activeMenu === 'Annonces' && (
                <DirectoryAnnonces />
              )}
              {!isLoading && !error && activeMenu === 'Emploi du temps' && (
                <DirectoryTimetable />
              )}        </section>
      </main>
    </div>
  )
}

export default DirecteurDashboard


