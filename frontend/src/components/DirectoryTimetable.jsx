import React from "react";
import "./DirectoryTimetable.css";

function DirectoryTimetable() {
  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const times = ["08:00", "09:30", "11:00", "14:00"];

  const scheduleData = {
    "08:00": {
      "Lundi": { subject: "Physique Chimie", class: "2BAC-G1", room: "Salle A12", color: "blue" },
      "Mercredi": { subject: "Physique Chimie", class: "2BAC-G1", room: "Salle A12", color: "green", status: "En cours" },
      "Jeudi": { subject: "SVT", class: "TCS-G2", room: "Labo 2", color: "blue" },
      "Vendredi": { subject: "Physique Chimie", class: "2BAC-G1", room: "Salle A12", color: "blue" },
      "Samedi": { subject: "Mathématiques", class: "1BAC-G3", room: "Salle B04", color: "blue" },
    },
    "09:30": {
      "Lundi": { subject: "Mathématiques", class: "1BAC-G3", room: "Salle B04", color: "blue" },
      "Mardi": { subject: "Physique Chimie", class: "2BAC-G2", room: "Salle A12", color: "blue" },
      "Mercredi": { subject: "Mathématiques", class: "1BAC-G3", room: "Salle B04", color: "blue" },
      "Vendredi": { subject: "SVT", class: "TCS-G2", room: "Labo 2", color: "blue" },
    },
    "11:00": {
      "Mardi": { subject: "Physique Chimie", class: "2BAC-G1", room: "Labo 1", color: "blue" },
      "Mercredi": { subject: "SVT", class: "TCS-G2", room: "Labo 2", color: "blue" },
      "Jeudi": { subject: "Physique Chimie", class: "2BAC-G2", room: "Salle A12", color: "blue" },
    },
    "14:00": {
      "Lundi": { subject: "SVT", class: "TCS-G2", room: "Labo 2", color: "blue" },
      "Mercredi": { subject: "Physique Chimie", class: "2BAC-G2", room: "Salle A12", color: "blue" },
      "Jeudi": { subject: "Mathématiques", class: "1BAC-G3", room: "Salle B04", color: "blue" },
    }
  };

  return (
    <div className="directory-timetable">
      <div className="timetable-header">
        <div className="timetable-title-group">
          <h1>Emploi du Temps</h1>
          <p>Semaine du 24 au 29 Mars 2026</p>
        </div>
        <div className="timetable-actions">
          <div className="week-nav">
            <button className="nav-btn">&lt;</button>
            <span className="week-label">Semaine 13</span>
            <button className="nav-btn">&gt;</button>
          </div>
          <div className="view-toggle">
            <button className="toggle-btn active">Semaine</button>
            <button className="toggle-btn">Jour</button>
          </div>
        </div>
      </div>

      <div className="timetable-grid-container">
        <table className="timetable-table">
          <thead>
            <tr>
              <th className="time-col"></th>
              {days.map(day => (
                <th key={day} className={day === 'Mercredi' ? 'current-day-header' : ''}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map(time => (
              <tr key={time}>
                <td className="time-cell">{time}</td>
                {days.map(day => {
                  const cellData = scheduleData[time]?.[day];
                  return (
                    <td key={`${time}-${day}`} className={day === 'Mercredi' ? 'current-day-col' : ''}>
                      {cellData ? (
                        <div className={`course-card border-${cellData.color}`}>
                          {cellData.status && <div className="course-status">{cellData.status}</div>}
                          <strong className="course-subject">{cellData.subject}</strong>
                          <div className="course-details">
                            <span className="course-class">{cellData.class}</span>
                            <span className="course-room">{cellData.room}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="empty-cell"></div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DirectoryTimetable;

