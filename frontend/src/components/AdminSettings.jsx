import { useEffect, useState } from 'react';
import { FiSave as Save, FiRotateCcw as RotateCcw, FiSettings as SettingsIcon } from 'react-icons/fi';

const STORAGE_KEY = 'linkedu_admin_settings';
const SUBPROJECT_STORAGE_KEY = 'linkedu_subproject_settings';

const defaultSettings = {
  compactTable: false,
  emailNotifications: true,
  sessionTimeout: '30',
};

const defaultSubproject = {
  displayName: 'LinkedU Admin',
  tagline: 'Gestion du sous-projet',
  schoolYear: '2025-2026',
  coordinator: '',
};

export default function AdminSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [subproject, setSubproject] = useState(defaultSubproject);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings({ ...defaultSettings, ...parsed });
      }

      const subprojectRaw = localStorage.getItem(SUBPROJECT_STORAGE_KEY);
      if (subprojectRaw) {
        const parsedSubproject = JSON.parse(subprojectRaw);
        setSubproject({ ...defaultSubproject, ...parsedSubproject });
      }
    } catch (error) {
      console.error('Erreur lecture settings local:', error);
    }
  }, []);

  const saveSettings = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setStatusMessage('Parametres enregistres avec succes.');
    } catch (error) {
      setStatusMessage("Impossible d'enregistrer les parametres.");
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
    setStatusMessage('Parametres reinitialises.');
  };

  const saveSubproject = () => {
    try {
      localStorage.setItem(SUBPROJECT_STORAGE_KEY, JSON.stringify(subproject));
      window.dispatchEvent(new Event('linkedu-subproject-updated'));
      setStatusMessage('Parametres du sous-projet enregistres.');
    } catch (error) {
      setStatusMessage('Impossible d enregistrer les parametres du sous-projet.');
    }
  };

  const resetSubproject = () => {
    setSubproject(defaultSubproject);
    localStorage.setItem(SUBPROJECT_STORAGE_KEY, JSON.stringify(defaultSubproject));
    window.dispatchEvent(new Event('linkedu-subproject-updated'));
    setStatusMessage('Parametres du sous-projet reinitialises.');
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-brand-navy to-brand-teal bg-clip-text text-transparent tracking-tight flex items-center gap-3">
          <SettingsIcon className="text-brand-teal" size={28} />
          Paramètres
        </h1>
        <p className="text-sm text-slate-500 mt-2 font-medium">Réglages simples de la console administrateur.</p>
      </header>

      {/* Configuration Section */}
      <div className="premium-stat max-w-3xl">
        <h2 className="text-lg font-black text-brand-navy mb-6">Configuration</h2>

        <div className="flex flex-col gap-5">
          {/* Toggle: compact table */}
          <label className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-white/60 hover:border-brand-teal/30 transition-all cursor-pointer group">
            <span className="text-sm font-bold text-brand-navy group-hover:text-brand-teal transition-colors">Mode tableau compact</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.compactTable}
                onChange={(e) => setSettings((prev) => ({ ...prev, compactTable: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-teal/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-teal" />
            </div>
          </label>

          {/* Toggle: email notifications */}
          <label className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-white/60 hover:border-brand-teal/30 transition-all cursor-pointer group">
            <span className="text-sm font-bold text-brand-navy group-hover:text-brand-teal transition-colors">Notifications email admin</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings((prev) => ({ ...prev, emailNotifications: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-teal/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-teal" />
            </div>
          </label>

          {/* Session timeout */}
          <div className="p-4 rounded-2xl bg-white/40 border border-white/60">
            <label className="block mb-2 text-sm font-bold text-brand-navy">
              Délai d'expiration de session
            </label>
            <select
              value={settings.sessionTimeout}
              onChange={(e) => setSettings((prev) => ({ ...prev, sessionTimeout: e.target.value }))}
              className="premium-select w-full"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
              <option value="120">2 heures</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6 flex-wrap">
          <button type="button" onClick={saveSettings} className="premium-btn-primary">
            <Save size={16} /> Enregistrer
          </button>
          <button type="button" onClick={resetSettings} className="premium-btn-secondary">
            <RotateCcw size={16} /> Réinitialiser
          </button>
        </div>

        {statusMessage && (
          <p className="mt-4 text-sm font-bold text-emerald-600">{statusMessage}</p>
        )}
      </div>

      {/* Subproject Section */}
      <div className="premium-stat max-w-3xl">
        <h2 className="text-lg font-black text-brand-navy mb-1">Sous-projet</h2>
        <p className="text-sm text-slate-500 mb-6 font-medium">
          Personnalisez les informations visibles du sous-projet dans votre interface admin.
        </p>

        <div className="flex flex-col gap-5">
          <div>
            <label className="block mb-2 text-sm font-bold text-brand-navy">Nom affiché du sous-projet</label>
            <input
              type="text"
              value={subproject.displayName}
              onChange={(e) => setSubproject((prev) => ({ ...prev, displayName: e.target.value }))}
              placeholder="Ex: LinkedU Admin"
              className="premium-input"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-bold text-brand-navy">Slogan</label>
            <input
              type="text"
              value={subproject.tagline}
              onChange={(e) => setSubproject((prev) => ({ ...prev, tagline: e.target.value }))}
              placeholder="Ex: Gestion du sous-projet"
              className="premium-input"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block mb-2 text-sm font-bold text-brand-navy">Année scolaire</label>
              <input
                type="text"
                value={subproject.schoolYear}
                onChange={(e) => setSubproject((prev) => ({ ...prev, schoolYear: e.target.value }))}
                placeholder="Ex: 2025-2026"
                className="premium-input"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold text-brand-navy">Responsable</label>
              <input
                type="text"
                value={subproject.coordinator}
                onChange={(e) => setSubproject((prev) => ({ ...prev, coordinator: e.target.value }))}
                placeholder="Nom du responsable"
                className="premium-input"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 flex-wrap">
          <button type="button" onClick={saveSubproject} className="premium-btn-primary">
            <Save size={16} /> Enregistrer sous-projet
          </button>
          <button type="button" onClick={resetSubproject} className="premium-btn-secondary">
            <RotateCcw size={16} /> Réinitialiser sous-projet
          </button>
        </div>
      </div>
    </div>
  );
}
