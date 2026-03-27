import React, { useState } from 'react';
import './DirectoryAnnonces.css';

function DirectoryAnnonces() {
  const [annonces] = useState([
    {
      id: 1,
      title: "Réunion générale avec le corps professoral",
      date: "28 Mars 2026",
      type: "Important",
      content: "Une réunion avec tous les professeurs aura lieu ce jeudi à 16h00 dans la salle des professeurs pour discuter des examens de fin de trimestre.",
      author: "Direction"
    },
    {
      id: 2,
      title: "Maintenance de la plateforme LinkEdu",
      date: "27 Mars 2026",
      type: "Info",
      content: "Une maintenance technique est programmée ce week-end. Des coupures temporaires du service sont à prévoir entre minuit et 4h du matin.",
      author: "Service Informatique"
    },
    {
      id: 3,
      title: "Nouvelles activités parascolaires",
      date: "25 Mars 2026",
      type: "Nouveau",
      content: "Les inscriptions pour le club de robotique et le club de théâtre sont désormais ouvertes pour les classes du lycée.",
      author: "Vie Scolaire"
    }
  ]);

  return (
    <div className="directory-annonces-container">
      <div className="annonces-header">
        <div>
          <h1>Annonces et Communications</h1>
          <p>Gérez les annonces diffusées aux professeurs, étudiants et parents.</p>
        </div>
        <button className="btn-new-annonce">+ Nouvelle Annonce</button>
      </div>

      <div className="annonces-list">
        {annonces.map((annonce) => (
          <div key={annonce.id} className="annonce-card">
            <div className="annonce-card-header">
              <span className={`annonce-badge badge-${annonce.type.toLowerCase()}`}>{annonce.type}</span>
              <span className="annonce-date">{annonce.date}</span>
            </div>
            <h3 className="annonce-title">{annonce.title}</h3>
            <p className="annonce-content">{annonce.content}</p>
            <div className="annonce-footer">
              <span className="annonce-author">Par : {annonce.author}</span>
              <button className="btn-edit-annonce">Modifier</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DirectoryAnnonces;
