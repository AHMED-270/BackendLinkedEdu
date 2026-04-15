import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  FiUser as User,
  FiMail as Mail,
  FiSave as Save,
  FiCamera as Camera,
  FiTrash2 as Trash2,
  FiLock as Lock,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Parametres.css';

const emptyPasswordForm = {
  current_password: '',
  password: '',
  password_confirmation: '',
};

export default function Parametres() {
  const { user, updateAuthenticatedUser } = useAuth();
  const fileInputRef = useRef(null);
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
  const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

  const [profileForm, setProfileForm] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
  });
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);

  const [avatarPreview, setAvatarPreview] = useState(user?.profilePhoto || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const resolvePhotoUrl = (rawValue) => {
    const value = String(rawValue || '').trim();
    if (!value) return '';
    if (/^(https?:|data:image|blob:)/i.test(value)) return value;
    if (value.startsWith('//')) return `${window.location.protocol}${value}`;
    if (value.startsWith('/')) return `${apiOrigin}${value}`;
    return `${apiOrigin}/${value.replace(/^\.?\//, '')}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(apiBaseUrl + '/api/profile', {
          withCredentials: true,
          withXSRFToken: true,
          headers: { Accept: 'application/json' },
        });

        const profile = res.data || {};

        setProfileForm({
          nom: profile.nom || '',
          prenom: profile.prenom || '',
          email: profile.email || '',
        });
        setAvatarPreview(resolvePhotoUrl(profile.profile_photo_url || profile.profilePhoto || user?.profilePhoto || ''));
      } catch {
        setProfileError('Erreur lors du chargement du profil.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [apiBaseUrl, user?.profilePhoto]);

  const initials = `${profileForm.prenom || ''} ${profileForm.nom || ''}`.trim().charAt(0).toUpperCase() || 'P';

  const handlePasswordInputChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileError('Veuillez choisir une image valide.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setProfileError('La photo ne doit pas dépasser 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) return;

      setAvatarPreview(result);
      setAvatarFile(file);
      setRemovePhoto(false);
      setProfileError(null);
    };
    reader.readAsDataURL(file);

    event.target.value = '';
  };

  const handleRemovePhoto = () => {
    setAvatarPreview('');
    setAvatarFile(null);
    setRemovePhoto(true);
    setProfileMessage(null);
    setProfileError(null);
  };

  const handleSubmitProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);
    setProfileError(null);

    try {
      await axios.get(apiBaseUrl + '/sanctum/csrf-cookie', {
        withCredentials: true,
        withXSRFToken: true,
      });

      const payload = new FormData();

      if (avatarFile) {
        payload.append('profile_photo', avatarFile);
      }

      if (removePhoto) {
        payload.append('remove_profile_photo', '1');
      }

      const res = await axios.post(apiBaseUrl + '/api/profile', payload, {
        withCredentials: true,
        withXSRFToken: true,
        headers: { Accept: 'application/json' },
      });

      const updated = res.data?.user || {};
      const nextProfilePhoto = resolvePhotoUrl(updated.profile_photo_url || updated.profilePhoto || null);

      updateAuthenticatedUser({
        profilePhoto: nextProfilePhoto,
      });

      setAvatarPreview(nextProfilePhoto || '');
      setAvatarFile(null);
      setRemovePhoto(false);
      setProfileMessage(res.data?.message || 'Photo de profil mise a jour avec succes.');
    } catch (submitError) {
      const backendErrors = submitError?.response?.data?.errors;
      if (backendErrors) {
        const firstError = Object.values(backendErrors)?.[0]?.[0];
        setProfileError(firstError || 'Erreur lors de la mise Ã  jour du profil.');
      } else {
        setProfileError(submitError?.response?.data?.message || 'Erreur lors de la mise Ã  jour du profil.');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSubmitPassword = async (event) => {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordMessage(null);
    setPasswordError(null);

    try {
      await axios.get(apiBaseUrl + '/sanctum/csrf-cookie', {
        withCredentials: true,
        withXSRFToken: true,
      });

      const res = await axios.put(apiBaseUrl + '/api/profile/password', passwordForm, {
        withCredentials: true,
        withXSRFToken: true,
        headers: { Accept: 'application/json' },
      });

      setPasswordForm(emptyPasswordForm);
      setPasswordMessage(res.data?.message || 'Mot de passe mis Ã  jour avec succès.');
    } catch (submitError) {
      const backendErrors = submitError?.response?.data?.errors;
      if (backendErrors) {
        const firstError = Object.values(backendErrors)?.[0]?.[0];
        setPasswordError(firstError || 'Erreur lors du changement de mot de passe.');
      } else {
        setPasswordError(submitError?.response?.data?.message || 'Erreur lors du changement de mot de passe.');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-brand-navy to-brand-teal bg-clip-text text-transparent tracking-tight flex items-center gap-3">
          <User className="text-brand-teal" size={28} />
          Mon Profil
        </h1>
        <p className="text-sm text-slate-500 mt-2 font-medium">Gérez votre photo et votre mot de passe.</p>
      </header>

      {loading ? (
        <div className="premium-stat max-w-5xl mx-auto"><div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-teal" /></div></div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 max-w-5xl mx-auto">
          <form onSubmit={handleSubmitProfile} className="premium-stat space-y-5">
            <h2 className="text-lg font-black text-brand-navy">Informations personnelles</h2>

            {profileMessage && <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-bold text-emerald-700">{profileMessage}</div>}
            {profileError && <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-bold text-red-700">{profileError}</div>}

            <div className="rounded-2xl border border-white/60 bg-white/40 backdrop-blur-sm p-4">
              <label className="mb-3 flex items-center gap-2 text-sm font-bold text-brand-navy">
                <Camera size={16} className="text-brand-teal" /> Photo de profil
              </label>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy/10 to-brand-teal/10 ring-2 ring-white shadow-premium">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profil" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-slate-600">{initials}</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <label className="premium-btn-primary cursor-pointer text-sm">
                    Choisir une photo
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>

                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="premium-btn-secondary text-sm"
                    >
                      <Trash2 size={14} /> Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-brand-navy">
                  <User size={16} className="text-brand-teal" /> Nom
                </label>
                <input
                  type="text"
                  name="nom"
                  value={profileForm.nom}
                  readOnly
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-brand-navy">
                  <User size={16} className="text-brand-teal" /> Prénom
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={profileForm.prenom}
                  readOnly
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-brand-navy">
                <Mail size={16} className="text-brand-teal" /> Adresse email 
              </label>
              <input
                type="email"
                name="email"
                value={profileForm.email}
                readOnly
                disabled
                className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="premium-btn-primary w-full justify-center disabled:opacity-60"
            >
              <Save size={16} />
              {savingProfile ? 'Enregistrement...' : 'Enregistrer la photo'}
            </button>
          </form>

          <form onSubmit={handleSubmitPassword} className="premium-stat space-y-5">
            <h2 className="text-lg font-black text-brand-navy">Changer le mot de passe</h2>

            {passwordMessage && <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-bold text-emerald-700">{passwordMessage}</div>}
            {passwordError && <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-bold text-red-700">{passwordError}</div>}

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-brand-navy">
                <Lock size={16} className="text-brand-teal" /> Mot de passe actuel
              </label>
              <input
                type="password"
                name="current_password"
                value={passwordForm.current_password}
                onChange={handlePasswordInputChange}
                required
                className="premium-input"
                placeholder="Mot de passe actuel"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-brand-navy">
                  <Lock size={16} className="text-brand-teal" /> Nouveau mot de passe
                </label>
                <input
                  type="password"
                  name="password"
                  value={passwordForm.password}
                  onChange={handlePasswordInputChange}
                  required
                  className="premium-input"
                  placeholder="Nouveau mot de passe"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-brand-navy">
                  <Lock size={16} className="text-brand-teal" /> Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={passwordForm.password_confirmation}
                  onChange={handlePasswordInputChange}
                  required
                  className="premium-input"
                  placeholder="Confirmer le mot de passe"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="premium-btn-primary w-full justify-center disabled:opacity-60"
            >
              <Lock size={16} />
              {savingPassword ? 'Mise Ã  jour...' : 'Mettre Ã  jour le mot de passe'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}



