import React, { useEffect, useState } from 'react';
import { useRecipes } from '../contexts/RecipeContext';
import '../styles/RecipeSearch.css';

const RecipeSearchPage = () => {
  const { searchRecipes, searchResults, loading, error, setSearchQuery, clearSearchResults, filters, updateFiltersAndSearch } = useRecipes();
  const mealTypeOptions = ['', 'breakfast', 'lunch', 'dinner', 'snack', 'teatime'];
  const dietOptions = ['', 'balanced', 'high-fiber', 'high-protein', 'low-carb', 'low-fat', 'low-sodium'];
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Auto-load initial recipes (fallback dataset)
    searchRecipes('');

    return () => {
      clearSearchResults();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSearchQuery(query);
    await searchRecipes(query, filters);
  };

  return (
    <div className="page recipe-search-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Recepten zoeken</h1>
          <p className="page-subtitle">Zoek gezonde en lekkere recepten op basis van je voorkeuren.</p>
        </div>
        <form onSubmit={onSubmit} className="inline-search-form" role="search" aria-label="Zoek recepten">
          <input
            type="text"
            className="search-input"
            placeholder="Bijv. kip, quinoa, salade..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Zoekterm"
          />
          <button type="submit" className="search-button" disabled={loading}>Zoeken</button>
        </form>
      </div>

      <div className="layout-panels">
        <div className="panel filters-panel modern">
          <h2 className="panel-title">Filters</h2>
          <div className="filters-grid">
            <div className="filter-item">
              <label htmlFor="mealType">Maaltijd</label>
              <select id="mealType" value={filters.mealType} onChange={(e)=> updateFiltersAndSearch({ mealType: e.target.value })}>
                {mealTypeOptions.map(opt => <option key={opt} value={opt}>{opt || 'Alle'}</option>)}
              </select>
            </div>
            <div className="filter-item">
              <label htmlFor="diet">Dieet</label>
              <select id="diet" value={filters.diet} onChange={(e)=> updateFiltersAndSearch({ diet: e.target.value })}>
                {dietOptions.map(opt => <option key={opt} value={opt}>{opt || 'Alle'}</option>)}
              </select>
            </div>
            <div className="filter-item">
              <label htmlFor="maxCalories">Max kcal</label>
              <select id="maxCalories" value={filters.maxCalories || ''} onChange={(e)=> updateFiltersAndSearch({ maxCalories: e.target.value })}>
                <option value="">Geen</option>
                <option value="300">300</option>
                <option value="500">500</option>
                <option value="700">700</option>
                <option value="900">900</option>
              </select>
            </div>
            <div className="filter-item">
              <label htmlFor="time">Max tijd (min)</label>
              <select id="time" value={filters.time} onChange={(e)=> updateFiltersAndSearch({ time: e.target.value })}>
                <option value="">Alle</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45</option>
                <option value="60">60</option>
              </select>
            </div>
            <div className="filter-item full-row">
              <button type="button" className="clear-filters-btn" disabled={loading || (!filters.mealType && !filters.diet && !filters.maxCalories && !filters.time)} onClick={()=> updateFiltersAndSearch({ mealType:'', diet:'', maxCalories:'', time:'' })}>Wis filters</button>
            </div>
          </div>
        </div>

        <div className="panel results-panel">
          <div className="results-header">
            <h2 className="panel-title">Resultaten</h2>
            {searchResults && <span className="results-count">{searchResults.length} gevonden</span>}
          </div>

            {error && <div className="error-container">{error}</div>}
            {loading && <div className="loading-container"><div className="loading-spinner" /></div>}

            {!loading && !error && (
              <div>
                {searchResults && searchResults.length > 0 ? (
                  <div className="recipes-grid">
                    {searchResults.map(r => (
                      <div key={r.id} className="recipe-card" tabIndex={0} aria-label={`Recept ${r.title}`}>
                        <img src={r.image} alt={r.title} className="recipe-image" />
                        <div className="recipe-content">
                          <h3 className="recipe-title">{r.title}</h3>
                          <div className="recipe-meta">
                            <span className="recipe-calories">{r.caloriesPerServing} kcal</span>
                            {(r.totalTime || r.prepTime) && <span className="recipe-time">{r.totalTime || r.prepTime} min</span>}
                            {r._fallback && <span className="recipe-badge offline" title="Lokale dataset">Offline</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">Geen resultaten. Probeer een andere zoekterm.</div>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default RecipeSearchPage;
