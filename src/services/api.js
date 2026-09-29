import axios from 'axios';
import { notifyUnauthorized } from '../utils/authEvents';

const env = import.meta.env;
const baseURL = (env.VITE_NOVI_API_URL || 'https://novi-backend-api-wgsgz.ondigitalocean.app/api').replace(/\/$/, '');
const projectId = env.VITE_NOVI_PROJECT_ID?.trim();

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  timeout: 10000
});

apiClient.interceptors.request.use(
  (config) => {
    if (!projectId) {
      return Promise.reject(new Error('NOVI Project ID ontbreekt. Vul VITE_NOVI_PROJECT_ID in je .env-bestand in.'));
    }

    config.headers['novi-education-project-id'] = projectId;

    const token = localStorage.getItem('token');
    if (token && config.url !== '/login' && token !== 'demo-token') {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.url !== '/login') {
      localStorage.removeItem('token');
      notifyUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
