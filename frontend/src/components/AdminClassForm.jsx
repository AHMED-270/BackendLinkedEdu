import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiArrowLeft as ArrowLeft } from 'react-icons/fi';
import { FiPlus as Plus } from 'react-icons/fi';
import { BiSolidUserDetail } from 'react-icons/bi';

export default function AdminClassForm({ mode = 'create', classToEdit = null, onBack, onSuccess, isModal = false }) {
  const isEditing = mode === 'edit' && !!classToEdit;
  const [professeurs, setProfesseurs] = useState([]);

  const [formData, setFormData] = useState({
    nom: '',
    niveau: '',
    professeur_ids: []
  });
  const [formMsg, setFormMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

  useEffect(() => {
    const fetchProfesseurs = async () => {
      try {
        const response = await axios.get(apiBaseUrl + '/api/admin/users', {
          withCredentials: true,
          headers: { Accept: 'application/json' }
        });

        const profs = (response.data || []).filter((u) => u.role === 'professeur');
        setProfesseurs(profs);

        if (isEditing) {
          setFormData({
            nom: classToEdit.nom || '',
            niveau: classToEdit.niveau || '',
            professeur_ids: Array.isArray(classToEdit.professeurs_ids)
              ? classToEdit.professeurs_ids.map((id) => String(id))
              : []
          });
        } else {
          setFormData({
            nom: '',
            niveau: '',
            professeur_ids: []
          });
        }
      } catch (error) {
        setFormMsg('Impossible de charger la liste des professeurs.');
      }
    };

    fetchProfesseurs();
  }, [apiBaseUrl, isEditing, classToEdit]);

  const ensureCsrfCookie = async () => {
    await axios.get(apiBaseUrl + '/sanctum/csrf-cookie', {
      withCredentials: true,
      withXSRFToken: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMsg('');
    setSaving(true);

    if (!formData.professeur_ids || formData.professeur_ids.length === 0) {
      setFormMsg('Veuillez selectionner au moins un professeur.');
      setSaving(false);
      return;
    }

    const payload = {
      nom: formData.nom,
      niveau: formData.niveau,
      professeur_ids: formData.professeur_ids.map((id) => Number(id))
    };

    try {
      await ensureCsrfCookie();

      if (isEditing) {
        await axios.put(`${apiBaseUrl}/api/admin/classes/${classToEdit.id_classe}`, payload, {
          withCredentials: true,
          withXSRFToken: true,
          headers: { Accept: 'application/json' }
        });
      } else {
        await axios.post(apiBaseUrl + '/api/admin/classes', payload, {
          withCredentials: true,
          withXSRFToken: true,
          headers: { Accept: 'application/json' }
        });
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      setFormMsg(error.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={isModal ? 'bg-[#f8fafc]' : 'dashboard-content bg-gray-50/30'}>
      {!isModal && (
        <header className="content-header flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold tracking-wider uppercase text-xs mb-1">
              <span className="w-8 h-[2px] bg-blue-600"></span>
              Classes
            </div>
            <h1 className="mt-1 flex items-center gap-3 text-4xl lg:text-5xl font-extrabold italic tracking-tight text-slate-900">
              <BiSolidUserDetail className="text-blue-600" />
              {isEditing ? 'Modifier Classe' : 'Nouvelle Classe'}
            </h1>
            <p className="text-slate-500 mt-2 max-w-2xl">Formulaire de configuration des structures pédagogiques.</p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            <ArrowLeft size={18} strokeWidth={3} /> Retour
          </button>
        </header>
      )}

      <div className={isModal ? 'bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden' : 'bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-10'}>
        {isModal && (
          <div className="px-8 pt-8 pb-6 border-b border-slate-100 bg-gradient-to-br from-blue-50/50 to-white">
            <p className="text-[10px] uppercase tracking-[0.2em] text-blue-600 font-black mb-1">Classes / {isEditing ? 'Modifier' : 'Ajouter'}</p>
            <h2 className="text-3xl font-black text-slate-900 mt-1">{isEditing ? 'Éditer la Classe' : 'Créer une Classe'}</h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">Définissez le nom, le niveau et affectez les enseignants responsables.</p>
          </div>
        )}

        <div className={isModal ? 'p-8' : 'p-10'}>
          {formMsg && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs font-black">!</div>
              <p className="text-sm font-bold">{formMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Base Info */}
            <section className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-12">
                <div className="md:col-span-4 bg-slate-50 p-6 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-center">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Identité</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Informations de base pour identifier la classe dans le système.</p>
                </div>
                <div className="md:col-span-8 p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Nom de la classe</label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      required
                      placeholder="Ex: 3ème B"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Niveau scolaire</label>
                    <input
                      type="text"
                      value={formData.niveau}
                      onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                      required
                      placeholder="Ex: Collège"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Professeurs */}
            <section className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-12">
                <div className="md:col-span-4 bg-slate-50 p-6 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-center">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Enseignants</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Sélectionnez les professeurs habilités à intervenir dans cette classe.</p>
                  <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-blue-700 uppercase">{formData.professeur_ids.length} Sélectionné(s)</span>
                  </div>
                </div>
                <div className="md:col-span-8 p-6 bg-white">
                  <div className="border border-slate-100 rounded-xl bg-slate-50/30 p-2 max-h-[300px] overflow-y-auto custom-scrollbar shadow-inner">
                    {professeurs.length === 0 ? (
                      <div className="p-10 text-center text-slate-400 italic text-sm">Chargement ou aucun professeur disponible...</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {professeurs.map((p) => {
                          const checked = formData.professeur_ids.includes(String(p.id));
                          return (
                            <label 
                              key={p.id} 
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${
                                checked 
                                  ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/5' 
                                  : 'bg-white border-slate-100 hover:border-slate-300'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                checked ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200'
                              }`}>
                                {checked && <Plus className="rotate-45" size={14} strokeWidth={4} />}
                              </div>
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData(prev => ({ ...prev, professeur_ids: [...prev.professeur_ids, String(p.id)] }));
                                  } else {
                                    setFormData(prev => ({ ...prev, professeur_ids: prev.professeur_ids.filter(id => id !== String(p.id)) }));
                                  }
                                }}
                              />
                              <div className="overflow-hidden">
                                <span className={`text-sm font-bold block truncate transition-colors ${checked ? 'text-blue-700' : 'text-slate-600 group-hover:text-slate-900'}`}>{p.name}</span>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">PROFESSEUR</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t border-slate-100 mt-10">
              <button
                type="button"
                onClick={onBack}
                disabled={saving}
                className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all text-sm active:scale-95 disabled:opacity-50"
              >
                ANNULER
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-blue-200 text-sm active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ENREGISTREMENT...
                  </>
                ) : (
                  'CONFIRMER ET ENREGISTRER'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
