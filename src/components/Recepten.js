import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import recipes from '../data/recipes';
import '../styles/RecipeDetail.css';

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Find recipe by ID
    const recipeId = parseInt(id, 10);
    const foundRecipe = recipes.find(r => r.id === recipeId);
    
    if (foundRecipe) {
      setRecipe(foundRecipe);
    }
    
    setLoading(false);
  }, [id]);
  
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Recept laden...</p>
      </div>
    );
  }
  
  if (!recipe) {
    return (
      <div className="recipe-not-found">
        <h2>Recept niet gevonden</h2>
        <p>Het recept dat je zoekt bestaat niet of is verwijderd.</p>
        <Link to="/recipes" className="btn btn-primary">Terug naar recepten</Link>
      </div>
    );
  }
  
  return (
    <div className="recipe-detail-container">
      <div className="recipe-detail-header">
        <Link to="/recipes" className="back-link">
          <i className="fas fa-arrow-left"></i> Terug naar recepten
        </Link>
        <div className="recipe-header-content">
          <h1>{recipe.title}</h1>
          <p className="recipe-description">{recipe.description}</p>
        </div>
      </div>
      
      <div className="recipe-detail-main">
        <div className="recipe-image-large">
          <img 
            src={recipe.imageUrl} 
            alt={recipe.title} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/recipes/default-recipe.jpg';
            }}
          />
          <button className="recipe-favorite-btn">
            <i className="far fa-heart"></i>
          </button>
        </div>
        
        <div className="recipe-info-card">
          <div className="recipe-info-item">
            <i className="fas fa-fire"></i>
            <div>
              <span className="info-value">{recipe.calories}</span>
              <span className="info-label">Calorieën</span>
            </div>
          </div>
          
          <div className="recipe-info-item">
            <i className="far fa-clock"></i>
            <div>
              <span className="info-value">{recipe.prepTime}</span>
              <span className="info-label">Minuten</span>
            </div>
          </div>
          
          <div className="recipe-info-item">
            <i className="fas fa-utensils"></i>
            <div>
              <span className="info-value">4</span>
              <span className="info-label">Porties</span>
            </div>
          </div>
          
          <div className="recipe-info-item">
            <i className="fas fa-star"></i>
            <div>
              <span className="info-value">4.8</span>
              <span className="info-label">Beoordeling</span>
            </div>
          </div>
        </div>
        
        <div className="recipe-detail-section">
          <h2>Voedingswaarden</h2>
          <div className="nutrition-macros">
            {recipe.macros && Object.entries(recipe.macros).map(([key, value]) => (
              <div className="macro-detail" key={key}>
                <div className="macro-header">
                  <h3>{key}</h3>
                  <span>{value.grams}g</span>
                </div>
                <div className="macro-bar">
                  <div 
                    className={`macro-fill macro-${key.toLowerCase()}`}
                    style={{ width: `${value.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="recipe-detail-section">
          <h2>Bereidingswijze</h2>
          <ol className="preparation-steps">
            {recipe.steps && recipe.steps.map((step, index) => (
              <li key={index} className="preparation-step">
                {step}
              </li>
            ))}
          </ol>
        </div>
        
        <div className="recipe-detail-section">
          <h2>Ingrediënten</h2>
          <ul className="ingredients-list">
            {recipe.ingredients && recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="ingredient-item">
                {ingredient}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;