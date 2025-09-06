import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import recipesData from '../data/recipes';
import '../styles/Recipes.css';

const Recipes = () => {
  const [recipes, setRecipes] = useState(recipesData);
  const [filteredRecipes, setFilteredRecipes] = useState(recipesData);
  const [activeFilters, setActiveFilters] = useState({
    search: '',
    calories: '',
    dietLabels: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 6;
  const [calorieFilter, setCalorieFilter] = useState(null);
  const [sortBy, setSortBy] = useState('standaard');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setRecipes(recipesData);
    setFilteredRecipes(recipesData);
  }, [recipesData]);

  const applyFilters = useCallback(() => {
    let filtered = [...recipes];

    // Search filter
    if (activeFilters.search) {
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(activeFilters.search.toLowerCase())
      );
    }

    // Calories filter
    if (activeFilters.calories) {
      const maxCalories = parseInt(activeFilters.calories);
      filtered = filtered.filter(recipe => recipe.calories <= maxCalories);
    }

    // Diet filters
    if (activeFilters.dietLabels && activeFilters.dietLabels.length > 0) {
      filtered = filtered.filter(recipe => 
        activeFilters.dietLabels.some(label => recipe.dietLabels.includes(label))
      );
    }

    setFilteredRecipes(filtered);
    setCurrentPage(1);
  }, [recipes, activeFilters]);

  useEffect(() => {
    applyFilters();
  }, [activeFilters, applyFilters]);

  const handleFilterChange = (filterKey, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const isDietFilterActive = (dietLabel) => {
    return activeFilters.dietLabels && activeFilters.dietLabels.includes(dietLabel);
  };

  // Filter recipes by calories
  const filterByCalories = (recipe) => {
    if (!calorieFilter) return true;
    if (calorieFilter === 300) return recipe.calories <= 300;
    if (calorieFilter === 500) return recipe.calories <= 500 && recipe.calories > 300;
    if (calorieFilter === 900) return recipe.calories >= 500;
    return true;
  };

  // Filter recipes by search query
  const filterBySearch = (recipe) => {
    if (!searchQuery) return true;
    return recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
  };

  // Sort recipes
  const sortRecipes = (a, b) => {
    switch (sortBy) {
      case 'calorieën':
        return a.calories - b.calories;
      case 'bereidingstijd':
        return a.prepTime - b.prepTime;
      case 'eiwitten':
        return b.macros.Eiwitten.grams - a.macros.Eiwitten.grams;
      default:
        return 0;
    }
  };

  // Apply filters and sorting
  const filteredAndSortedRecipes = filteredRecipes
    .filter(filterByCalories)
    .filter(filterBySearch)
    .sort(sortRecipes);
    
  // Calculate total of filtered recipes
  const totalFilteredRecipes = filteredAndSortedRecipes.length;

  // Pagination
  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = filteredAndSortedRecipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
  const totalPages = Math.ceil(filteredAndSortedRecipes.length / recipesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="recipes-page">
      {/* Main Content Area */}
      <div className="recipes-content">
        {/* Header Section */}
        <div className="recipes-header">
          <h1 className="recipes-title">Zoek je favoriete recepten!</h1>
          <p className="recipes-subtitle">Vind gezonde recepten die bij jouw dieet passen.</p>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Zoeken..." 
            value={activeFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <button className="search-button">Zoek</button>
        </div>

        {/* Recipes Grid - 3x2 layout as shown in the design */}
        <div className="recipes-grid">
          {currentRecipes.length > 0 ? (
            currentRecipes.map((recipe) => (
              <div key={recipe.id} className="recipe-card">
                <div className="recipe-image-container">
                  <img 
                    src={recipe.imageUrl} 
                    alt={recipe.title}
                    className="recipe-image" 
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = 'https://via.placeholder.com/300x200?text=Recept'; 
                    }}
                  />
                  <button className="recipe-favorite-btn">
                    <i className="far fa-heart"></i>
                  </button>
                </div>
                
                <div className="recipe-content">
                  <h3 className="recipe-title">{recipe.title}</h3>
                  <p className="recipe-description">{recipe.description}</p>
                  <div className="recipe-meta">
                    <span className="recipe-calories">
                      <i className="fas fa-fire"></i> {recipe.calories} kcal
                    </span>
                    <span className="recipe-time">
                      <i className="far fa-clock"></i> {recipe.prepTime} min
                    </span>
                  </div>
                  <div className="recipe-macros">
                    {recipe.macros && Object.entries(recipe.macros).map(([key, value]) => (
                      <div className="macro-item" key={key}>
                        <span className="macro-label">{key}</span>
                        <div className="macro-bar">
                          <div 
                            className={`macro-fill macro-${key.toLowerCase()}`}
                            style={{ width: `${value.percentage}%` }}
                          ></div>
                        </div>
                        <span className="macro-value">{value.grams}g</span>
                      </div>
                    ))}
                  </div>
                  <div className="recipe-actions">
                    <Link to={`/recipes/${recipe.id}`} className="btn btn-primary">
                      Bekijk recept
                    </Link>
                    <button className="btn btn-secondary">
                      Genereer alternatieven
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-recipes">
              <p>Geen recepten gevonden die voldoen aan je criteria. Probeer andere filters.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  className={`page-number ${currentPage === number ? 'active' : ''}`}
                  onClick={() => paginate(number)}
                >
                  {number}
                </button>
              ))}
              <span>...</span>
            </div>
            <div className="pagination-text">Volgende Pagina</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipes;