import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMealPlan } from '../contexts/MealPlanContext';
import { getSavedRecipes } from '../utils/recipeStorage';
import './MealPlanPage.css';

const days = [
  ['monday', 'Maandag'], ['tuesday', 'Dinsdag'], ['wednesday', 'Woensdag'],
  ['thursday', 'Donderdag'], ['friday', 'Vrijdag'], ['saturday', 'Zaterdag'], ['sunday', 'Zondag']
];
const mealTypes = [
  ['breakfast', 'Ontbijt'], ['lunch', 'Lunch'], ['dinner', 'Avondeten'], ['snack', 'Snack']
];
const labelFor = (items, value) => items.find(([key]) => key === value)?.[1] || value;

const MealPlanPage = () => {
  const { weekMenu, loading, error, addRecipeToMenu, removeRecipeFromMenu } = useMealPlan();
  const [savedRecipes] = useState(getSavedRecipes);
  const [day, setDay] = useState('monday');
  const [mealType, setMealType] = useState('breakfast');
  const [recipeId, setRecipeId] = useState('');
  const [message, setMessage] = useState('');

  const hasMeals = Object.values(weekMenu || {}).some(
    (meals) => meals && Object.values(meals).some(Boolean)
  );

  const addMeal = (event) => {
    event.preventDefault();
    const recipe = savedRecipes.find((item) => String(item.id) === recipeId);
    if (!recipe) {
      setMessage('Kies eerst een opgeslagen recept.');
      return;
    }
    const result = addRecipeToMenu(day, mealType, recipe);
    setMessage(result.success ? 'Maaltijd toegevoegd aan je planning.' : result.error);
  };

  const removeMeal = (selectedDay, selectedMealType) => {
    const result = removeRecipeFromMenu(selectedDay, selectedMealType);
    setMessage(result.success ? 'Maaltijd verwijderd.' : result.error);
  };

  if (loading) {
    return (
      <div className="meal-plan-page">
        <div className="meal-plan-loading">Bezig met laden...</div>
      </div>
    );
  }

  return (
    <div className="meal-plan-page">
      <div className="meal-plan-hero">
        <div className="meal-plan-hero__content">
          <p className="eyebrow">Maaltijdplan</p>
          <h1>Maaltijdplan</h1>
          <p className="subtitle">Beheer en plan je wekelijkse maaltijden.</p>
        </div>
      </div>

      <div className="meal-plan-shell">
        <form className="meal-plan-form" onSubmit={addMeal}>
          <h2>Maaltijd inplannen</h2>
          {savedRecipes.length === 0 ? (
            <p>Je hebt nog geen recepten opgeslagen. <Link to="/recepten">Zoek en bewaar eerst een recept.</Link></p>
          ) : (
            <div className="meal-plan-form__fields">
              <label>Dag
                <select value={day} onChange={(event) => setDay(event.target.value)}>
                  {days.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>Eetmoment
                <select value={mealType} onChange={(event) => setMealType(event.target.value)}>
                  {mealTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>Opgeslagen recept
                <select value={recipeId} onChange={(event) => setRecipeId(event.target.value)} required>
                  <option value="">Kies een recept</option>
                  {savedRecipes.map((recipe) => <option key={recipe.id} value={recipe.id}>{recipe.title}</option>)}
                </select>
              </label>
              <button type="submit">Toevoegen</button>
            </div>
          )}
          {(message || error) && <p role="status">{message || error}</p>}
        </form>
        {!hasMeals ? (
          <div className="meal-plan-empty-card">
            <span>Nog geen maaltijden gepland.</span>
          </div>
        ) : (
          <div className="meal-plan-summary">
            {Object.entries(weekMenu).map(([dayKey, meals]) => {
              const plannedMeals = Object.entries(meals || {}).filter(([, meal]) => Boolean(meal));
              if (plannedMeals.length === 0) return null;

              return (
                <div key={dayKey} className="meal-plan-summary__day">
                  <div className="meal-plan-summary__day-header">
                    <h3>{labelFor(days, dayKey)}</h3>
                    <span>{plannedMeals.length} maaltijden</span>
                  </div>

                  <div className="meal-plan-summary__meals">
                    {plannedMeals.map(([type, meal]) => (
                      <div key={`${dayKey}-${type}`} className="meal-plan-summary__meal">
                        <div className="meal-plan-summary__meal-info">
                          <span>{labelFor(mealTypes, type)}</span>
                          <span className="meal-plan-summary__meal-title">{meal.title}</span>
                          {(meal.caloriesPerServing || meal.calories) && (
                            <span className="meal-plan-summary__meal-meta">{meal.caloriesPerServing || meal.calories} kcal</span>
                          )}
                        </div>
                        <button type="button" onClick={() => removeMeal(dayKey, type)}>Verwijderen</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanPage;
