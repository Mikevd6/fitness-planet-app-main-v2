import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { storage } from '../utils/localStorage';
import CalorieCalculator from '../utils/calorieCalculator';
import { edamamService } from '../services/edamamService';

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
    excludedIngredients: []
  },
  loading: false,
  error: null,
  generating: false
};

// Action types
const MEAL_PLAN_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_GENERATING: 'SET_GENERATING',
  LOAD_WEEK_MENU: 'LOAD_WEEK_MENU',
  UPDATE_WEEK_MENU: 'UPDATE_WEEK_MENU',
  ADD_RECIPE_TO_MENU: 'ADD_RECIPE_TO_MENU',
  REMOVE_RECIPE_FROM_MENU: 'REMOVE_RECIPE_FROM_MENU',
  SAVE_MENU: 'SAVE_MENU',
  LOAD_SAVED_MENUS: 'LOAD_SAVED_MENUS',
  DELETE_SAVED_MENU: 'DELETE_SAVED_MENU',
  GENERATE_SHOPPING_LIST: 'GENERATE_SHOPPING_LIST',
  UPDATE_SHOPPING_LIST: 'UPDATE_SHOPPING_LIST',
  UPDATE_MEAL_PLAN_SETTINGS: 'UPDATE_MEAL_PLAN_SETTINGS',
  CALCULATE_NUTRITION_SUMMARY: 'CALCULATE_NUTRITION_SUMMARY',
  CLEAR_WEEK_MENU: 'CLEAR_WEEK_MENU'
};

// Reducer function
const mealPlanReducer = (state, action) => {
  switch (action.type) {
    case MEAL_PLAN_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case MEAL_PLAN_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case MEAL_PLAN_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case MEAL_PLAN_ACTIONS.SET_GENERATING:
      return { ...state, generating: action.payload };

    case MEAL_PLAN_ACTIONS.LOAD_WEEK_MENU:
      return { ...state, weekMenu: action.payload };

    case MEAL_PLAN_ACTIONS.UPDATE_WEEK_MENU:
      return { ...state, weekMenu: action.payload };

    case MEAL_PLAN_ACTIONS.ADD_RECIPE_TO_MENU:
      const { day, mealType, recipe } = action.payload;
      return {
        ...state,
        weekMenu: {
          ...state.weekMenu,
          [day]: {
            ...state.weekMenu[day],
            [mealType]: recipe
          }
        }
      };

    case MEAL_PLAN_ACTIONS.REMOVE_RECIPE_FROM_MENU:
      const { day: removeDay, mealType: removeMealType } = action.payload;
      return {
        ...state,
        weekMenu: {
          ...state.weekMenu,
          [removeDay]: {
            ...state.weekMenu[removeDay],
            [removeMealType]: null
          }
        }
      };

    case MEAL_PLAN_ACTIONS.LOAD_SAVED_MENUS:
      return { ...state, savedMenus: action.payload };

    case MEAL_PLAN_ACTIONS.SAVE_MENU:
      return {
        ...state,
        savedMenus: [...state.savedMenus, action.payload]
      };

    case MEAL_PLAN_ACTIONS.DELETE_SAVED_MENU:
      return {
        ...state,
        savedMenus: state.savedMenus.filter(menu => menu.id !== action.payload)
      };

    case MEAL_PLAN_ACTIONS.GENERATE_SHOPPING_LIST:
      return { ...state, shoppingList: action.payload };

    case MEAL_PLAN_ACTIONS.UPDATE_SHOPPING_LIST:
      return { ...state, shoppingList: action.payload };

    case MEAL_PLAN_ACTIONS.UPDATE_MEAL_PLAN_SETTINGS:
      return {
        ...state,
        mealPlanSettings: { ...state.mealPlanSettings, ...action.payload }
      };

    case MEAL_PLAN_ACTIONS.CALCULATE_NUTRITION_SUMMARY:
      return { ...state, nutritionSummary: action.payload };

    case MEAL_PLAN_ACTIONS.CLEAR_WEEK_MENU:
      return { ...state, weekMenu: {} };

    default:
      return state;
  }
};

