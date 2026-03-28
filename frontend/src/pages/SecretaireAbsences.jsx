import { useEffect, useState } from 'react';
import axios from 'axios';
import './Eleves.css';

const emptyForm = { id_etudiant: '', date_abs: '', motif: '' };

export default function SecretaireAbsences() {
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
  const [absences, setAbsences] = useState([]);
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData().catch(() => {
      setAbsences([]);
      setStudents([]);
    });
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await axios.get(apiBaseUrl + '/sanctum/csrf-cookie', { withCredentials: true, withXSRFToken: true });

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
  };

  const onDelete = async (id) => {
    await axios.get(apiBaseUrl + '/sanctum/csrf-cookie', { withCredentials: true, withXSRFToken: true });
    await axios.delete(`${apiBaseUrl}/api/secretaire/absences/${id}`, {
      withCredentials: true,
      withXSRFToken: true,
    });
    await loadData();
  };

  return (
    <div className="eleves-page">
      <section className="eleves-panel">
        <div className="eleves-header"><h3>Gestion des absences</h3></div>

        <form className="teacher-form" onSubmit={onSubmit}>
          {!editingId && (
            <select value={form.id_etudiant} onChange={(e) => setForm({ ...form, id_etudiant: e.target.value })} required>
              <option value="">Selectionner un etudiant</option>
              {students.map((s) => (
                <option key={s.id_etudiant} value={s.id_etudiant}>
                  {s.nom} {s.prenom} ({s.matricule})
                </option>
              ))}
            </select>
          )}
          <input type="date" value={form.date_abs} onChange={(e) => setForm({ ...form, date_abs: e.target.value })} required />
          <input placeholder="Motif" value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} />
          <button type="submit">{editingId ? 'Mettre a jour' : 'Ajouter'}</button>
          {editingId && <button type="button" onClick={resetForm}>Annuler</button>}
        </form>

        <table className="eleves-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Etudiant</th>
              <th>Classe</th>
              <th>Professeur</th>
              <th>Motif</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {absences.map((a) => (
              <tr key={a.id_absence}>
                <td>{String(a.date_abs).slice(0, 10)}</td>
                <td>{a.etu_nom} {a.etu_prenom}</td>
                <td>{a.classe_nom} - {a.classe_niveau}</td>
                <td>{a.prof_nom} {a.prof_prenom}</td>
                <td>{a.motif || '-'}</td>
                <td>
                  <button onClick={() => { setEditingId(a.id_absence); setForm({ id_etudiant: '', date_abs: String(a.date_abs).slice(0, 10), motif: a.motif || '' }); }}>Modifier</button>
                  <button onClick={() => onDelete(a.id_absence)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
