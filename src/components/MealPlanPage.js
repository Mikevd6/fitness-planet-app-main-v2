import React from 'react';
import { useMealPlan } from '../contexts/MealPlanContext';
import { useAuth } from '../contexts/AuthContext';
import '../styles/MealPlan.css';

const MealPlanPage = () => {
  useAuth();
  const { weekMenu, loading } = useMealPlan();

  const hasMeals = Object.values(weekMenu || {}).some(
    (day) => day && Object.keys(day).length > 0
  );

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
        {!hasMeals ? (
          <div className="meal-plan-empty-card">
            <span>Nog geen maaltijden gepland.</span>
          </div>
        ) : (
          <div className="meal-plan-summary">
            {Object.entries(weekMenu).map(([dayKey, meals]) => {
              if (!meals || Object.keys(meals).length === 0) return null;

              return (
                <div key={dayKey} className="meal-plan-summary__day">
                  <div className="meal-plan-summary__day-header">
                    <h3>{dayKey}</h3>
                    <span>{Object.keys(meals).length} maaltijden</span>
                  </div>

                  <div className="meal-plan-summary__meals">
                    {Object.values(meals).map((meal) => (
                      <div key={meal.id || meal.title} className="meal-plan-summary__meal">
                        <div className="meal-plan-summary__meal-info">
                          <span className="meal-plan-summary__meal-title">{meal.title}</span>
                          {meal.calories && (
                            <span className="meal-plan-summary__meal-meta">{meal.calories} kcal</span>
                          )}
                        </div>
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
