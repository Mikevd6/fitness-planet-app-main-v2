import React from 'react';
import '../styles/NutritionTracker.css';

const NutritionTracker = () => {
  const macros = [
    { label: 'Caloriën', value: '1850', total: '2000', percent: 92 },
    { label: 'Proteïne', value: '112g', total: '140g', percent: 80 },
    { label: 'Koolhydraten', value: '185g', total: '210g', percent: 75 },
    { label: 'Vetten', value: '58g', total: '70g', percent: 60 },
  ];

  const meals = [
    {
      title: 'Ontbijt',
      items: ['Omelet', 'Greek Yogurt'],
      calories: 120,
    },
    {
      title: 'Lunch',
      items: ['Burger', 'Aardappelen', 'Fries'],
      calories: 105,
    },
    {
      title: 'Avondeten',
      items: ['Kip', 'Chopped Salad'],
      calories: 100,
    },
    {
      title: 'Snacks',
      items: ['Protein Bar', 'Fruit'],
      calories: 50,
    },
  ];

  const quickEntries = [
    { label: 'Voedsel / gerecht', placeholder: 'Bijv. pasta met kip' },
    { label: 'Portie', placeholder: '1 kom' },
    { label: 'Cal', placeholder: '420' },
  ];

  return (
    <div className="nutrition-page">
      <div className="nutrition-hero">
        <div>
          <p className="kicker">Voeding</p>
          <h1>Voeding</h1>
          <p className="subtitle">Stel je doelen in en volg je voortgang</p>
        </div>
        <div className="hero-actions">
          <button className="pill">Maaltijd Loggen</button>
          <button className="pill secondary">Dag Reset</button>
        </div>
      </div>

      <div className="nutrition-grid">
        <section className="panel macro-panel">
          <div className="panel-header">
            <p className="panel-kicker">Macro Overzicht</p>
            <h3>Dagelijkse doelen</h3>
          </div>
          <div className="macro-list">
            {macros.map((macro) => (
              <div key={macro.label} className="macro-card">
                <div className="macro-top">
                  <div>
                    <p className="macro-label">{macro.label}</p>
                    <p className="macro-value">{macro.value}</p>
                  </div>
                  <span className="macro-total">{macro.total}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${macro.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel meals-panel">
          <div className="panel-header">
            <p className="panel-kicker">Maaltijden</p>
            <h3>Dagelijkse planning</h3>
          </div>
          <div className="meals-grid">
            {meals.map((meal) => (
              <div key={meal.title} className="meal-card">
                <div className="meal-header">
                  <p className="meal-title">{meal.title}</p>
                  <button className="pill ghost">Eetplan</button>
                </div>
                <ul className="meal-items">
                  {meal.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="meal-calories">{meal.calories}kcal</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel quick-panel">
          <div className="panel-header">
            <p className="panel-kicker">Snelle invoer</p>
            <h3>Log direct een maaltijd</h3>
          </div>
          <form className="quick-form">
            {quickEntries.map((entry) => (
              <label key={entry.label} className="quick-field">
                <span>{entry.label}</span>
                <input type="text" placeholder={entry.placeholder} />
              </label>
            ))}
            <div className="quick-actions">
              <button type="submit" className="pill">
                Toevoegen
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default NutritionTracker;
