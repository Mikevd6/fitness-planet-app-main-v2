import React, { useState, useEffect } from 'react';
import { useMealPlan } from '../contexts/MealPlanContext';
import { useAuth } from '../contexts/AuthContext';
import '../styles/MealPlan.css';

const MealPlanPage = () => {
  const { user } = useAuth();
  const { weekMenu, loading, dispatch, actionTypes } = useMealPlan();
  const [selectedDay, setSelectedDay] = useState('monday');
  const [view, setView] = useState('week'); // 'week' or 'day'

  const days = [
    { key: 'monday', label: 'Maandag' },
    { key: 'tuesday', label: 'Dinsdag' },
    { key: 'wednesday', label: 'Woensdag' },
    { key: 'thursday', label: 'Donderdag' },
    { key: 'friday', label: 'Vrijdag' },
    { key: 'saturday', label: 'Zaterdag' },
    { key: 'sunday', label: 'Zondag' }
  ];

  const mealTypes = [
    { key: 'breakfast', label: 'Ontbijt' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'dinner', label: 'Avondeten' },
    { key: 'snack', label: 'Snack' }
  ];

  const handleAddRecipe = (day, mealType) => {
    // This would typically open a recipe selection modal
    console.log('Adding recipe for', day, mealType);
    
    // For demo purposes, add a placeholder recipe
    const demoRecipe = {
      id: demo-,
      title: Demo  recept,
      calories: 300,
      prepTime: 20,
      image: '/images/recipes/default-recipe.jpg'
    };

    dispatch({
      type: actionTypes.ADD_RECIPE_TO_DAY,
      payload: { day, mealType, recipe: demoRecipe }
    });
  };

  const handleRemoveRecipe = (day, mealType) => {
    dispatch({
      type: actionTypes.REMOVE_RECIPE_FROM_DAY,
      payload: { day, mealType }
    });
  };

  const calculateDayCalories = (day) => {
    const dayMenu = weekMenu[day] || {};
    return Object.values(dayMenu).reduce((total, recipe) => {
      return total + (recipe?.calories || 0);
    }, 0);
  };

  const calculateWeekCalories = () => {
    return days.reduce((total, day) => {
      return total + calculateDayCalories(day.key);
    }, 0);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading meal plan...</p>
      </div>
    );
  }

  return (
    <div className="meal-plan-page">
      <div className="container">
        <div className="page-header">
          <h1>Maaltijdplanning</h1>
          <p>Plan je maaltijden voor de hele week</p>
          
          <div className="view-controls">
            <button 
              className={tn }
              onClick={() => setView('week')}
            >
              Weekoverzicht
            </button>
            <button 
              className={tn }
              onClick={() => setView('day')}
            >
              Dag detail
            </button>
          </div>
        </div>

        <div className="meal-plan-stats">
          <div className="stat-card">
            <h3>Week Totaal</h3>
            <span className="stat-value">{calculateWeekCalories()} cal</span>
          </div>
          <div className="stat-card">
            <h3>Geplande Maaltijden</h3>
            <span className="stat-value">
              {Object.values(weekMenu).reduce((count, day) => count + Object.keys(day).length, 0)}
            </span>
          </div>
        </div>

        {view === 'week' ? (
          <div className="week-view">
            <div className="week-grid">
              {days.map(day => (
                <div key={day.key} className="day-column">
                  <h3 className="day-header">{day.label}</h3>
                  <div className="day-calories">
                    {calculateDayCalories(day.key)} cal
                  </div>
                  
                  <div className="meals">
                    {mealTypes.map(mealType => (
                      <div key={mealType.key} className="meal-slot">
                        <h4>{mealType.label}</h4>
                        
                        {weekMenu[day.key]?.[mealType.key] ? (
                          <div className="recipe-card">
                            <img 
                              src={weekMenu[day.key][mealType.key].image || '/images/recipes/default-recipe.jpg'}
                              alt={weekMenu[day.key][mealType.key].title}
                              className="recipe-image"
                            />
                            <div className="recipe-info">
                              <h5>{weekMenu[day.key][mealType.key].title}</h5>
                              <p>{weekMenu[day.key][mealType.key].calories} cal</p>
                            </div>
                            <button 
                              className="btn btn-small btn-danger"
                              onClick={() => handleRemoveRecipe(day.key, mealType.key)}
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="btn btn-outline add-recipe-btn"
                            onClick={() => handleAddRecipe(day.key, mealType.key)}
                          >
                            + Add Recipe
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="day-view">
            <div className="day-selector">
              <select 
                value={selectedDay} 
                onChange={(e) => setSelectedDay(e.target.value)}
                className="day-select"
              >
                {days.map(day => (
                  <option key={day.key} value={day.key}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="selected-day">
              <h2>{days.find(d => d.key === selectedDay)?.label}</h2>
              <p className="day-total">{calculateDayCalories(selectedDay)} calories totaal</p>
              
              <div className="day-meals">
                {mealTypes.map(mealType => (
                  <div key={mealType.key} className="meal-section">
                    <h3>{mealType.label}</h3>
                    
                    {weekMenu[selectedDay]?.[mealType.key] ? (
                      <div className="recipe-detail">
                        <img 
                          src={weekMenu[selectedDay][mealType.key].image || '/images/recipes/default-recipe.jpg'}
                          alt={weekMenu[selectedDay][mealType.key].title}
                          className="recipe-image-large"
                        />
                        <div className="recipe-details">
                          <h4>{weekMenu[selectedDay][mealType.key].title}</h4>
                          <p>Calories: {weekMenu[selectedDay][mealType.key].calories}</p>
                          <p>Prep time: {weekMenu[selectedDay][mealType.key].prepTime || 'N/A'} minutes</p>
                          <div className="recipe-actions">
                            <button className="btn btn-secondary">View Recipe</button>
                            <button 
                              className="btn btn-danger"
                              onClick={() => handleRemoveRecipe(selectedDay, mealType.key)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="empty-meal">
                        <p>No recipe planned for {mealType.label.toLowerCase()}</p>
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleAddRecipe(selectedDay, mealType.key)}
                        >
                          Add Recipe
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="meal-plan-actions">
          <button className="btn btn-primary">Save Meal Plan</button>
          <button className="btn btn-secondary">Generate Shopping List</button>
          <button className="btn btn-outline">Clear All</button>
        </div>
      </div>
    </div>
  );
};

export default MealPlanPage;
