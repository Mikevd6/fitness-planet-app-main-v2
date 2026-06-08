import axios from 'axios';
import { storage } from './localStorage';
import { notifyUnauthorized } from './authEvents';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.fitnessplanet.nl/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const user = storage.getUser();

    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get' && response.config.cache !== false) {
      const cacheKey = `api_cache_${response.config.url}`;
      const cacheData = {
        data: response.data,
        timestamp: Date.now(),
        expires: Date.now() + (response.config.cacheTime || 5 * 60 * 1000)
      };

      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.message.includes('network') && !originalRequest._retry) {
      originalRequest._retry = (originalRequest._retry || 0) + 1;

      if (originalRequest._retry <= 3) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * originalRequest._retry));
        return api(originalRequest);
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry401) {
      originalRequest._retry401 = true;

      try {
        const refreshToken = storage.getUser()?.refreshToken;

        if (refreshToken) {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { token } = response.data;
          const user = storage.getUser();

          storage.setUser({ ...user, token });
          originalRequest.headers.Authorization = `Bearer ${token}`;

          return api(originalRequest);
        }
      } catch {
        storage.clearUser();
        notifyUnauthorized();
      }
    }

    return Promise.reject(error);
  }
);

const getCached = async (url, config = {}) => {
  if (config.cache !== false) {
    const cacheKey = `api_cache_${url}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const cacheData = JSON.parse(cached);

      if (cacheData.expires > Date.now()) {
        return { data: cacheData.data, fromCache: true };
      }

      localStorage.removeItem(cacheKey);
    }
  }

  return api.get(url, config);
};

export const apiService = {
  getRecipes: (params = {}) => getCached('/recipes', {
    params,
    cacheTime: 30 * 60 * 1000
  }),

  getRecipeById: (id) => getCached(`/recipes/${id}`, {
    cacheTime: 60 * 60 * 1000
  }),

  searchRecipes: (query) => getCached('/recipes/search', {
    params: { q: query },
    cacheTime: 15 * 60 * 1000
  }),

  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  resetPassword: (email) => api.post('/auth/reset-password', { email }),
  updateProfile: (profileData) => api.put('/user/profile', profileData),
  healthCheck: () => api.get('/health'),

  clearCache: () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('api_cache_')) {
        localStorage.removeItem(key);
      }
    });
  }
};
