import { useState } from 'react';
import axios from 'axios';
import { FiFileText as FileText, FiDownload as Download, FiCheckCircle as CheckCircle } from 'react-icons/fi';

export default function AdminReports() {
  const [reportType, setReportType] = useState('attendance');
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setSuccessMsg('');
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
      await axios.get(apiBaseUrl + '/sanctum/csrf-cookie', { withCredentials: true });

      const res = await axios.post(apiBaseUrl + '/api/admin/reports/generate', {
        type: reportType,
        month: parseInt(month),
        year: parseInt(year)
      }, {
        withCredentials: true,
        headers: { Accept: 'application/json' }
      });

      setSuccessMsg('Succès: ' + res.data.message + ' Vous pouvez télécharger le document.');
      
    } catch (error) {
      console.error('Report error:', error);
      setSuccessMsg('Erreur lors de la génération du rapport.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-brand-navy to-brand-teal bg-clip-text text-transparent tracking-tight flex items-center gap-3">
          <FileText className="text-brand-teal" size={28} />
          Générateur de Rapports
        </h1>
        <p className="text-sm text-slate-500 mt-2 font-medium">Générez et exportez les rapports statistiques de l'établissement.</p>
      </header>

      <div className="premium-stat max-w-2xl">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 flex items-center justify-center mb-6">
          <FileText size={24} className="text-emerald-500" />
        </div>
        
        <h2 className="text-lg font-black text-brand-navy mb-1">Nouveau Rapport</h2>
        <p className="text-sm text-slate-500 mb-6 font-medium">Sélectionnez les paramètres du rapport que vous souhaitez compiler.</p>

        <form onSubmit={handleGenerate} className="flex flex-col gap-5">
          <div>
            <label className="block mb-2 text-sm font-bold text-brand-navy">Type de rapport</label>
            <select value={reportType} onChange={e => setReportType(e.target.value)} className="premium-select w-full">
              <option value="attendance">Assiduité (Absences)</option>
              <option value="performance">Performances académiques (Notes)</option>
              <option value="financial">Rapport financier</option>
              <option value="general">Synthèse générale mensuelle</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-bold text-brand-navy">Mois</label>
              <select value={month} onChange={e => setMonth(e.target.value)} className="premium-select w-full">
                <option value="1">Janvier</option>
                <option value="2">Février</option>
                <option value="3">Mars</option>
                <option value="4">Avril</option>
                <option value="5">Mai</option>
                <option value="6">Juin</option>
                <option value="7">Juillet</option>
                <option value="8">Août</option>
                <option value="9">Septembre</option>
                <option value="10">Octobre</option>
                <option value="11">Novembre</option>
                <option value="12">Décembre</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-bold text-brand-navy">Année</label>
              <input type="number" value={year} onChange={e => setYear(e.target.value)} min="2020" max="2100" className="premium-input" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isGenerating}
            className="premium-btn-primary w-full justify-center py-3.5 mt-2 disabled:opacity-60"
          >
            {isGenerating ? 'Compilation en cours...' : <><Download size={18} /> Générer le document PDF</>}
          </button>
        </form>

        {successMsg && (
          <div className={`mt-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
            successMsg.includes('Erreur') 
              ? 'bg-red-50 border border-red-200 text-red-700' 
              : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}>
             {!successMsg.includes('Erreur') && <CheckCircle size={20} />}
             {successMsg}
          </div>
        )}
      </div>
    </div>
  );
}
