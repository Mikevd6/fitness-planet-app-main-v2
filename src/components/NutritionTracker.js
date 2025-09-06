import React, { useState } from 'react';

const NutritionTracker = () => {
  const [loading] = useState(false);

  return (
    <div className="nutrition-tracker">
      <div className="container">
        <h1>Nutrition Tracker</h1>
        <p>Track your daily nutrition and calorie intake.</p>
        
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading nutrition data...</p>
          </div>
        ) : (
          <div className="nutrition-content">
            <div className="nutrition-summary">
              <h2>Today's Nutrition</h2>
              <div className="nutrition-stats">
                <div className="stat-card">
                  <h3>Calories</h3>
                  <span className="stat-value">0 / 2000</span>
                </div>
                <div className="stat-card">
                  <h3>Protein</h3>
                  <span className="stat-value">0g / 150g</span>
                </div>
                <div className="stat-card">
                  <h3>Carbs</h3>
                  <span className="stat-value">0g / 200g</span>
                </div>
                <div className="stat-card">
                  <h3>Fat</h3>
                  <span className="stat-value">0g / 67g</span>
                </div>
              </div>
            </div>
            
            <div className="food-log">
              <h3>Food Log</h3>
              <div className="meal-sections">
                <div className="meal-section">
                  <h4>Breakfast</h4>
                  <button className="btn btn-secondary">Add Food</button>
                </div>
                <div className="meal-section">
                  <h4>Lunch</h4>
                  <button className="btn btn-secondary">Add Food</button>
                </div>
                <div className="meal-section">
                  <h4>Dinner</h4>
                  <button className="btn btn-secondary">Add Food</button>
                </div>
                <div className="meal-section">
                  <h4>Snacks</h4>
                  <button className="btn btn-secondary">Add Food</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionTracker;
