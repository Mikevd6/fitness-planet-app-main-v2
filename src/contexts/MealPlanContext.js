import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { storage } from '../utils/localStorage';

// Initial state
const initialState = {
  weekMenu: {},
  savedMenus: [],
  currentMenu: null,
  shoppingList: [],
  nutritionSummary: {},
  mealPlanSettings: {
    calorieGoal: 2000,
    macroTargets: {
      protein: 150,
      carbs: 200,
      fat: 67
    },
    dietPreferences: [],
    allergens: [],
    mealCount: 3
  },
  loading: false,
  error: null
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_WEEK_MENU: 'SET_WEEK_MENU',
  SET_SAVED_MENUS: 'SET_SAVED_MENUS',
  SET_CURRENT_MENU: 'SET_CURRENT_MENU',
  SET_SHOPPING_LIST: 'SET_SHOPPING_LIST',
  SET_NUTRITION_SUMMARY: 'SET_NUTRITION_SUMMARY',
  UPDATE_MEAL_PLAN_SETTINGS: 'UPDATE_MEAL_PLAN_SETTINGS',
  ADD_RECIPE_TO_DAY: 'ADD_RECIPE_TO_DAY',
  REMOVE_RECIPE_FROM_DAY: 'REMOVE_RECIPE_FROM_DAY',
  SAVE_MENU: 'SAVE_MENU',
  LOAD_MENU: 'LOAD_MENU',
  CLEAR_WEEK_MENU: 'CLEAR_WEEK_MENU'
};

// Reducer function
function mealPlanReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    case actionTypes.SET_WEEK_MENU:
      return { ...state, weekMenu: action.payload };
    case actionTypes.SET_SAVED_MENUS:
      return { ...state, savedMenus: action.payload };
    case actionTypes.SET_CURRENT_MENU:
      return { ...state, currentMenu: action.payload };
    case actionTypes.SET_SHOPPING_LIST:
      return { ...state, shoppingList: action.payload };
    case actionTypes.SET_NUTRITION_SUMMARY:
      return { ...state, nutritionSummary: action.payload };
    case actionTypes.UPDATE_MEAL_PLAN_SETTINGS:
      return { 
        ...state, 
        mealPlanSettings: { ...state.mealPlanSettings, ...action.payload }
      };
    case actionTypes.ADD_RECIPE_TO_DAY:
      const { day, mealType, recipe } = action.payload;
      return {
        ...state,
        weekMenu: {
          ...state.weekMenu,
          [day]: {
            ...state.weekMenu[day],
            [mealType]: [
              ...(state.weekMenu[day]?.[mealType] || []),
              recipe
            ]
          }
        }
      };
    case actionTypes.REMOVE_RECIPE_FROM_DAY:
      const { day: removeDay, mealType: removeMealType, index: removeIndex } = action.payload;
      const dayClone = { ...(state.weekMenu[removeDay] || {}) };
      const slotArray = [...(dayClone[removeMealType] || [])];
      if (removeIndex != null) {
        slotArray.splice(removeIndex, 1);
      }
      dayClone[removeMealType] = slotArray;
      return {
        ...state,
        weekMenu: {
          ...state.weekMenu,
          [removeDay]: dayClone
        }
      };
    default:
      return state;
  }
}

// Create context
const MealPlanContext = createContext();

// Provider component
export const MealPlanProvider = ({ children }) => {
  const [state, dispatch] = useReducer(mealPlanReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadStoredData = () => {
      try {
  const storedWeekMenu = storage.getWeekMenu();
  // savedMenus and mealPlanSettings are not directly supported by storage utils yet
  const storedSavedMenus = null;
  const storedMealPlanSettings = null;

        if (storedWeekMenu) {
          dispatch({ type: actionTypes.SET_WEEK_MENU, payload: storedWeekMenu });
        }
        if (storedSavedMenus) {
          dispatch({ type: actionTypes.SET_SAVED_MENUS, payload: storedSavedMenus });
        }
        if (storedMealPlanSettings) {
          dispatch({ type: actionTypes.UPDATE_MEAL_PLAN_SETTINGS, payload: storedMealPlanSettings });
        }
      } catch (error) {
        console.error('Error loading meal plan data:', error);
        dispatch({ type: actionTypes.SET_ERROR, payload: 'Error loading meal plan data' });
      }
    };

    loadStoredData();
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
  storage.saveWeekMenu(state.weekMenu);
  }, [state.weekMenu]);

  useEffect(() => {
    storage.setItem('savedMenus', state.savedMenus);
  }, [state.savedMenus]);

  useEffect(() => {
    storage.setItem('mealPlanSettings', state.mealPlanSettings);
  }, [state.mealPlanSettings]);

  const value = {
    ...state,
    dispatch,
    actionTypes,
    addMeal: (day, mealType, meal) => {
      dispatch({ type: actionTypes.ADD_RECIPE_TO_DAY, payload: { day, mealType, recipe: meal } });
    },
    removeMeal: (day, mealType, index) => {
      dispatch({ type: actionTypes.REMOVE_RECIPE_FROM_DAY, payload: { day, mealType, index } });
    },
    clearWeekMenu: () => dispatch({ type: actionTypes.CLEAR_WEEK_MENU })
  };

  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  );
};

// Custom hook to use meal plan context
export const useMealPlan = () => {
  const context = useContext(MealPlanContext);
  if (!context) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
};

export default MealPlanContext;
