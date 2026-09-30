import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { noviDataService } from '../services/noviDataService';
import './MealPlanPage.css';

const days = [
  ['monday', 'Maandag'], ['tuesday', 'Dinsdag'], ['wednesday', 'Woensdag'],
  ['thursday', 'Donderdag'], ['friday', 'Vrijdag'], ['saturday', 'Zaterdag'], ['sunday', 'Zondag']
];
const mealTypes = [
  ['breakfast', 'Ontbijt'], ['lunch', 'Lunch'], ['dinner', 'Avondeten'], ['snack', 'Snack']
];
const labelFor = (items, value) => items.find(([key]) => key === value)?.[1] || value;
const dateKey = (date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
const datesThisWeek = () => {
  const monday = new Date();
  monday.setHours(12, 0, 0, 0);
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  return Object.fromEntries(days.map(([key], index) => {
    const date = new Date(monday);
    date.setDate(date.getDate() + index);
    return [key, dateKey(date)];
  }));
};

const MealPlanPage = () => {
  const { user } = useAuth();
  const weekDates = useMemo(datesThisWeek, []);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [day, setDay] = useState('monday');
  const [mealType, setMealType] = useState('breakfast');
  const [recipeId, setRecipeId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      noviDataService.mealPlans.list({ signal: controller.signal }),
      noviDataService.favoriteRecipes.list({ signal: controller.signal })
    ])
      .then(([plans, favorites]) => {
        if (controller.signal.aborted) return;
        setEntries(plans.filter((item) => Object.values(weekDates).includes(item.date?.slice(0, 10))));
        setSavedRecipes(favorites.map((item) => ({
          id: item.id, uri: item.recipeUri, title: item.title, image: item.imageUrl
        })));
      })
      .catch((failure) => { if (!controller.signal.aborted) setError(failure.response?.data?.message || failure.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [user?.id, weekDates]);

  const weekMenu = Object.fromEntries(days.map(([key]) => [key, Object.fromEntries(
    entries.filter((item) => item.date?.slice(0, 10) === weekDates[key])
      .map((item) => [item.mealType, { ...item, title: item.recipeTitle }])
  )]));

  const hasMeals = Object.values(weekMenu || {}).some(
    (meals) => meals && Object.values(meals).some(Boolean)
  );

  const addMeal = async (event) => {
    event.preventDefault();
    const recipe = savedRecipes.find((item) => String(item.id) === recipeId);
    if (!recipe) {
      setMessage('Kies eerst een opgeslagen recept.');
      return;
    }
    const existing = entries.find((item) => item.date?.slice(0, 10) === weekDates[day] && item.mealType === mealType);
    const values = {
      date: weekDates[day], mealType, recipeUri: recipe.uri || String(recipe.id),
      recipeTitle: recipe.title, imageUrl: recipe.image || ''
    };
    try {
      const saved = existing
        ? await noviDataService.mealPlans.update(existing.id, values)
        : await noviDataService.mealPlans.create(values);
      setEntries((items) => [...items.filter((item) => item.id !== existing?.id), saved]);
      setMessage('Maaltijd opgeslagen bij NOVI.');
      setError('');
    } catch (failure) {
      setMessage('');
      setError(failure.response?.data?.message || failure.message);
    }
  };

  const removeMeal = async (selectedDay, selectedMealType) => {
    const existing = entries.find((item) => item.date?.slice(0, 10) === weekDates[selectedDay] && item.mealType === selectedMealType);
    if (!existing) return;
    try {
      await noviDataService.mealPlans.remove(existing.id);
      setEntries((items) => items.filter((item) => item.id !== existing.id));
      setMessage('Maaltijd verwijderd bij NOVI.');
      setError('');
    } catch (failure) {
      setMessage('');
      setError(failure.response?.data?.message || failure.message);
    }
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
      <header className="meal-plan-hero">
        <div className="meal-plan-hero__content">
          <p className="eyebrow">Maaltijdplan</p>
          <h1>Maaltijdplan</h1>
          <p className="subtitle">Beheer en plan je wekelijkse maaltijden.</p>
        </div>
      </header>

      <div className="meal-plan-shell">
        <form className="meal-plan-form" onSubmit={addMeal}>
          <h2>Maaltijd inplannen</h2>
          {savedRecipes.length === 0 ? (
            <p>Je hebt nog geen recepten opgeslagen. <Link to="/recepten">Zoek en bewaar eerst een recept.</Link></p>
          ) : (
            <div className="meal-plan-form__fields">
              <label>Dag
                <select value={day} onChange={(event) => setDay(event.target.value)}>
                  {days.map(([value, label]) => <option key={value} value={value}>{label} ({weekDates[value]})</option>)}
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
          <section className="meal-plan-summary" aria-label="Geplande maaltijden">
            {Object.entries(weekMenu).map(([dayKey, meals]) => {
              const plannedMeals = Object.entries(meals || {}).filter(([, meal]) => Boolean(meal));
              if (plannedMeals.length === 0) return null;

              return (
                <section key={dayKey} className="meal-plan-summary__day">
                  <div className="meal-plan-summary__day-header">
                    <h3>{labelFor(days, dayKey)} ({weekDates[dayKey]})</h3>
                    <span>{plannedMeals.length} maaltijden</span>
                  </div>

                  <div className="meal-plan-summary__meals">
                    {plannedMeals.map(([type, meal]) => (
                      <article key={`${dayKey}-${type}`} className="meal-plan-summary__meal">
                        <div className="meal-plan-summary__meal-info">
                          <span>{labelFor(mealTypes, type)}</span>
                          <h4 className="meal-plan-summary__meal-title">{meal.title}</h4>
                        </div>
                        <button type="button" onClick={() => removeMeal(dayKey, type)}>Verwijderen</button>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
};

export default MealPlanPage;
