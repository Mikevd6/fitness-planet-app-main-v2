import apiClient from './api';

const USER_KEY = 'user';
const env = import.meta.env;
const shouldUseDemoBackend = env.MODE === 'test' || env.VITE_USE_DEMO_BACKEND === 'true';

const tokenIsValid = (token) => {
  if (token === 'demo-token') return true;
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now() + 5000;
  } catch {
    return false;
  }
};

const persistUser = (user, token) => {
  const data = {
    ...user,
    username: user.username || user.name || user.email,
    name: user.name || user.email,
    token
  };
  localStorage.setItem(USER_KEY, JSON.stringify(data));
  localStorage.setItem('token', token);
  return data;
};

const demoLogin = (credentials) => {
  const email = credentials.email || credentials.username || 'demo@fitnessplanet.com';
  const user = persistUser({ email }, 'demo-token');
  return { success: true, user, token: 'demo-token' };
};

const isDemoCredential = (email, password) =>
  email.toLowerCase() === 'demo@fitnessplanet.com' && password === 'demo123';

export const noviAuthService = {
  isAuthenticated() {
    const user = this.getCurrentUser();
    return Boolean(user && tokenIsValid(localStorage.getItem('token')));
  },

  getCurrentUser() {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('token');
  },

  async login(credentials) {
    const email = (credentials?.email || credentials?.username || '').trim();
    const password = credentials?.password;

    if (!email || !password) {
      throw new Error('Vul zowel je e-mailadres als wachtwoord in.');
    }

    if (shouldUseDemoBackend || isDemoCredential(email, password)) {
      return demoLogin({ email });
    }

    try {
      const response = await apiClient.post('/login', { email, password });
      const { token, user } = response.data || {};
      if (!token || !user?.email) {
        throw new Error('De NOVI-API gaf geen geldig token of gebruikersprofiel terug.');
      }

      const persisted = persistUser(user, token);
      return { success: true, user: persisted, token };
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('E-mailadres of wachtwoord is onjuist.');
      }
      throw error;
    }
  },

  async register(userData) {
    const currentUser = this.getCurrentUser();
    const roles = currentUser?.roles || [];
    const isAdmin = roles.some(role => String(role).toLowerCase() === 'admin');

    if (!isAdmin || !tokenIsValid(this.getToken()) || this.getToken() === 'demo-token') {
      throw new Error('Alleen een NOVI-beheerder kan via deze API een nieuw account aanmaken.');
    }

    const email = userData?.email?.trim();
    if (!email || !userData?.password) {
      throw new Error('E-mailadres en wachtwoord zijn verplicht.');
    }

    const response = await apiClient.post('/users', {
      email,
      password: userData.password,
      roles: ['user']
    });
    return { success: true, user: response.data };
  },

  logout() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('token');
    return { success: true };
  }
};
