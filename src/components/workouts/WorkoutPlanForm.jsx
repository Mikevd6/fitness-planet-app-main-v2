import ActionButton from '../ui/ActionButton';
import FormField from '../ui/FormField';
import './WorkoutPlanForm.css';

const WorkoutPlanForm = ({ formValues, onFieldChange, onSubmit }) => (
  <div className="panel form-panel">
    <div className="panel-header">
      <p className="panel-kicker">Nieuwe Workout</p>
      <h3>Plan een nieuwe sessie</h3>
    </div>
    <form className="workout-form" onSubmit={onSubmit}>
      <div className="form-row">
        <FormField
          id="type"
          label="Type"
          type="select"
          value={formValues.type}
          onChange={onFieldChange}
          options={['Functioneel', 'Cardio', 'Kracht', 'Volledig lichaam']}
        />
        <FormField
          id="intensity"
          label="Intensiteit"
          type="select"
          value={formValues.intensity}
          onChange={onFieldChange}
          options={['Hoog', 'Middel', 'Lage']}
        />
      </div>

      <div className="form-row">
        <FormField
          id="date"
          label="Datum"
          type="date"
          value={formValues.date}
          onChange={onFieldChange}
        />
        <FormField
          id="time"
          label="Tijd"
          type="time"
          value={formValues.time}
          onChange={onFieldChange}
        />
      </div>

      <FormField
        id="notes"
        label="Notities"
        type="textarea"
        value={formValues.notes}
        onChange={onFieldChange}
        placeholder="Voeg je plan, doelen, etc toe..."
      />

      <div className="form-actions">
        <ActionButton className="pill secondary" label="Opslaan en plannen" onClick={onSubmit} />
        <ActionButton type="submit" className="pill" label="Toevoegen" />
      </div>
    </form>
  </div>
);

export default WorkoutPlanForm;
