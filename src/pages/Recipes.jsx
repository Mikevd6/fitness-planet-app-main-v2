import React, { useCallback, useEffect, useState } from 'react';
import { useRecipes } from '../contexts/RecipeContext';
import { storage } from '../utils/localStorage';
import { notificationService } from '../utils/notificationService';
import { getSavedRecipes, saveSavedRecipes } from '../utils/recipeStorage';
import '../styles/RecipeSearch.css';

const initialFilters = {
  cuisineType: '',
  mealType: '',
  diet: '',
  health: '',
  maxCalories: '',
  maxTime: ''
};

const cuisineTypes = ['', 'american', 'italian', 'chinese', 'mexican', 'indian', 'french', 'mediterranean'];
const mealTypes = ['', 'breakfast', 'lunch', 'dinner', 'snack'];
const diets = ['vegetarian', 'vegan', 'low-carb', 'high-protein', 'low-fat'];
const allergies = ['', 'gluten-free', 'dairy-free', 'soy-free', 'peanut-free'];

const labelFor = (value, fallback) => value || fallback;

const RecipeCard = ({ recipe, isSaved, isFavorite, onSave, onToggleFavorite }) => (
  <article className="recipe-card">
    <div className="recipe-image-container">
      <img
        src={recipe.image || '/images/recipes/default-recipe.jpg'}
        alt={recipe.title}
        className="recipe-image"
      />
      <div className="recipe-chip-row">
        {recipe.dietLabels?.slice(0, 2).map((label) => (
          <span key={label} className="chip chip-pill">{label}</span>
        ))}
      </div>
    </div>

    <div className="recipe-content">
      <div className="recipe-header">
        <div>
          <h3 className="recipe-title">{recipe.title}</h3>
          <p className="recipe-source">{recipe.source}</p>
        </div>
        <div className="recipe-meta">
          <div className="meta-block">
            <span className="meta-label">Calorieen</span>
            <strong>{recipe.caloriesPerServing || recipe.calories}</strong>
          </div>
          <div className="meta-block">
            <span className="meta-label">Bereiding</span>
            <strong>{recipe.prepTime || 15} min</strong>
          </div>
        </div>
      </div>

      <div className="recipe-tags">
        {recipe.cuisineType?.slice(0, 1).map((cuisine) => (
          <span key={cuisine} className="tag cuisine-tag">{cuisine}</span>
        ))}
        {recipe.dishType?.slice(0, 1).map((dish) => (
          <span key={dish} className="tag diet-tag">{dish}</span>
        ))}
        <span className="tag ghost-tag">{recipe.yield || 2} personen</span>
      </div>

      <div className="recipe-card-actions">
        <button
          type="button"
          className={`favorite-recipe-btn ${isFavorite ? 'is-favorite' : ''}`}
          onClick={() => onToggleFavorite(recipe)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
        >
          <i className={isFavorite ? 'fas fa-heart' : 'far fa-heart'}></i>
        </button>
        <button
          type="button"
          className={`save-recipe-btn ${isSaved ? 'is-saved' : ''}`}
          onClick={() => onSave(recipe)}
          disabled={isSaved}
        >
          {isSaved ? 'Opgeslagen' : 'Opslaan in profiel'}
        </button>
      </div>
    </div>
  </article>
);

const Recipes = () => {
  const { loading, searchRecipes } = useRecipes();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [searchResults, setSearchResults] = useState([]);
  const [resultCount, setResultCount] = useState(0);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);

  useEffect(() => {
    setSavedRecipes(getSavedRecipes());
    setFavoriteRecipes(storage.getFavorites());
  }, []);

  const handleSearch = useCallback(async () => {
    const recipeFilters = {
      cuisineType: filters.cuisineType,
      mealType: filters.mealType,
      diet: filters.diet,
      health: filters.health,
      calories: filters.maxCalories ? `0-${filters.maxCalories}` : '',
      time: filters.maxTime ? `1-${filters.maxTime}` : ''
    };
    const result = await searchRecipes(searchTerm, recipeFilters, { from: 0, to: 10, total: 0 });

    if (!result.success) {
      setSearchResults([]);
      setResultCount(0);
      return;
    }

    setSearchResults(result.recipes);
    setResultCount(result.totalResults || result.recipes.length);
  }, [filters, searchRecipes, searchTerm]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const updateFilter = (name, value) => {
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearchTerm('');
  };

  const saveRecipe = (recipe) => {
    if (!recipe?.id) {
      notificationService.warning('Recept niet beschikbaar', 'Dit recept kan niet worden opgeslagen.');
      return;
    }

    if (savedRecipes.some((savedRecipe) => savedRecipe.id === recipe.id)) {
      notificationService.info('Recept al opgeslagen', `${recipe.title} staat al in je profiel.`);
      return;
    }

    const updatedRecipes = saveSavedRecipes([...savedRecipes, recipe]);
    setSavedRecipes(updatedRecipes);
    notificationService.success('Recept opgeslagen', `${recipe.title} is toegevoegd aan je profiel.`);
  };

  const toggleFavorite = (recipe) => {
    if (!recipe?.id) return;

    if (favoriteRecipes.some((favorite) => favorite.id === recipe.id)) {
      storage.removeFromFavorites(recipe.id);
      setFavoriteRecipes((favorites) => favorites.filter((favorite) => favorite.id !== recipe.id));
      return;
    }

    storage.addToFavorites(recipe);
    setFavoriteRecipes((favorites) => [...favorites, recipe]);
  };

  return (
    <div className="recipe-search-page">
      <div className="recipe-search-hero">
        <div className="hero-text">
          <p className="breadcrumb">Home &gt; Maaltijden &gt; Recepten</p>
          <h1>Recepten zoeken</h1>
          <p className="hero-subtitle">Vind de perfecte maaltijd voor jouw doelen en voorkeuren.</p>
        </div>

        <form onSubmit={(event) => { event.preventDefault(); handleSearch(); }} className="hero-search">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Bijv. kip, quinoa, salade..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">Zoeken</button>
          </div>
        </form>
      </div>

      <div className="search-layout">
        <aside className="filters-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Fitness Planet - Recepten</p>
              <h3>Filters</h3>
            </div>
            <button className="chip chip-outline" type="button" onClick={resetFilters}>Alles wissen</button>
          </div>

          <div className="filter-group">
            <label htmlFor="cuisineType">Cuisine</label>
            <select id="cuisineType" value={filters.cuisineType} onChange={(event) => updateFilter('cuisineType', event.target.value)}>
              {cuisineTypes.map((type) => <option key={type || 'all'} value={type}>{labelFor(type, 'All Cuisines')}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="mealType">Maaltijd</label>
            <select id="mealType" value={filters.mealType} onChange={(event) => updateFilter('mealType', event.target.value)}>
              {mealTypes.map((type) => <option key={type || 'all'} value={type}>{labelFor(type, 'Any Meal')}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="diet">Dieet</label>
            <div className="pill-row">
              {diets.map((diet) => (
                <button
                  key={diet}
                  type="button"
                  className={`pill ${filters.diet === diet ? 'pill-active' : ''}`}
                  onClick={() => updateFilter('diet', filters.diet === diet ? '' : diet)}
                >
                  {diet}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="health">Allergieen</label>
            <select id="health" value={filters.health} onChange={(event) => updateFilter('health', event.target.value)}>
              {allergies.map((allergy) => <option key={allergy || 'none'} value={allergy}>{labelFor(allergy, 'Geen allergieen')}</option>)}
            </select>
          </div>

          <div className="filter-grid">
            <div className="filter-group">
              <label htmlFor="maxCalories">Max kcal</label>
              <input type="number" id="maxCalories" placeholder="450" value={filters.maxCalories} onChange={(event) => updateFilter('maxCalories', event.target.value)} />
            </div>
            <div className="filter-group">
              <label htmlFor="maxTime">Max tijd (min)</label>
              <input type="number" id="maxTime" placeholder="30" value={filters.maxTime} onChange={(event) => updateFilter('maxTime', event.target.value)} />
            </div>
          </div>

          <button className="apply-btn" onClick={handleSearch} type="button">Filters toepassen</button>
        </aside>

        <section className="results-panel">
          <div className="results-header">
            <div>
              <p className="panel-kicker">Favorieten &gt;</p>
              <h2>Resultaten</h2>
            </div>
            <span className="results-count">{resultCount} gevonden</span>
          </div>

          <div className="search-results">
            {loading ? (
              <div className="loading"><div className="loading-spinner"></div><p>Recepten zoeken...</p></div>
            ) : searchResults.length > 0 ? (
              <div className="recipes-grid">
                {searchResults.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    isSaved={savedRecipes.some((savedRecipe) => savedRecipe.id === recipe.id)}
                    isFavorite={favoriteRecipes.some((favorite) => favorite.id === recipe.id)}
                    onSave={saveRecipe}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="no-results"><h3>Geen recepten gevonden</h3><p>Pas je zoekterm of filters aan en probeer opnieuw.</p></div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Recipes;
