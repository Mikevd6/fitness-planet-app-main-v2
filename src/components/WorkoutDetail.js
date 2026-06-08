import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { workoutSessions } from '../data/workouts';
import ActionButton from './ui/ActionButton';
import PageHeader from './ui/PageHeader';
import ExerciseList from './workouts/ExerciseList';
import WorkoutStatsGrid from './workouts/WorkoutStatsGrid';
import '../styles/WorkoutTracker.css';

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const workout = workoutSessions.find((session) => session.id === id);

  if (!workout) {
    return <Navigate to="/workouts" replace />;
  }

  const detailStats = [
    { label: 'Type', value: workout.type },
    { label: 'Duur', value: workout.duration },
    { label: 'Intensiteit', value: workout.intensity },
    { label: 'Calorieen', value: workout.calories }
  ];

  return (
    <div className="workout-page workout-detail-page">
      <PageHeader
        kicker="Workout details"
        title={workout.title}
        subtitle={`Dynamische route: /workouts/${id}`}
        actions={(
          <ActionButton
            className="pill secondary"
            label="Terug naar workouts"
            onClick={() => navigate('/workouts')}
          />
        )}
      />

      <div className="workout-detail-grid">
        <section className="panel recent-panel workout-detail-main">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Route-id uit de URL</p>
              <h3>{id}</h3>
            </div>
          </div>
          <p className="workout-description">{workout.description}</p>

          <WorkoutStatsGrid
            stats={detailStats}
            className="workout-detail-stats"
            cardClassName="stat-card light"
          />
        </section>

        <ExerciseList exercises={workout.exercises} />
      </div>
    </div>
  );
};

export default WorkoutDetail;
