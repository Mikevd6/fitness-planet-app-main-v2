import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { edamamService } from '../services/edamamService';
import { storage } from '../utils/localStorage';

// Initial state
const initialState = {
  recipes: [],
  favorites: [],
  searchResults: [],
  currentRecipe: null,
  searchQuery: '',
  filters: {
    cuisineType: '',
    mealType: '',
    diet: '',
    health: '',
    calories: '',
    time: ''
  },
  loading: false,
  error: null,
  pagination: {
    from: 0,
    to: 20,
    total: 0
  }
};

// Action types
const RECIPE_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTERS: 'SET_FILTERS',
  SEARCH_RECIPES_SUCCESS: 'SEARCH_RECIPES_SUCCESS',
  SEARCH_RECIPES_FAILURE: 'SEARCH_RECIPES_FAILURE',
  SET_CURRENT_RECIPE: 'SET_CURRENT_RECIPE',
  LOAD_FAVORITES: 'LOAD_FAVORITES',
  ADD_TO_FAVORITES: 'ADD_TO_FAVORITES',
  REMOVE_FROM_FAVORITES: 'REMOVE_FROM_FAVORITES',
  CLEAR_SEARCH_RESULTS: 'CLEAR_SEARCH_RESULTS',
  SET_PAGINATION: 'SET_PAGINATION'
};

// Reducer function
const recipeReducer = (state, action) => {
  switch (action.type) {
    case RECIPE_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case RECIPE_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case RECIPE_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case RECIPE_ACTIONS.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload
      };

    case RECIPE_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      };

    case RECIPE_ACTIONS.SEARCH_RECIPES_SUCCESS:
      return {
        ...state,
        searchResults: action.payload.recipes,
        pagination: {
          from: action.payload.from,
          to: action.payload.to,
          total: action.payload.totalResults
        },
        loading: false,
        error: null
      };

    case RECIPE_ACTIONS.SEARCH_RECIPES_FAILURE:
      return {
        ...state,
        searchResults: [],
        loading: false,
        error: action.payload
      };

    case RECIPE_ACTIONS.SET_CURRENT_RECIPE:
      return {
        ...state,
        currentRecipe: action.payload
      };

    case RECIPE_ACTIONS.LOAD_FAVORITES:
      return {
        ...state,
        favorites: action.payload
      };

    case RECIPE_ACTIONS.ADD_TO_FAVORITES:
      const newFavorites = [...state.favorites, action.payload];
      return {
        ...state,
        favorites: newFavorites,
        searchResults: state.searchResults.map(recipe =>
          recipe.id === action.payload.id
            ? { ...recipe, isFavorite: true }
            : recipe
        )
      };

    case RECIPE_ACTIONS.REMOVE_FROM_FAVORITES:
      const filteredFavorites = state.favorites.filter(
        recipe => recipe.id !== action.payload
      );
      return {
        ...state,
        favorites: filteredFavorites,
        searchResults: state.searchResults.map(recipe =>
          recipe.id === action.payload
            ? { ...recipe, isFavorite: false }
            : recipe
        )
      };

    case RECIPE_ACTIONS.CLEAR_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: [],
        searchQuery: '',
        pagination: {
          from: 0,
          to: 20,
          total: 0
        }
      };

    case RECIPE_ACTIONS.SET_PAGINATION:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...action.payload
        }
      };

    default:
      return state;
  }
};

// Create context
const RecipeContext = createContext();