// Create context
const MealPlanContext = createContext();

// MealPlan provider component
export const MealPlanProvider = ({ children }) => {
  const [state, dispatch] = useReducer(mealPlanReducer, initialState);

  // Load data on mount
  useEffect(() => {
    loadWeekMenu();
    loadSavedMenus();
    loadMealPlanSettings();
  }, []);

  // Recalculate nutrition when week menu or settings change
  useEffect(() => {
    calculateNutritionSummary();
  // eslint-disable-next-line no-use-before-define
  }, [calculateNutritionSummary]);

  // Load week menu from storage
  const loadWeekMenu = () => {
    try {
      const weekMenu = storage.getWeekMenu() || {};
      dispatch({ type: MEAL_PLAN_ACTIONS.LOAD_WEEK_MENU, payload: weekMenu });
    } catch (error) {
      console.error('Error loading week menu:', error);
      dispatch({ type: MEAL_PLAN_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Load saved menus from storage
  const loadSavedMenus = () => {
    try {
      const saved = localStorage.getItem('fitnessapp_saved_weekmenus');
      const savedMenus = saved ? JSON.parse(saved) : [];
      dispatch({ type: MEAL_PLAN_ACTIONS.LOAD_SAVED_MENUS, payload: savedMenus });
    } catch (error) {
      console.error('Error loading saved menus:', error);
    }
  };

  // Load meal plan settings
  const loadMealPlanSettings = () => {
    try {
      const settings = localStorage.getItem('fitnessapp_meal_plan_settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        dispatch({
          type: MEAL_PLAN_ACTIONS.UPDATE_MEAL_PLAN_SETTINGS,
          payload: parsedSettings
        });
      }
    } catch (error) {
      console.error('Error loading meal plan settings:', error);
    }
  };

  // Save week menu to storage
  const saveWeekMenu = (weekMenu) => {
    try {
      storage.saveWeekMenu(weekMenu);
      dispatch({ type: MEAL_PLAN_ACTIONS.UPDATE_WEEK_MENU, payload: weekMenu });
    } catch (error) {
      dispatch({ type: MEAL_PLAN_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Add recipe to specific day and meal
  const addRecipeToMenu = (day, mealType, recipe) => {
    try {
      const updatedMenu = {
        ...state.weekMenu,
        [day]: {
          ...state.weekMenu[day],
          [mealType]: recipe
        }
      };
      
      saveWeekMenu(updatedMenu);
      dispatch({
        type: MEAL_PLAN_ACTIONS.ADD_RECIPE_TO_MENU,
        payload: { day, mealType, recipe }
      });

      return { success: true };
    } catch (error) {
      dispatch({ type: MEAL_PLAN_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Remove recipe from menu
  const removeRecipeFromMenu = (day, mealType) => {
    try {
      const updatedMenu = {
        ...state.weekMenu,
        [day]: {
          ...state.weekMenu[day],
          [mealType]: null
        }
      };
      
      saveWeekMenu(updatedMenu);
      dispatch({
        type: MEAL_PLAN_ACTIONS.REMOVE_RECIPE_FROM_MENU,
        payload: { day, mealType }
      });

      return { success: true };
    } catch (error) {
      dispatch({ type: MEAL_PLAN_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Generate automatic meal plan based on user goals
  // Helper function to get search query for meal type
  function getMealTypeQuery(mealType) {
    const queries = {
      breakfast: 'healthy breakfast',
      lunch: 'healthy lunch',
      dinner: 'healthy dinner',
      snack: 'healthy snack'
    };
    return queries[mealType] || 'healthy meal';
  }

  // Fallback recipe generator
  function getFallbackRecipe(mealType, targetCalories) {
    const fallbackRecipes = {
      breakfast: {
        id: 'fallback-breakfast',
        title: 'Healthy Oatmeal Bowl',
        description: 'Nutritious oatmeal with fruits and nuts',
        calories: targetCalories,
        image: 'https://source.unsplash.com/400x300/?oatmeal',
        macros: { protein: 12, carbs: 45, fat: 8 },
        mealType: ['breakfast']
      },
      lunch: {
        id: 'fallback-lunch',
        title: 'Garden Salad with Protein',
        description: 'Fresh salad with lean protein',
        calories: targetCalories,
        image: 'https://source.unsplash.com/400x300/?salad',
        macros: { protein: 25, carbs: 20, fat: 12 },
        mealType: ['lunch']
      },
      dinner: {
        id: 'fallback-dinner',
        title: 'Grilled Chicken with Vegetables',
        description: 'Balanced dinner with lean protein and vegetables',
        calories: targetCalories,
        image: 'https://source.unsplash.com/400x300/?chicken',
        macros: { protein: 35, carbs: 30, fat: 15 },
        mealType: ['dinner']
      },
      snack: {
        id: 'fallback-snack',
        title: 'Mixed Nuts and Fruit',
        description: 'Healthy snack with nuts and seasonal fruit',
        calories: targetCalories,
        image: 'https://source.unsplash.com/400x300/?nuts',
        macros: { protein: 6, carbs: 15, fat: 10 },
        mealType: ['snack']
      }
    };

    return fallbackRecipes[mealType] || fallbackRecipes.snack;
  }

  const generateAutomaticMealPlan = async (userProfile) => {
    dispatch({ type: MEAL_PLAN_ACTIONS.SET_GENERATING, payload: true });
    dispatch({ type: MEAL_PLAN_ACTIONS.CLEAR_ERROR });

    try {
      // Calculate nutrition plan
      const nutritionPlan = CalorieCalculator.calculateNutritionPlan(userProfile);
      if (!nutritionPlan.success) {
        throw new Error(nutritionPlan.error);
      }

      // Get weekly meal targets
      const weeklyTargets = CalorieCalculator.getWeeklyMealTargets(nutritionPlan.plan.calorieGoal);

      // Generate menu for each day
      const generatedMenu = {};
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

      for (const day of days) {
        generatedMenu[day] = {};
        for (const mealType of mealTypes) {
          const mealTarget = weeklyTargets[day][mealType];

          // Build calorie range (prefer min-max, fallback to open-ended min)
          const calorieRange = mealTarget?.min && mealTarget?.max
            ? `${mealTarget.min}-${mealTarget.max}`
            : mealTarget?.min
              ? `${mealTarget.min}-`
              : '';

            // Get recipes for this meal type and calorie range
          const recipeResult = await edamamService.searchRecipes({
            query: getMealTypeQuery(mealType),
            mealType,
            calories: calorieRange,
            diet: userProfile.dietPreferences?.[0] || '',
            health: userProfile.allergens && userProfile.allergens.length
              ? userProfile.allergens.map(a => `${a}-free`)
              : [],
            from: 0,
            to: 10
          });

          if (recipeResult.success && recipeResult.recipes.length > 0) {
            const randomIndex = Math.floor(Math.random() * recipeResult.recipes.length);
            generatedMenu[day][mealType] = recipeResult.recipes[randomIndex];
          } else {
            generatedMenu[day][mealType] = getFallbackRecipe(mealType, mealTarget?.target || mealTarget?.min || 0);
          }
        }
      }

      // Save the generated menu
      saveWeekMenu(generatedMenu);

      // Update settings with new nutrition plan
      updateMealPlanSettings({
        calorieGoal: nutritionPlan.plan.calorieGoal,
        macroTargets: nutritionPlan.plan.macroTargets
      });

      dispatch({ type: MEAL_PLAN_ACTIONS.SET_GENERATING, payload: false });
      return { success: true, menu: generatedMenu };
    } catch (error) {
      console.error('Error generating automatic meal plan:', error);
      dispatch({ type: MEAL_PLAN_ACTIONS.SET_ERROR, payload: error.message });
      dispatch({ type: MEAL_PLAN_ACTIONS.SET_GENERATING, payload: false });
      return { success: false, error: error.message };
    }
  };

  // Save current menu with a name
  const saveCurrentMenu = (menuName) => {
    try {
      const menuToSave = {
        id: Date.now(),
        name: menuName,
        createdAt: new Date().toISOString(),
        menu: { ...state.weekMenu },
        nutritionSummary: { ...state.nutritionSummary }
      };

      const updatedMenus = [...state.savedMenus, menuToSave];
      localStorage.setItem('fitnessapp_saved_weekmenus', JSON.stringify(updatedMenus));
      
      dispatch({ type: MEAL_PLAN_ACTIONS.SAVE_MENU, payload: menuToSave });
      return { success: true, menu: menuToSave };
    } catch (error) {
      dispatch({ type: MEAL_PLAN_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Load a saved menu
  const loadSavedMenu = (menuId) => {
    try {
      const savedMenu = state.savedMenus.find(menu => menu.id === menuId);
      if (savedMenu) {
        saveWeekMenu(savedMenu.menu);
        return { success: true };
      } else {
        throw new Error('Menu not found');
      }
    } catch (error) {
      dispatch({ type: MEAL_PLAN_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Delete a saved menu
  const deleteSavedMenu = (menuId) => {
    try {
      const updatedMenus = state.savedMenus.filter(menu => menu.id !== menuId);
      localStorage.setItem('fitnessapp_saved_weekmenus', JSON.stringify(updatedMenus));
      
      dispatch({ type: MEAL_PLAN_ACTIONS.DELETE_SAVED_MENU, payload: menuId });
      return { success: true };
    } catch (error) {
      dispatch({ type: MEAL_PLAN_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Generate shopping list from current week menu
  const generateShoppingList = () => {
    try {
      // Categorize ingredient for shopping list
      function categorizeIngredient(ingredient) {
        const categories = {
          'Produce': ['tomato', 'onion', 'garlic', 'lettuce', 'spinach', 'carrot', 'bell pepper', 'cucumber', 'apple', 'banana', 'lemon', 'lime', 'avocado', 'broccoli', 'cauliflower'],
            'Meat & Seafood': ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'turkey', 'ham', 'bacon'],
            'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'eggs'],
            'Pantry': ['rice', 'pasta', 'bread', 'flour', 'sugar', 'salt', 'pepper', 'oil', 'vinegar', 'spices', 'herbs'],
            'Frozen': ['frozen vegetables', 'frozen fruits', 'ice cream'],
            'Beverages': ['water', 'juice', 'coffee', 'tea', 'soda']
        };

        const lowerIngredient = ingredient.toLowerCase();
        for (const [category, items] of Object.entries(categories)) {
          if (items.some(item => lowerIngredient.includes(item))) {
            return category;
          }
        }
        return 'Other';
      }

      const ingredients = new Map();

      Object.values(state.weekMenu).forEach(dayMeals => {
        Object.values(dayMeals).forEach(recipe => {
          if (recipe && recipe.ingredients) {
            recipe.ingredients.forEach(ingredient => {
              const ingredientName = typeof ingredient === 'string'
                ? ingredient.trim()
                : ingredient.name || ingredient.toString();

              if (ingredients.has(ingredientName)) {
                ingredients.set(ingredientName, {
                  ...ingredients.get(ingredientName),
                  quantity: ingredients.get(ingredientName).quantity + 1
                });
              } else {
                ingredients.set(ingredientName, {
                  name: ingredientName,
                  quantity: 1,
                  category: categorizeIngredient(ingredientName),
                  checked: false
                });
              }
            });
          }
        });
      });

      const shoppingList = Array.from(ingredients.values())
        .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

      storage.setShoppingList(shoppingList);
      dispatch({ type: MEAL_PLAN_ACTIONS.GENERATE_SHOPPING_LIST, payload: shoppingList });

      return { success: true, list: shoppingList };
    } catch (error) {
      console.error('Error generating shopping list:', error);
      dispatch({ type: MEAL_PLAN_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Update meal plan settings
  const updateMealPlanSettings = (newSettings) => {
    try {
      const updatedSettings = { ...state.mealPlanSettings, ...newSettings };
      localStorage.setItem('fitnessapp_meal_plan_settings', JSON.stringify(updatedSettings));

      dispatch({
        type: MEAL_PLAN_ACTIONS.UPDATE_MEAL_PLAN_SETTINGS,
        payload: newSettings
      });

      return { success: true };
    } catch (error) {
      dispatch({ type: MEAL_PLAN_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Calculate nutrition summary for current week
  const calculateNutritionSummary = useCallback(() => {
    try {
      const summary = {
        totalCalories: 0,
        averageDailyCalories: 0,
        totalMacros: { protein: 0, carbs: 0, fat: 0 },
        averageDailyMacros: { protein: 0, carbs: 0, fat: 0 },
        mealBreakdown: {},
        goalComparison: {}
      };

      let totalDays = 0;

      Object.entries(state.weekMenu).forEach(([day, meals]) => {
        let dayCalories = 0;
        let dayMacros = { protein: 0, carbs: 0, fat: 0 };

        Object.entries(meals).forEach(([mealType, recipe]) => {
          if (recipe) {
            dayCalories += recipe.caloriesPerServing || recipe.calories || 0;
            if (recipe.macros) {
              dayMacros.protein += recipe.macros.protein || 0;
              dayMacros.carbs += recipe.macros.carbs || 0;
              dayMacros.fat += recipe.macros.fat || 0;
            }
          }
        });

        if (dayCalories > 0) {
          summary.mealBreakdown[day] = {
            calories: dayCalories,
            macros: dayMacros
          };
          summary.totalCalories += dayCalories;
          summary.totalMacros.protein += dayMacros.protein;
            summary.totalMacros.carbs += dayMacros.carbs;
            summary.totalMacros.fat += dayMacros.fat;
          totalDays++;
        }
      });

      if (totalDays > 0) {
        summary.averageDailyCalories = Math.round(summary.totalCalories / totalDays);
        summary.averageDailyMacros = {
          protein: Math.round(summary.totalMacros.protein / totalDays),
          carbs: Math.round(summary.totalMacros.carbs / totalDays),
          fat: Math.round(summary.totalMacros.fat / totalDays)
        };

        summary.goalComparison = {
          calories: {
            target: state.mealPlanSettings.calorieGoal,
            actual: summary.averageDailyCalories,
            percentage: Math.round((summary.averageDailyCalories / state.mealPlanSettings.calorieGoal) * 100)
          },
          macros: {
            protein: {
              target: state.mealPlanSettings.macroTargets.protein,
              actual: summary.averageDailyMacros.protein,
              percentage: Math.round((summary.averageDailyMacros.protein / state.mealPlanSettings.macroTargets.protein) * 100)
            },
            carbs: {
              target: state.mealPlanSettings.macroTargets.carbs,
              actual: summary.averageDailyMacros.carbs,
              percentage: Math.round((summary.averageDailyMacros.carbs / state.mealPlanSettings.macroTargets.carbs) * 100)
            },
            fat: {
              target: state.mealPlanSettings.macroTargets.fat,
              actual: summary.averageDailyMacros.fat,
              percentage: Math.round((summary.averageDailyMacros.fat / state.mealPlanSettings.macroTargets.fat) * 100)
            }
          }
        };
      }

      dispatch({
        type: MEAL_PLAN_ACTIONS.CALCULATE_NUTRITION_SUMMARY,
        payload: summary
      });

      return summary;
    } catch (error) {
      console.error('Error calculating nutrition summary:', error);
      return {};
    }
  }, [state.weekMenu, state.mealPlanSettings]);

  // Clear current week menu
  const clearWeekMenu = () => {
    try {
      storage.saveWeekMenu({});
      dispatch({ type: MEAL_PLAN_ACTIONS.CLEAR_WEEK_MENU });
      return { success: true };
    } catch (error) {
      dispatch({ type: MEAL_PLAN_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: MEAL_PLAN_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    ...state,
    loadWeekMenu,
    saveWeekMenu,
    addRecipeToMenu,
    removeRecipeFromMenu,
    generateAutomaticMealPlan,
    saveCurrentMenu,
    loadSavedMenu,
    deleteSavedMenu,
    generateShoppingList,
    updateMealPlanSettings,
    calculateNutritionSummary,
    clearWeekMenu,
    clearError
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
