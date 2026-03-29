import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FiUser, FiCalendar, FiMail, FiPhone, FiMapPin, FiArrowLeft, FiCheckCircle, FiSearch, FiEdit2, FiTrash2, FiPlus, FiUsers } from 'react-icons/fi';

const emptyForm = {
  nom: '',
  prenom: '',
  date_naissance: '',
  date_entree: '',
  genre: 'M',
  id_classe: '',
  email: '',
  parent_nom: '',
  parent_prenom: '',
  parent_cin: '',
  parent_email: '',
  parent_phone: '',
  parent_urgence_phone: '',
  adresse: '',
};

export default function SecretaireEtudiants() {
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [isFormPage, setIsFormPage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    setLoading(true);
    const [studentsRes, classesRes] = await Promise.all([
      axios.get(apiBaseUrl + '/api/secretaire/students', {
        withCredentials: true,
        withXSRFToken: true,
      }),
      axios.get(apiBaseUrl + '/api/secretaire/classes', {
        withCredentials: true,
        withXSRFToken: true,
      }),
    ]);

    setStudents(studentsRes.data?.students || []);
    setClasses(classesRes.data?.classes || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData().catch(() => {
      setStudents([]);
      setClasses([]);
      setLoading(false);
    });
  }, []);

  const visibleStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter((s) => {
      const classMatch = classFilter === 'all' || String(s.id_classe || '') === classFilter;
      if (!classMatch) return false;
      if (!term) return true;
      return [s.nom, s.prenom, s.email, s.matricule, s.classe, s.parent_nom, s.parent_prenom, s.parent_email, s.parent_cin, s.parent_phone, s.parent_urgence_phone]
        .some((v) => String(v || '').toLowerCase().includes(term));
    });
  }, [students, search, classFilter]);

  const stats = useMemo(() => {
    const total = students.length;
    const classesCount = classes.length;
    const maleCount = students.filter((s) => String(s.genre || '').toUpperCase() === 'M').length;
    const femaleCount = students.filter((s) => String(s.genre || '').toUpperCase() === 'F').length;

    return {
      total,
      classesCount,
      maleCount,
      femaleCount,
    };
  }, [students, classes]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrorMessage('');
    setIsFormPage(false);
  };

  const openCreateFormPage = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrorMessage('');
    setIsFormPage(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await axios.get(apiBaseUrl + '/sanctum/csrf-cookie', { withCredentials: true, withXSRFToken: true });

      const payload = {
        nom: form.nom,
        prenom: form.prenom,
        date_naissance: form.date_naissance,
        genre: form.genre,
        id_classe: form.id_classe ? Number(form.id_classe) : null,
        email: form.email,
        parent_nom: form.parent_nom,
        parent_prenom: form.parent_prenom,
        parent_cin: form.parent_cin,
        parent_email: form.parent_email || '',
        country_code: '+212',
        parent_phone: form.parent_phone,
        parent_urgence_phone: form.parent_urgence_phone,
        adresse: form.adresse,
      };

      if (editingId) {
        await axios.put(`${apiBaseUrl}/api/secretaire/students/${editingId}`, payload, {
          withCredentials: true,
          withXSRFToken: true,
        });
      } else {
        await axios.post(apiBaseUrl + '/api/secretaire/students', payload, {
          withCredentials: true,
          withXSRFToken: true,
        });
      }

      await loadData();
      resetForm();
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Impossible d'enregistrer l'etudiant.");
    }
  };

  const onEdit = (student) => {
    setEditingId(student.id_etudiant);
    setForm({
      nom: student.nom || '',
      prenom: student.prenom || '',
      date_naissance: student.date_naissance || '',
      date_entree: '',
      genre: student.genre || 'M',
      id_classe: student.id_classe ? String(student.id_classe) : '',
      email: student.email || '',
      parent_nom: student.parent_nom || '',
      parent_prenom: student.parent_prenom || '',
      parent_cin: student.parent_cin || '',
      parent_email: student.parent_email || '',
      parent_phone: student.parent_phone || '',
      parent_urgence_phone: student.parent_urgence_phone || '',
      adresse: student.adresse || '',
    });
    setErrorMessage('');
    setIsFormPage(true);
  };

  const onDelete = async (id) => {
    if (!window.confirm('Supprimer cet etudiant ?')) return;
    await axios.get(apiBaseUrl + '/sanctum/csrf-cookie', { withCredentials: true, withXSRFToken: true });
    await axios.delete(`${apiBaseUrl}/api/secretaire/students/${id}`, {
      withCredentials: true,
      withXSRFToken: true,
    });
    await loadData();
  };

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        {!isFormPage && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                  <FiUsers className="w-8 h-8 text-blue-600" />
                  Liste des étudiants
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors sm:text-sm shadow-sm font-medium"
                    placeholder="Chercher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                
                <div className="relative w-full sm:w-48">
                  <select
                    className="block w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors sm:text-sm shadow-sm font-medium appearance-none cursor-pointer"
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                  >
                    <option value="all">Toutes les classes</option>
                    {classes.map((c) => (
                      <option key={c.id_classe} value={String(c.id_classe)}>
                        {c.nom}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <button 
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95 text-sm" 
                  onClick={openCreateFormPage}
                >
                  <FiPlus className="w-5 h-5 stroke-[3]" />
                  Nouvel étudiant
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom et Prenom</th>
                      <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Email</th>
                      <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Parent</th>
                      <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      [...Array(6)].map((_, i) => (
                        <tr key={`student-skeleton-${i}`} className="animate-pulse">
                          <td className="py-4 px-6"><div className="h-9 w-48 rounded bg-gray-100"></div></td>
                          <td className="py-4 px-6"><div className="h-4 w-40 rounded bg-gray-100 mx-auto"></div></td>
                          <td className="py-4 px-6"><div className="h-10 w-52 rounded bg-gray-100"></div></td>
                          <td className="py-4 px-6"><div className="h-4 w-16 ml-auto rounded bg-gray-100"></div></td>
                        </tr>
                      ))
                    ) : visibleStudents.map((student) => (
                      <tr key={student.id_etudiant} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm tracking-tight">
                              {student.nom ? student.nom.substring(0, 1).toUpperCase() : '?'}
                              {student.prenom ? student.prenom.substring(0, 1).toUpperCase() : ''}
                            </div>
                            <span className="font-semibold text-gray-900">{student.nom} {student.prenom}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500 text-center">{student.email || '-'}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          <div className="font-semibold text-gray-800">{student.parent_nom || '-'} {student.parent_prenom || ''}</div>
                          <div className="text-xs text-gray-500">Parent: {student.parent_phone || '-'}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer" 
                              onClick={() => onEdit(student)}
                              title="Modifier"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer" 
                              onClick={() => onDelete(student.id_etudiant)}
                              title="Supprimer"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!loading && visibleStudents.length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <FiUsers className="w-12 h-12 mb-3 text-gray-200" />
                            <p className="text-base font-medium text-gray-500">Aucun étudiant trouvé</p>
                            <p className="text-sm mt-1">Ajustez vos filtres ou ajoutez un nouvel étudiant.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {isFormPage && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col p-6 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-gray-100 mb-6 gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Modifier Étudiant' : 'Nouvel Étudiant'}</h3>
                <p className="text-gray-500 text-sm mt-1">Veuillez renseigner les informations pour {editingId ? 'mettre à jour le' : 'créer un nouveau'} dossier académique.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors focus:outline-none" 
                  onClick={resetForm}
                >
                  <FiArrowLeft size={16} /> Retour
                </button>
                <button 
                  type="submit" 
                  form="student-form" 
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl shadow-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95"
                >
                  <FiCheckCircle size={16} /> {editingId ? 'Enregistrer' : 'Créer l\'inscription'}
                </button>
              </div>
            </div>

            <form id="student-form" className="flex flex-col gap-8" onSubmit={onSubmit}>
              {errorMessage && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                  {errorMessage}
                </div>
              )}

              {/* Informations Personnelles */}
              <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100 text-base">👤</span> 
                  Informations Personnelles
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Nom</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FiUser size={16} />
                      </div>
                      <input 
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="ex: Durand" required 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Prénom</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FiUser size={16} />
                      </div>
                      <input 
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} placeholder="ex: Jean-Luc" required 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Date de naissance</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FiCalendar size={16} />
                      </div>
                      <input 
                        type="date" 
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        value={form.date_naissance} onChange={(e) => setForm({ ...form, date_naissance: e.target.value })} required 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Genre</label>
                    <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                        <input type="radio" className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" name="genre" value="M" checked={form.genre === 'M'} onChange={(e) => setForm({ ...form, genre: e.target.value })} /> 
                        Masculin
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                        <input type="radio" className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" name="genre" value="F" checked={form.genre === 'F'} onChange={(e) => setForm({ ...form, genre: e.target.value })} /> 
                        Féminin
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              {/* Informations Académiques */}
              <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100 text-base">🎓</span> 
                  Informations Académiques
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Classe / Niveau</label>
                    <select 
                      className="block w-full py-2 px-3 border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      value={form.id_classe} onChange={(e) => setForm({ ...form, id_classe: e.target.value })}
                    >
                      <option value="">Sélectionner un niveau</option>
                      {classes.map((c) => (
                        <option key={c.id_classe} value={c.id_classe}>{c.nom} - {c.niveau}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Date d'entrée</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FiCalendar size={16} />
                      </div>
                      <input 
                        type="date" 
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        value={form.date_entree} onChange={(e) => setForm({ ...form, date_entree: e.target.value })} 
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Informations Parent / Tuteur */}
              <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100 text-base">👨‍👩‍👧</span>
                  Informations Parent / Tuteur
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Nom du parent</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FiUser size={16} />
                      </div>
                      <input
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        value={form.parent_nom}
                        onChange={(e) => setForm({ ...form, parent_nom: e.target.value })}
                        placeholder="ex: Alami"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Prénom du parent</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FiUser size={16} />
                      </div>
                      <input
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        value={form.parent_prenom}
                        onChange={(e) => setForm({ ...form, parent_prenom: e.target.value })}
                        placeholder="ex: Fatima"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Numéro CIN du parent</label>
                    <input
                      className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      value={form.parent_cin}
                      onChange={(e) => setForm({ ...form, parent_cin: e.target.value })}
                      placeholder="ex: AB123456"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Gmail du parent</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FiMail size={16} />
                      </div>
                      <input
                        type="email"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        value={form.parent_email}
                        onChange={(e) => setForm({ ...form, parent_email: e.target.value })}
                        placeholder="parent@gmail.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Téléphone parent</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FiPhone size={16} />
                      </div>
                      <input
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        value={form.parent_phone}
                        onChange={(e) => setForm({ ...form, parent_phone: e.target.value })}
                        placeholder="+212 6 00 00 00 00"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Téléphone urgence (Facultatif)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FiPhone size={16} />
                      </div>
                      <input
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        value={form.parent_urgence_phone}
                        onChange={(e) => setForm({ ...form, parent_urgence_phone: e.target.value })}
                        placeholder="+212 6 11 11 11 11"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Coordonnées */}
              <section className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100 text-base">📍</span> 
                  Coordonnées
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FiMail size={16} />
                      </div>
                      <input 
                        type="email" 
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Optionnel: etudiant@exemple.com"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Si vide, le systeme generera un email eleve base sur le gmail parent.</p>
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Adresse postale</label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                        <FiMapPin size={16} />
                      </div>
                      <textarea 
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-y"
                        value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} rows="3" required placeholder="Numéro, rue, code postal et ville" 
                      />
                    </div>
                  </div>
                </div>
              </section>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
