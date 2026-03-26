import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './EmploiDuTemps.css';

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const hours = ['08:00', '09:30', '11:00', '14:00', '15:30', '17:00'];

const scheduleData = {
  Lundi: [
    { hour: '08:00', end: '09:30', subject: 'Physique Chimie', class: '2BAC-G1', room: 'Salle A12' },
    { hour: '09:30', end: '11:00', subject: 'Mathématiques', class: '1BAC-G3', room: 'Salle B04' },
    null,
    { hour: '14:00', end: '15:30', subject: 'SVT', class: 'TCS-G2', room: 'Labo 2' },
    null, null,
  ],
  Mardi: [
    null,
    { hour: '09:30', end: '11:00', subject: 'Physique Chimie', class: '2BAC-G2', room: 'Salle A12' },
    { hour: '11:00', end: '12:30', subject: 'Physique Chimie', class: '2BAC-G1', room: 'Labo 1' },
    null,
    { hour: '15:30', end: '17:00', subject: 'Mathématiques', class: '1BAC-G3', room: 'Salle C02' },
    null,
  ],
  Mercredi: [
    { hour: '08:00', end: '09:30', subject: 'Physique Chimie', class: '2BAC-G1', room: 'Salle A12', isNow: true },
    { hour: '09:30', end: '11:00', subject: 'Mathématiques', class: '1BAC-G3', room: 'Salle B04' },
    { hour: '11:00', end: '12:30', subject: 'SVT', class: 'TCS-G2', room: 'Labo 2' },
    { hour: '14:00', end: '15:30', subject: 'Physique Chimie', class: '2BAC-G2', room: 'Salle A12' },
    null, null,
  ],
  Jeudi: [
    { hour: '08:00', end: '09:30', subject: 'SVT', class: 'TCS-G2', room: 'Labo 2' },
    null,
    { hour: '11:00', end: '12:30', subject: 'Physique Chimie', class: '2BAC-G2', room: 'Salle A12' },
    { hour: '14:00', end: '15:30', subject: 'Mathématiques', class: '1BAC-G3', room: 'Salle B04' },
    null, null,
  ],
  Vendredi: [
    { hour: '08:00', end: '09:30', subject: 'Physique Chimie', class: '2BAC-G1', room: 'Salle A12' },
    { hour: '09:30', end: '11:00', subject: 'SVT', class: 'TCS-G2', room: 'Labo 2' },
    null, null, null, null,
  ],
  Samedi: [
    { hour: '08:00', end: '09:30', subject: 'Mathématiques', class: '1BAC-G3', room: 'Salle B04' },
    null, null, null, null, null,
  ],
};

export default function EmploiDuTemps() {
  const [view, setView] = useState('week');

  return (
    <div className="edt-page">
      <div className="edt-header animate-fade-in">
        <div>
          <h2>Emploi du Temps</h2>
          <p>Semaine du 24 au 29 Mars 2026</p>
        </div>
        <div className="edt-controls">
          <div className="edt-nav">
            <button className="btn btn-sm btn-outline"><FiChevronLeft size={16} /></button>
            <span className="edt-week-label">Semaine 13</span>
            <button className="btn btn-sm btn-outline"><FiChevronRight size={16} /></button>
          </div>
          <div className="edt-view-toggle">
            <button className={`edt-view-btn ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>Semaine</button>
            <button className={`edt-view-btn ${view === 'day' ? 'active' : ''}`} onClick={() => setView('day')}>Jour</button>
          </div>
        </div>
      </div>

      <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="edt-grid">
            <div className="edt-corner"></div>
            {days.map((d) => (
              <div key={d} className={`edt-day-header ${d === 'Mercredi' ? 'today' : ''}`}>
                {d}
              </div>
            ))}
            {hours.map((h, hi) => (
              <>
                <div key={h} className="edt-hour">{h}</div>
                {days.map((d) => {
                  const slot = scheduleData[d]?.[hi];
                  return (
                    <div key={`${d}-${h}`} className={`edt-cell ${slot?.isNow ? 'now-cell' : ''}`}>
                      {slot && (
                        <div className={`edt-slot ${slot.isNow ? 'now' : ''}`}>
                          <span className="edt-slot-subject">{slot.subject}</span>
                          <span className="edt-slot-meta">{slot.class}</span>
                          <span className="edt-slot-room">{slot.room}</span>
                          {slot.isNow && <span className="badge badge-now edt-now-badge">En cours</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
