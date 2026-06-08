import { storage } from './localStorage';

const uniqueById = (recipes) => {
  const recipeMap = new Map();

  recipes.forEach((recipe) => {
    if (recipe?.id && !recipeMap.has(recipe.id)) {
      recipeMap.set(recipe.id, recipe);
    }
  });

  return Array.from(recipeMap.values());
};

export const getSavedRecipes = () => {
  const profile = storage.getProfile();
  const profileRecipes = Array.isArray(profile?.savedRecipes) ? profile.savedRecipes : [];
  const legacyRecipes = storage.getSavedRecipes ? storage.getSavedRecipes() : [];
  const savedRecipes = uniqueById([...profileRecipes, ...legacyRecipes]);

  if (savedRecipes.length !== profileRecipes.length) {
    saveSavedRecipes(savedRecipes);
  }

  return savedRecipes;
};

export const saveSavedRecipes = (recipes) => {
  const profile = storage.getProfile();
  const savedRecipes = uniqueById(recipes);

  storage.setProfile({ ...profile, savedRecipes });

  if (storage.setSavedRecipes) {
    storage.setSavedRecipes(savedRecipes);
  }

  return savedRecipes;
};
