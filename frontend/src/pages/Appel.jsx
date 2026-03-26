import { useState } from 'react';
import { FiCheck, FiX, FiMessageSquare } from 'react-icons/fi';
import './Appel.css';

const appelData = [
  { id: 1, firstName: 'Ayoub', lastName: 'Karim', avatar: 'https://i.pravatar.cc/150?u=1', status: 'present' },
  { id: 2, firstName: 'Zineb', lastName: 'Benjelloun', avatar: 'https://i.pravatar.cc/150?u=2', status: null },
  { id: 3, firstName: 'Youssef', lastName: 'Amrani', avatar: 'https://i.pravatar.cc/150?u=3', status: 'absent' },
  { id: 4, firstName: 'Hiba', lastName: 'Chraibi', avatar: 'https://i.pravatar.cc/150?u=4', status: null },
  { id: 5, firstName: 'Omar', lastName: 'Filali', avatar: 'https://i.pravatar.cc/150?u=5', status: 'present' },
  { id: 6, firstName: 'Sara', lastName: 'Tazi', avatar: 'https://i.pravatar.cc/150?u=6', status: null },
];

export default function Appel() {
  const [students, setStudents] = useState(appelData);
  const [selectedClass, setSelectedClass] = useState('2BAC-G1');
  const [selectedMatiere, setSelectedMatiere] = useState('Physique Chimie');
  const [date, setDate] = useState('2026-03-26');

  const updateStatus = (id, status) => {
    setStudents(students.map(s => s.id === id ? { ...s, status } : s));
  };

  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;

  const handleSave = () => {
    alert("Feuille d'appel enregistrée !");
  };

  return (
    <div className="appel-page">
      <div className="appel-header animate-fade-in">
        <div>
          <h2>Feuille d'Appel</h2>
          <p>Lundi 26 Mars 2026 • 08h00 à 09h30</p>
        </div>
      </div>

      <div className="card appel-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="appel-toolbar card-header">
          <div className="appel-filters">
            <select className="form-select appel-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <option value="2BAC-G1">2BAC Sciences - G1</option>
              <option value="1BAC-G3">1BAC Sciences - G3</option>
            </select>
            <select className="form-select appel-select" value={selectedMatiere} onChange={(e) => setSelectedMatiere(e.target.value)}>
              <option value="Physique Chimie">Physique Chimie</option>
              <option value="Mathématiques">Mathématiques</option>
            </select>
            <input type="date" className="form-input appel-date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button className="btn btn-primary appel-change-btn">Changer l'heure</button>
        </div>

        <div className="appel-table-wrapper card-body" style={{ padding: 0 }}>
          <table className="table appel-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Photo</th>
                <th>Nom Complet</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, index) => (
                <tr key={s.id} className={s.status === 'absent' ? 'absent-row' : ''}>
                  <td className="appel-num">{index + 1}</td>
                  <td><img src={s.avatar} alt="avatar" className="appel-avatar" /></td>
                  <td className="appel-name">{s.firstName} {s.lastName}</td>
                  <td>
                    <div className="appel-actions">
                      <button 
                        className={`appel-action-btn present ${s.status === 'present' ? 'active' : ''}`}
                        onClick={() => updateStatus(s.id, 'present')}
                        title="Présent"
                      >
                        <FiCheck size={18} />
                      </button>
                      <button 
                        className={`appel-action-btn absent ${s.status === 'absent' ? 'active' : ''}`}
                        onClick={() => updateStatus(s.id, 'absent')}
                        title="Absent"
                      >
                        <FiX size={18} />
                      </button>
                      {s.status === 'absent' && (
                        <button className="appel-sms-btn" title="Envoyer SMS aux parents">
                          <FiMessageSquare size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="appel-footer card-header" style={{ justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', borderBottom: 'none' }}>
          <div className="appel-stats">
            <span className="appel-stat-present"><span className="dot bg-green"></span> Présents : <strong>{presentCount}</strong></span>
            <span className="appel-stat-absent"><span className="dot bg-red"></span> Absents : <strong>{absentCount}</strong></span>
          </div>
          <button className="btn btn-primary appel-save-btn" onClick={handleSave} disabled={presentCount + absentCount !== students.length}>
            Enregistrer l'appel
          </button>
        </div>
      </div>
    </div>
  );
}
