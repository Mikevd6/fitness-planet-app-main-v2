import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../utils/localStorage';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [todayCalories, setTodayCalories] = useState(0);
  const [calorieGoal] = useState(2200);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [todayMeals, setTodayMeals] = useState([]);
  const [progressWeights, setProgressWeights] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      const fallback = { name: 'Mike' };
      setUser(authUser || fallback);
      hydrateDashboard();
      setIsLoading(false);
    }, 250);
    // hydrateDashboard is stable (no deps) so safe to omit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  const hydrateDashboard = () => {
    // Nutrition
    const nutritionEntries = storage.getNutrition() || [];
    const todayDate = new Date().toISOString().split('T')[0];
    const todaysEntries = nutritionEntries.filter(n => n.datum === todayDate);
    const kcal = todaysEntries.reduce((sum, e) => sum + (e.calorieen || e.calories || 0), 0);
    setTodayCalories(kcal);

    // Workouts
    const workouts = storage.getWorkouts().slice(0,3);
    setRecentWorkouts(workouts);

    // Meals (flatten weekMenu day matching today)
    const weekMenu = storage.getWeekMenu();
    const weekday = new Intl.DateTimeFormat('nl-NL', { weekday: 'long' }).format(new Date());
    const dayMeals = weekMenu[capitalizeFirst(weekday)] || weekMenu[weekday] || {};
    const collectedMeals = Object.values(dayMeals).flat();
    setTodayMeals(collectedMeals.slice(0,4));

    // Progress (weights last 6 entries)
    const progress = storage.getProgress().slice(0,6).reverse();
    setProgressWeights(progress);
  };

  const capitalizeFirst = (s='') => s.charAt(0).toUpperCase() + s.slice(1);

  const caloriePerc = Math.min(100, Math.round((todayCalories / calorieGoal) * 100));

  if (isLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page enhanced">
      <section className="dashboard-hero">
        <div className="hero-text-block">
          <h1 className="welcome-title">Welkom terug, {user.name || user.email || 'atleet'} 👋</h1>
          <p className="welcome-sub">Dit is je hub voor voeding, workouts en voortgang vandaag.</p>
          <div className="quick-actions">
            <a href="/voeding" className="qa-btn">+ Voedingslog</a>
            <a href="/workouts" className="qa-btn alt">+ Workout</a>
            <a href="/voortgang" className="qa-btn ghost">Voortgang</a>
          </div>
        </div>
        <div className="hero-stats-ring">
          <div className="ring" data-perc={caloriePerc}>
            <div className="ring-center">
              <span className="ring-value">{todayCalories}</span>
              <span className="ring-label">/ {calorieGoal} kcal</span>
            </div>
            <svg viewBox="0 0 120 120">
              <circle className="bg" cx="60" cy="60" r="54" />
              <circle className="prog" cx="60" cy="60" r="54" style={{ strokeDasharray: `${(caloriePerc/100)*339} 339`}} />
            </svg>
          </div>
        </div>
      </section>

      <section className="stat-cards-grid">
        <div className="mini-stat">
          <span className="label">Calorieën</span>
          <span className="value">{todayCalories}</span>
          <span className="sub">{caloriePerc}% van doel</span>
        </div>
        <div className="mini-stat">
          <span className="label">Workouts</span>
          <span className="value">{recentWorkouts.length}</span>
          <span className="sub">Laatste 7 dagen</span>
        </div>
        <div className="mini-stat">
          <span className="label">Maaltijden</span>
          <span className="value">{todayMeals.length}</span>
          <span className="sub">Vandaag</span>
        </div>
        <div className="mini-stat">
          <span className="label">Gewicht logs</span>
          <span className="value">{progressWeights.length}</span>
          <span className="sub">Recente</span>
        </div>
      </section>

      <section className="dashboard-panels-grid">
        <div className="panel dashboard-panel">
          <h2 className="panel-title">Recente Workouts</h2>
          {recentWorkouts.length === 0 ? <p className="empty">Nog geen workouts.</p> : (
            <ul className="simple-list">
              {recentWorkouts.map(w => (
                <li key={w.id}>
                  <span className="primary">{w.type || w.naam || 'Workout'}</span>
                  <span className="meta">{new Date(w.datum).toLocaleDateString('nl-NL',{ weekday:'short'})}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="panel dashboard-panel">
          <h2 className="panel-title">Maaltijden Vandaag</h2>
          {todayMeals.length === 0 ? <p className="empty">Geen maaltijden toegevoegd.</p> : (
            <ul className="simple-list meals">
              {todayMeals.map(m => (
                <li key={m.id}>
                  <span className="primary">{m.title || m.name}</span>
                  {m.calories && <span className="meta">{m.calories} kcal</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="panel dashboard-panel progress-mini">
          <h2 className="panel-title">Gewicht</h2>
          {progressWeights.length === 0 ? <p className="empty">Nog geen data.</p> : (
            <div className="mini-chart" aria-label="Gewicht trend">
              {progressWeights.map(p => (
                <div key={p.id} className="bar-wrap" title={`${new Date(p.datum).toLocaleDateString('nl-NL')}: ${p.gewicht}kg`}>
                  <div className="bar" style={{ height: `${Math.min(100, (p.gewicht/ progressWeights[0].gewicht)*100)}%`}} />
                  <span className="bar-label">{Math.round(p.gewicht)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;