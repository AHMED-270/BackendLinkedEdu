import { FiSettings, FiUser, FiBell, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Parametres.css';

export default function Parametres() {
  const { user } = useAuth();
  
  return (
    <div className="parametres-page">
      <div className="param-header animate-fade-in">
        <h2>Paramètres de Profil</h2>
        <p>Gérez vos informations personnelles et vos préférences.</p>
      </div>

      <div className="param-content animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="param-sidebar card">
          <ul className="param-menu">
            <li className="active"><FiUser /> Profil Public</li>
            <li><FiShield /> Sécurité & Mot de passe</li>
            <li><FiBell /> Préférences Notifications</li>
            <li><FiSettings /> Paramètres Affichage</li>
          </ul>
        </div>
        
        <div className="param-main card">
          <div className="card-header">
            <h3>Informations Générales</h3>
          </div>
          <div className="card-body">
            <div className="param-avatar-section">
              <div className="avatar-preview">
                {user?.initials || 'P'}
              </div>
              <div className="avatar-actions">
                <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>Changer la photo</button>
                <button className="btn btn-outline" style={{ padding: '8px 16px', color: 'var(--accent-red)', border: '1px solid var(--accent-red)', fontSize: '0.875rem' }}>Supprimer</button>
              </div>
            </div>
            
            <form className="param-form">
              <div className="form-group">
                <label>Nom complet</label>
                <input type="text" className="input-field" defaultValue={user?.name} />
              </div>
              <div className="form-group">
                <label>Adresse e-mail (Institutionnelle)</label>
                <input type="email" className="input-field text-gray" defaultValue={user?.email} disabled />
              </div>
              <div className="form-group">
                <label>Établissement</label>
                <input type="text" className="input-field text-gray" defaultValue={user?.etablissement} disabled />
              </div>
              
              <button type="button" className="btn btn-primary" style={{ marginTop: '16px' }}>Sauvegarder les modifications</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
