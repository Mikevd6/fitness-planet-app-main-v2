import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import recipes from '../data/recipes';
import '../styles/RecipeDetails.css';

const RecipeDetails = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Find the recipe by id
    const recipeId = parseInt(id, 10);
    const foundRecipe = recipes.find(r => r.id === recipeId);
    
    // Simulate API call
    setTimeout(() => {
      setRecipe(foundRecipe);
      setLoading(false);
    }, 300);
  }, [id]);
  
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Recept wordt geladen...</p>
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
    <div className="recipe-detail">
      <div className="recipe-detail-header">
        <Link to="/recipes" className="back-link">
          <i className="fas fa-arrow-left"></i> Terug naar recepten
        </Link>
        <h1>{recipe.title}</h1>
        <div className="recipe-meta">
          <span className="recipe-calories">
            <i className="fas fa-fire"></i> {recipe.calories} kcal
          </span>
          <span className="recipe-time">
            <i className="far fa-clock"></i> {recipe.prepTime} min
          </span>
        </div>
      </div>
      
      <div className="recipe-detail-content">
        <div className="recipe-detail-image-container">
          <img 
            src={recipe.imageUrl} 
            alt={recipe.title} 
            className="recipe-detail-image" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/recipes/default-recipe.jpg';
            }}
          />
          <button className="recipe-favorite-btn">
            <i className="far fa-heart"></i>
          </button>
        </div>
        
        <div className="recipe-detail-info">
          <div className="recipe-description">
            <h2>Beschrijving</h2>
            <p>{recipe.description}</p>
          </div>
          
          <div className="recipe-nutrition">
            <h2>Voedingswaarden</h2>
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
          </div>
          
          <div className="recipe-ingredients">
            <h2>Ingrediënten</h2>
            <ul>
              {recipe.ingredients ? (
                recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))
              ) : (
                // Sample ingredients if not provided in data
                <>
                  <li>300g hoofdingrediënt</li>
                  <li>2 eetlepels olijfolie</li>
                  <li>1 ui, fijngesneden</li>
                  <li>2 teentjes knoflook</li>
                  <li>Zout en peper naar smaak</li>
                  <li>Verse kruiden (naar keuze)</li>
                </>
              )}
            </ul>
          </div>
          
          <div className="recipe-instructions">
            <h2>Bereidingswijze</h2>
            <ol>
              {recipe.instructions ? (
                recipe.instructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))
              ) : (
                // Sample instructions if not provided in data
                <>
                  <li>Verwarm de oven voor op 180°C.</li>
                  <li>Bereid alle ingrediënten voor zoals aangegeven.</li>
                  <li>Verhit olie in een pan en fruit de ui en knoflook tot ze glazig zijn.</li>
                  <li>Voeg het hoofdingrediënt toe en bak volgens aangegeven tijd.</li>
                  <li>Breng op smaak met zout, peper en kruiden naar keuze.</li>
                  <li>Serveer warm en geniet van je maaltijd!</li>
                </>
              )}
            </ol>
          </div>
        </div>
      </div>
      
      <div className="recipe-actions">
        <button className="btn btn-primary">
          <i className="fas fa-print"></i> Print Recept
        </button>
        <button className="btn btn-secondary">
          <i className="fas fa-share-alt"></i> Delen
        </button>
        <button className="btn btn-secondary">
          <i className="fas fa-edit"></i> Aanpassen
        </button>
      </div>
    </div>
  );
};

export default RecipeDetails;