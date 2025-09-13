import React, { useState } from 'react';
import '../styles/WorkoutTracker.css';

const WorkoutTracker = () => {
  const [loading] = useState(false);

  return (
    <div className="page workout-page">
      <header className="page-header">
        <div className="page-heading-group">
          <h1 className="page-title">Workouts</h1>
          <p className="page-subtitle">Plan, registreer en analyseer je trainingssessies.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary">Snelle Workout</button>
          <button className="btn btn-outline">Importeren</button>
        </div>
      </header>

      {loading ? (
        <div className="loading-block">
          <div className="loading-spinner"></div>
          <p>Workouts laden...</p>
        </div>
      ) : (
        <div className="workout-layout">
          <section className="panel panel-wide recent-workouts">
            <h2 className="panel-title">Recente Sessies</h2>
            <ul className="item-list">
              <li className="item-row">
                <div>
                  <strong>Borst & Schouders</strong>
                  <span className="meta-row">Gisteren · 52 min · 420 kcal</span>
                </div>
                <button className="link-button">Details ›</button>
              </li>
              <li className="item-row">
                <div>
                  <strong>HIIT Cardio</strong>
                  <span className="meta-row">2 dagen geleden · 28 min · 310 kcal</span>
                </div>
                <button className="link-button">Details ›</button>
              </li>
              <li className="item-row">
                <div>
                  <strong>Benentraining</strong>
                  <span className="meta-row">4 dagen geleden · 61 min · 560 kcal</span>
                </div>
                <button className="link-button">Details ›</button>
              </li>
            </ul>
          </section>

          <section className="panel stats-cards">
            <h2 className="visually-hidden">Statistieken</h2>
            <div className="mini-stats-grid">
              <div className="mini-stat">
                <span className="label">Deze Week</span>
                <span className="value">3/5</span>
                <span className="trend up">+1 t.o.v. vorige week</span>
              </div>
              <div className="mini-stat">
                <span className="label">Totaal Tijd</span>
                <span className="value">6h 42m</span>
                <span className="trend">Gemiddeld 55m / sessie</span>
              </div>
              <div className="mini-stat">
                <span className="label">Rust Vandaag</span>
                <span className="value">OK</span>
                <span className="trend neutral">Herstel 82%</span>
              </div>
              <div className="mini-stat">
                <span className="label">Gem. Intensiteit</span>
                <span className="value">75%</span>
                <span className="trend">Consistent</span>
              </div>
            </div>
          </section>

          <section className="panel plan-builder">
            <h2 className="panel-title">Nieuwe Workout</h2>
            <form className="form-grid">
              <div className="form-field">
                <label>Type</label>
                <select>
                  <option>— Kies —</option>
                  <option>Kracht</option>
                  <option>Cardio</option>
                  <option>HIIT</option>
                  <option>Mobiliteit</option>
                </select>
              </div>
              <div className="form-field">
                <label>Duur (min)</label>
                <input type="number" min="1" />
              </div>
              <div className="form-field">
                <label>Intensiteit</label>
                <select>
                  <option>Laag</option>
                  <option>Gemiddeld</option>
                  <option>Hoog</option>
                </select>
              </div>
              <div className="form-field full">
                <label>Notities</label>
                <textarea rows="2" placeholder="Sets, gevoel, etc..."></textarea>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary">Opslaan als Template</button>
                <button type="submit" className="btn btn-primary">Toevoegen</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default WorkoutTracker;
