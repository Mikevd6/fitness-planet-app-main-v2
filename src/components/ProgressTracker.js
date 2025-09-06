import React, { useState } from 'react';

const ProgressTracker = () => {
  const [loading] = useState(false);

  return (
    <div className="progress-tracker">
      <div className="container">
        <h1>Progress Tracker</h1>
        <p>Monitor your fitness journey and achievements.</p>
        
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading progress data...</p>
          </div>
        ) : (
          <div className="progress-content">
            <div className="progress-overview">
              <h2>Your Progress</h2>
              <div className="progress-cards">
                <div className="progress-card">
                  <h3>Weight</h3>
                  <span className="progress-value">-- kg</span>
                  <span className="progress-change">No data</span>
                </div>
                <div className="progress-card">
                  <h3>Body Fat %</h3>
                  <span className="progress-value">--%</span>
                  <span className="progress-change">No data</span>
                </div>
                <div className="progress-card">
                  <h3>Muscle Mass</h3>
                  <span className="progress-value">-- kg</span>
                  <span className="progress-change">No data</span>
                </div>
                <div className="progress-card">
                  <h3>Workouts This Week</h3>
                  <span className="progress-value">0</span>
                  <span className="progress-change">Keep going!</span>
                </div>
              </div>
            </div>
            
            <div className="progress-charts">
              <h3>Progress Charts</h3>
              <p>Charts will appear here once you start tracking your progress.</p>
            </div>
            
            <div className="progress-log">
              <h3>Add Progress Entry</h3>
              <form>
                <div className="form-group">
                  <label htmlFor="weight">Weight (kg):</label>
                  <input type="number" id="weight" name="weight" step="0.1" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="bodyFat">Body Fat %:</label>
                  <input type="number" id="bodyFat" name="bodyFat" step="0.1" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes">Notes:</label>
                  <textarea id="notes" name="notes" rows="3"></textarea>
                </div>
                
                <button type="submit" className="btn btn-primary">
                  Add Entry
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;
