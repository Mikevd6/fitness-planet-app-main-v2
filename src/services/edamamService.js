const DEFAULT_RECIPE_QUERY = 'healthy';

class EdamamService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_EDAMAM_BASE_URL || 'https://api.edamam.com';
    this.appId = import.meta.env.VITE_EDAMAM_APP_ID;
    this.appKey = import.meta.env.VITE_EDAMAM_APP_KEY;
    this.recipeSearchUrl = `${this.baseUrl}/api/recipes/v2`;
  }

  validateCredentials() {
    if (!this.appId || !this.appKey) {
      throw new Error('Edamam API gegevens ontbreken. Vul VITE_EDAMAM_APP_ID en VITE_EDAMAM_APP_KEY in je .env-bestand in.');
    }
  }

  appendIfPresent(params, key, value) {
    if (!value) return;

    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((item) => params.append(key, item));
      return;
    }

    params.append(key, value);
  }

  createRecipeSearchUrl(options = {}) {
    this.validateCredentials();

    const {
      query = DEFAULT_RECIPE_QUERY,
      cuisineType = '',
      mealType = '',
      dishType = '',
      diet = '',
      health = '',
      calories = '',
      time = '',
      nutrients = {}
    } = options;

    const params = new URLSearchParams({
      type: 'public',
      app_id: this.appId,
      app_key: this.appKey
    });

    if (query.trim()) {
      params.append('q', query.trim());
    }

    this.appendIfPresent(params, 'cuisineType', cuisineType);
    this.appendIfPresent(params, 'mealType', mealType);
    this.appendIfPresent(params, 'dishType', dishType);
    this.appendIfPresent(params, 'diet', diet);
    this.appendIfPresent(params, 'health', health);
    this.appendIfPresent(params, 'calories', calories);
    this.appendIfPresent(params, 'time', time);

    Object.entries(nutrients).forEach(([key, value]) => {
      this.appendIfPresent(params, key, value);
    });

    return `${this.recipeSearchUrl}?${params.toString()}`;
  }

  addCredentialsToUrl(url) {
    this.validateCredentials();

    const requestUrl = new URL(url);
    if (!requestUrl.searchParams.has('app_id')) {
      requestUrl.searchParams.set('app_id', this.appId);
    }
    if (!requestUrl.searchParams.has('app_key')) {
      requestUrl.searchParams.set('app_key', this.appKey);
    }

    return requestUrl.toString();
  }

  async requestJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
      let message = 'De Edamam API kon geen recepten ophalen.';

      if (response.status === 401 || response.status === 403) {
        message = 'De Edamam API-sleutels zijn ongeldig of horen niet bij dit Recipe Search plan.';
      } else if (response.status === 429) {
        message = 'De Edamam API-limiet is bereikt. Wacht even en probeer opnieuw.';
      } else if (response.status >= 500) {
        message = 'Edamam is tijdelijk niet bereikbaar. Probeer het later opnieuw.';
      }

      throw new Error(message);
    }

    return response.json();
  }

  async requestRecipes(options) {
    try {
      const url = this.createRecipeSearchUrl(options);
      const data = await this.requestJson(url);

      return this.createRecipeResult(data);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async searchRecipes(queryOrOptions = DEFAULT_RECIPE_QUERY, filters = {}) {
    const options = typeof queryOrOptions === 'object'
      ? queryOrOptions
      : { query: queryOrOptions, ...filters };

    return this.requestRecipes(options);
  }

  async getRecipesByDiet(diet) {
    return this.requestRecipes({
      query: DEFAULT_RECIPE_QUERY,
      diet
    });
  }

  async getRecipesByMealType(mealType) {
    return this.requestRecipes({
      query: DEFAULT_RECIPE_QUERY,
      mealType
    });
  }

  async getRecipesByHealthLabel(healthLabel) {
    return this.requestRecipes({
      query: DEFAULT_RECIPE_QUERY,
      health: healthLabel
    });
  }

  async getHighProteinRecipes() {
    return this.requestRecipes({
      query: 'chicken',
      diet: 'high-protein'
    });
  }

  async getLowCalorieRecipes() {
    return this.requestRecipes({
      query: 'salad',
      calories: 'lte 450'
    });
  }

  async getRecipeDetails(recipeUrlOrUri) {
    try {
      this.validateCredentials();

      let requestUrl = recipeUrlOrUri;

      if (!/^https?:\/\//.test(recipeUrlOrUri)) {
        const params = new URLSearchParams({
          type: 'public',
          app_id: this.appId,
          app_key: this.appKey,
          uri: recipeUrlOrUri
        });
        requestUrl = `${this.recipeSearchUrl}/by-uri?${params.toString()}`;
      }

      const data = await this.requestJson(this.addCredentialsToUrl(requestUrl));
      const recipes = this.transformRecipes(data.hits || [data].filter((item) => item.recipe));

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

  async getNextRecipesPage(nextUrl) {
    try {
      if (!nextUrl) {
        throw new Error('Er is geen volgende pagina met recepten beschikbaar.');
      }

      const data = await this.requestJson(this.addCredentialsToUrl(nextUrl));

      return this.createRecipeResult(data);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async getPersonalizedRecipes(userProfile) {
    const {
      dietPreferences = [],
      healthRestrictions = [],
      calorieGoal = null,
      mealType = '',
      cuisinePreferences = []
    } = userProfile;

    return this.requestRecipes({
      query: cuisinePreferences[0] || DEFAULT_RECIPE_QUERY,
      mealType,
      diet: dietPreferences[0] || '',
      health: healthRestrictions,
      calories: calorieGoal ? `lte ${calorieGoal}` : ''
    });
  }

  async getAlternativeRecipes(originalRecipe, count = 3) {
    const result = await this.requestRecipes({
      query: originalRecipe.cuisineType?.[0] || originalRecipe.title?.split(' ')[0] || DEFAULT_RECIPE_QUERY,
      mealType: originalRecipe.mealType?.[0] || '',
      diet: originalRecipe.dietLabels?.[0] || '',
      calories: originalRecipe.caloriesPerServing
        ? `${Math.max(0, originalRecipe.caloriesPerServing - 100)}-${originalRecipe.caloriesPerServing + 100}`
        : ''
    });

    if (!result.success) {
      return result;
    }

    return {
      ...result,
      recipes: result.recipes
        .filter((recipe) => recipe.id !== originalRecipe.id)
        .slice(0, count)
    };
  }

  createRecipeResult(data) {
    return {
      success: true,
      recipes: this.transformRecipes(data.hits || []),
      totalResults: data.count || 0,
      nextPageUrl: data._links?.next?.href || ''
    };
  }

  createErrorResult(error) {
    return {
      success: false,
      error: error.message,
      recipes: [],
      totalResults: 0,
      nextPageUrl: ''
    };
  }

  transformRecipes(hits) {
    return hits.map((hit) => {
      const recipe = hit.recipe;
      const servings = recipe.yield || 1;

      return {
        id: this.generateRecipeId(recipe.uri),
        uri: recipe.uri,
        detailsUrl: hit._links?.self?.href || '',
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

  generateRecipeId(uri = '') {
    return uri.split('#').pop().split('/').pop().split('?')[0];
  }
}

export const edamamService = new EdamamService();
