import React from 'react';
import '../styles/ProgressTracker.css';

const stats = [
  { label: 'Gewicht', value: '82.4kg', change: '-0.6kg' },
  { label: 'BMI', value: '15.8', change: '-0.22%' },
  { label: 'Vetpercentage', value: '38.1%', change: '+0.4kg' },
  { label: 'Spiermassa / week', value: '3', change: 'Constant' },
];

const ProgressTracker = () => {
  return (
    <div className="progress-page">
      <div className="progress-hero">
        <div>
          <h1>Voortgang</h1>
          <p className="subtitle">Bekijk je belangrijkste statistieken en volg nieuwe metingen</p>
        </div>
        <button className="primary-btn">Nieuwe Meting</button>
      </div>

      <div className="progress-grid">
        <section className="panel stats-panel">
          <div className="panel-header">
            <h3>Belangrijkste statistieken</h3>
            <p className="panel-kicker">Experiment</p>
          </div>
          <div className="stats-list">
            {stats.map((stat) => (
              <div className="stat-row" key={stat.label}>
                <div className="stat-label-group">
                  <p className="stat-label">{stat.label}</p>
                  <span className="stat-change">{stat.change}</span>
                </div>
                <p className="stat-value">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel trends-panel">
          <div className="panel-header">
            <h3>Trends</h3>
          </div>
          <div className="chart-placeholder">Grafiek wordt hier weergegeven</div>
        </section>

        <section className="panel measurement-panel">
          <div className="panel-header">
            <h3>Nieuwe meting</h3>
          </div>
          <form className="measurement-form">
            <label className="form-field">
              <span>Gemeten Gewicht</span>
              <input type="text" placeholder="Bijv. 82.4 kg" />
            </label>
            <label className="form-field">
              <span>Notities</span>
              <textarea rows="4" placeholder="Voeg context toe aan deze meting" />
            </label>
            <div className="form-actions">
              <button type="button" className="save-btn">
                Bewaar
              </button>
              <button type="submit" className="secondary-btn">
                Opslaan
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ProgressTracker;
