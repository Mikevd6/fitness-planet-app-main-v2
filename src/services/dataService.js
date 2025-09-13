import { api } from './api';

const dataService = {
  // User profile operations
  getUserProfile: async () => {
    const res = await api.get('/user/profile', { context: 'getUserProfile', silent: true });
    if (!res.success) throw res.error;
    return res.data;
  },
  
  updateUserProfile: async (profileData) => {
    const res = await api.put('/user/profile', profileData, { context: 'updateUserProfile' });
    if (!res.success) throw res.error;
    return res.data;
  },
  
  // Fitness data operations
  getWorkoutPlans: async () => {
    const res = await api.get('/workouts', { context: 'getWorkoutPlans' });
    if (!res.success) throw res.error;
    return res.data;
  },
  
  saveWorkoutPlan: async (workoutData) => {
    const res = await api.post('/workouts', workoutData, { context: 'saveWorkoutPlan' });
    if (!res.success) throw res.error;
    return res.data;
  },
};

export default dataService;