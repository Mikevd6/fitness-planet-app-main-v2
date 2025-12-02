import apiClient from './api';

const USER_KEY = 'user';
const useDemoBackend = () => process.env.NODE_ENV === 'test' || process.env.REACT_APP_USE_DEMO_BACKEND === 'true';

const persistUser = (user, token = null) => {
  const data = { ...user, token };
  localStorage.setItem(USER_KEY, JSON.stringify(data));

  if (token) {
    localStorage.setItem('token', token);
  }

  return data;
};

const getApiKeyHeader = () => {
  const apiKey = process.env.REACT_APP_NOVI_API_KEY;
  return apiKey ? { 'X-Api-Key': apiKey } : {};
};

const extractToken = (data) => {
  if (!data) return null;
  if (typeof data === 'string') return data;
  return data.token || data.jwt || data.jwtToken || null;
};

const demoLogin = (credentials) => {
  const email = credentials?.email || credentials?.username || 'demo@fitnessplanet.com';
  const user = { username: email, email, name: credentials?.name || email };
  const token = 'demo-token';
  const persisted = persistUser(user, token);
  return { user: persisted, token };
};

export const noviAuthService = {
  isAuthenticated() {
    return Boolean(localStorage.getItem(USER_KEY));
  },

  getCurrentUser() {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  getToken() {
    const stored = this.getCurrentUser();
    return stored?.token || null;
  },

  async fetchUserProfile(username, token) {
    if (!username) return null;

    const headers = {
      ...getApiKeyHeader(),
      Authorization: `Bearer ${token}`
    };

    const response = await apiClient.get(`/users/${username}`, { headers });
    return response.data;
  },

  async login(credentials) {
    const username = credentials?.username || credentials?.email;
    const password = credentials?.password;

    if (!username || !password) {
      throw new Error('Vul zowel gebruikersnaam als wachtwoord in.');
    }

    if (useDemoBackend()) {
      const { user, token } = demoLogin(credentials);
      return { success: true, user, token };
    }

    try {
      const response = await apiClient.post(
        '/users/authenticate',
        { username, password },
        { headers: getApiKeyHeader() }
      );

      const token = extractToken(response.data);
      if (!token) {
        throw new Error('Geen geldige JWT-token ontvangen van de backend.');
      }

      let user = { username };
      try {
        const profile = await this.fetchUserProfile(username, token);
        user = { ...profile, username: profile?.username || username };
      } catch (profileError) {
        console.warn('Kon gebruikersprofiel niet ophalen, gebruik fallback.', profileError);
      }

      const persisted = persistUser(user, token);
      return { success: true, user: persisted, token };
    } catch (error) {
      const message = error.response?.data || error.message || 'Inloggen mislukt. Controleer je gegevens.';
      throw new Error(typeof message === 'string' ? message : 'Inloggen mislukt.');
    }
  },

  async register(userData) {
    const username = userData?.username || userData?.email;
    if (!username || !userData?.password || !userData?.email) {
      throw new Error('Gebruikersnaam, e-mailadres en wachtwoord zijn verplicht.');
    }

    const payload = {
      username,
      email: userData.email,
      password: userData.password,
      info: userData.info || '',
      authorities: userData.authorities || [{ authority: 'USER' }]
    };

    if (useDemoBackend()) {
      const { user } = demoLogin(payload);
      return { success: true, user };
    }

    try {
      const response = await apiClient.post('/users', payload, { headers: getApiKeyHeader() });
      return { success: true, user: response.data };
    } catch (error) {
      const message = error.response?.data || error.message || 'Registratie mislukt.';
      throw new Error(typeof message === 'string' ? message : 'Registratie mislukt.');
    }
  },

  logout() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('token');
    return { success: true };
  }
};
