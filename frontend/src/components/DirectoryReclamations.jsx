import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DirectoryReclamations.css';

const DirectoryReclamations = () => {
  const [filter, setFilter] = useState('toutes');
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReclamations();
  }, []);

  const fetchReclamations = () => {
    setLoading(true);
    axios.get('http://localhost:8000/api/directeur/reclamations', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
    .then(response => {
      setReclamations(response.data);
      setLoading(false);
    })
    .catch(error => {
      console.error("Erreur lors du chargement des réclamations", error);
      setLoading(false);
    });
  };

  const getFilteredClaims = () => {
    if (filter === 'toutes') {
      return reclamations;
    }
    return reclamations.filter(claim => claim.statut === filter);
  };

  const filteredClaims = getFilteredClaims();

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Nouveau': return 'Nouveau';
      case 'En cours': return 'En cours';
      case 'Resolu':
      case 'Résolu': return 'Résolu';
      default: return status;
    }
  };

  const getStatusBadgeClass = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'nouveau') return 'badge-nouveau';
    if (s === 'en cours' || s === 'en_cours') return 'badge-encours';
    if (s === 'résolu' || s === 'resolu') return 'badge-resolu';
    return 'badge-nouveau';
  };

  return (
    <div className="directory-reclamations">
      <div className="reclamations-header">
        <h2>Boîte de Réception - Réclamations</h2>
        
        <div className="reclamations-filters">
          <button 
            className={`filter-btn ${filter === 'toutes' ? 'active' : ''}`}
            onClick={() => setFilter('toutes')}
          >
            Toutes
          </button>
          <button 
            className={`filter-btn ${filter === 'Nouveau' ? 'active' : ''}`}
            onClick={() => setFilter('Nouveau')}
          >
            Nouvelles
          </button>
          <button 
            className={`filter-btn ${filter === 'En cours' ? 'active' : ''}`}
            onClick={() => setFilter('En cours')}
          >
            En cours
          </button>
          <button 
            className={`filter-btn ${filter === 'Résolu' ? 'active' : ''}`}
            onClick={() => setFilter('Résolu')}
          >
            Résolues
          </button>
        </div>
      </div>

      <div className="claims-list">
        {loading ? (
          <div className="empty-state">Chargement des réclamations...</div>
        ) : filteredClaims.length > 0 ? (
          filteredClaims.map(claim => (
            <div key={claim.id_reclamation} className="claim-card">
              <div className="claim-header">
                <div className="claim-meta">
                  <span className={`claim-badge ${getStatusBadgeClass(claim.statut)}`}>
                    {getStatusLabel(claim.statut)}
                  </span>
                  <span className="claim-date">
                    <i className="fa-regular fa-clock"></i> {new Date(claim.date_reclamation).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="claim-actions">
                  <button className="action-btn reply" title="Répondre">
                    <i className="fa-solid fa-reply"></i>
                  </button>
                  <button className="action-btn resolve" title="Marquer comme résolu">
                    <i className="fa-solid fa-check"></i>
                  </button>
                </div>
              </div>
              
              <div className="claim-body">
                <div className="claim-sender">
                  <div className="sender-avatar">
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <span className="sender-name">Utilisateur ID: {claim.id_parent || claim.id_professeur || claim.id_etudiant || 'Inconnu'}</span>
                </div>
                
                <h3 className="claim-subject">{claim.sujet}</h3>
                <p className="claim-excerpt">
                  {claim.description}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <i className="fa-regular fa-folder-open" style={{fontSize: '3rem', marginBottom: '1rem', color: '#ccc'}}></i>
            <p>Aucune réclamation trouvée pour ce filtre.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectoryReclamations;