import { useState } from 'react';
import { FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import './Avancement.css';

const classesProgres = [
  { id: 1, name: '2BAC Sciences - G1', matiere: 'Physique Chimie', progress: 65, totalChap: 12, completedChap: 8, current: 'Chapitre 8 : Mécanique Newtonienne', nextDate: 'Demain, 08:00' },
  { id: 2, name: '1BAC Sciences - G3', matiere: 'Mathématiques', progress: 45, totalChap: 10, completedChap: 4, current: 'Chapitre 5 : Les suites numériques', nextDate: 'Lundi, 10:00' },
  { id: 3, name: 'TCS - G2', matiere: 'SVTs', progress: 80, totalChap: 8, completedChap: 6, current: 'Chapitre 7 : La reproduction', nextDate: 'Vendredi, 14:00' },
  { id: 4, name: '2BAC Sciences - G2', matiere: 'Physique Chimie', progress: 58, totalChap: 12, completedChap: 7, current: 'Chapitre 8 : Mécanique Newtonienne', nextDate: 'Aujourd\'hui, 15:30' },
];

export default function Avancement() {
  const [selectedClass, setSelectedClass] = useState('');
  const [chapActuel, setChapActuel] = useState('');
  const [pct, setPct] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Avancement mis à jour !');
    setSelectedClass('');
    setChapActuel('');
    setPct(0);
  };

  return (
    <div className="avancement-page">
      <div className="avancement-header animate-fade-in">
        <div>
          <h2>Avancement Pédagogique</h2>
          <p>Suivez la progression du programme pour chaque classe</p>
        </div>
      </div>

      <div className="avancement-content animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="card avancement-form-card">
          <div className="card-header">
            <h3>Mettre à jour l'avancement</h3>
          </div>
          <div className="card-body">
            <form className="avancement-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Classe concernée</label>
                <select className="form-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} required>
                  <option value="">Sélectionner une classe</option>
                  {classesProgres.map(c => <option key={c.id} value={c.name}>{c.name} - {c.matiere}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Chapitre actuel terminé</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ex: Chapitre 4 : Thermodynamique" 
                  value={chapActuel}
                  onChange={(e) => setChapActuel(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Couverture du programme (Estimation en %)</label>
                <div className="avancement-slider-wrapper">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={pct} 
                    onChange={(e) => setPct(parseInt(e.target.value))}
                    className="avancement-slider"
                  />
                  <span className="avancement-slider-val">{pct}%</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                <FiCheckCircle size={16} /> Enregistrer l'avancement
              </button>
            </form>
          </div>
        </div>

        <div className="card avancement-list-card">
          <div className="card-header">
            <h3>Progression globale</h3>
          </div>
          <div className="card-body">
            <div className="progress-list">
              {classesProgres.map(c => (
                <div key={c.id} className="progress-item">
                  <div className="progress-item-header">
                    <div>
                      <span className="progress-class-name">{c.name}</span>
                      <span className="progress-matiere">{c.matiere}</span>
                    </div>
                    <span className="progress-pct">{c.progress}%</span>
                  </div>
                  
                  <div className="progress-bar mb-2">
                    <div className="progress-fill" style={{ width: `${c.progress}%` }}></div>
                  </div>

                  <div className="progress-details">
                    <span className="progress-stat"><strong>{c.completedChap}/{c.totalChap}</strong> Chapitres</span>
                    <span className="progress-current" title={c.current}>Actuel : {c.current}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
