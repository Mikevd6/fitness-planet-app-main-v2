import React, { useState } from 'react';
import '../styles/ProgressTracker.css';

const ProgressTracker = () => {
  const [loading] = useState(false);

  return (
    <div className="page progress-page">
      <header className="page-header">
        <div className="page-heading-group">
          <h1 className="page-title">Voortgang</h1>
          <p className="page-subtitle">Overzicht van je fysieke progressie en trainingsconsistentie.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline">Exporteren</button>
          <button className="btn btn-primary">Nieuwe Meting</button>
        </div>
      </header>

      {loading ? (
        <div className="loading-block">
          <div className="loading-spinner"></div>
          <p>Voortgang laden...</p>
        </div>
      ) : (
        <div className="progress-layout">
          <section className="panel key-metrics">
            <h2 className="panel-title">Belangrijkste Statistieken</h2>
            <div className="metric-grid">
              <div className="metric-tile">
                <span className="label">Gewicht</span>
                <span className="value">82.4<small>kg</small></span>
                <span className="delta down">-0.6 kg</span>
              </div>
              <div className="metric-tile">
                <span className="label">Vet%</span>
                <span className="value">15.8<small>%</small></span>
                <span className="delta">−0.3%</span>
              </div>
              <div className="metric-tile">
                <span className="label">Spiermassa</span>
                <span className="value">38.1<small>kg</small></span>
                <span className="delta up">+0.2 kg</span>
              </div>
              <div className="metric-tile">
                <span className="label">Workouts / Week</span>
                <span className="value">3<small>/5</small></span>
                <span className="delta neutral">Consistent</span>
              </div>
            </div>
          </section>

          <section className="panel trend-section">
            <h2 className="panel-title">Trends</h2>
            <div className="trend-placeholder">(Grafieken komen hier in een latere fase)</div>
          </section>

          <section className="panel add-entry">
            <h2 className="panel-title">Nieuwe Meting</h2>
            <form className="form-grid">
              <div className="form-field">
                <label>Gewicht (kg)</label>
                <input type="number" step="0.1" />
              </div>
              <div className="form-field">
                <label>Vet% </label>
                <input type="number" step="0.1" />
              </div>
              <div className="form-field full">
                <label>Notities</label>
                <textarea rows="2" placeholder="Slaap, energie, blessures..."></textarea>
              </div>
              <div className="form-actions">
                <button type="reset" className="btn btn-secondary">Reset</button>
                <button type="submit" className="btn btn-primary">Opslaan</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
