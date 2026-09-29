import apiClient from './api';
import { noviAuthService } from './noviAuthService';

const userId = () => {
  const storedId = noviAuthService.getCurrentUser()?.id;
  const id = Number(storedId);
  if (storedId == null || !Number.isInteger(id) || id < 0) {
    throw new Error('Log opnieuw in om je gegevens te beheren.');
  }
  return id;
};

const asList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  throw new Error('De NOVI-API gaf geen lijst terug.');
};

const collection = (name) => ({
  async list() {
    const response = await apiClient.get(`/users/${userId()}/${name}`);
    return asList(response.data);
  },
  async create(values) {
    const response = await apiClient.post(`/${name}`, { userId: userId(), ...values });
    return response.data;
  },
  async update(id, values) {
    const response = await apiClient.patch(`/${name}/${id}`, values);
    return response.data;
  },
  async remove(id) {
    await apiClient.delete(`/${name}/${id}`);
  }
});

export const noviDataService = {
  workouts: collection('workouts'),
  favoriteRecipes: collection('favorite_recipes'),
  mealPlans: collection('meal_plans')
};
