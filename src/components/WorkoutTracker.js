import React, { useState, useEffect } from 'react';
import '../styles/WorkoutTracker.css';

const initialRecentWorkouts = [
  { id: 1, name: 'Borst & Schouders', meta: 'Gisteren · 52 min · 420 kcal' },
  { id: 2, name: 'HIIT Cardio', meta: '2 dagen geleden · 28 min · 310 kcal' },
  { id: 3, name: 'Benentraining', meta: '4 dagen geleden · 61 min · 560 kcal' },
];

const WorkoutTracker = () => {
  const [loading, setLoading] = useState(true);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [workoutType, setWorkoutType] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState('Laag');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Simuleer een API call om recente workouts op te halen
    setLoading(true);
    const timer = setTimeout(() => {
      setRecentWorkouts(initialRecentWorkouts);
      setLoading(false);
    }, 1000); // Simuleer 1 seconde laadtijd

    return () => clearTimeout(timer);
  }, []);

  const handleQuickWorkout = () => {
    console.log('"Snelle Workout" button clicked');
    // Voorbeeld: voeg een standaard workout toe
    const quickWorkout = {
      id: recentWorkouts.length + 1,
      name: 'Snelle Full Body Workout',
      meta: `${new Date().toLocaleDateString()} · 30 min · 250 kcal`,
    };
    setRecentWorkouts([quickWorkout, ...recentWorkouts]);
    alert('Snelle workout van 30 minuten toegevoegd!');
  };

  const handleImport = () => {
    console.log('"Importeren" button clicked');
    alert('Importeren: Functionaliteit nog niet geïmplementeerd.');
  };

  const handleViewDetails = (sessionId) => {
    console.log(`"Details" button clicked for session ${sessionId}`);
    const workout = recentWorkouts.find(w => w.id === sessionId);
    if (workout) {
      alert(`Details voor ${workout.name}:\n${workout.meta}`);
    }
  };

  const handleSaveAsTemplate = () => {
    console.log('"Opslaan als Template" button clicked');
    if (!workoutType || !duration) {
      alert('Selecteer een type en duur om een template op te slaan.');
      return;
    }
    const newTemplate = {
      type: workoutType,
      duration,
      intensity,
      notes,
    };
    console.log('Template to save:', newTemplate);
    // In een echte app zou je dit opslaan in de state of via een API call
    alert(`Template opgeslagen: ${workoutType} (${duration} min)`);
  };

  const handleAddWorkout = (e) => {
    e.preventDefault();
    if (!workoutType || !duration) {
      alert('Selecteer een type en duur voor de workout.');
      return;
    }
    const newWorkout = {
      id: recentWorkouts.length + 1,
      name: workoutType,
      meta: `${new Date().toLocaleDateString()} · ${duration} min · ${intensity}`,
    };
    setRecentWorkouts([newWorkout, ...recentWorkouts]);
    alert(`Workout toegevoegd:\nType: ${workoutType}\nDuur: ${duration} min\nIntensiteit: ${intensity}`);
    
    // Reset form
    setWorkoutType('');
    setDuration('');
    setIntensity('Laag');
    setNotes('');
  };

  return (
    <div className="page workout-page">
      <header className="page-header">
        <div className="page-heading-group">
          <h1 className="page-title">Workouts</h1>
          <p className="page-subtitle">Plan, registreer en analyseer je trainingssessies.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleQuickWorkout}>Snelle Workout</button>
          <button className="btn btn-outline" onClick={handleImport}>Importeren</button>
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
              {recentWorkouts.map(workout => (
                <li key={workout.id} className="item-row">
                  <div>
                    <strong>{workout.name}</strong>
                    <span className="meta-row">{workout.meta}</span>
                  </div>
                  <button className="link-button" onClick={() => handleViewDetails(workout.id)}>Details ›</button>
                </li>
              ))}
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
            <form className="form-grid" onSubmit={handleAddWorkout}>
              <div className="form-field">
                <label>Type</label>
                <select value={workoutType} onChange={(e) => setWorkoutType(e.target.value)} required>
                  <option value="">— Kies —</option>
                  <option value="Kracht">Kracht</option>
                  <option value="Cardio">Cardio</option>
                  <option value="HIIT">HIIT</option>
                  <option value="Mobiliteit">Mobiliteit</option>
                </select>
              </div>
              <div className="form-field">
                <label>Duur (min)</label>
                <input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} required />
              </div>
              <div className="form-field">
                <label>Intensiteit</label>
                <select value={intensity} onChange={(e) => setIntensity(e.target.value)}>
                  <option value="Laag">Laag</option>
                  <option value="Gemiddeld">Gemiddeld</option>
                  <option value="Hoog">Hoog</option>
                </select>
              </div>
              <div className="form-field full">
                <label>Notities</label>
                <textarea rows="2" placeholder="Sets, gevoel, etc..." value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleSaveAsTemplate}>Opslaan als Template</button>
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