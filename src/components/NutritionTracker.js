import React, { useState } from 'react';
import '../styles/NutritionTracker.css';

const NutritionTracker = () => {
  const [loading] = useState(false);

  return (
    <div className="page nutrition-page">
      <header className="page-header">
        <div className="page-heading-group">
          <h1 className="page-title">Voeding</h1>
          <p className="page-subtitle">Beheer calorieën, macro's en maaltijden.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary">Maaltijd Loggen</button>
          <button className="btn btn-outline">Dag Reset</button>
        </div>
      </header>

      {loading ? (
        <div className="loading-block">
          <div className="loading-spinner"></div>
          <p>Voedingsdata laden...</p>
        </div>
      ) : (
        <div className="nutrition-layout">
          <section className="panel macro-summary">
            <h2 className="panel-title">Macro Overzicht</h2>
            <div className="macro-grid">
              <div className="macro-tile">
                <span className="label">Calorieën</span>
                <span className="value">1850</span>
                <span className="target">/ 2200</span>
                <div className="bar"><span style={{width:'68%'}}></span></div>
              </div>
              <div className="macro-tile">
                <span className="label">Proteïne</span>
                <span className="value">112g</span>
                <span className="target">/ 150g</span>
                <div className="bar"><span style={{width:'55%'}}></span></div>
              </div>
              <div className="macro-tile">
                <span className="label">Koolhydraten</span>
                <span className="value">180g</span>
                <span className="target">/ 230g</span>
                <div className="bar"><span style={{width:'62%'}}></span></div>
              </div>
              <div className="macro-tile">
                <span className="label">Vetten</span>
                <span className="value">58g</span>
                <span className="target">/ 70g</span>
                <div className="bar"><span style={{width:'74%'}}></span></div>
              </div>
            </div>
          </section>

          <section className="panel meals-log">
            <h2 className="panel-title">Maaltijden</h2>
            <div className="meals-grid">
              {['Ontbijt','Lunch','Avondeten','Snacks'].map(meal => (
                <div className="meal-block" key={meal}>
                  <header>
                    <h3>{meal}</h3>
                    <button className="link-button">+ Item</button>
                  </header>
                  <ul className="meal-items empty">
                    <li className="empty-note">Nog geen items</li>
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="panel quick-add">
            <h2 className="panel-title">Snelle Invoer</h2>
            <form className="quick-form">
              <input type="text" placeholder="Voedsel / gerecht" />
              <input type="number" placeholder="Cal" />
              <input type="number" placeholder="Prot" />
              <input type="number" placeholder="Carb" />
              <input type="number" placeholder="Vet" />
              <button className="btn btn-primary" type="submit">Toevoegen</button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default NutritionTracker;
