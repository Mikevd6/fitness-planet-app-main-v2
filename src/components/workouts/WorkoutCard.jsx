import ActionButton from '../ui/ActionButton';
import './WorkoutCard.css';

const WorkoutCard = ({ workout, onViewDetails }) => (
  <li className="session-item">
    <div className="session-content">
      <p className="session-title">{workout.title}</p>
      <p className="session-meta">
        {workout.time} - {workout.type}
      </p>
    </div>
    <ActionButton className="link button-link" onClick={() => onViewDetails(workout.id)} label="Details" />
  </li>
);

export default WorkoutCard;
