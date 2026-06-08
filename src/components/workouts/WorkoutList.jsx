import WorkoutCard from './WorkoutCard';
import './WorkoutList.css';

const WorkoutList = ({ title, kicker, workouts, onSelectWorkout }) => (
  <div className="panel recent-panel">
    <div className="panel-header">
      <div>
        <p className="panel-kicker">{kicker}</p>
        <h3>{title}</h3>
      </div>
      {workouts[0] && (
        <button className="link button-link" type="button" onClick={() => onSelectWorkout(workouts[0].id)}>
          Details
        </button>
      )}
    </div>
    <ul className="session-list">
      {workouts.map((workout) => (
        <WorkoutCard key={workout.id} workout={workout} onViewDetails={onSelectWorkout} />
      ))}
    </ul>
  </div>
);

export default WorkoutList;
