import { useEffect, useState } from 'react';
import axios from 'axios';
import './Annonces.css';

const emptyForm = { titre: '', contenu: '' };

export default function SecretaireAnnonces() {
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
  const [annonces, setAnnonces] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    const res = await axios.get(apiBaseUrl + '/api/secretaire/annonces', {
      withCredentials: true,
      withXSRFToken: true,
    });
    setAnnonces(res.data?.annonces || []);
  };

  useEffect(() => {
    loadData().catch(() => setAnnonces([]));
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    await axios.get(apiBaseUrl + '/sanctum/csrf-cookie', { withCredentials: true, withXSRFToken: true });
    await axios.post(apiBaseUrl + '/api/secretaire/annonces', form, {
      withCredentials: true,
      withXSRFToken: true,
    });
    setForm(emptyForm);
    await loadData();
  };

  return (
    <div className="annonces-page">
      <section className="annonces-panel">
        <div className="annonces-header">
          <h3>Publication d'annonces</h3>
        </div>

        <form className="announce-form" onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Titre"
            value={form.titre}
            onChange={(e) => setForm({ ...form, titre: e.target.value })}
            required
          />
          <textarea
            rows="4"
            placeholder="Contenu"
            value={form.contenu}
            onChange={(e) => setForm({ ...form, contenu: e.target.value })}
            required
          />
          <button type="submit">Publier</button>
        </form>

        <table className="announce-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Auteur</th>
              <th>Date</th>
              <th>Contenu</th>
            </tr>
          </thead>
          <tbody>
            {annonces.map((a) => (
              <tr key={a.id_annonce}>
                <td>{a.titre}</td>
                <td>{a.auteur_nom} {a.auteur_prenom}</td>
                <td>{a.date_publication ? String(a.date_publication).slice(0, 16).replace('T', ' ') : '-'}</td>
                <td>{a.contenu}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
