import React, { useState } from 'react';

const WorkoutTracker = () => {
  const [loading] = useState(false);

  return (
    <div className="workout-tracker">
      <div className="container">
        <h1>Workout Tracker</h1>
        <p>Track your fitness activities and progress.</p>
        
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading workouts...</p>
          </div>
        ) : (
          <div className="workout-content">
            <div className="workout-summary">
              <h2>Your Workouts</h2>
              <p>Start tracking your fitness journey!</p>
            </div>
            
            <div className="workout-form">
              <h3>Add New Workout</h3>
              <form>
                <div className="form-group">
                  <label htmlFor="exercise">Exercise Type:</label>
                  <select id="exercise" name="exercise">
                    <option value="">Select exercise</option>
                    <option value="running">Running</option>
                    <option value="cycling">Cycling</option>
                    <option value="swimming">Swimming</option>
                    <option value="weightlifting">Weight Lifting</option>
                    <option value="yoga">Yoga</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="duration">Duration (minutes):</label>
                  <input type="number" id="duration" name="duration" min="1" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="intensity">Intensity:</label>
                  <select id="intensity" name="intensity">
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <button type="submit" className="btn btn-primary">
                  Add Workout
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutTracker;
