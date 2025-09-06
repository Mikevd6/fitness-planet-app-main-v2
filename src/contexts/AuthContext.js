import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { noviAuthService } from '../services/noviAuthService';
import authService from '../services/authService';

// Initial state
const baseState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

const getInitialState = () => {
  try {
    // Prefer noviAuthService keys
    if (noviAuthService.isAuthenticated()) {
      const user = noviAuthService.getCurrentUser();
      const token = noviAuthService.getToken();
      if (user && token) {
        return { ...baseState, user, token, isAuthenticated: true };
      }
    }
    // Fallback to legacy keys set by api auth service
    const legacyToken = localStorage.getItem('token');
    const legacyUserRaw = localStorage.getItem('user');
    const legacyUser = legacyUserRaw ? JSON.parse(legacyUserRaw) : null;
    if (legacyToken && legacyUser) {
      return { ...baseState, user: legacyUser, token: legacyToken, isAuthenticated: true };
    }
  } catch {}
  return { ...baseState };
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
  RESTORE_SESSION: 'RESTORE_SESSION'
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload.error
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.RESTORE_SESSION:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload.loading
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, undefined, getInitialState);

  // Restore session on app load
  useEffect(() => {
  const restoreSession = async () => {
      try {
    if (noviAuthService.isAuthenticated()) {
          const user = noviAuthService.getCurrentUser();
          const token = noviAuthService.getToken();
          
          if (user && token) {
            dispatch({
              type: AUTH_ACTIONS.RESTORE_SESSION,
              payload: { user, token }
            });
          }
        } else {
          const legacyToken = localStorage.getItem('token');
          const legacyUserRaw = localStorage.getItem('user');
          const legacyUser = legacyUserRaw ? JSON.parse(legacyUserRaw) : null;
          if (legacyToken && legacyUser) {
            dispatch({
              type: AUTH_ACTIONS.RESTORE_SESSION,
              payload: { user: legacyUser, token: legacyToken }
            });
          }
        }
      } catch (error) {
        console.error('Session restoration failed:', error);
      }
    };

    restoreSession();
  }, []);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      // Try backend API first
      try {
        const apiRes = await authService.login(email, password);
        if (apiRes?.user && apiRes?.token) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user: apiRes.user, token: apiRes.token }
          });
          return { success: true };
        }
      } catch (apiErr) {
        // Fallback to local demo auth
        const result = await noviAuthService.login({ email, password });
        if (result.success) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user: result.user, token: result.token }
          });
          return { success: true, fallback: true };
        }
        throw apiErr;
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: error.message }
      });
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    
    try {
      const result = await noviAuthService.register(userData);
      
      if (result.success) {
        dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS });
        return { success: true, message: result.message };
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: { error: error.message }
      });
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    noviAuthService.logout();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    ...state,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
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
