import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { workoutSessions } from '../data/workouts';
import '../styles/WorkoutTracker.css';

const WorkoutDetail = () => {
  const { id } = useParams();
  const workout = workoutSessions.find((session) => session.id === id);

  if (!workout) {
    return <Navigate to="/workouts" replace />;
  }

  return (
    <div className="workout-page workout-detail-page">
      <div className="workout-header">
        <div>
          <p className="header-kicker">Workout details</p>
          <h1>{workout.title}</h1>
          <p className="header-subtitle">
            Dynamische route: /workouts/{id}
          </p>
        </div>
        <Link to="/workouts" className="pill secondary">
          Terug naar workouts
        </Link>
      </div>

      <div className="workout-detail-grid">
        <section className="panel recent-panel workout-detail-main">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Route-id uit de URL</p>
              <h3>{id}</h3>
            </div>
          </div>
          <p className="workout-description">{workout.description}</p>

          <div className="workout-detail-stats">
            <div className="stat-card light">
              <p className="stat-label">Type</p>
              <p className="stat-value">{workout.type}</p>
            </div>
            <div className="stat-card light">
              <p className="stat-label">Duur</p>
              <p className="stat-value">{workout.duration}</p>
            </div>
            <div className="stat-card light">
              <p className="stat-label">Intensiteit</p>
              <p className="stat-value">{workout.intensity}</p>
            </div>
            <div className="stat-card light">
              <p className="stat-label">Calorieen</p>
              <p className="stat-value">{workout.calories}</p>
            </div>
          </div>
        </section>

        <section className="panel workout-exercises-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Oefeningen</p>
              <h3>Programma</h3>
            </div>
          </div>
          <ul className="exercise-list">
            {workout.exercises.map((exercise) => (
              <li key={exercise}>{exercise}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default WorkoutDetail;
