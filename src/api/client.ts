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

const AUTH_KEYS = [
  'fitnessplanet:7m997U9ozv6dJ9JLyWh9',
  'novi_auth_token',
  'token',
];

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
  const storageToken = readTokenFromStorage();
  const fallback = getDefaultToken();
  let token = storageToken || fallback;

  // If storage has no valid JWT or contains demo-token, seed with the real JWT from .env
  if (!isLikelyJwt(storageToken) && isLikelyJwt(fallback)) {
    try {
      localStorage.setItem(AUTH_KEYS[0], JSON.stringify({ accessToken: fallback! }));
      localStorage.setItem(AUTH_KEYS[1], fallback!);
      localStorage.setItem(AUTH_KEYS[2], fallback!);
    } catch {}
    token = fallback;
  }

  if (isLikelyJwt(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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