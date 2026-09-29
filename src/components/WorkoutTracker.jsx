import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutSessions } from '../data/workouts';
import { storage } from '../utils/localStorage';
import ActionButton from './ui/ActionButton';
import PageHeader from './ui/PageHeader';
import WorkoutList from './workouts/WorkoutList';
import WorkoutPlanForm from './workouts/WorkoutPlanForm';
import WorkoutStatsGrid from './workouts/WorkoutStatsGrid';
import './WorkoutTracker.css';

const localDate = (date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0')
].join('-');

const initialWorkoutForm = () => ({
  type: 'Functioneel',
  intensity: 'Lage',
  date: localDate(new Date()),
  time: '15:00',
  duration: '',
  notes: ''
});

const WorkoutTracker = () => {
  const navigate = useNavigate();
  const [workoutForm, setWorkoutForm] = useState(initialWorkoutForm);
  const [savedWorkouts, setSavedWorkouts] = useState(() => storage.getWorkouts());
  const [formError, setFormError] = useState('');
  const workouts = [...savedWorkouts, ...workoutSessions];
  const totalMinutes = savedWorkouts.reduce((total, workout) => total + (Number.parseInt(workout.duration, 10) || 0), 0);
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return localDate(date);
  });
  const dailyMinutes = lastSevenDays.map((day) => savedWorkouts
    .filter((workout) => workout.date === day)
    .reduce((total, workout) => total + (Number.parseInt(workout.duration, 10) || 0), 0));
  const maxMinutes = Math.max(...dailyMinutes, 1);
  const workoutStats = [
    { label: 'Opgeslagen', value: savedWorkouts.length, detail: 'Eigen workouts' },
    { label: 'Totale tijd', value: `${totalMinutes} min`, detail: 'Eigen workouts' },
    { label: 'Deze week', value: savedWorkouts.filter((workout) => lastSevenDays.includes(workout.date)).length, detail: 'Afgelopen 7 dagen' },
    { label: 'Laatste type', value: savedWorkouts[0]?.type || 'Nog geen', detail: 'Eigen workouts' }
  ];

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
    const duration = Number(workoutForm.duration);
    if (!workoutForm.date || !workoutForm.time || !Number.isFinite(duration) || duration <= 0) {
      setFormError('Vul een datum, tijd en een duur groter dan nul in.');
      return;
    }

    const saved = storage.addWorkout({
      title: `${workoutForm.type} workout`,
      type: workoutForm.type,
      intensity: workoutForm.intensity,
      date: workoutForm.date,
      time: `${workoutForm.date} ${workoutForm.time}`,
      duration: `${duration} minuten`,
      description: workoutForm.notes || 'Eigen workout',
      exercises: []
    });

    if (!saved) {
      setFormError('Opslaan is niet gelukt. Probeer het opnieuw.');
      return;
    }

    setSavedWorkouts(storage.getWorkouts());
    setWorkoutForm(initialWorkoutForm());
    setFormError('');
  };

  const deleteWorkout = (workoutId) => {
    if (storage.deleteWorkout(workoutId)) {
      setSavedWorkouts(storage.getWorkouts());
    }
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
          title="Mijn workouts en voorbeelden"
          kicker="Recent Sessions"
          workouts={workouts}
          onSelectWorkout={openWorkoutDetails}
          onDeleteWorkout={deleteWorkout}
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
              {dailyMinutes.map((value, index) => (
                <div
                  key={lastSevenDays[index]}
                  className="chart-point"
                  title={`${lastSevenDays[index]}: ${value} minuten`}
                  style={{ height: `${value ? Math.max(8, (value / maxMinutes) * 100) : 0}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <WorkoutPlanForm
          formValues={workoutForm}
          onFieldChange={updateWorkoutForm}
          onSubmit={submitWorkoutForm}
          error={formError}
        />
      </div>
    </div>
  );
};

export default WorkoutTracker;
