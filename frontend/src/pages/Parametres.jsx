import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { User, Mail, Save, Camera, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Parametres.css';

export default function Parametres() {
  const { user, updateAuthenticatedUser } = useAuth();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.profilePhoto || '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(apiBaseUrl + '/api/user', {
          withCredentials: true,
          headers: { Accept: 'application/json' }
        });

        setFormData({
          name: res.data?.name || '',
          email: res.data?.email || '',
        });
        setAvatarPreview(user?.profilePhoto || '');
      } catch (fetchError) {
        setError('Erreur lors du chargement du profil.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [apiBaseUrl, user?.profilePhoto]);

  const initials = (formData.name || user?.name || 'P').trim().charAt(0).toUpperCase();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) return;

      setAvatarPreview(result);
      updateAuthenticatedUser({ profilePhoto: result });
      setMessage('Photo de profil mise à jour.');
      setError(null);
    };
    reader.readAsDataURL(file);

    // Reset input to allow selecting the same file again.
    event.target.value = '';
  };

  const handleRemovePhoto = () => {
    setAvatarPreview('');
    updateAuthenticatedUser({ profilePhoto: null });
    setMessage('Photo de profil supprimée.');
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await axios.put(apiBaseUrl + '/api/professeur/profile', formData, {
        withCredentials: true,
        headers: { Accept: 'application/json' },
      });

      updateAuthenticatedUser({ name: formData.name, email: formData.email });
      setMessage(res.data?.message || 'Profil mis à jour avec succès.');
    } catch (submitError) {
      setError(submitError?.response?.data?.message || 'Erreur lors de la mise à jour du profil.');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="dashboard-content">
      <header className="content-header">
        <h1>Mon Profil</h1>
        <p>Gérez vos informations personnelles.</p>
      </header>

      <div className="card-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '30px' }}>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {message && <div style={{ padding: '10px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px' }}>{message}</div>}
            {error && <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#9f1239', borderRadius: '8px' }}>{error}</div>}

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: '500', color: '#475569' }}>
                <Camera size={18} /> Photo de Profil
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ width: '84px', height: '84px', borderRadius: '9999px', overflow: 'hidden', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profil professeur" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '1.6rem', fontWeight: '700', color: '#475569' }}>{initials}</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <label style={{ padding: '9px 12px', borderRadius: '8px', background: '#0f172a', color: '#fff', cursor: 'pointer', fontWeight: '500' }}>
                    Choisir une photo
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                  </label>
                  {avatarPreview && (
                    <button type="button" onClick={handleRemovePhoto} style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Trash2 size={16} /> Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>
                <User size={18} /> Nom / Prénom
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>
                <Mail size={18} /> Adresse Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                marginTop: '15px',
                padding: '12px',
                background: '#3b82f6',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '1rem',
                opacity: saving ? 0.7 : 1
              }}
            >
              <Save size={20} />
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
