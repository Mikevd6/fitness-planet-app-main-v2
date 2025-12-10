import React, { useState, useEffect } from 'react';
import { useRecipes } from '../contexts/RecipeContext';
import { useAuth } from '../contexts/AuthContext';
import '../styles/RecipeSearch.css';

const RecipeSearchPage = () => {
  const { user } = useAuth();
  const { recipes, loading, searchRecipes } = useRecipes();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    cuisineType: '',
    mealType: '',
    diet: '',
    health: '',
    maxCalories: '',
    maxTime: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [resultCount, setResultCount] = useState(0);

  const cuisineTypes = [
    { value: '', label: 'All Cuisines' },
    { value: 'american', label: 'American' },
    { value: 'italian', label: 'Italian' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'mexican', label: 'Mexican' },
    { value: 'indian', label: 'Indian' },
    { value: 'french', label: 'French' },
    { value: 'mediterranean', label: 'Mediterranean' }
  ];

  const mealTypes = [
    { value: '', label: 'Any Meal' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' }
  ];

  const diets = [
    { value: '', label: 'No Diet Restrictions' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'low-carb', label: 'Low Carb' },
    { value: 'high-protein', label: 'High Protein' },
    { value: 'low-fat', label: 'Low Fat' }
  ];

  const allergyOptions = [
    { value: '', label: 'Geen allergieën' },
    { value: 'gluten-free', label: 'Gluten-free' },
    { value: 'dairy-free', label: 'Dairy-free' },
    { value: 'soy-free', label: 'Soy-free' },
    { value: 'peanut-free', label: 'Peanut-free' }
  ];

  useEffect(() => {
    // Load initial recipes
    handleSearch();
  }, []);

  const handleSearch = async () => {
    try {
      const searchOptions = {
        query: searchTerm,
        cuisineType: filters.cuisineType,
        mealType: filters.mealType,
        diet: filters.diet,
        health: filters.health,
        calories: filters.maxCalories ? `0-${filters.maxCalories}` : '',
        time: filters.maxTime ? `1-${filters.maxTime}` : '',
        from: 0,
        to: 10
      };

      const result = await searchRecipes(searchOptions);
      if (result.success) {
        setSearchResults(result.recipes);
        setResultCount(result.totalResults || result.recipes.length);
      } else {
        console.error('Search failed:', result.error);
        setSearchResults([]);
        setResultCount(0);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setResultCount(0);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const RecipeCard = ({ recipe }) => (
    <div className="recipe-card">
      <div className="recipe-image-container">
        <img
          src={recipe.image || '/images/recipes/default-recipe.jpg'}
          alt={recipe.title}
          className="recipe-image"
        />
        <div className="recipe-chip-row">
          <span className="chip chip-outline">Favoriet</span>
          {recipe.dietLabels?.slice(0, 1).map(label => (
            <span key={label} className="chip chip-pill">{label}</span>
          ))}
          {recipe.healthLabels?.slice(0, 1).map(label => (
            <span key={label} className="chip chip-outline">{label}</span>
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
              <span className="meta-label">Calorieën</span>
              <strong>{recipe.caloriesPerServing || recipe.calories}</strong>
            </div>
            <div className="meta-block">
              <span className="meta-label">Bereiding</span>
              <strong>{recipe.prepTime || 15} min</strong>
            </div>
            <div className="meta-block">
              <span className="meta-label">Hits</span>
              <strong>105</strong>
            </div>
          </div>
        </div>

        <div className="recipe-tags">
          {recipe.cuisineType?.slice(0, 1).map(cuisine => (
            <span key={cuisine} className="tag cuisine-tag">{cuisine}</span>
          ))}
          {recipe.dishType?.slice(0, 1).map(dish => (
            <span key={dish} className="tag diet-tag">{dish}</span>
          ))}
          <span className="tag ghost-tag">{recipe.yield || 2} personen</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="recipe-search-page">
      <div className="recipe-search-hero">
        <div className="hero-text">
          <p className="breadcrumb">Home &gt; Maaltijden &gt; Recepten</p>
          <h1>Recepten zoeken</h1>
          <p className="hero-subtitle">Vind de perfecte maaltijd voor jouw doelen en voorkeuren.</p>
        </div>

        <form onSubmit={handleSubmit} className="hero-search">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Bijv. kip, quinoa, salade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              Zoeken
            </button>
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
            <button className="chip chip-outline" type="button" onClick={() => {
              setFilters({ cuisineType: '', mealType: '', diet: '', health: '', maxCalories: '', maxTime: '' });
              setSearchTerm('');
            }}>
              Alles wissen
            </button>
          </div>

          <div className="filter-group">
            <label htmlFor="cuisineType">Cuisine</label>
            <select
              id="cuisineType"
              value={filters.cuisineType}
              onChange={(e) => handleFilterChange('cuisineType', e.target.value)}
            >
              {cuisineTypes.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="mealType">Maaltijd</label>
            <select
              id="mealType"
              value={filters.mealType}
              onChange={(e) => handleFilterChange('mealType', e.target.value)}
            >
              {mealTypes.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="diet">Dieet</label>
            <div className="pill-row">
              {diets.slice(1).map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`pill ${filters.diet === option.value ? 'pill-active' : ''}`}
                  onClick={() => handleFilterChange('diet', filters.diet === option.value ? '' : option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="health">Allergieën</label>
            <select
              id="health"
              value={filters.health}
              onChange={(e) => handleFilterChange('health', e.target.value)}
            >
              {allergyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-grid">
            <div className="filter-group">
              <label htmlFor="maxCalories">Max kcal</label>
              <input
                type="number"
                id="maxCalories"
                placeholder="450"
                value={filters.maxCalories}
                onChange={(e) => handleFilterChange('maxCalories', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="maxTime">Max tijd (min)</label>
              <input
                type="number"
                id="maxTime"
                placeholder="30"
                value={filters.maxTime}
                onChange={(e) => handleFilterChange('maxTime', e.target.value)}
              />
            </div>
          </div>

          <button className="apply-btn" onClick={handleSearch} type="button">
            Filters toepassen
          </button>
        </aside>

        <section className="results-panel">
          <div className="results-header">
            <div>
              <p className="panel-kicker">Favorieten ></p>
              <h2>Resultaten</h2>
            </div>
            <span className="results-count">{resultCount} gevonden</span>
          </div>

          <div className="search-results">
            {loading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>Recepten zoeken...</p>
              </div>
            ) : (
              <>
                {searchResults.length > 0 ? (
                  <div className="recipes-grid">
                    {searchResults.map(recipe => (
                      <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    <h3>Geen recepten gevonden</h3>
                    <p>Pas je zoekterm of filters aan en probeer opnieuw.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RecipeSearchPage;
