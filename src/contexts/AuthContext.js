import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { noviAuthService } from '../services/noviAuthService';

// Token storage keys used across the app
const AUTH_KEYS = [
  'fitnessplanet:7m997U9ozv6dJ9JLyWh9',
  'novi_auth_token',
  'token',
];

const USER_KEYS = ['novi_auth_user', 'user'];

function isLikelyJwt(t) {
  return !!t && t.split('.').length === 3 && !/^demo-token$/i.test(t);
}

function persistToken(token) {
  try {
    localStorage.setItem(AUTH_KEYS[0], JSON.stringify({ accessToken: token }));
    localStorage.setItem(AUTH_KEYS[1], token);
    localStorage.setItem(AUTH_KEYS[2], token);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to persist token', e);
  }
}

function clearToken() {
  try {
    for (const k of AUTH_KEYS) {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    }
  } catch {}
}

function readTokenFromStorage() {
  const keys = AUTH_KEYS;
  for (const key of keys) {
    const raw = sessionStorage.getItem(key) ?? localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const t = parsed?.accessToken || parsed?.token || parsed?.jwt || null;
      if (isLikelyJwt(t)) return t;
    } catch {
      if (isLikelyJwt(raw)) return raw;
    }
  }
  return null;
}

function getDefaultToken() {
  return process.env.REACT_APP_DEFAULT_JWT || null;
}

function readUserFromStorage() {
  for (const k of USER_KEYS) {
    const raw = localStorage.getItem(k);
    if (!raw) continue;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return null;
}

function decodeJwt(token) {
  try {
    const [, payload] = token.split('.');
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
  RESTORE_SESSION: 'RESTORE_SESSION',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return { ...state, loading: true, error: null };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return { ...state, loading: false, error: null };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload.error,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.RESTORE_SESSION:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload.loading };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on app load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // 1) Prefer noviAuthService if it has an active session
        if (noviAuthService?.isAuthenticated?.()) {
          const user = noviAuthService.getCurrentUser?.() || null;
          const token = noviAuthService.getToken?.() || null;

          if (isLikelyJwt(token)) {
            persistToken(token);
            const fallbackUser =
              user ||
              readUserFromStorage() ||
              buildUserFromToken(token);

            dispatch({
              type: AUTH_ACTIONS.RESTORE_SESSION,
              payload: { user: fallbackUser, token },
            });
            return;
          }
        }

        // 2) Otherwise read token from storage or .env fallback
        let token = readTokenFromStorage();
        if (!isLikelyJwt(token)) {
          const fallback = getDefaultToken();
          if (isLikelyJwt(fallback)) {
            persistToken(fallback);
            token = fallback;
          }
        }

        if (isLikelyJwt(token)) {
          const user = readUserFromStorage() || buildUserFromToken(token);
          dispatch({
            type: AUTH_ACTIONS.RESTORE_SESSION,
            payload: { user, token },
          });
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { loading: false } });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Session restoration failed:', error);
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { loading: false } });
      }
    };

    restoreSession();
  }, []);

  function buildUserFromToken(token) {
    const p = decodeJwt(token) || {};
    // best-effort shape; adjust if your app needs specific fields
    return {
      id: p.userId || p.userID || p.sub || p.id || null,
      email: p.email || p.sub || 'dev@fitnessplanet.com',
      name: p.name || p.username || 'User',
      role: p.role || p.roles || p.authorities || 'USER',
      applicationName: p.applicationName,
    };
  }

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const result = await noviAuthService.login(credentials);

      let token =
        result?.token ||
        result?.jwt ||
        result?.accessToken ||
        noviAuthService.getToken?.();

      if (!isLikelyJwt(token)) {
        // Dev fallback to .env JWT
        token = getDefaultToken();
      }

      if (!isLikelyJwt(token)) {
        throw new Error('No valid token returned from login and no REACT_APP_DEFAULT_JWT configured.');
      }

      persistToken(token);

      const user =
        result?.user ||
        noviAuthService.getCurrentUser?.() ||
        buildUserFromToken(token);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: error.message || 'Login failed' },
      });
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  // Register function (delegates to noviAuthService)
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      const result = await noviAuthService.register(userData);
      dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS });
      return { success: true, message: result?.message || 'Registered' };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: { error: error.message || 'Registration failed' },
      });
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  // Logout function
  const logout = () => {
    try {
      noviAuthService?.logout?.();
    } catch {}
    clearToken();
    for (const k of USER_KEYS) {
      localStorage.removeItem(k);
    }
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
