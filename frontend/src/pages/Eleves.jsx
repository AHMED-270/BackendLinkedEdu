import { useState } from 'react';
import { FiSearch, FiMail, FiPhone, FiMoreVertical } from 'react-icons/fi';
import './Eleves.css';

const elevesData = [
  { id: 1, firstName: 'Ayoub', lastName: 'Karim', class: '2BAC-G1', avatar: 'https://i.pravatar.cc/150?u=1', email: 'ayoub.k@student.linkedu.ma', phone: '+212 600-000001', rank: 1, average: 18.5 },
  { id: 2, firstName: 'Zineb', lastName: 'Benjelloun', class: '2BAC-G1', avatar: 'https://i.pravatar.cc/150?u=2', email: 'zineb.b@student.linkedu.ma', phone: '+212 600-000002', rank: 2, average: 17.8 },
  { id: 3, firstName: 'Youssef', lastName: 'Amrani', class: '2BAC-G1', avatar: 'https://i.pravatar.cc/150?u=3', email: 'youssef.a@student.linkedu.ma', phone: '+212 600-000003', rank: 14, average: 12.4 },
  { id: 4, firstName: 'Hiba', lastName: 'Chraibi', class: '1BAC-G3', avatar: 'https://i.pravatar.cc/150?u=4', email: 'hiba.c@student.linkedu.ma', phone: '+212 600-000004', rank: 5, average: 15.2 },
  { id: 5, firstName: 'Omar', lastName: 'Filali', class: 'TCS-G2', avatar: 'https://i.pravatar.cc/150?u=5', email: 'omar.f@student.linkedu.ma', phone: '+212 600-000005', rank: 8, average: 14.1 },
  { id: 6, firstName: 'Sara', lastName: 'Tazi', class: '2BAC-G1', avatar: 'https://i.pravatar.cc/150?u=6', email: 'sara.t@student.linkedu.ma', phone: '+212 600-000006', rank: 3, average: 16.9 },
  { id: 7, firstName: 'Mehdi', lastName: 'Lahlou', class: '2BAC-G2', avatar: 'https://i.pravatar.cc/150?u=7', email: 'mehdi.l@student.linkedu.ma', phone: '+212 600-000007', rank: 22, average: 10.5 },
];

export default function Eleves() {
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEleves = elevesData.filter((e) => {
    const classMatch = selectedClass === 'all' || e.class === selectedClass;
    const searchMatch = `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    return classMatch && searchMatch;
  });

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
                <option value="2BAC-G1">2BAC Sciences - G1</option>
                <option value="2BAC-G2">2BAC Sciences - G2</option>
                <option value="1BAC-G3">1BAC Sciences - G3</option>
                <option value="TCS-G2">TCS - G2</option>
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
          <table className="table eleves-table">
            <thead>
              <tr>
                <th>Élève</th>
                <th>Classe</th>
                <th>Contact</th>
                <th>Rang global</th>
                <th>Moyenne</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEleves.length > 0 ? (
                filteredEleves.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div className="eleve-profile-cell">
                        <img src={e.avatar} alt={e.firstName} className="eleve-avatar" />
                        <div className="eleve-info">
                          <span className="eleve-name">{e.firstName} {e.lastName}</span>
                          <span className="eleve-id">#{String(e.id).padStart(5, '0')}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-blue">{e.class}</span></td>
                    <td>
                      <div className="eleve-contact">
                        <span><FiMail size={12} /> {e.email}</span>
                        <span><FiPhone size={12} /> {e.phone}</span>
                      </div>
                    </td>
                    <td>
                      <div className="eleve-rank-circle">{e.rank}</div>
                    </td>
                    <td>
                      <span className={`eleve-avg ${e.average >= 15 ? 'high' : e.average >= 12 ? 'med' : 'low'}`}>
                        {e.average.toFixed(2)}/20
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline"><FiMoreVertical size={16} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center" style={{ padding: '2rem' }}>
                    Aucun élève trouvé pour cette recherche.
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
