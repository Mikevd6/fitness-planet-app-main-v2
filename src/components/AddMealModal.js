import React, { useState } from 'react';
import '../styles/MealPlan.css';

const AddMealModal = ({ isOpen, onClose, onSave, day, mealType }) => {
  const [title, setTitle] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ id: Date.now(), title: title.trim(), calories: calories ? parseInt(calories, 10) : null, notes: notes.trim() });
    setTitle('');
    setCalories('');
    setNotes('');
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Maaltijd toevoegen">
      <div className="modal-panel">
        <div className="modal-header">
          <h3>Voeg maaltijd toe</h3>
          <button className="close-btn" onClick={onClose} aria-label="Sluiten">×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-field">
            <label>Dag</label>
            <input value={day} disabled />
          </div>
          <div className="modal-field">
            <label>Type</label>
            <input value={mealType} disabled />
          </div>
            <div className="modal-field">
              <label>Naam</label>
              <input value={title} onChange={e=> setTitle(e.target.value)} placeholder="Bijv. Havermout" />
            </div>
            <div className="modal-field">
              <label>Calorieën</label>
              <input value={calories} onChange={e=> setCalories(e.target.value.replace(/[^0-9]/g,''))} placeholder="kcal" />
            </div>
            <div className="modal-field">
              <label>Notities</label>
              <textarea value={notes} onChange={e=> setNotes(e.target.value)} placeholder="Optioneel" rows={3} />
            </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuleer</button>
            <button type="submit" className="btn-primary">Opslaan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMealModal;