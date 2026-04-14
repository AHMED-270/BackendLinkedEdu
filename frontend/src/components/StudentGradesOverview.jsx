import { useEffect, useMemo, useState } from 'react';
import './StudentGradesOverview.css';

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function buildInitials(label) {
  const words = String(label || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return 'NA';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0] || ''}${words[1][0] || ''}`.toUpperCase();
}

function getMention(average) {
  if (!Number.isFinite(average)) return 'Insuffisant';
  if (average >= 18) return 'Excellent';
  if (average >= 16) return 'Tres bien';
  if (average >= 14) return 'Bien';
  if (average >= 10) return 'Passable';
  return 'Insuffisant';
}

function getNoteTone(note) {
  if (!Number.isFinite(note)) return 'red';
  if (note >= 14) return 'green';
  if (note >= 10) return 'blue';
  if (note >= 8) return 'orange';
  return 'red';
}

function getToneClass(tone) {
  if (tone === 'green') return 'sgo-tone-green';
  if (tone === 'blue') return 'sgo-tone-blue';
  if (tone === 'orange') return 'sgo-tone-orange';
  return 'sgo-tone-red';
}

export default function StudentGradesOverview({ data }) {
  const semestres = useMemo(() => {
    if (!Array.isArray(data?.semestres)) return [];
    return data.semestres;
  }, [data]);

  const [selectedSemestre, setSelectedSemestre] = useState('all');

  useEffect(() => {
    if (selectedSemestre === 'all') return;

    const exists = semestres.some((semestre) => String(semestre?.id) === String(selectedSemestre));
    if (!exists) setSelectedSemestre('all');
  }, [semestres, selectedSemestre]);

  const visibleSemestres = useMemo(() => {
    if (selectedSemestre === 'all') return semestres;
    return semestres.filter((semestre) => String(semestre?.id) === String(selectedSemestre));
  }, [semestres, selectedSemestre]);

  const rows = useMemo(() => {
    const collected = [];

    visibleSemestres.forEach((semestre) => {
      const semestreId = semestre?.id ?? '-';
      const matieres = Array.isArray(semestre?.matieres) ? semestre.matieres : [];

      matieres.forEach((matiere, idx) => {
        const note = toNumber(matiere?.note, NaN);
        const coefficient = Math.max(0, toNumber(matiere?.coefficient, 1));
        const tone = getNoteTone(note);

        collected.push({
          id: `${semestreId}-${idx}-${String(matiere?.nom || 'matiere')}`,
          semestreId,
          nom: String(matiere?.nom || 'Matiere'),
          initiales: String(matiere?.initiales || buildInitials(matiere?.nom)),
          note,
          coefficient,
          type: String(matiere?.type || 'Controle'),
          valide: Boolean(matiere?.valide),
          tone,
          progress: Number.isFinite(note) ? clamp((note / 20) * 100, 0, 100) : 0,
        });
      });
    });

    return collected.sort((a, b) => {
      const aNote = Number.isFinite(a.note) ? a.note : -1;
      const bNote = Number.isFinite(b.note) ? b.note : -1;
      return bNote - aNote;
    });
  }, [visibleSemestres]);

  const summary = useMemo(() => {
    const weightedTotal = rows.reduce((sum, row) => sum + (Number.isFinite(row.note) ? row.note * row.coefficient : 0), 0);
    const coefficientsTotal = rows.reduce((sum, row) => sum + row.coefficient, 0);

    const average = coefficientsTotal > 0 ? weightedTotal / coefficientsTotal : 0;

    const creditsValidated = rows.reduce((sum, row) => sum + (row.valide ? row.coefficient : 0), 0);

    const creditsTotal = visibleSemestres.reduce((sum, semestre) => {
      const configValue = toNumber(semestre?.credits_total, NaN);
      if (Number.isFinite(configValue) && configValue > 0) return sum + configValue;

      const fallback = (Array.isArray(semestre?.matieres) ? semestre.matieres : []).reduce((acc, matiere) => {
        return acc + Math.max(0, toNumber(matiere?.coefficient, 0));
      }, 0);

      return sum + fallback;
    }, 0);

    return {
      average,
      mention: getMention(average),
      creditsValidated,
      creditsTotal,
    };
  }, [rows, visibleSemestres]);

  const studentName = String(data?.etudiant?.nom || 'Etudiant');
  const rank = data?.etudiant?.rang;
  const classSize = data?.etudiant?.total_classe;

  return (
    <section className="sgo-root">
      <header className="sgo-head">
        <div>
          <p className="sgo-kicker">Resultats scolaires</p>
          <h2>{studentName}</h2>
          <p className="sgo-rank">Rang: {rank ?? '-'} / {classSize ?? '-'}</p>
        </div>

        <label className="sgo-filter">
          <span>Semestre</span>
          <select value={selectedSemestre} onChange={(event) => setSelectedSemestre(event.target.value)}>
            <option value="all">Tous</option>
            {semestres.map((semestre) => (
              <option key={String(semestre?.id)} value={String(semestre?.id)}>
                {`Semestre ${semestre?.id}`}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="sgo-summary-grid">
        <article className="sgo-summary-card">
          <p>Moyenne ponderee</p>
          <strong>{summary.average.toFixed(2)} / 20</strong>
        </article>
        <article className="sgo-summary-card">
          <p>Mention</p>
          <strong>{summary.mention}</strong>
        </article>
        <article className="sgo-summary-card">
          <p>Credits valides</p>
          <strong>{summary.creditsValidated.toFixed(0)} / {summary.creditsTotal.toFixed(0)}</strong>
        </article>
      </div>

      <div className="sgo-list">
        {rows.length === 0 && (
          <p className="sgo-empty">Aucune note disponible pour ce filtre de semestre.</p>
        )}

        {rows.map((row) => {
          const toneClass = getToneClass(row.tone);

          return (
            <article className="sgo-item" key={row.id}>
              <div className="sgo-title-row">
                <div className={`sgo-initials ${toneClass}`}>{row.initiales}</div>
                <div>
                  <h3>{row.nom}</h3>
                  <p>{row.type} - Semestre {row.semestreId}</p>
                </div>
                <div className={`sgo-note ${toneClass}`}>
                  {Number.isFinite(row.note) ? `${row.note.toFixed(2)} / 20` : '-'}
                </div>
              </div>

              <div className="sgo-meta-row">
                <span>Coef {row.coefficient}</span>
                <span>{row.valide ? 'Credit valide' : 'Credit non valide'}</span>
              </div>

              <div className="sgo-progress">
                <div className={`sgo-progress-fill ${toneClass}`} style={{ width: `${row.progress}%` }} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
