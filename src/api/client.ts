import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Api-Key': process.env.REACT_APP_X_API_KEY || '',
  },
});

function isLikelyJwt(t?: string | null) {
  return !!t && t.split('.').length === 3 && !/^demo-token$/i.test(t);
}

function readTokenFromStorage(): string | null {
  const keys = [
    'fitnessplanet:7m997U9ozv6dJ9JLyWh9',
    'novi_auth_token',
    'token',
  ];
  for (const key of keys) {
    const raw = sessionStorage.getItem(key) ?? localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const token = parsed?.accessToken || parsed?.token || parsed?.jwt || null;
      if (isLikelyJwt(token)) return token;
    } catch {
      if (isLikelyJwt(raw)) return raw;
    }
  }
  return null;
}

function getDefaultToken(): string | null {
  return process.env.REACT_APP_DEFAULT_JWT || null;
}

api.interceptors.request.use((config) => {
  const token = readTokenFromStorage() || getDefaultToken();
  if (isLikelyJwt(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // ensure X-Api-Key is present even if instance was created before env loaded
  if (!config.headers['X-Api-Key'] && process.env.REACT_APP_X_API_KEY) {
    config.headers['X-Api-Key'] = process.env.REACT_APP_X_API_KEY;
  }
  return config;
});

export default api;

export async function getApiInfo() {
  const res = await api.get('/info');
  return res.data;
}