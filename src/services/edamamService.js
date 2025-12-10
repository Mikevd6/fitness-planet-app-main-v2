// Edamam Recipe API Service
class EdamamService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_EDAMAM_BASE_URL || 'https://api.edamam.com';
    this.appId = process.env.REACT_APP_EDAMAM_APP_ID;
    this.appKey = process.env.REACT_APP_EDAMAM_APP_KEY;
    this.recipeSearchUrl = `${this.baseUrl}/api/recipes/v2`;
    this.nutritionUrl = `${this.baseUrl}/api/nutrition-data/v2/nutrients`;
  }

  // Validate API credentials
  validateCredentials() {
    if (!this.appId || !this.appKey) {
      throw new Error('Edamam API credentials not configured. Please check your environment variables.');
    }
  }

  // Search recipes with advanced filters
  async searchRecipes(options = {}) {
    try {
      this.validateCredentials();

      const {
        query = '',
        cuisineType = '',
        mealType = '',
        dishType = '',
        diet = '',
        health = '',
        calories = '',
        time = '',
        nutrients = {},
        from = 0,
        to = 10
      } = options;

      const safeFrom = Math.max(0, Number(from) || 0);
      const requestedTo = Number(to);
      const safeTo = Math.min(
        safeFrom + 10,
        Number.isFinite(requestedTo) && requestedTo > safeFrom ? requestedTo : safeFrom + 10
      );

      const params = new URLSearchParams({
        type: 'public',
        app_id: this.appId,
        app_key: this.appKey,
        q: query,
        from: safeFrom.toString(),
        to: safeTo.toString()
      });

      // Add optional filters
      if (cuisineType) params.append('cuisineType', cuisineType);
      if (mealType) params.append('mealType', mealType);
      if (dishType) params.append('dishType', dishType);
      if (diet) params.append('diet', diet);
      if (health) params.append('health', health);
      if (calories) params.append('calories', calories);
      if (time) params.append('time', time);

      // Add nutrient filters
      Object.entries(nutrients).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`${this.recipeSearchUrl}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        recipes: this.transformRecipes(data.hits || []),
        totalResults: data.count || 0,
        from: data.from || 0,
        to: data.to || 0
      };
    } catch (error) {
      console.error('Recipe search error:', error);
      return {
        success: false,
        error: error.message,
        recipes: []
      };
    }
  }

  // Get recipe by URI
  async getRecipeByUri(uri) {
    try {
      this.validateCredentials();

      const params = new URLSearchParams({
        type: 'public',
        app_id: this.appId,
        app_key: this.appKey,
        uri: uri
      });

      const response = await fetch(`${this.baseUrl}/api/recipes/v2/by-uri?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const recipes = this.transformRecipes(data.hits || []);

      return {
        success: true,
        recipe: recipes[0] || null
      };
    } catch (error) {
      console.error('Recipe fetch error:', error);
      return {
        success: false,
        error: error.message,
        recipe: null
      };
    }
  }

  // Get nutrition analysis
  async getNutritionAnalysis(ingredients) {
    try {
      this.validateCredentials();

      const params = new URLSearchParams({
        app_id: this.appId,
        app_key: this.appKey
      });

      const response = await fetch(`${this.nutritionUrl}?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingr: ingredients
        })
      });

      if (!response.ok) {
        throw new Error(`Nutrition API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        nutrition: this.transformNutritionData(data)
      };
    } catch (error) {
      console.error('Nutrition analysis error:', error);
      return {
        success: false,
        error: error.message,
        nutrition: null
      };
    }
  }

  // Transform raw recipe data to app format
  transformRecipes(hits) {
    return hits.map(hit => {
      const recipe = hit.recipe;
      return {
        id: this.generateRecipeId(recipe.uri),
        uri: recipe.uri,
        title: recipe.label,
        description: recipe.source || 'Edamam Recipe',
        image: recipe.image,
        source: recipe.source,
        url: recipe.url,
        shareAs: recipe.shareAs,
        yield: recipe.yield,
        prepTime: recipe.totalTime || null,
        calories: Math.round(recipe.calories) || 0,
        caloriesPerServing: Math.round(recipe.calories / recipe.yield) || 0,
        ingredients: recipe.ingredientLines || [],
        instructions: recipe.instructions || [],
        cuisineType: recipe.cuisineType || [],
        mealType: recipe.mealType || [],
        dishType: recipe.dishType || [],
        dietLabels: recipe.dietLabels || [],
        healthLabels: recipe.healthLabels || [],
        macros: {
          protein: Math.round((recipe.totalNutrients?.PROCNT?.quantity || 0) / recipe.yield),
          carbs: Math.round((recipe.totalNutrients?.CHOCDF?.quantity || 0) / recipe.yield),
          fat: Math.round((recipe.totalNutrients?.FAT?.quantity || 0) / recipe.yield),
          fiber: Math.round((recipe.totalNutrients?.FIBTG?.quantity || 0) / recipe.yield)
        },
        nutrients: this.transformNutrients(recipe.totalNutrients, recipe.yield),
        tags: [
          ...recipe.cuisineType || [],
          ...recipe.mealType || [],
          ...recipe.dishType || [],
          ...recipe.dietLabels || []
        ],
        isFavorite: false,
        addedAt: new Date().toISOString()
      };
    });
  }

  // Transform nutrition data
  transformNutritionData(data) {
    return {
      calories: Math.round(data.calories || 0),
      totalWeight: Math.round(data.totalWeight || 0),
      dietLabels: data.dietLabels || [],
      healthLabels: data.healthLabels || [],
      cautions: data.cautions || [],
      totalNutrients: data.totalNutrients || {},
      totalDaily: data.totalDaily || {}
    };
  }

  // Transform nutrients for easier use
  transformNutrients(totalNutrients, servings = 1) {
    if (!totalNutrients) return {};

    const nutrients = {};
    
    Object.entries(totalNutrients).forEach(([key, nutrient]) => {
      nutrients[key] = {
        label: nutrient.label,
        quantity: Math.round((nutrient.quantity || 0) / servings),
        unit: nutrient.unit
      };
    });

    return nutrients;
  }

  // Generate unique recipe ID from URI
  generateRecipeId(uri) {
    return uri.split('/').pop().split('?')[0];
  }

  // Get recipe suggestions based on user preferences
  async getPersonalizedRecipes(userProfile) {
    const {
      dietPreferences = [],
      healthRestrictions = [],
      calorieGoal = null,
      mealType = '',
      cuisinePreferences = []
    } = userProfile;

    const searchOptions = {
      query: cuisinePreferences.length > 0 ? cuisinePreferences[0] : 'healthy',
      mealType: mealType,
      diet: dietPreferences.length > 0 ? dietPreferences[0] : '',
      health: healthRestrictions.length > 0 ? healthRestrictions.join(',') : '',
      calories: calorieGoal ? `0-${calorieGoal}` : '',
      from: 0,
      to: 12
    };

    return await this.searchRecipes(searchOptions);
  }

  // Get alternative recipes similar to a given recipe
  async getAlternativeRecipes(originalRecipe, count = 3) {
    const searchOptions = {
      query: originalRecipe.cuisineType?.[0] || originalRecipe.title.split(' ')[0],
      mealType: originalRecipe.mealType?.[0] || '',
      diet: originalRecipe.dietLabels?.[0] || '',
      calories: `${Math.max(0, originalRecipe.caloriesPerServing - 100)}-${originalRecipe.caloriesPerServing + 100}`,
      from: 0,
      to: count + 5 // Get a few extra to filter out the original
    };

    const result = await this.searchRecipes(searchOptions);
    
    if (result.success) {
      // Filter out the original recipe and return only the requested count
      const alternatives = result.recipes
        .filter(recipe => recipe.id !== originalRecipe.id)
        .slice(0, count);
      
      return {
        success: true,
        recipes: alternatives
      };
    }

    return result;
  }

  // Get available filter options
  getFilterOptions() {
    return {
      cuisineTypes: [
        'american', 'asian', 'british', 'caribbean', 'central europe',
        'chinese', 'eastern europe', 'french', 'indian', 'italian',
        'japanese', 'kosher', 'mediterranean', 'mexican', 'middle eastern',
        'nordic', 'south american', 'south east asian'
      ],
      mealTypes: ['breakfast', 'lunch', 'dinner', 'snack', 'teatime'],
      dishTypes: [
        'alcohol-cocktail', 'biscuits and cookies', 'bread', 'cereals',
        'condiments and sauces', 'desserts', 'drinks', 'egg', 'fats and oils',
        'fish', 'frozen desserts', 'fruit', 'grain', 'ice cream and custard',
        'main course', 'meat', 'milk', 'pancake', 'pasta', 'pastry',
        'pies and tarts', 'pizza', 'pork', 'poultry', 'preserve',
        'salad', 'sandwiches', 'seafood', 'side dish', 'soup',
        'special occasions', 'starter', 'sweets', 'vegetables', 'vegetarian'
      ],
      diets: [
        'balanced', 'high-fiber', 'high-protein', 'low-carb', 'low-fat', 'low-sodium'
      ],
      healthLabels: [
        'alcohol-free', 'celery-free', 'crustacean-free', 'dairy-free',
        'egg-free', 'fish-free', 'fodmap-free', 'gluten-free', 'immuno-supportive',
        'keto-friendly', 'kidney-friendly', 'kosher', 'low-potassium',
        'lupine-free', 'Mediterranean', 'mollusk-free', 'mustard-free',
        'no-oil-added', 'paleo', 'peanut-free', 'pescatarian', 'pork-free',
        'red-meat-free', 'sesame-free', 'shellfish-free', 'soy-free',
        'sugar-conscious', 'tree-nut-free', 'vegan', 'vegetarian', 'wheat-free'
      ]
    };
  }
}

export const edamamService = new EdamamService();
