import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutSessions } from '../data/workouts';
import ActionButton from './ui/ActionButton';
import PageHeader from './ui/PageHeader';
import WorkoutList from './workouts/WorkoutList';
import WorkoutPlanForm from './workouts/WorkoutPlanForm';
import WorkoutStatsGrid from './workouts/WorkoutStatsGrid';
import '../styles/WorkoutTracker.css';

const workoutStats = [
  { label: 'Sessions', value: '3/5', detail: 'Deze week' },
  { label: 'Totale tijd', value: '6h 42m', detail: 'Deze week' },
  { label: 'Gem. tempo', value: 'OK', detail: '12.26 minuten' },
  { label: 'Compliance', value: '75%', detail: 'Deze week' }
];

const chartPoints = [50, 65, 58, 72, 60, 68, 62];

const initialWorkoutForm = {
  type: 'Functioneel',
  intensity: 'Lage',
  date: '2022-05-05',
  time: '15:00',
  notes: ''
};

const WorkoutTracker = () => {
  const navigate = useNavigate();
  const [workoutForm, setWorkoutForm] = useState(initialWorkoutForm);

  const openWorkoutDetails = (workoutId) => {
    navigate(`/workouts/${workoutId}`);
  };

  const updateWorkoutForm = (event) => {
    const { name, value } = event.target;

    setWorkoutForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  };

  const submitWorkoutForm = (event) => {
    event.preventDefault();
    setWorkoutForm(initialWorkoutForm);
  };

  return (
    <div className="workout-page">
      <PageHeader
        kicker="Voortgang"
        title="Workouts"
        subtitle="Je voortgang en prestaties op een plek."
        actions={(
          <>
            <ActionButton className="pill" label="Snelle Workout" onClick={() => openWorkoutDetails('bootcamp')} />
            <ActionButton className="pill secondary" label="Importeren" onClick={() => openWorkoutDetails('hit-cardio')} />
          </>
        )}
      />

      <div className="workout-grid">
        <WorkoutList
          title="Laatste geplande sessies"
          kicker="Recent Sessions"
          workouts={workoutSessions}
          onSelectWorkout={openWorkoutDetails}
        />

        <div className="panel stats-panel">
          <div className="panel-header">
            <p className="panel-kicker">Statistieken</p>
            <h3>Bekijk hoe je presteert</h3>
          </div>
          <WorkoutStatsGrid stats={workoutStats} />
        </div>

        <div className="panel chart-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Workout Statistieken</p>
              <h3>Weekoverzicht</h3>
            </div>
            <ActionButton className="pill ghost" label="+ Toevoegen" onClick={() => openWorkoutDetails('back-shoulders')} />
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

        <WorkoutPlanForm
          formValues={workoutForm}
          onFieldChange={updateWorkoutForm}
          onSubmit={submitWorkoutForm}
        />
      </div>
    </div>
  );
};

export default WorkoutTracker;
