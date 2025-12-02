import axios from 'axios';

const baseURL = process.env.REACT_APP_NOVI_API_URL || 'https://api.datavortex.nl/fitnessplanet';

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
    const apiKey = process.env.REACT_APP_NOVI_API_KEY;
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