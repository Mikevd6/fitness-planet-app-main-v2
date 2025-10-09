import axios from 'axios';
import { storage } from './localStorage';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://api.fitnessplanet.nl/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  config => {
    // Add auth token if available
    const user = storage.getUser();
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor with caching
api.interceptors.response.use(
  response => {
    // Cache GET responses when appropriate
    if (response.config.method === 'get' && response.config.cache !== false) {
      const cacheKey = `api_cache_${response.config.url}`;
      const cacheData = {
        data: response.data,
        timestamp: Date.now(),
        expires: Date.now() + (response.config.cacheTime || 5 * 60 * 1000) // Default 5 min cache
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }
    
    return response;
  },
  async error => {
    const originalRequest = error.config;
    
    // Auto-retry on network errors (max 3 times)
    if (error.message.includes('network') && !originalRequest._retry) {
      originalRequest._retry = (originalRequest._retry || 0) + 1;
      
      if (originalRequest._retry <= 3) {
        console.log(`Retrying request (${originalRequest._retry}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * originalRequest._retry));
        return api(originalRequest);
      }
    }
    
    // Handle 401 Unauthorized - refresh token or logout
    if (error.response?.status === 401 && !originalRequest._retry401) {
      originalRequest._retry401 = true;
      
      try {
        // Try to refresh token
        const refreshToken = storage.getUser()?.refreshToken;
        if (refreshToken) {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { token } = response.data;
          
          // Update token in storage
          const user = storage.getUser();
          storage.setUser({ ...user, token });
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        storage.clearUser();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Enhanced GET with caching
const getCached = async (url, config = {}) => {
  // Check cache first if caching is enabled
  if (config.cache !== false) {
    const cacheKey = `api_cache_${url}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const cacheData = JSON.parse(cached);
      
      // Return cached data if not expired
      if (cacheData.expires > Date.now()) {
        return { data: cacheData.data, fromCache: true };
      }
      
      // Remove expired cache
      localStorage.removeItem(cacheKey);
    }
  }
  
  // No valid cache, make API call
  return api.get(url, config);
};

export const apiService = {
  // Recipes API
  getRecipes: (params = {}) => {
    return getCached('/recipes', { 
      params,
      cacheTime: 30 * 60 * 1000 // Cache for 30 minutes
    });
  },
  
  getRecipeById: (id) => {
    return getCached(`/recipes/${id}`, {
      cacheTime: 60 * 60 * 1000 // Cache for 1 hour
    });
  },
  
  searchRecipes: (query) => {
    return getCached('/recipes/search', {
      params: { q: query },
      cacheTime: 15 * 60 * 1000 // Cache for 15 minutes
    });
  },
  
  // User API
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },
  
  register: (userData) => {
    return api.post('/auth/register', userData);
  },
  
  resetPassword: (email) => {
    return api.post('/auth/reset-password', { email });
  },
  
  updateProfile: (profileData) => {
    return api.put('/user/profile', profileData);
  },
  
  // Utility methods
  clearCache: () => {
    // Clear all API caches
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('api_cache_')) {
        localStorage.removeItem(key);
      }
    });
  },
  
  // Health check
  healthCheck: () => {
    return api.get('/health');
  }
};