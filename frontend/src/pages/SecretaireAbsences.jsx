import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Filter, 
  Download, 
  Plus,
  UploadCloud,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical
} from 'lucide-react';

const emptyForm = { id_etudiant: '', date_abs: '', motif: 'Medical' };

export default function SecretaireAbsences() {
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
  const [absences, setAbsences] = useState([]);
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterClasse, setFilterClasse] = useState('all');
  const [filterStatut, setFilterStatut] = useState('all');

  const loadData = async () => {
    try {
      const [absencesRes, studentsRes] = await Promise.all([
        axios.get(apiBaseUrl + '/api/secretaire/absences', {
          withCredentials: true,
          withXSRFToken: true,
        }),
        axios.get(apiBaseUrl + '/api/secretaire/students', {
          withCredentials: true,
          withXSRFToken: true,
        }),
      ]);
      setAbsences(absencesRes.data?.absences || []);
      setStudents(studentsRes.data?.students || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await axios.get(apiBaseUrl + '/sanctum/csrf-cookie', { withCredentials: true, withXSRFToken: true });

    try {
      if (editingId) {
        await axios.put(`${apiBaseUrl}/api/secretaire/absences/${editingId}`, {
          date_abs: form.date_abs,
          motif: form.motif,
        }, {
          withCredentials: true,
          withXSRFToken: true,
        });
      } else {
        await axios.post(apiBaseUrl + '/api/secretaire/absences', {
          id_etudiant: Number(form.id_etudiant),
          date_abs: form.date_abs,
          motif: form.motif,
        }, {
          withCredentials: true,
          withXSRFToken: true,
        });
      }
      await loadData();
      resetForm();
    } catch(err) {
      console.error(err);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Supprimer cette absence ?")) return;
    await axios.get(apiBaseUrl + '/sanctum/csrf-cookie', { withCredentials: true, withXSRFToken: true });
    await axios.delete(`${apiBaseUrl}/api/secretaire/absences/${id}`, {
      withCredentials: true,
      withXSRFToken: true,
    });
    await loadData();
  };

  const stats = useMemo(() => {
    const total = absences.length;
    const nonJustifiees = absences.filter(a => !a.motif || a.motif.trim() === '').length;
    // Mock percentage calculation
    const currentRate = 94.2; 
    return { total, nonJustifiees, currentRate };
  }, [absences]);

  const uniqueClasses = useMemo(() => {
    const classes = absences.map(a => a.classe_nom).filter(Boolean);
    return [...new Set(classes)];
  }, [absences]);

  const getStatus = (motif) => {
    if (!motif || motif.trim() === '') return 'non-justifiee';
    if (motif.toLowerCase().includes('attente')) return 'en-attente';
    return 'justifiee';
  };

  const filteredAbsences = useMemo(() => {
    return absences.filter(a => {
      const nomComplet = `${a.etu_nom || ''} ${a.etu_prenom || ''}`.toLowerCase();
      const searchMatch = nomComplet.includes(searchTerm.toLowerCase());
      const classMatch = filterClasse === 'all' || a.classe_nom === filterClasse;
      const statusMatch = filterStatut === 'all' || getStatus(a.motif) === filterStatut;
      return searchMatch && classMatch && statusMatch;
    });
  }, [absences, searchTerm, filterClasse, filterStatut]);

  const motifsType = ["Medical", "Familial", "Transport", "Autre"];

  const renderStatusBadge = (motif) => {
    const status = getStatus(motif);
    if (status === 'justifiee') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          <CheckCircle className="w-3.5 h-3.5" /> Justifiée
        </span>
      );
    }
    if (status === 'en-attente') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
          <Clock className="w-3.5 h-3.5" /> En attente
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
        <XCircle className="w-3.5 h-3.5" /> Non-justifiée
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 font-sans text-gray-900">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Registre des Absences</h1>
          </div>
          <button 
            onClick={() => {resetForm(); document.getElementById('id_etudiant_select')?.focus();}}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl shadow-sm hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <Plus className="w-5 h-5" />
            Nouveau Relevé
          </button>
        </div>

        {/* KPI Cards */}
       
        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Table */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un étudiant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Filter className="w-4 h-4 text-gray-400" />
                </div>
                <select
                  value={filterClasse}
                  onChange={(e) => setFilterClasse(e.target.value)}
                  className="w-full sm:w-44 pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none font-medium text-gray-700"
                >
                  <option value="all">Toutes les classes</option>
                  {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="w-full sm:w-36 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-gray-700"
              >
                <option value="all">Statut: Tous</option>
                <option value="non-justifiee">Non-justifiés</option>
                <option value="justifiee">Justifiés</option>
              </select>
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold whitespace-nowrap">
                <Download className="w-4 h-4" />
                Exporter
              </button>
            </div>

            {/* Table Card */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden pb-4">
              <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Liste des Absences Récentes</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Mis à jour aujourd'hui
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/30">
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Étudiant</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Classe</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date & Période</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Statut</th>
                      <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredAbsences.length > 0 ? filteredAbsences.map((a) => (
                      <tr key={a.id_absence} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                              {a.etu_nom?.substring(0,2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-sm">
                                {a.etu_nom} {a.etu_prenom}
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5">
                                ID: #{a.id_etudiant}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-semibold text-gray-700">{a.classe_nom || '-'}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{a.classe_niveau || ''}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-semibold text-gray-800">
                            {new Date(a.date_abs).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Journée complète
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {renderStatusBadge(a.motif)}
                        </td>
                        <td className="py-4 px-6 text-right">
                           <div className="flex items-center justify-end gap-2 text-gray-400">
                             <button
                               onClick={() => {
                                 setEditingId(a.id_absence);
                                 setForm({
                                   id_etudiant: String(a.id_etudiant),
                                   date_abs: String(a.date_abs).slice(0, 10),
                                   motif: a.motif || 'Medical'
                                 });
                                 window.scrollTo({ top: 0, behavior: 'smooth' });
                               }}
                               className="p-1.5 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors"
                             >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                             </button>
                             <button
                               onClick={() => onDelete(a.id_absence)}
                               className="p-1.5 hover:bg-gray-100 hover:text-red-600 rounded-lg transition-colors"
                             >
                               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                             </button>
                           </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" className="py-8 text-center text-gray-500">Aucune absence trouvée</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Forms & Alerts */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Quick Action Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-[#0b4d96] text-white p-5">
                <h3 className="font-bold text-base">Justifier</h3>
                <p className="text-blue-100 text-xs mt-1">Justifier une absence</p>
              </div>
              <div className="p-6">
                <form onSubmit={onSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Sélectionner L'étudiant</label>
                    <select
                      id="id_etudiant_select"
                      value={form.id_etudiant}
                      onChange={(e) => setForm({ ...form, id_etudiant: e.target.value })}
                      required
                      disabled={!!editingId}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                    >
                      <option value="">Choisir un étudiant...</option>
                      {students.map((s) => (
                        <option key={s.id_etudiant} value={s.id_etudiant}>
                          {s.nom} {s.prenom} ({s.classe || '-'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Date de l'absence</label>
                    <input
                      type="date"
                      value={form.date_abs}
                      onChange={(e) => setForm({ ...form, date_abs: e.target.value })}
                      required
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Type de Motif</label>
                    <div className="grid grid-cols-2 gap-2">
                       {motifsType.map(m => (
                         <button
                           key={m}
                           type="button"
                           onClick={() => setForm({ ...form, motif: m })}
                           className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                             form.motif === m 
                              ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                           }`}
                         >
                           {m}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pièce justificative</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-blue-600">Glissez le certificat médical ici</span>
                      <span className="text-[10px] text-gray-400 mt-1">PDF, PNG, JPG (Max 5MB)</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
                    >
                      {editingId ? 'Mettre à jour' : 'Valider la Justification'}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Alert Contacts Card */}
            

          </div>
        </div>
      </div>
    </div>
  );
}