// Recipe provider component
export const RecipeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(recipeReducer, initialState);

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  // Load favorites from localStorage
  const loadFavorites = () => {
    try {
      const favorites = storage.getFavorites() || [];
      dispatch({
        type: RECIPE_ACTIONS.LOAD_FAVORITES,
        payload: favorites
      });
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Search recipes with current filters
  const searchRecipes = async (query = state.searchQuery, filters = state.filters, pagination = state.pagination) => {
    dispatch({ type: RECIPE_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: RECIPE_ACTIONS.CLEAR_ERROR });

    try {
      const searchOptions = {
        query,
        ...filters,
        from: pagination.from,
        to: pagination.to
      };

      const result = await edamamService.searchRecipes(searchOptions);

      if (result.success) {
        // Mark favorites in search results
        const recipesWithFavorites = result.recipes.map(recipe => ({
          ...recipe,
          isFavorite: state.favorites.some(fav => fav.id === recipe.id)
        }));

        dispatch({
          type: RECIPE_ACTIONS.SEARCH_RECIPES_SUCCESS,
          payload: {
            recipes: recipesWithFavorites,
            from: result.from,
            to: result.to,
            totalResults: result.totalResults
          }
        });

        return { success: true, recipes: recipesWithFavorites };
      } else {
        dispatch({
          type: RECIPE_ACTIONS.SEARCH_RECIPES_FAILURE,
          payload: result.error
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      dispatch({
        type: RECIPE_ACTIONS.SEARCH_RECIPES_FAILURE,
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  };

  // Set search query
  const setSearchQuery = (query) => {
    dispatch({
      type: RECIPE_ACTIONS.SET_SEARCH_QUERY,
      payload: query
    });
  };

  // Set filters
  const setFilters = (newFilters) => {
    dispatch({
      type: RECIPE_ACTIONS.SET_FILTERS,
      payload: newFilters
    });
  };

  // Clear search results
  const clearSearchResults = () => {
    dispatch({ type: RECIPE_ACTIONS.CLEAR_SEARCH_RESULTS });
  };

  // Get recipe by ID
  const getRecipeById = async (recipeId) => {
    dispatch({ type: RECIPE_ACTIONS.SET_LOADING, payload: true });

    try {
      // First check if recipe is in favorites
      const favoriteRecipe = state.favorites.find(recipe => recipe.id === recipeId);
      if (favoriteRecipe) {
        dispatch({
          type: RECIPE_ACTIONS.SET_CURRENT_RECIPE,
          payload: favoriteRecipe
        });
        dispatch({ type: RECIPE_ACTIONS.SET_LOADING, payload: false });
        return { success: true, recipe: favoriteRecipe };
      }

      // Check in search results
      const searchRecipe = state.searchResults.find(recipe => recipe.id === recipeId);
      if (searchRecipe) {
        dispatch({
          type: RECIPE_ACTIONS.SET_CURRENT_RECIPE,
          payload: searchRecipe
        });
        dispatch({ type: RECIPE_ACTIONS.SET_LOADING, payload: false });
        return { success: true, recipe: searchRecipe };
      }

      // If not found locally, could implement API call here
      dispatch({ type: RECIPE_ACTIONS.SET_LOADING, payload: false });
      return { success: false, error: 'Recipe not found' };
    } catch (error) {
      dispatch({
        type: RECIPE_ACTIONS.SET_ERROR,
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  };

  // Add recipe to favorites
  const addToFavorites = (recipe) => {
    try {
      const updatedRecipe = { ...recipe, isFavorite: true };
      storage.addToFavorites(updatedRecipe);
      
      dispatch({
        type: RECIPE_ACTIONS.ADD_TO_FAVORITES,
        payload: updatedRecipe
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: RECIPE_ACTIONS.SET_ERROR,
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  };

  // Remove recipe from favorites
  const removeFromFavorites = (recipeId) => {
    try {
      storage.removeFromFavorites(recipeId);
      
      dispatch({
        type: RECIPE_ACTIONS.REMOVE_FROM_FAVORITES,
        payload: recipeId
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: RECIPE_ACTIONS.SET_ERROR,
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  };

  // Toggle favorite status
  const toggleFavorite = (recipe) => {
    if (recipe.isFavorite) {
      return removeFromFavorites(recipe.id);
    } else {
      return addToFavorites(recipe);
    }
  };

  // Get personalized recipes based on user profile
  const getPersonalizedRecipes = async (userProfile) => {
    dispatch({ type: RECIPE_ACTIONS.SET_LOADING, payload: true });

    try {
      const result = await edamamService.getPersonalizedRecipes(userProfile);
      
      if (result.success) {
        const recipesWithFavorites = result.recipes.map(recipe => ({
          ...recipe,
          isFavorite: state.favorites.some(fav => fav.id === recipe.id)
        }));

        dispatch({
          type: RECIPE_ACTIONS.SEARCH_RECIPES_SUCCESS,
          payload: {
            recipes: recipesWithFavorites,
            from: 0,
            to: recipesWithFavorites.length,
            totalResults: recipesWithFavorites.length
          }
        });

        return { success: true, recipes: recipesWithFavorites };
      } else {
        dispatch({
          type: RECIPE_ACTIONS.SEARCH_RECIPES_FAILURE,
          payload: result.error
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      dispatch({
        type: RECIPE_ACTIONS.SEARCH_RECIPES_FAILURE,
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  };

  // Get alternative recipes
  const getAlternativeRecipes = async (originalRecipe, count = 3) => {
    try {
      const result = await edamamService.getAlternativeRecipes(originalRecipe, count);
      
      if (result.success) {
        const recipesWithFavorites = result.recipes.map(recipe => ({
          ...recipe,
          isFavorite: state.favorites.some(fav => fav.id === recipe.id)
        }));

        return { success: true, recipes: recipesWithFavorites };
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Load more recipes (pagination)
  const loadMoreRecipes = async () => {
    if (state.loading || state.pagination.to >= state.pagination.total) {
      return { success: false, message: 'No more recipes to load' };
    }

    const newPagination = {
      ...state.pagination,
      from: state.pagination.to,
      to: state.pagination.to + 20
    };

    dispatch({
      type: RECIPE_ACTIONS.SET_PAGINATION,
      payload: newPagination
    });

    return await searchRecipes(state.searchQuery, state.filters, newPagination);
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: RECIPE_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    ...state,
    searchRecipes,
    setSearchQuery,
    setFilters,
    clearSearchResults,
    getRecipeById,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    getPersonalizedRecipes,
    getAlternativeRecipes,
    loadMoreRecipes,
    clearError,
    loadFavorites
  };

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
};

// Custom hook to use recipe context
export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
};

export default RecipeContext;
