import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storage } from '../utils/localStorage';
import { notificationService } from '../utils/notificationService';
import '../styles/Favorieten.css';

const Favorieten = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    setLoading(true);
    try {
      const savedFavorites = storage.getFavorites();
      setFavorites(savedFavorites || []);
      setError(null);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setError('Er is een fout opgetreden bij het laden van je favorieten');
      notificationService.error('Fout bij laden favorieten', error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = (recipeId) => {
    try {
      storage.removeFromFavorites(recipeId);
      setFavorites(favorites.filter(recipe => recipe.id !== recipeId));
      notificationService.success('Verwijderd uit favorieten');
    } catch (error) {
      console.error('Error removing from favorites:', error);
      notificationService.error('Fout bij verwijderen uit favorieten', error.message);
    }
  };

  const viewRecipeDetails = (recipe) => {
    navigate(`/recept/${recipe.id}`, { state: { recipe } });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Favorieten laden...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={loadFavorites} className="retry-button">Probeer opnieuw</button>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h1>Jouw Favorieten</h1>
        <p className="favorites-subtitle">
          {favorites.length > 0 
            ? `Je hebt ${favorites.length} recepten in je favorieten` 
            : 'Je hebt nog geen favorieten recepten'}
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          <h3>Nog geen favorieten</h3>
          <p>Voeg recepten toe aan je favorieten om ze hier terug te vinden.</p>
          <Link to="/recepten" className="browse-recipes-btn">
            Bekijk recepten
          </Link>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map(recipe => (
            <div key={recipe.id} className="favorite-card">
              <div className="favorite-image-container">
                <img 
                  src={recipe.image || "https://source.unsplash.com/random/300x200/?food"} 
                  alt={recipe.name} 
                  className="favorite-image" 
                />
              </div>
              <div className="favorite-details">
                <h3>{recipe.name}</h3>
                <p>{recipe.ingredients} ingrediënten</p>
                <div className="favorite-actions">
                  <button 
                    className="view-recipe-btn" 
                    onClick={() => viewRecipeDetails(recipe)}
                  >
                    Bekijk Recept
                  </button>
                  <button 
                    className="remove-favorite-btn" 
                    onClick={() => removeFromFavorites(recipe.id)}
                  >
                    Verwijder uit Favorieten
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorieten;