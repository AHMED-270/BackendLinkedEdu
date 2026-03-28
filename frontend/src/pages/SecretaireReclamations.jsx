import { useEffect, useState } from 'react';
import axios from 'axios';
import './Reclamation.css';

const statusOptions = ['en_attente', 'en_cours', 'resolue', 'rejetee'];

export default function SecretaireReclamations() {
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
  const [reclamations, setReclamations] = useState([]);

  const loadData = async () => {
    const res = await axios.get(apiBaseUrl + '/api/secretaire/reclamations', {
      withCredentials: true,
      withXSRFToken: true,
    });
    setReclamations(res.data?.reclamations || []);
  };

  useEffect(() => {
    loadData().catch(() => setReclamations([]));
  }, []);

  const onStatusChange = async (id, statut) => {
    await axios.get(apiBaseUrl + '/sanctum/csrf-cookie', { withCredentials: true, withXSRFToken: true });
    await axios.put(`${apiBaseUrl}/api/secretaire/reclamations/${id}/status`, { statut }, {
      withCredentials: true,
      withXSRFToken: true,
    });
    await loadData();
  };

  return (
    <div className="reclamation-page">
      <section className="reclamation-panel">
        <div className="reclamation-header"><h3>Suivi des reclamations</h3></div>

        <table className="reclamation-table">
          <thead>
            <tr>
              <th>Sujet</th>
              <th>Parent</th>
              <th>Email</th>
              <th>Date</th>
              <th>Message</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {reclamations.map((r) => (
              <tr key={r.id_reclamation}>
                <td>{r.sujet}</td>
                <td>{r.parent_nom} {r.parent_prenom}</td>
                <td>{r.parent_email}</td>
                <td>{r.date_soumission ? String(r.date_soumission).slice(0, 16).replace('T', ' ') : '-'}</td>
                <td>{r.message}</td>
                <td>
                  <select value={r.statut} onChange={(e) => onStatusChange(r.id_reclamation, e.target.value)}>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
