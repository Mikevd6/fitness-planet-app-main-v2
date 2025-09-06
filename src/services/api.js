import axios from 'axios';

// App-level auth identifiers (provided by API)
const APP_ID = '70ed8150';
const APP_KEY = 'f4cc2b9f25cdd8185e8d0ba4c00adc23';
const API_KEY = 'fitnessplanet:7m997U9ozv6dJ9JLyWh9';

// Create an axios instance with the NOVI backend base URL
const apiClient = axios.create({
  baseURL: 'https://novi.datavortex.nl/api',
  headers: {
    'Content-Type': 'application/json',
  'Accept': 'application/json',
  // Sent with every request as required by the API
  'X-Application-Id': APP_ID,
  'X-Application-Key': APP_KEY
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

    // Add API key for POST requests to user/auth endpoints
    const method = (config.method || '').toLowerCase();
    const url = config.url || '';
    if (
      method === 'post' &&
      (/\/auth\//.test(url) || /\/users?(\/|$)/.test(url))
    ) {
      config.headers['X-Api-Key'] = API_KEY;
      config.headers['Content-Type'] = 'application/json';
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