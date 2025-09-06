import React, { useEffect, useState } from 'react';
import { useRecipes } from '../contexts/RecipeContext';
import '../styles/RecipeSearch.css';

const RecipeSearchPage = () => {
  const { searchRecipes, searchResults, loading, error, setSearchQuery, clearSearchResults } = useRecipes();
  const [query, setQuery] = useState('');

  useEffect(() => {
    return () => clearSearchResults();
  }, [clearSearchResults]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSearchQuery(query);
    await searchRecipes(query);
  };

  return (
    <div className="recipe-search-page">
      <h1>Recepten</h1>
      <form onSubmit={onSubmit} className="recipe-search-form">
        <input
          type="text"
          placeholder="Zoek naar recepten..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={loading}>Zoeken</button>
      </form>

      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Bezig met zoeken...</div>}

      <div className="recipe-results">
        {searchResults && searchResults.length > 0 ? (
          <ul className="recipe-list">
            {searchResults.map(r => (
              <li key={r.id} className="recipe-item">
                <img src={r.image} alt={r.title} />
                <div className="recipe-meta">
                  <h3>{r.title}</h3>
                  <p>{r.caloriesPerServing} kcal / portie</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          !loading && <p className="empty-state">Geen resultaten</p>
        )}
      </div>
    </div>
  );
};

export default RecipeSearchPage;
