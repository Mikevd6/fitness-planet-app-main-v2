import React, { useEffect, useState } from 'react';
import { storage } from '../utils/localStorage';
import { notificationService } from '../utils/notificationService';
import '../styles/ProfileSettings.css';

const ProfileSettings = () => {
  const [savedRecipes, setSavedRecipes] = useState([]);

  const mergeSavedRecipes = (primaryRecipes, secondaryRecipes) => {
    const recipeMap = new Map();
    [...secondaryRecipes, ...primaryRecipes].forEach(recipe => {
      if (recipe?.id && !recipeMap.has(recipe.id)) {
        recipeMap.set(recipe.id, recipe);
      }
    });
    return Array.from(recipeMap.values());
  };

  useEffect(() => {
    const profile = storage.getProfile();
    const profileSaved = Array.isArray(profile?.savedRecipes) ? profile.savedRecipes : [];
    const legacySaved = storage.getSavedRecipes ? storage.getSavedRecipes() : [];
    const mergedSaved = mergeSavedRecipes(profileSaved, legacySaved);

    if (mergedSaved.length !== profileSaved.length) {
      storage.setProfile({ ...profile, savedRecipes: mergedSaved });
    }

    if (storage.setSavedRecipes) {
      storage.setSavedRecipes(mergedSaved);
    }

    setSavedRecipes(mergedSaved);
  }, []);

  const removeSavedRecipe = (recipeId) => {
    const profile = storage.getProfile();
    const updatedRecipes = savedRecipes.filter(recipe => recipe.id !== recipeId);
    storage.setProfile({ ...profile, savedRecipes: updatedRecipes });

    if (storage.setSavedRecipes) {
      storage.setSavedRecipes(updatedRecipes);
    }

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
            {savedRecipes.map(recipe => (
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
