import React, { useEffect, useState } from 'react';
import { notificationService } from '../utils/notificationService';
import { getSavedRecipes, saveSavedRecipes } from '../utils/recipeStorage';
import '../styles/ProfileSettings.css';

const ProfileSettings = () => {
  const [savedRecipes, setSavedRecipes] = useState([]);

  useEffect(() => {
    setSavedRecipes(getSavedRecipes());
  }, []);

  const removeSavedRecipe = (recipeId) => {
    const updatedRecipes = saveSavedRecipes(
      savedRecipes.filter((recipe) => recipe.id !== recipeId)
    );

    setSavedRecipes(updatedRecipes);
    notificationService.success('Recept verwijderd', 'Het recept is verwijderd uit je profiel.');
  };

  return (
    <section className="profile-settings">
      <header className="profile-settings__header">
        <div>
          <p className="profile-settings__eyebrow">Fitness Planet / Profiel</p>
          <h1>Profielinstellingen</h1>
          <p>Beheer je persoonlijke gegevens en je opgeslagen recepten.</p>
        </div>
      </header>

      <div className="profile-settings__card">
        <div className="profile-settings__card-header">
          <h2>Opgeslagen recepten</h2>
          <span className="profile-settings__count">{savedRecipes.length} opgeslagen</span>
        </div>

        {savedRecipes.length === 0 ? (
          <div className="profile-settings__empty">
            <p>Je hebt nog geen recepten opgeslagen. Ga naar Recepten om een favoriet te bewaren.</p>
          </div>
        ) : (
          <div className="profile-settings__recipes">
            {savedRecipes.map((recipe) => (
              <article key={recipe.id} className="saved-recipe">
                <img
                  src={recipe.image || '/images/recipes/default-recipe.jpg'}
                  alt={recipe.title}
                  className="saved-recipe__image"
                />
                <div className="saved-recipe__details">
                  <h3>{recipe.title}</h3>
                  <p>{recipe.source || 'Opgeslagen recept'}</p>
                  <div className="saved-recipe__meta">
                    <span>{recipe.caloriesPerServing || recipe.calories} kcal</span>
                    <span>{recipe.prepTime || 15} min</span>
                  </div>
                  {recipe.url && (
                    <a href={recipe.url} target="_blank" rel="noreferrer" className="saved-recipe__link">
                      Bekijk recept
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  className="saved-recipe__remove"
                  onClick={() => removeSavedRecipe(recipe.id)}
                >
                  Verwijderen
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfileSettings;
