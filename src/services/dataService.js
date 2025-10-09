import apiClient from './api';

const dataService = {
  // User profile operations
  getUserProfile: async () => {
    try {
      const response = await apiClient.get('/user/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateUserProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/user/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Fitness data operations
  getWorkoutPlans: async () => {
    try {
      const response = await apiClient.get('/workouts');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  saveWorkoutPlan: async (workoutData) => {
    try {
      const response = await apiClient.post('/workouts', workoutData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Other data operations as needed
  // ...
};

export default dataService;