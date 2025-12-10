import React, { useEffect, useMemo, useState } from 'react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));

    setTimeout(() => {
      setUser(userData || { username: 'demo' });
      setIsLoading(false);
    }, 400);
  }, []);

  const progress = useMemo(() => {
    const calories = 1503;
    const goal = 3000;
    const percentage = Math.min(Math.round((calories / goal) * 100), 100);

    return { calories, goal, percentage };
  }, []);

  const recentWorkouts = [
    'Bovenlichaam training',
    'Benen',
    'Full Body Workout',
  ];

  const todayMeals = [
    'Yoghurt met granola en banaan',
    'Bruine boterhammen met avocado, hummus en komkommer',
    'Tomaat-paprikasoep met volkoren stokbrood',
    'Griekse yoghurt met cruesli en honing',
  ];

  const weightLogs = [
    { day: 'Vandaag', weight: 2, unit: 'gr' },
    { day: 'Gisteren', weight: 2, unit: 'gr' },
    { day: 'Vrijdag', weight: 6, unit: 'gr' },
    { day: 'Donderdag', weight: 2, unit: 'gr' },
  ];

  const trainingSummary = [
    { label: 'Bovenlichaam', value: '25 min' },
    { label: 'Cardio', value: '35 min' },
    { label: 'Core', value: '0 min' },
  ];

  if (isLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div className="hero-top">
          <div>
            <p className="hero-kicker">Fitness Planet Dashboard</p>
            <h1 className="hero-title">
              Welkom terug, {user.username} <span className="wave">👋</span>
            </h1>
            <p className="hero-subtitle">Hier is een overzicht van je voortgang.</p>
            <div className="hero-actions">
              <button className="chip">Voedingsplan</button>
              <button className="chip">+ Workout</button>
              <button className="chip">Voortgang</button>
            </div>
          </div>
          <div className="progress-card">
            <div className="progress-ring" aria-label="Calorie voortgang">
              <div
                className="progress-ring-fill"
                style={{
                  background: `conic-gradient(var(--accent) 0deg ${progress.percentage * 3.6}deg, rgba(255,255,255,0.15) ${progress.percentage * 3.6}deg 360deg)`,
                }}
              >
                <div className="progress-ring-center">
                  <div className="progress-value">{progress.calories}</div>
                  <div className="progress-label">
                    /{progress.goal}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card large">
            <div className="stat-header">
              <p className="stat-title">Calorieën</p>
              <span className="badge">51%</span>
            </div>
            <div className="stat-value">{progress.calories}</div>
            <p className="stat-subtitle">Doel: {progress.goal}</p>
            <div className="progress-track">
              <div className="progress-bar" style={{ width: `${progress.percentage}%` }}></div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <p className="stat-title">Workouts</p>
              <span className="stat-meta">Laatste 7 dagen</span>
            </div>
            <div className="stat-value">4</div>
            <div className="mini-chart">
              {[50, 30, 70, 40, 60, 35, 55].map((height, index) => (
                <span key={index} style={{ height: `${height}%` }}></span>
              ))}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <p className="stat-title">Maaltijden</p>
              <span className="stat-meta">Vandaag</span>
            </div>
            <div className="stat-value">5</div>
            <div className="mini-chart dots">
              {[60, 80, 40, 70, 55].map((height, index) => (
                <span key={index} style={{ height: `${height}%` }}></span>
              ))}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <p className="stat-title">Gewicht logs</p>
              <span className="stat-meta">Recent</span>
            </div>
            <div className="stat-value muted">0</div>
            <div className="mini-chart empty">-</div>
          </div>
        </div>
      </div>

      <div className="dashboard-panels">
        <div className="panel wide">
          <div className="panel-header">
            <h2>Recente Workouts</h2>
          </div>
          <ul className="bullet-list">
            {recentWorkouts.map((workout) => (
              <li key={workout}>{workout}</li>
            ))}
          </ul>
        </div>

        <div className="panel wide">
          <div className="panel-header">
            <h2>Maaltijden vandaag</h2>
          </div>
          <ul className="bullet-list">
            {todayMeals.map((meal) => (
              <li key={meal}>{meal}</li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Gewicht</h2>
          </div>
          <ul className="compact-list">
            {weightLogs.map((entry) => (
              <li key={entry.day}>
                <span>{entry.day}</span>
                <strong>
                  {entry.weight} {entry.unit}
                </strong>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Afgeronde trainingen</h2>
          </div>
          <ul className="compact-list">
            {trainingSummary.map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
