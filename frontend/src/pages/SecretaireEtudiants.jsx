import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FiUser, FiCalendar, FiMail, FiPhone, FiMapPin, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import './SecretaireEtudiants.css';

const emptyForm = {
  nom: '',
  prenom: '',
  date_naissance: '',
  date_entree: '',
  genre: 'M',
  id_classe: '',
  email: '',
  parent_email: '',
  parent_phone: '',
  adresse: '',
};

export default function SecretaireEtudiants() {
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [isFormPage, setIsFormPage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData().catch(() => {
      setStudents([]);
      setClasses([]);
    });
  }, []);

  const visibleStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter((s) => {
      const classMatch = classFilter === 'all' || String(s.id_classe || '') === classFilter;
      if (!classMatch) return false;
      if (!term) return true;
      return [s.nom, s.prenom, s.email, s.matricule, s.classe]
        .some((v) => String(v || '').toLowerCase().includes(term));
    });
  }, [students, search, classFilter]);

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
        parent_email: form.parent_email || '',
        country_code: '+212',
        parent_phone: form.parent_phone,
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
      parent_email: student.parent_email || '',
      parent_phone: student.parent_phone || '',
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
    <div className="students-page">
      <div className="students-shell">
        {!isFormPage && (
          <section className="students-index-card">
            <div className="students-index-header">
              <div>
                <h2>Liste des etudiants</h2>
                <p className="muted-header">Consultez et gerez les inscriptions</p>
              </div>
              <button className="btn-open-form" onClick={openCreateFormPage}>Nouvel etudiant</button>
            </div>

            <div className="list-section-card">
              <div className="students-toolbar">
                <input
                  className="toolbar-input"
                  placeholder="Rechercher (nom, prenom, email, matricule)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select className="toolbar-select" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                  <option value="all">Toutes les classes</option>
                  {classes.map((c) => (
                    <option key={c.id_classe} value={String(c.id_classe)}>{c.nom} - {c.niveau}</option>
                  ))}
                </select>
              </div>

              <table className="students-table">
                <thead>
                  <tr>
                    <th>Matricule</th>
                    <th>Nom et Prenom</th>
                    <th>Classe</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleStudents.map((student) => (
                    <tr key={student.id_etudiant}>
                      <td>{student.matricule || '-'}</td>
                      <td>{student.nom} {student.prenom}</td>
                      <td>{student.classe || '-'}</td>
                      <td>{student.email || '-'}</td>
                      <td className="actions-cell">
                        <button className="btn-table" onClick={() => onEdit(student)}>Modifier</button>
                        <button className="btn-table btn-danger" onClick={() => onDelete(student.id_etudiant)}>Supprimer</button>
                      </td>
                    </tr>
                  ))}
                  {visibleStudents.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-state">Aucun etudiant trouve.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {isFormPage && (
          <section className="student-form-page">
            <div className="modal-topbar form-page-topbar">
              <div>
                <h3>{editingId ? 'Modifier Etudiant' : 'Nouvel Etudiant'}</h3>
                <p>Veuillez renseigner les informations pour creer un nouveau dossier academique.</p>
              </div>
              <div className="modal-top-actions">
                <button type="button" className="btn-cancel" onClick={resetForm}><FiArrowLeft size={16} /> Retour a la liste</button>
                <button type="submit" form="student-form" className="btn-submit"><FiCheckCircle size={16} /> {editingId ? 'Enregistrer' : 'Enregistrer inscription'}</button>
              </div>
            </div>

            <form id="student-form" className="student-form" onSubmit={onSubmit}>
              {errorMessage && <p className="error-message">{errorMessage}</p>}

              <section className="form-section">
                <h4><span className="section-badge">👤</span> Informations Personnelles</h4>
                <div className="form-grid two-col">
                  <label>
                    Nom
                    <div className="field-with-icon">
                      <FiUser className="field-icon" size={16} />
                      <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="ex: Durand" required />
                    </div>
                  </label>
                  <label>
                    Prenom
                    <div className="field-with-icon">
                      <FiUser className="field-icon" size={16} />
                      <input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} placeholder="ex: Jean-Luc" required />
                    </div>
                  </label>
                  <label>
                    Date de naissance
                    <div className="field-with-icon">
                      <FiCalendar className="field-icon" size={16} />
                      <input type="date" value={form.date_naissance} onChange={(e) => setForm({ ...form, date_naissance: e.target.value })} required />
                    </div>
                  </label>
                  <label>
                    Genre
                    <div className="radio-row">
                      <label className="radio-item"><input type="radio" name="genre" value="M" checked={form.genre === 'M'} onChange={(e) => setForm({ ...form, genre: e.target.value })} /> Masculin</label>
                      <label className="radio-item"><input type="radio" name="genre" value="F" checked={form.genre === 'F'} onChange={(e) => setForm({ ...form, genre: e.target.value })} /> Feminin</label>
                    </div>
                  </label>
                </div>
              </section>

              <section className="form-section">
                <h4><span className="section-badge">🎓</span> Informations Academiques</h4>
                <div className="form-grid two-col">
                  <label>
                    Classe / Niveau
                    <select value={form.id_classe} onChange={(e) => setForm({ ...form, id_classe: e.target.value })}>
                      <option value="">Selectionner un niveau</option>
                      {classes.map((c) => (
                        <option key={c.id_classe} value={c.id_classe}>{c.nom} - {c.niveau}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Date d'entree
                    <div className="field-with-icon">
                      <FiCalendar className="field-icon" size={16} />
                      <input type="date" value={form.date_entree} onChange={(e) => setForm({ ...form, date_entree: e.target.value })} />
                    </div>
                  </label>
                </div>
              </section>

              <section className="form-section">
                <h4><span className="section-badge">📍</span> Coordonnees</h4>
                <div className="form-grid two-col">
                  <label>
                    Email
                    <div className="field-with-icon">
                      <FiMail className="field-icon" size={16} />
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="etudiant@exemple.com" />
                    </div>
                  </label>
                  <label>
                    Telephone
                    <div className="field-with-icon">
                      <FiPhone className="field-icon" size={16} />
                      <input value={form.parent_phone} onChange={(e) => setForm({ ...form, parent_phone: e.target.value })} placeholder="+33 6 00 00 00 00" required />
                    </div>
                  </label>
                  <label className="full-width">
                    Adresse postale
                    <div className="field-with-icon field-with-textarea">
                      <FiMapPin className="field-icon" size={16} />
                      <textarea value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} rows="3" required placeholder="Numero, rue, code postal et ville" />
                    </div>
                  </label>
                </div>
              </section>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
