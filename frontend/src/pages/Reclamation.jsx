import { useState } from 'react';
import { FiSend, FiPaperclip, FiClock, FiCheckCircle } from 'react-icons/fi';
import './Reclamation.css';

const myReclamations = [
  { id: 'REC-2026-004', subject: 'Problème projecteur Salle A12', category: 'Technique', date: '25 Mars 2026', status: 'En cours', statusColor: 'orange' },
  { id: 'REC-2026-003', subject: 'Manque de feutres pour tableau', category: 'Matériel', date: '20 Mars 2026', status: 'Résolu', statusColor: 'green' },
  { id: 'REC-2026-001', subject: 'Erreur affectation classe 1BAC-G3', category: 'Administratif', date: '05 Sep 2025', status: 'Résolu', statusColor: 'green' },
];

export default function Reclamation() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Réclamation envoyée avec succès à l\'administration !');
    setSubject(''); setCategory(''); setMessage(''); setFile(null);
  };

  return (
    <div className="reclamation-page">
      <div className="reclamation-header animate-fade-in">
        <h2>Réclamations & Requêtes</h2>
        <p>Contactez l'administration pour tout problème technique ou administratif</p>
      </div>

      <div className="reclamation-content animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="card" style={{ flex: 1.5 }}>
          <div className="card-header">
            <h3>Nouvelle réclamation</h3>
          </div>
          <div className="card-body">
            <form className="reclamation-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Sujet principal</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ex: Panne du vidéoprojecteur" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Catégorie</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} required>
                  <option value="">Sélectionnez une catégorie</option>
                  <option value="Technique">Problème Technique (IT, Projecteur...)</option>
                  <option value="Matériel">Matériel pédagogique</option>
                  <option value="Administratif">Ajustement administratif (Emploi, classes...)</option>
                  <option value="Discipline">Signalement disciplinaire</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description détaillée</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Veuillez décrire votre problème en détail..." 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  required 
                  style={{ minHeight: '160px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pièce jointe (Optionnel)</label>
                <div className="file-input-compact">
                  <FiPaperclip size={18} />
                  <span>{file ? file.name : 'Ajouter un fichier, une photo...'}</span>
                  <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--space-2)' }}>
                <FiSend size={16} /> Envoyer la réclamation
              </button>
            </form>
          </div>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <div className="card-header">
            <h3>Mes requêtes récentes</h3>
          </div>
          <div className="card-body">
            <div className="reclamations-list">
              {myReclamations.map((r, i) => (
                <div key={i} className="reclamation-item">
                  <div className="rec-item-header">
                    <span className="rec-id">{r.id}</span>
                    <span className={`badge badge-${r.statusColor}`}>{r.status}</span>
                  </div>
                  <h4 className="rec-subject">{r.subject}</h4>
                  <div className="rec-meta">
                    <span className="rec-cat">{r.category}</span>
                    <span className="rec-date"><FiClock size={12} /> {r.date}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: 'var(--space-4)', justifyContent: 'center' }}>
              Voir tout l'historique
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
