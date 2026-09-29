import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { workoutSessions } from '../data/workouts';
import { noviDataService } from '../services/noviDataService';
import ActionButton from './ui/ActionButton';
import PageHeader from './ui/PageHeader';
import ExerciseList from './workouts/ExerciseList';
import WorkoutStatsGrid from './workouts/WorkoutStatsGrid';
import './WorkoutDetail.css';

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const example = workoutSessions.find((session) => String(session.id) === id);
  const [workout, setWorkout] = useState(example || null);
  const [loading, setLoading] = useState(!example);

  useEffect(() => {
    if (example) return undefined;
    let active = true;
    noviDataService.workouts.list()
      .then((items) => { if (active) setWorkout(items.find((item) => String(item.id) === id) || null); })
      .catch(() => { if (active) setWorkout(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, example]);

  if (loading) return <p role="status">Workout laden...</p>;

  if (!workout) {
    return <Navigate to="/workouts" replace />;
  }

  const detailStats = [
    { label: 'Type', value: workout.type },
    { label: 'Duur', value: typeof workout.duration === 'number' ? `${workout.duration} minuten` : workout.duration },
    { label: 'Intensiteit', value: workout.intensity },
    { label: 'Datum', value: workout.time }
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

        {workout.exercises?.length > 0 && <ExerciseList exercises={workout.exercises} />}
      </div>
    </div>
  );
};

export default WorkoutDetail;
