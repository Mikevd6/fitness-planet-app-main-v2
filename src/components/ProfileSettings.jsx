import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { noviDataService } from '../services/noviDataService';
import { notificationService } from '../utils/notificationService';
import PageHeader from './ui/PageHeader';
import SavedRecipeList from './profile/SavedRecipeList';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    noviDataService.favoriteRecipes.list()
      .then((items) => { if (active) setSavedRecipes(items); })
      .catch((failure) => { if (active) setError(failure.response?.data?.message || failure.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.id]);

  const removeSavedRecipe = async (id) => {
    try {
      await noviDataService.favoriteRecipes.remove(id);
      setSavedRecipes((items) => items.filter((item) => item.id !== id));
      notificationService.success('Recept verwijderd', 'Het recept is verwijderd uit je profiel.');
    } catch (failure) {
      setError(failure.response?.data?.message || failure.message);
    }
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

        {loading && <p role="status">Recepten laden uit NOVI...</p>}
        {error && <p role="alert">{error}</p>}
        {!loading && !error && <SavedRecipeList recipes={savedRecipes.map((item) => ({
          id: item.id, title: item.title, image: item.imageUrl, url: item.sourceUrl,
          calories: item.calories
        }))} onRemoveRecipe={removeSavedRecipe} />}
      </div>
    </section>
  );
};

export default ProfileSettings;
