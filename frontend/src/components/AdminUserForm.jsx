import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FiArrowLeft as ArrowLeft } from 'react-icons/fi';
import { BiSolidUserDetail } from 'react-icons/bi';

export default function AdminUserForm({ mode = 'create', userToEdit = null, onBack, onSuccess, isModal = false }) {
  const isEditing = mode === 'edit' && !!userToEdit;

  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [loadWarning, setLoadWarning] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'secretaire',
    id_classe: '',
    id_parent: '',
    telephone: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

  const parentUsers = useMemo(() => users.filter((u) => u.role === 'parent'), [users]);
  const selectedParent = parentUsers.find((p) => String(p.id) === String(formData.id_parent));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadWarning('');

        const [usersResult, classesResult] = await Promise.allSettled([
          axios.get(apiBaseUrl + '/api/admin/users', {
            withCredentials: true,
            headers: { Accept: 'application/json' }
          }),
          axios.get(apiBaseUrl + '/api/admin/classes', {
            withCredentials: true,
            headers: { Accept: 'application/json' }
          })
        ]);

        const usersData = usersResult.status === 'fulfilled' ? (usersResult.value.data || []) : [];
        const classesData = classesResult.status === 'fulfilled' ? (classesResult.value.data || []) : [];

        setUsers(usersData);
        setClasses(classesData);

        if (usersResult.status === 'rejected' || classesResult.status === 'rejected') {
          setLoadWarning('Certaines donnees du formulaire n\'ont pas pu etre chargees. Vous pouvez quand meme continuer.');
        }

        if (isEditing) {
          setFormData({
            name: userToEdit.name || '',
            email: userToEdit.email || '',
            password: '',
            role: userToEdit.role || 'secretaire',
            id_classe: userToEdit.id_classe || (classesData[0]?.id_classe ?? ''),
            id_parent: userToEdit.id_parent || '',
            telephone: userToEdit.telephone || ''
          });
          setConfirmPassword('');
        } else {
          const firstParent = usersData.find((u) => u.role === 'parent');
          setFormData((prev) => ({
            ...prev,
            id_classe: classesData[0]?.id_classe ?? '',
            id_parent: firstParent?.id ?? ''
          }));
          setConfirmPassword('');
        }
      } catch (error) {
        console.error('Erreur fetch:', error);
        setLoadWarning('Certaines donnees du formulaire n\'ont pas pu etre chargees. Vous pouvez quand meme continuer.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiBaseUrl, isEditing, userToEdit]);

  const ensureCsrfCookie = async () => {
    await axios.get(apiBaseUrl + '/sanctum/csrf-cookie', {
      withCredentials: true,
      withXSRFToken: true,
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    if (formData.password && formData.password !== confirmPassword) {
      setFormError('La confirmation du mot de passe ne correspond pas.');
      setSaving(false);
      return;
    }

    try {
      await ensureCsrfCookie();

      if (isEditing) {
        await axios.put(`${apiBaseUrl}/api/admin/users/${userToEdit.id}`, formData, {
          withCredentials: true,
          withXSRFToken: true,
          headers: { Accept: 'application/json' }
        });
      } else {
        await axios.post(`${apiBaseUrl}/api/admin/users`, formData, {
          withCredentials: true,
          withXSRFToken: true,
          headers: { Accept: 'application/json' }
        });
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      setFormError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const roles = [
    { value: 'professeur', label: 'Professeur' },
    { value: 'secretaire', label: 'Secretariat' },
    { value: 'directeur', label: 'Directeur' }
  ];

  if (loading) {
    return (
      <div className={isModal ? '' : 'dashboard-content'}>
        <p>Chargement du formulaire...</p>
      </div>
    );
  }

  return (
    <div className={isModal ? '' : 'dashboard-content'}>
      {!isModal && (
        <header className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="mt-1 flex items-center gap-2 text-4xl lg:text-5xl font-extrabold italic tracking-tight text-slate-900">
              <BiSolidUserDetail className="text-blue-600" />
              {isEditing ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
            </h1>
            <p>Formulaire dedie pour ajouter ou modifier un utilisateur.</p>
          </div>
          <button
            type="button"
            onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0f172a', color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
          >
            <ArrowLeft size={16} />
            Retour a la gestion
          </button>
        </header>
      )}

      <div className={isModal ? 'bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden' : 'card-panel'} style={!isModal ? { marginBottom: '20px' } : undefined}>
        {isModal && (
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gray-50/70">
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Users / {isEditing ? 'Modifier' : 'Ajouter'}</p>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-1">{isEditing ? 'Modifier un Utilisateur' : 'Ajouter un Utilisateur'}</h2>
            <p className="text-sm text-gray-500 mt-1">Creation manuelle reservee aux cadres: secretaire, professeur, directeur.</p>
          </div>
        )}

        <div className={isModal ? 'p-6' : ''}>
          {loadWarning && (
            <p style={{ color: '#b45309', marginBottom: '10px' }}>{loadWarning}</p>
          )}
          {formError && <p style={{ color: 'red', marginBottom: '10px' }}>{formError}</p>}

          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            <section className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-12">
                <div className="md:col-span-4 bg-gray-50 p-4 border-b md:border-b-0 md:border-r border-gray-200">
                  <h3 className="text-sm font-bold text-gray-800">Informations de compte</h3>
                  <p className="text-xs text-gray-500 mt-1">Identite de base de l'utilisateur sur la plateforme.</p>
                </div>
                <div className="md:col-span-8 p-4 grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Nom complet</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">E-mail professionnel</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Role assigne</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                    >
                      {roles.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <section className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-12">
                <div className="md:col-span-4 bg-gray-50 p-4 border-b md:border-b-0 md:border-r border-gray-200">
                  <h3 className="text-sm font-bold text-gray-800">Securite</h3>
                  <p className="text-xs text-gray-500 mt-1">Definissez les identifiants d'acces initiaux.</p>
                </div>
                <div className="md:col-span-8 p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Mot de passe</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!isEditing}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Confirmation</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={!isEditing}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            {(formData.role === 'directeur' || formData.role === 'professeur') && (
              <section className="border border-gray-200 rounded-xl p-4">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  {formData.role === 'directeur'
                    ? 'Telephone du directeur'
                    : formData.role === 'professeur'
                      ? 'Telephone du professeur'
                      : 'Telephone'}
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: 0612345678"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                />
              </section>
            )}

           
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={onBack}
                disabled={saving}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
