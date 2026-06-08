import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { edamamService } from '../services/edamamService';
import { storage } from '../utils/localStorage';

const initialState = {
  favorites: [],
  searchResults: [],
  currentRecipe: null,
  loading: false,
  error: '',
  nextPageUrl: '',
  totalResults: 0
};

const RECIPE_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_RESULTS: 'SET_RESULTS',
  APPEND_RESULTS: 'APPEND_RESULTS',
  SET_CURRENT_RECIPE: 'SET_CURRENT_RECIPE',
  LOAD_FAVORITES: 'LOAD_FAVORITES',
  ADD_TO_FAVORITES: 'ADD_TO_FAVORITES',
  REMOVE_FROM_FAVORITES: 'REMOVE_FROM_FAVORITES',
  CLEAR_SEARCH_RESULTS: 'CLEAR_SEARCH_RESULTS'
};

const markFavorites = (recipes, favorites) => (
  recipes.map((recipe) => ({
    ...recipe,
    isFavorite: favorites.some((favorite) => favorite.id === recipe.id)
  }))
);

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
        error: ''
      };

    case RECIPE_ACTIONS.SET_RESULTS:
      return {
        ...state,
        searchResults: action.payload.recipes,
        totalResults: action.payload.totalResults,
        nextPageUrl: action.payload.nextPageUrl,
        loading: false,
        error: ''
      };

    case RECIPE_ACTIONS.APPEND_RESULTS:
      return {
        ...state,
        searchResults: [...state.searchResults, ...action.payload.recipes],
        totalResults: action.payload.totalResults,
        nextPageUrl: action.payload.nextPageUrl,
        loading: false,
        error: ''
      };

    case RECIPE_ACTIONS.SET_CURRENT_RECIPE:
      return {
        ...state,
        currentRecipe: action.payload,
        loading: false,
        error: ''
      };

    case RECIPE_ACTIONS.LOAD_FAVORITES:
      return {
        ...state,
        favorites: action.payload
      };

    case RECIPE_ACTIONS.ADD_TO_FAVORITES:
      return {
        ...state,
        favorites: [...state.favorites, action.payload],
        searchResults: state.searchResults.map((recipe) => (
          recipe.id === action.payload.id ? { ...recipe, isFavorite: true } : recipe
        ))
      };

    case RECIPE_ACTIONS.REMOVE_FROM_FAVORITES:
      return {
        ...state,
        favorites: state.favorites.filter((recipe) => recipe.id !== action.payload),
        searchResults: state.searchResults.map((recipe) => (
          recipe.id === action.payload ? { ...recipe, isFavorite: false } : recipe
        ))
      };

    case RECIPE_ACTIONS.CLEAR_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: [],
        totalResults: 0,
        nextPageUrl: '',
        error: ''
      };

    default:
      return state;
  }
};

const RecipeContext = createContext();

