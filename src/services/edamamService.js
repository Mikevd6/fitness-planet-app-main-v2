class EdamamService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_EDAMAM_BASE_URL || 'https://api.edamam.com';
    this.appId = import.meta.env.VITE_EDAMAM_APP_ID;
    this.appKey = import.meta.env.VITE_EDAMAM_APP_KEY;
    this.recipeSearchUrl = `${this.baseUrl}/api/recipes/v2`;
    this.nutritionUrl = `${this.baseUrl}/api/nutrition-data/v2/nutrients`;
  }

  validateCredentials() {
    if (!this.appId || !this.appKey) {
      throw new Error('Edamam API credentials are missing. Add VITE_EDAMAM_APP_ID and VITE_EDAMAM_APP_KEY.');
    }
  }

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
      const safeTo = Number.isFinite(requestedTo) && requestedTo > safeFrom
        ? requestedTo
        : safeFrom + 10;

      const params = new URLSearchParams({
        type: 'public',
        app_id: this.appId,
        app_key: this.appKey,
        q: query,
        from: safeFrom.toString(),
        to: safeTo.toString()
      });

      if (cuisineType) params.append('cuisineType', cuisineType);
      if (mealType) params.append('mealType', mealType);
      if (dishType) params.append('dishType', dishType);
      if (diet) params.append('diet', diet);
      if (health) params.append('health', health);
      if (calories) params.append('calories', calories);
      if (time) params.append('time', time);

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
      return {
        success: false,
        error: error.message,
        recipes: []
      };
    }
  }

  async getRecipeByUri(uri) {
    try {
      this.validateCredentials();

      const params = new URLSearchParams({
        type: 'public',
        app_id: this.appId,
        app_key: this.appKey,
        uri
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
      return {
        success: false,
        error: error.message,
        recipe: null
      };
    }
  }

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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ingr: ingredients })
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
      return {
        success: false,
        error: error.message,
        nutrition: null
      };
    }
  }

  transformRecipes(hits) {
    return hits.map((hit) => {
      const recipe = hit.recipe;
      const servings = recipe.yield || 1;

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
        caloriesPerServing: Math.round(recipe.calories / servings) || 0,
        ingredients: recipe.ingredientLines || [],
        instructions: recipe.instructions || [],
        cuisineType: recipe.cuisineType || [],
        mealType: recipe.mealType || [],
        dishType: recipe.dishType || [],
        dietLabels: recipe.dietLabels || [],
        healthLabels: recipe.healthLabels || [],
        macros: {
          protein: Math.round((recipe.totalNutrients?.PROCNT?.quantity || 0) / servings),
          carbs: Math.round((recipe.totalNutrients?.CHOCDF?.quantity || 0) / servings),
          fat: Math.round((recipe.totalNutrients?.FAT?.quantity || 0) / servings),
          fiber: Math.round((recipe.totalNutrients?.FIBTG?.quantity || 0) / servings)
        },
        nutrients: this.transformNutrients(recipe.totalNutrients, servings),
        tags: [
          ...(recipe.cuisineType || []),
          ...(recipe.mealType || []),
          ...(recipe.dishType || []),
          ...(recipe.dietLabels || [])
        ],
        isFavorite: false,
        addedAt: new Date().toISOString()
      };
    });
  }

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

  transformNutrients(totalNutrients, servings = 1) {
    if (!totalNutrients) return {};

    return Object.entries(totalNutrients).reduce((nutrients, [key, nutrient]) => ({
      ...nutrients,
      [key]: {
        label: nutrient.label,
        quantity: Math.round((nutrient.quantity || 0) / servings),
        unit: nutrient.unit
      }
    }), {});
  }

  generateRecipeId(uri) {
    return uri.split('/').pop().split('?')[0];
  }

  async getPersonalizedRecipes(userProfile) {
    const {
      dietPreferences = [],
      healthRestrictions = [],
      calorieGoal = null,
      mealType = '',
      cuisinePreferences = []
    } = userProfile;

    return this.searchRecipes({
      query: cuisinePreferences[0] || 'healthy',
      mealType,
      diet: dietPreferences[0] || '',
      health: healthRestrictions.length > 0 ? healthRestrictions.join(',') : '',
      calories: calorieGoal ? `0-${calorieGoal}` : '',
      from: 0,
      to: 12
    });
  }

  async getAlternativeRecipes(originalRecipe, count = 3) {
    const result = await this.searchRecipes({
      query: originalRecipe.cuisineType?.[0] || originalRecipe.title.split(' ')[0],
      mealType: originalRecipe.mealType?.[0] || '',
      diet: originalRecipe.dietLabels?.[0] || '',
      calories: `${Math.max(0, originalRecipe.caloriesPerServing - 100)}-${originalRecipe.caloriesPerServing + 100}`,
      from: 0,
      to: count + 5
    });

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      recipes: result.recipes
        .filter((recipe) => recipe.id !== originalRecipe.id)
        .slice(0, count)
    };
  }

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
