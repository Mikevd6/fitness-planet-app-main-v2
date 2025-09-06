/**
 * Local Storage Utility
 * Handles saving and retrieving data from local storage with error handling
 */

const STORAGE_KEYS = {
  USER: 'fitnessapp_user',
  RECIPES: 'fitnessapp_recipes',
  FAVORITES: 'fitnessapp_favorites',
  SAVED_RECIPES: 'fitnessapp_saved_recipes',
  NUTRITION: 'fitnessapp_nutrition',
  PROFILE: 'fitnessapp_profile',
  PROGRESS: 'fitnessapp_progress',
  GOALS: 'fitnessapp_goals',
  WEEKMENU: 'fitnessapp_weekmenu',
  WORKOUTS: 'fitnessapp_workouts',
  API_RECIPES: 'fitnessapp_api_recipes',
  SHOPPING_LIST: 'fitnessapp_shopping_list'
};

const storage = {
  // Generic helpers (used by some contexts)
  getItem: (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting item from localStorage:', error);
      return null;
    }
  },

  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error setting item in localStorage:', error);
      return false;
    }
  },

  // User management
  setUser: (user) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  },

  getUser: () => {
    try {
      const user = localStorage.getItem(STORAGE_KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  clearUser: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Error clearing user:', error);
    }
  },

  // Profile management
  getProfile: () => {
    try {
      const profile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return profile ? JSON.parse(profile) : {
        naam: '',
        email: '',
        leeftijd: '',
        geslacht: '',
        lengte: '',
        gewicht: '',
        dagelijkseSuikerDoel: '',
        macronutrienten: '',
        bereikDoelen: '',
        dieetvoorkeuren: {
          vegan: false,
          halal: false,
          lactosevrij: false,
          pescotarier: false,
          glutenvrij: false,
          overig: ''
        }
      };
    } catch (error) {
      console.error('Error getting profile:', error);
      return {};
    }
  },

  setProfile: (profile) => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  },

  // Favorites management
  getFavorites: function() {
    try {
      const favorites = localStorage.getItem('fitnessplanet_favorites');
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites from localStorage:', error);
      return [];
    }
  },

  addToFavorites: function(recipe) {
    try {
      const favorites = this.getFavorites();
      if (!favorites.some(fav => fav.id === recipe.id)) {
        favorites.push(recipe);
        localStorage.setItem('fitnessplanet_favorites', JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error adding to favorites in localStorage:', error);
    }
  },

  removeFromFavorites: function(recipeId) {
    try {
      let favorites = this.getFavorites();
      favorites = favorites.filter(recipe => recipe.id !== recipeId);
      localStorage.setItem('fitnessplanet_favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error removing from favorites in localStorage:', error);
    }
  },

  // Saved Recipes management
  getSavedRecipes: function() {
    try {
      const saved = localStorage.getItem('fitnessplanet_savedrecipes');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error getting saved recipes from localStorage:', error);
      return [];
    }
  },

  setSavedRecipes: function(recipes) {
    try {
      localStorage.setItem('fitnessplanet_savedrecipes', JSON.stringify(recipes));
    } catch (error) {
      console.error('Error setting saved recipes in localStorage:', error);
    }
  },

  // Week menu management
  getWeekMenu: function() {
    try {
      const weekMenu = localStorage.getItem('fitnessplanet_weekmenu');
      return weekMenu ? JSON.parse(weekMenu) : {};
    } catch (error) {
      console.error('Error getting week menu from localStorage:', error);
      return {};
    }
  },

  saveWeekMenu: function(weekMenu) {
    try {
      localStorage.setItem('fitnessplanet_weekmenu', JSON.stringify(weekMenu));
    } catch (error) {
      console.error('Error saving week menu to localStorage:', error);
    }
  },

  // Nutrition tracking
  getNutrition: () => {
    try {
      const nutrition = localStorage.getItem(STORAGE_KEYS.NUTRITION);
      return nutrition ? JSON.parse(nutrition) : [];
    } catch (error) {
      console.error('Error getting nutrition:', error);
      return [];
    }
  },

  addNutrition: (nutritionData) => {
    try {
      const existingData = storage.getNutrition();
      const newEntry = {
        id: Date.now(),
        datum: new Date().toISOString().split('T')[0],
        ...nutritionData
      };
      existingData.unshift(newEntry);
      localStorage.setItem(STORAGE_KEYS.NUTRITION, JSON.stringify(existingData));
      return true;
    } catch (error) {
      console.error('Error adding nutrition:', error);
      return false;
    }
  },

  // Progress tracking
  getProgress: () => {
    try {
      const progress = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      return progress ? JSON.parse(progress) : [];
    } catch (error) {
      console.error('Error getting progress:', error);
      return [];
    }
  },

  addWeight: (weight) => {
    try {
      const existingData = storage.getProgress();
      const newEntry = {
        id: Date.now(),
        datum: new Date().toISOString(),
        gewicht: parseFloat(weight)
      };
      existingData.unshift(newEntry);
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(existingData));
      return true;
    } catch (error) {
      console.error('Error adding weight:', error);
      return false;
    }
  },

  deleteWeight: (id) => {
    try {
      const existingData = storage.getProgress();
      const filteredData = existingData.filter(entry => entry.id !== id);
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(filteredData));
      return true;
    } catch (error) {
      console.error('Error deleting weight:', error);
      return false;
    }
  },

  // Goals management
  getGoals: () => {
    try {
      const goals = localStorage.getItem(STORAGE_KEYS.GOALS);
      return goals ? JSON.parse(goals) : {
        weeklyWorkouts: 3,
        dailyCalories: 2000,
        targetWeight: 70
      };
    } catch (error) {
      console.error('Error getting goals:', error);
      return {
        weeklyWorkouts: 3,
        dailyCalories: 2000,
        targetWeight: 70
      };
    }
  },

  setGoals: (goals) => {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
      return true;
    } catch (error) {
      console.error('Error saving goals:', error);
      return false;
    }
  },

  // Recipes management
  getRecipes: () => {
    try {
      const recipes = localStorage.getItem(STORAGE_KEYS.RECIPES);
      return recipes ? JSON.parse(recipes) : [];
    } catch (error) {
      console.error('Error getting recipes:', error);
      return [];
    }
  },

  saveRecipes: (recipes) => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes || []));
      return true;
    } catch (error) {
      console.error('Error saving recipes:', error);
      return false;
    }
  },

  // Workouts management
  getWorkouts: () => {
    try {
      const workouts = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
      return workouts ? JSON.parse(workouts) : [];
    } catch (error) {
      console.error('Error getting workouts:', error);
      return [];
    }
  },

  addWorkout: (workoutData) => {
    try {
      const existingWorkouts = storage.getWorkouts();
      const newWorkout = {
        id: Date.now(),
        datum: new Date().toISOString(),
        ...workoutData
      };
      existingWorkouts.unshift(newWorkout);
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(existingWorkouts));
      return true;
    } catch (error) {
      console.error('Error adding workout:', error);
      return false;
    }
  },

  deleteWorkout: (id) => {
    try {
      const existingWorkouts = storage.getWorkouts();
      const filteredWorkouts = existingWorkouts.filter(workout => workout.id !== id);
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(filteredWorkouts));
      return true;
    } catch (error) {
      console.error('Error deleting workout:', error);
      return false;
    }
  },

  // Clear all data
  clearAll: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  },

  // Update API recepten
  setApiRecipes: (recipes) => {
    try {
      localStorage.setItem(STORAGE_KEYS.API_RECIPES, JSON.stringify(recipes));
    } catch (error) {
      console.error('Error saving API recipes:', error);
    }
  },

  getApiRecipes: () => {
    try {
      const recipes = localStorage.getItem(STORAGE_KEYS.API_RECIPES);
      return recipes ? JSON.parse(recipes) : [];
    } catch (error) {
      console.error('Error getting API recipes:', error);
      return [];
    }
  },

  // ShoppingList management
  getShoppingList: () => {
    try {
      const shoppingList = localStorage.getItem(STORAGE_KEYS.SHOPPING_LIST);
      return shoppingList ? JSON.parse(shoppingList) : [];
    } catch (error) {
      console.error('Error getting shopping list:', error);
      return [];
    }
  },

  setShoppingList: (shoppingList) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(shoppingList));
      return true;
    } catch (error) {
      console.error('Error saving shopping list:', error);
      return false;
    }
  },

  // Dagelijkse calorieën ophalen
  getDailyCalories: () => {
    const calories = localStorage.getItem('dailyCalories');
    return calories ? parseInt(calories) : null;
  },
  
  // Dagelijkse calorieën opslaan
  setDailyCalories: (calories) => {
    localStorage.setItem('dailyCalories', calories);
  },

  // Gebruikers opslaan en ophalen
  getUsers: () => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  },
  
  addUser: (user) => {
    const users = storage.getUsers() || [];
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
  },
  
};

export { storage };
