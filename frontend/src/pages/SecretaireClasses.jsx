import { useEffect, useState } from 'react';
import axios from 'axios';
import './Eleves.css';

const emptyForm = { nom: '', niveau: '' };

export default function SecretaireClasses() {
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
  const [classes, setClasses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    const res = await axios.get(apiBaseUrl + '/api/secretaire/classes', {
      withCredentials: true,
      withXSRFToken: true,
    });
    setClasses(res.data?.classes || []);
  };

  useEffect(() => {
    loadData().catch(() => setClasses([]));
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await axios.get(apiBaseUrl + '/sanctum/csrf-cookie', { withCredentials: true, withXSRFToken: true });

    if (editingId) {
      await axios.put(`${apiBaseUrl}/api/secretaire/classes/${editingId}`, form, {
        withCredentials: true,
        withXSRFToken: true,
      });
    } else {
      await axios.post(apiBaseUrl + '/api/secretaire/classes', form, {
        withCredentials: true,
        withXSRFToken: true,
      });
    }

    await loadData();
    resetForm();
  };

  const onDelete = async (id) => {
    await axios.get(apiBaseUrl + '/sanctum/csrf-cookie', { withCredentials: true, withXSRFToken: true });
    await axios.delete(`${apiBaseUrl}/api/secretaire/classes/${id}`, {
      withCredentials: true,
      withXSRFToken: true,
    });
    await loadData();
  };

  return (
    <div className="eleves-page">
      <section className="eleves-panel">
        <div className="eleves-header"><h3>Gestion des classes</h3></div>

        <form className="teacher-form" onSubmit={onSubmit}>
          <input placeholder="Nom de la classe" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
          <input placeholder="Niveau" value={form.niveau} onChange={(e) => setForm({ ...form, niveau: e.target.value })} required />
          <button type="submit">{editingId ? 'Mettre a jour' : 'Ajouter'}</button>
          {editingId && <button type="button" onClick={resetForm}>Annuler</button>}
        </form>

        <table className="eleves-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Niveau</th>
              <th>Total etudiants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c.id_classe}>
                <td>{c.nom}</td>
                <td>{c.niveau}</td>
                <td>{c.total_etudiants}</td>
                <td>
                  <button onClick={() => { setEditingId(c.id_classe); setForm({ nom: c.nom, niveau: c.niveau }); }}>Modifier</button>
                  <button onClick={() => onDelete(c.id_classe)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
