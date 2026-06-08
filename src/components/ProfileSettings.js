import React, { useEffect, useState } from 'react';
import { notificationService } from '../utils/notificationService';
import { getSavedRecipes, saveSavedRecipes } from '../utils/recipeStorage';
import PageHeader from './ui/PageHeader';
import SavedRecipeList from './profile/SavedRecipeList';
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
      <PageHeader
        className="profile-settings__header"
        kickerClassName="profile-settings__eyebrow"
        subtitleClassName="profile-settings__subtitle"
        kicker="Fitness Planet / Profiel"
        title="Profielinstellingen"
        subtitle="Beheer je persoonlijke gegevens en je opgeslagen recepten."
      />

      <div className="profile-settings__card">
        <div className="profile-settings__card-header">
          <h2>Opgeslagen recepten</h2>
          <span className="profile-settings__count">{savedRecipes.length} opgeslagen</span>
        </div>

        <SavedRecipeList recipes={savedRecipes} onRemoveRecipe={removeSavedRecipe} />
      </div>
    </section>
  );
};

export default ProfileSettings;
