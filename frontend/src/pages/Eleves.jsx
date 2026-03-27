import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FiSearch, FiMail, FiPhone } from 'react-icons/fi';
import './Eleves.css';

export default function Eleves() {
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [classes, setClasses] = useState([]);
  const [elevesData, setElevesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError('');

      try {
        const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
        const response = await axios.get(apiBaseUrl + '/api/professeur/eleves', {
          withCredentials: true,
          headers: { Accept: 'application/json' },
        });

        setClasses(response.data?.classes || []);
        setElevesData(response.data?.students || []);
      } catch (fetchError) {
        setError('Impossible de charger vos classes et vos eleves.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredEleves = useMemo(() => {
    return elevesData.filter((e) => {
      const classMatch = selectedClass === 'all' || String(e.classId) === selectedClass;
      const fullName = `${e.firstName || ''} ${e.lastName || ''}`.trim().toLowerCase();
      const searchMatch = fullName.includes(searchTerm.toLowerCase());
      return classMatch && searchMatch;
    });
  }, [elevesData, searchTerm, selectedClass]);

  return (
    <div className="eleves-page">
      <div className="eleves-header animate-fade-in">
        <div>
          <h2>Liste des Élèves</h2>
          <p>Consultez les informations de vos élèves par classe</p>
        </div>
      </div>

      <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="eleves-toolbar">
          <div className="eleves-filters">
            <div className="form-group" style={{ minWidth: '200px' }}>
              <select 
                className="form-select" 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="all">Toutes les classes</option>
                {classes.map((classe) => (
                  <option key={classe.id} value={String(classe.id)}>
                    {classe.label || `${classe.nom} - ${classe.niveau}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="eleves-search">
            <div className="login-input-wrapper">
              <FiSearch size={16} className="login-input-icon" />
              <input
                type="text"
                className="form-input login-input"
                placeholder="Rechercher un élève..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="eleves-table-wrapper">
          {loading && <p className="eleves-state-message">Chargement des eleves...</p>}
          {!loading && error && <p className="eleves-state-message eleves-state-error">{error}</p>}

          <table className="table eleves-table">
            <thead>
              <tr>
                <th>Élève</th>
                <th>Classe</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {filteredEleves.length > 0 ? (
                filteredEleves.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div className="eleve-profile-cell">
                        {e.avatar ? (
                          <img src={e.avatar} alt={e.firstName} className="eleve-avatar" />
                        ) : (
                          <div className="eleve-avatar eleve-avatar-fallback">{(e.firstName || 'E').charAt(0).toUpperCase()}</div>
                        )}
                        <div className="eleve-info">
                          <span className="eleve-name">{`${e.firstName || ''} ${e.lastName || ''}`.trim() || 'Eleve'}</span>
                          <span className="eleve-id">{e.matricule || `#${String(e.id).padStart(5, '0')}`}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-blue">{e.class}</span></td>
                    <td>
                      <div className="eleve-contact">
                        <span><FiMail size={12} /> {e.email || 'N/A'}</span>
                        <span><FiPhone size={12} /> {e.phone || 'N/A'}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center" style={{ padding: '2rem' }}>
                    Aucun eleve trouve pour cette recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="eleves-footer">
          <span className="eleves-count">Affichage de {filteredEleves.length} élèves</span>
        </div>
      </div>
    </div>
  );
}
