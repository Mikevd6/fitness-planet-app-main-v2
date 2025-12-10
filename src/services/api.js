import axios from 'axios';

const DEFAULT_NOVI_API_KEY = 'fitnessplanet:7m997U9ozv6dJ9JLyWh9';

// Prefer a fully qualified NOVI API URL when provided; otherwise build one from host + realm
const noviApiHost = (process.env.REACT_APP_NOVI_API_HOST || 'https://api.datavortex.nl').replace(/\/$/, '');
const noviRealm = process.env.REACT_APP_NOVI_REALM || 'fitnessplanet';
const baseURL = process.env.REACT_APP_NOVI_API_URL || `${noviApiHost}/${noviRealm}`;

// Create an axios instance with the NOVI backend base URL
const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Request interceptor to add authorization token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add API key when available (needed for certain NOVI endpoints)
    const apiKey = process.env.REACT_APP_NOVI_API_KEY || DEFAULT_NOVI_API_KEY;
    if (apiKey) {
      config.headers['X-Api-Key'] = apiKey;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
