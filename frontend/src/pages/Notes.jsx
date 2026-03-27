import { useState } from 'react';
import { FiSave, FiPrinter, FiUploadCloud } from 'react-icons/fi';
import './Notes.css';

const notesData = [
  { id: 1, firstName: 'Ayoub', lastName: 'Karim', avatar: 'https://i.pravatar.cc/150?u=1', note: '18.5' },
  { id: 2, firstName: 'Zineb', lastName: 'Benjelloun', avatar: 'https://i.pravatar.cc/150?u=2', note: '17.0' },
  { id: 3, firstName: 'Youssef', lastName: 'Amrani', avatar: 'https://i.pravatar.cc/150?u=3', note: '14.5' },
  { id: 4, firstName: 'Hiba', lastName: 'Chraibi', avatar: 'https://i.pravatar.cc/150?u=4', note: '' },
  { id: 5, firstName: 'Omar', lastName: 'Filali', avatar: 'https://i.pravatar.cc/150?u=5', note: '11.0' },
  { id: 6, firstName: 'Sara', lastName: 'Tazi', avatar: 'https://i.pravatar.cc/150?u=6', note: '16.5' },
];

export default function Notes() {
  const [students, setStudents] = useState(notesData);
  const [selectedClass, setSelectedClass] = useState('2BAC-G1');
  const [selectedMatiere, setSelectedMatiere] = useState('Physique Chimie');
  const [evaluationType, setEvaluationType] = useState('Contrôle 1');

  const updateNote = (id, value) => {
    // Only allow numbers and one decimal dot (or comma replaced by dot)
    const sanitizedValue = value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
    
    // Prevent multiple dots
    if ((sanitizedValue.match(/\./g) || []).length > 1) return;
    
    // Max 20
    const numValue = parseFloat(sanitizedValue);
    if (!isNaN(numValue) && numValue > 20) return;

    setStudents(students.map(s => s.id === id ? { ...s, note: sanitizedValue } : s));
  };

  const handleSave = () => {
    alert("Notes enregistrées avec succès !");
  };

  return (
    <div className="notes-page">
      <div className="notes-header animate-fade-in">
        <div>
          <h2>Saisie des Notes</h2>
          <p>Gérez les évaluations de vos classes</p>
        </div>
        <div className="notes-actions">
          <button className="btn btn-sm btn-outline"><FiUploadCloud size={16}/> Importer Excel</button>
          <button className="btn btn-sm btn-outline"><FiPrinter size={16}/> Imprimer</button>
        </div>
      </div>

      <div className="card notes-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="notes-toolbar card-header">
          <div className="notes-filters">
            <select className="form-select notes-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <option value="2BAC-G1">2BAC Sciences - G1</option>
              <option value="2BAC-G2">2BAC Sciences - G2</option>
            </select>
            <select className="form-select notes-select" value={selectedMatiere} onChange={(e) => setSelectedMatiere(e.target.value)}>
              <option value="Physique Chimie">Physique Chimie</option>
              <option value="Mathématiques">Mathématiques</option>
            </select>
            <select className="form-select notes-select" value={evaluationType} onChange={(e) => setEvaluationType(e.target.value)}>
              <option value="Contrôle 1">Contrôle 1</option>
              <option value="Contrôle 2">Contrôle 2</option>
              <option value="Contrôle 3">Contrôle 3</option>
              <option value="TP">Travaux Pratiques</option>
              <option value="Projet">Projet / Exposé</option>
            </select>
          </div>
          <button className="btn btn-primary notes-change-btn">Valider la sélection</button>
        </div>

        <div className="notes-table-wrapper card-body" style={{ padding: 0 }}>
          <table className="table notes-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Photo</th>
                <th>Nom Complet</th>
                <th>Note / 20</th>
                <th>Appréciation (Optionnel)</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, index) => {
                const numNote = parseFloat(s.note);
                let noteColorClass = '';
                if (!isNaN(numNote)) {
                  if (numNote >= 15) noteColorClass = 'text-green';
                  else if (numNote >= 10) noteColorClass = 'text-orange';
                  else noteColorClass = 'text-red';
                }

                return (
                  <tr key={s.id}>
                    <td className="notes-num">{index + 1}</td>
                    <td><img src={s.avatar} alt="avatar" className="notes-avatar" /></td>
                    <td className="notes-name">{s.firstName} {s.lastName}</td>
                    <td>
                      <div className="notes-input-wrapper">
                        <input 
                          type="text" 
                          className={`form-input notes-input ${noteColorClass}`} 
                          placeholder="Ex: 15.5"
                          value={s.note}
                          onChange={(e) => updateNote(s.id, e.target.value)}
                        />
                      </div>
                    </td>
                    <td>
                      <input type="text" className="form-input notes-appr" placeholder="Très bien, a continué..." />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="notes-footer card-header" style={{ justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', borderBottom: 'none' }}>
           <button className="btn btn-primary notes-save-btn" onClick={handleSave}>
            <FiSave size={16} /> Enregistrer les notes
          </button>
        </div>
      </div>
    </div>
  );
}
