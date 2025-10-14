import api from './client';

const STORAGE_KEYS = [
  'fitnessplanet:7m997U9ozv6dJ9JLyWh9',
  'novi_auth_token',
  'token',
];

function saveTokenToStorage(token: string) {
  try {
    // hoofdkey als JSON
    localStorage.setItem(STORAGE_KEYS[0], JSON.stringify({ accessToken: token }));
    // compat: ruwe string onder de andere keys
    localStorage.setItem(STORAGE_KEYS[1], token);
    localStorage.setItem(STORAGE_KEYS[2], token);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to persist auth token', e);
  }
}

export async function login(username: string, password: string) {
  let token: string | undefined;

  try {
    const res = await api.post('/login', { username, password }); // pas endpoint/body aan indien nodig
    token = res.data?.accessToken || res.data?.token || res.data?.jwt;
    if (!token) {
      // fallback op DEV token uit .env
      token = process.env.REACT_APP_DEFAULT_JWT;
    }
    if (!token) throw new Error('No token in login response and no REACT_APP_DEFAULT_JWT configured');
    saveTokenToStorage(token);
    return res.data ?? { token };
  } catch (err) {
    // bij login-fout: als laatste redmiddel de DEV token gebruiken
    const fallback = process.env.REACT_APP_DEFAULT_JWT;
    if (!fallback) throw err;
    saveTokenToStorage(fallback);
    return { token: fallback, devFallback: true };
  }
}