export const RecipeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(recipeReducer, initialState);

  useEffect(() => {
    const favorites = storage.getFavorites() || [];
    dispatch({
      type: RECIPE_ACTIONS.LOAD_FAVORITES,
      payload: favorites
    });
  }, []);

  const runRecipeRequest = async (request, { append = false } = {}) => {
    dispatch({ type: RECIPE_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: RECIPE_ACTIONS.CLEAR_ERROR });

    const result = await request();

    if (!result.success) {
      dispatch({
        type: RECIPE_ACTIONS.SET_ERROR,
        payload: result.error
      });
      return result;
    }

    const recipesWithFavorites = markFavorites(result.recipes, state.favorites);

    dispatch({
      type: append ? RECIPE_ACTIONS.APPEND_RESULTS : RECIPE_ACTIONS.SET_RESULTS,
      payload: {
        recipes: recipesWithFavorites,
        totalResults: result.totalResults,
        nextPageUrl: result.nextPageUrl
      }
    });

    return {
      ...result,
      recipes: recipesWithFavorites
    };
  };

  const searchRecipes = (query, filters) => (
    runRecipeRequest(() => edamamService.searchRecipes(query, filters))
  );

  const getRecipesByDiet = (diet) => (
    runRecipeRequest(() => edamamService.getRecipesByDiet(diet))
  );

  const getRecipesByMealType = (mealType) => (
    runRecipeRequest(() => edamamService.getRecipesByMealType(mealType))
  );

  const getRecipesByHealthLabel = (healthLabel) => (
    runRecipeRequest(() => edamamService.getRecipesByHealthLabel(healthLabel))
  );

  const getHighProteinRecipes = () => (
    runRecipeRequest(() => edamamService.getHighProteinRecipes())
  );

  const getLowCalorieRecipes = () => (
    runRecipeRequest(() => edamamService.getLowCalorieRecipes())
  );

  const loadMoreRecipes = () => (
    runRecipeRequest(() => edamamService.getNextRecipesPage(state.nextPageUrl), { append: true })
  );

  const getRecipeById = async (recipeId) => {
    dispatch({ type: RECIPE_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: RECIPE_ACTIONS.CLEAR_ERROR });

    const localRecipe = [...state.searchResults, ...state.favorites]
      .find((recipe) => recipe.id === recipeId);

    if (localRecipe) {
      dispatch({
        type: RECIPE_ACTIONS.SET_CURRENT_RECIPE,
        payload: localRecipe
      });
      return { success: true, recipe: localRecipe };
    }

    dispatch({
      type: RECIPE_ACTIONS.SET_ERROR,
      payload: 'Recept niet gevonden in de huidige resultaten.'
    });

    return { success: false, error: 'Recept niet gevonden in de huidige resultaten.' };
  };

  const getRecipeDetails = async (recipeUrlOrUri) => {
    dispatch({ type: RECIPE_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: RECIPE_ACTIONS.CLEAR_ERROR });

    const result = await edamamService.getRecipeDetails(recipeUrlOrUri);

    if (!result.success) {
      dispatch({
        type: RECIPE_ACTIONS.SET_ERROR,
        payload: result.error
      });
      return result;
    }

    dispatch({
      type: RECIPE_ACTIONS.SET_CURRENT_RECIPE,
      payload: result.recipe
    });

    return result;
  };

  const getPersonalizedRecipes = (userProfile) => (
    runRecipeRequest(() => edamamService.getPersonalizedRecipes(userProfile))
  );

  const getAlternativeRecipes = async (originalRecipe, count = 3) => (
    edamamService.getAlternativeRecipes(originalRecipe, count)
  );

  const addToFavorites = (recipe) => {
    const updatedRecipe = { ...recipe, isFavorite: true };
    storage.addToFavorites(updatedRecipe);

    dispatch({
      type: RECIPE_ACTIONS.ADD_TO_FAVORITES,
      payload: updatedRecipe
    });

    return { success: true };
  };

  const removeFromFavorites = (recipeId) => {
    storage.removeFromFavorites(recipeId);

    dispatch({
      type: RECIPE_ACTIONS.REMOVE_FROM_FAVORITES,
      payload: recipeId
    });

    return { success: true };
  };

  const toggleFavorite = (recipe) => (
    recipe.isFavorite ? removeFromFavorites(recipe.id) : addToFavorites(recipe)
  );

  const clearSearchResults = () => {
    dispatch({ type: RECIPE_ACTIONS.CLEAR_SEARCH_RESULTS });
  };

  const clearError = () => {
    dispatch({ type: RECIPE_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    searchRecipes,
    getRecipesByDiet,
    getRecipesByMealType,
    getRecipesByHealthLabel,
    getHighProteinRecipes,
    getLowCalorieRecipes,
    getRecipeDetails,
    getRecipeById,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    getPersonalizedRecipes,
    getAlternativeRecipes,
    loadMoreRecipes,
    clearSearchResults,
    clearError
  };

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
};

export default RecipeContext;
