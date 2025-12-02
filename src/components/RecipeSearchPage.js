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
    maxCalories: '',
    maxTime: ''
  });
  const [searchResults, setSearchResults] = useState([]);

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

  useEffect(() => {
    // Load initial recipes
    handleSearch();
  }, []);

  const handleSearch = async () => {
    try {
      const searchOptions = {
        query: searchTerm,
        ...filters,
        from: 0,
        to: 20
      };

      const result = await searchRecipes(searchOptions);
      if (result.success) {
        setSearchResults(result.recipes);
      } else {
        console.error('Search failed:', result.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
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
        <div className="recipe-overlay">
          <button className="btn btn-small btn-primary">View Recipe</button>
          <button className="btn btn-small btn-secondary">Add to Plan</button>
        </div>
      </div>
      
      <div className="recipe-content">
        <h3 className="recipe-title">{recipe.title}</h3>
        <p className="recipe-source">{recipe.source}</p>
        
        <div className="recipe-stats">
          <span className="stat">
            <strong>{recipe.caloriesPerServing || recipe.calories}</strong> cal
          </span>
          {recipe.prepTime && (
            <span className="stat">
              <strong>{recipe.prepTime}</strong> min
            </span>
          )}
          <span className="stat">
            <strong>{recipe.yield || 1}</strong> servings
          </span>
        </div>
        
        <div className="recipe-tags">
          {recipe.dietLabels?.slice(0, 2).map(label => (
            <span key={label} className="tag diet-tag">{label}</span>
          ))}
          {recipe.cuisineType?.slice(0, 1).map(cuisine => (
            <span key={cuisine} className="tag cuisine-tag">{cuisine}</span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="recipe-search-page">
      <div className="container">
        <div className="page-header">
          <h1>Recipe Search</h1>
          <p>Discover delicious recipes for your meal planning</p>
        </div>

        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary search-btn">
              Search
            </button>
          </div>

          <div className="filters">
            <div className="filter-group">
              <label htmlFor="cuisineType">Cuisine:</label>
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
              <label htmlFor="mealType">Meal Type:</label>
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
              <label htmlFor="diet">Diet:</label>
              <select
                id="diet"
                value={filters.diet}
                onChange={(e) => handleFilterChange('diet', e.target.value)}
              >
                {diets.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="maxCalories">Max Calories:</label>
              <input
                type="number"
                id="maxCalories"
                placeholder="e.g., 500"
                value={filters.maxCalories}
                onChange={(e) => handleFilterChange('maxCalories', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="maxTime">Max Cook Time (min):</label>
              <input
                type="number"
                id="maxTime"
                placeholder="e.g., 30"
                value={filters.maxTime}
                onChange={(e) => handleFilterChange('maxTime', e.target.value)}
              />
            </div>
          </div>
        </form>

        <div className="search-results">
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Searching recipes...</p>
            </div>
          ) : (
            <>
              <div className="results-header">
                <h2>Search Results</h2>
                <p>{searchResults.length} recipes found</p>
              </div>
              
              {searchResults.length > 0 ? (
                <div className="recipes-grid">
                  {searchResults.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <h3>No recipes found</h3>
                  <p>Try adjusting your search terms or filters</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeSearchPage;
