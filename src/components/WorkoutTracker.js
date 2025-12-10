import React from 'react';
import '../styles/WorkoutTracker.css';

const WorkoutTracker = () => {
  const sessions = [
    { title: 'Back & Shoulders', time: 'Afgelopen weekend', type: 'Functioneel' },
    { title: 'HIT Cardio', time: '11 Januari 2021', type: 'Cardio' },
    { title: 'Bootcamp', time: 'Maandag', type: 'Volledig lichaam' },
  ];

  const stats = [
    { label: 'Sessions', value: '3/5', detail: 'Deze week' },
    { label: 'Totale tijd', value: '6h 42m', detail: 'Deze week' },
    { label: 'Gem. tempo', value: 'OK', detail: '12.26 minuten' },
    { label: 'Compliance', value: '75%', detail: 'Deze week' },
  ];

  const chartPoints = [50, 65, 58, 72, 60, 68, 62];

  return (
    <div className="workout-page">
      <div className="workout-header">
        <div>
          <p className="header-kicker">Voortgang</p>
          <h1>Workouts</h1>
          <p className="header-subtitle">Je voortgang en prestaties op een plek.</p>
        </div>
        <div className="header-actions">
          <button className="pill">Snelle Workout</button>
          <button className="pill secondary">Importeren</button>
        </div>
      </div>

      <div className="workout-grid">
        <div className="panel recent-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Recent Sessions</p>
              <h3>Laatste geplande sessies</h3>
            </div>
            <a className="link" href="#">Details</a>
          </div>
          <ul className="session-list">
            {sessions.map((session) => (
              <li key={session.title} className="session-item">
                <div>
                  <p className="session-title">{session.title}</p>
                  <p className="session-meta">
                    {session.time} • {session.type}
                  </p>
                </div>
                <a className="link" href="#">Details</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel stats-panel">
          <div className="panel-header">
            <p className="panel-kicker">Statistieken</p>
            <h3>Bekijk hoe je presteert</h3>
          </div>
          <div className="stats-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
                <p className="stat-detail">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Workout Statistieken</p>
              <h3>Weekoverzicht</h3>
            </div>
            <button className="pill ghost">+ Toevoegen</button>
          </div>
          <div className="chart-body">
            <div className="chart-lines">
              <div className="chart-line"></div>
              <div className="chart-line mid"></div>
              <div className="chart-line"></div>
            </div>
            <div className="chart-area">
              {chartPoints.map((value, index) => (
                <div
                  key={index}
                  className="chart-point"
                  style={{ height: `${value}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel form-panel">
          <div className="panel-header">
            <p className="panel-kicker">Nieuwe Workout</p>
            <h3>Plan een nieuwe sessie</h3>
          </div>
          <form className="workout-form">
            <div className="form-row">
              <div className="form-control">
                <label htmlFor="type">Type</label>
                <select id="type" defaultValue="Functioneel">
                  <option>Functioneel</option>
                  <option>Cardio</option>
                  <option>Kracht</option>
                  <option>Volledig lichaam</option>
                </select>
              </div>
              <div className="form-control">
                <label htmlFor="intensity">Intensiteit</label>
                <select id="intensity" defaultValue="Lage">
                  <option>Hoog</option>
                  <option>Middel</option>
                  <option>Lage</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-control">
                <label htmlFor="date">Datum</label>
                <input id="date" type="date" defaultValue="2022-05-05" />
              </div>
              <div className="form-control">
                <label htmlFor="time">Tijd</label>
                <input id="time" type="time" defaultValue="15:00" />
              </div>
            </div>

            <div className="form-control">
              <label htmlFor="notes">Notities</label>
              <textarea
                id="notes"
                placeholder="Voeg je plan, doelen, etc toe..."
                rows={3}
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="button" className="pill secondary">
                Opslaan en plannen
              </button>
              <button type="submit" className="pill">
                Toevoegen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkoutTracker;
