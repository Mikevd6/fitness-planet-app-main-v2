import axios from 'axios';
import { notifyUnauthorized } from '../utils/authEvents';

const env = import.meta.env;
const noviApiHost = (env.VITE_NOVI_API_HOST || 'https://api.datavortex.nl').replace(/\/$/, '');
const noviRealm = env.VITE_NOVI_REALM || 'fitnessplanet';
const baseURL = env.VITE_NOVI_API_URL || `${noviApiHost}/${noviRealm}`;
const noviApiKey = env.VITE_NOVI_API_KEY;

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
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (noviApiKey) {
      config.headers['X-Api-Key'] = noviApiKey;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      notifyUnauthorized();
    }

    return Promise.reject(error);
  }
);

export default apiClient;
