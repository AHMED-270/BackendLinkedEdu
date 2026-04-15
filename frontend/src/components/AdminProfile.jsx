import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUser as User, FiMail as Mail, FiLock as Lock, FiSave as Save, FiCamera as Camera, FiTrash2 as Trash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const ADMIN_AVATAR_STORAGE_KEY = 'linkedu_admin_avatar';

export default function AdminProfile() {
  const { user, updateAuthenticatedUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(apiBaseUrl + '/api/user', {
          withCredentials: true,
          headers: { Accept: 'application/json' }
        });
        setFormData({
          name: res.data.name,
          email: res.data.email,
          password: ''
        });
        setAvatarPreview(user?.profilePhoto || localStorage.getItem(ADMIN_AVATAR_STORAGE_KEY) || '');
      } catch (err) {
        console.error('Erreur profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [apiBaseUrl, user?.profilePhoto]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const notifyAvatarUpdate = () => {
    window.dispatchEvent(new Event('admin-avatar-updated'));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez choisir une image valide.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('La photo ne doit pas depasser 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) {
        setError('Impossible de lire la photo selectionnee.');
        return;
      }

      localStorage.setItem(ADMIN_AVATAR_STORAGE_KEY, result);
      setAvatarPreview(result);
      updateAuthenticatedUser({ profilePhoto: result });
      setError(null);
      setMessage('Photo de profil mise a jour.');
      notifyAvatarUpdate();
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    localStorage.removeItem(ADMIN_AVATAR_STORAGE_KEY);
    setAvatarPreview('');
    updateAuthenticatedUser({ profilePhoto: null });
    setError(null);
    setMessage('Photo de profil supprimee.');
    notifyAvatarUpdate();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    if (!String(formData.password || '').trim()) {
      setSaving(false);
      setError('Saisissez un nouveau mot de passe pour enregistrer.');
      return;
    }

    try {
      await axios.get(apiBaseUrl + '/sanctum/csrf-cookie', {
        withCredentials: true,
        withXSRFToken: true,
      });

      const res = await axios.put(apiBaseUrl + '/api/admin/profile', {
        password: formData.password,
      }, {
        withCredentials: true,
        withXSRFToken: true,
        headers: { Accept: 'application/json' }
      });

      setMessage(res.data.message);
      setFormData(prev => ({ ...prev, password: '' })); // clear password field
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise Ã  jour.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-brand-navy to-brand-teal bg-clip-text text-transparent tracking-tight flex items-center gap-3">
          <User className="text-brand-teal" size={28} />
          Mon Profil
        </h1>
        <p className="text-sm text-slate-500 mt-2 font-medium">Modification du nom, prénom et email désactivée. Changement de mot de passe uniquement.</p>
      </header>

      <div className="premium-stat max-w-2xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-teal" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {message && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div>
            )}
            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
            )}

            {/* Avatar Section */}
            <div className="premium-stat !bg-white/40">
              <label className="flex items-center gap-2 mb-4 font-bold text-brand-navy text-sm">
                <Camera size={18} className="text-brand-teal" /> Photo de Profil
              </label>
              <div className="flex items-center gap-5 flex-wrap">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-navy/10 to-brand-teal/10 flex items-center justify-center ring-2 ring-white shadow-premium">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profil admin" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-slate-400" />
                  )}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <label className="premium-btn-primary cursor-pointer text-sm">
                    Choisir une photo
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                  {avatarPreview && (
                    <button type="button" onClick={removeAvatar} className="premium-btn-secondary flex items-center gap-2 text-sm">
                      <Trash2 size={16} /> Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 mb-2 font-bold text-brand-navy text-sm">
                <User size={16} className="text-brand-teal" /> Nom / Prénom
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                readOnly
                disabled
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 font-medium cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 mb-2 font-bold text-brand-navy text-sm">
                <Mail size={16} className="text-brand-teal" /> Adresse Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                disabled
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 font-medium cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div className="pt-4 border-t border-white/40">
              <label className="flex items-center gap-2 mb-2 font-bold text-brand-navy text-sm">
                <Lock size={16} className="text-brand-teal" /> Nouveau Mot de Passe
              </label>
              <p className="text-xs text-slate-500 mb-3 font-medium">Laissez vide si vous ne souhaitez pas le changer.</p>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nouveau mot de passe"
                className="premium-input"
              />
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="premium-btn-primary w-full justify-center py-3.5 mt-2"
            >
              <Save size={18} />
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

