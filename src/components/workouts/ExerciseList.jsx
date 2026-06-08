import './ExerciseList.css';

const ExerciseList = ({ title = 'Programma', kicker = 'Oefeningen', exercises }) => (
  <section className="panel workout-exercises-panel">
    <div className="panel-header">
      <div>
        <p className="panel-kicker">{kicker}</p>
        <h3>{title}</h3>
      </div>
    </div>
    <ul className="exercise-list">
      {exercises.map((exercise) => (
        <li key={exercise}>{exercise}</li>
      ))}
    </ul>
  </section>
);

export default ExerciseList;
