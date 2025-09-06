/**
 * Application Context - Centrale state management zonder Redux
 * Maakt het delen van state tussen componenten eenvoudiger
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { storage } from '../utils/localStorage';
import { notificationService } from '../utils/notificationService';
import { serviceRegistry } from '../services/ServiceRegistry';

// Initial state
const initialState = {
  user: null,
  loading: true,
  theme: 'light',
  language: 'nl',
  featureFlags: {},
  settings: {
    notifications: true,
    analytics: true,
    showCalories: true,
    unitSystem: 'metric'
  }
};

// Action types
export const ACTION_TYPES = {
  SET_USER: 'SET_USER',
  CLEAR_USER: 'CLEAR_USER',
  SET_LOADING: 'SET_LOADING',
  SET_THEME: 'SET_THEME',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_SETTING: 'SET_SETTING',
  SET_FEATURE_FLAGS: 'SET_FEATURE_FLAGS'
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_USER:
      return { ...state, user: action.payload };
      
    case ACTION_TYPES.CLEAR_USER:
      return { ...state, user: null };
      
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case ACTION_TYPES.SET_THEME:
      return { ...state, theme: action.payload };
      
    case ACTION_TYPES.SET_LANGUAGE:
      return { ...state, language: action.payload };
      
    case ACTION_TYPES.SET_SETTING:
      return { 
        ...state, 
        settings: { 
          ...state.settings, 
          [action.payload.key]: action.payload.value 
        } 
      };
      
    case ACTION_TYPES.SET_FEATURE_FLAGS:
      return { ...state, featureFlags: action.payload };
      
    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Initialize app state from storage
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Haal user op
        const savedUser = storage.getUser();
        if (savedUser) {
          dispatch({ type: ACTION_TYPES.SET_USER, payload: savedUser });
        }
        
        // Haal settings op
        const savedSettings = localStorage.getItem('fitnessplanet_settings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          Object.entries(parsedSettings).forEach(([key, value]) => {
            dispatch({ 
              type: ACTION_TYPES.SET_SETTING, 
              payload: { key, value } 
            });
          });
        }
        
        // Initialiseer services
        await serviceRegistry.initializeAll();
        
        // Haal thema op
        const savedTheme = localStorage.getItem('fitnessplanet_theme') || 'light';
        dispatch({ type: ACTION_TYPES.SET_THEME, payload: savedTheme });
        document.documentElement.setAttribute('data-theme', savedTheme);
        
      } catch (error) {
        console.error('Error initializing app:', error);
        notificationService.error('Error', 'Er is een fout opgetreden bij het initialiseren van de app');
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    };
    
    initializeApp();
  }, []);
  
  // Save settings when changed
  useEffect(() => {
    if (!state.loading) {
      localStorage.setItem('fitnessplanet_settings', JSON.stringify(state.settings));
    }
  }, [state.settings]);
  
  // Save theme when changed
  useEffect(() => {
    if (!state.loading) {
      localStorage.setItem('fitnessplanet_theme', state.theme);
      document.documentElement.setAttribute('data-theme', state.theme);
    }
  }, [state.theme]);
  
  // Actions
  const login = (userData) => {
    dispatch({ type: ACTION_TYPES.SET_USER, payload: userData });
    storage.setUser(userData);
    notificationService.success('Ingelogd', `Welkom terug, ${userData.name}!`);
  };
  
  const logout = () => {
    dispatch({ type: ACTION_TYPES.CLEAR_USER });
    storage.removeUser();
    notificationService.info('Uitgelogd', 'Je bent succesvol uitgelogd');
  };
  
  const toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    dispatch({ type: ACTION_TYPES.SET_THEME, payload: newTheme });
  };
  
  const setSetting = (key, value) => {
    dispatch({ 
      type: ACTION_TYPES.SET_SETTING, 
      payload: { key, value } 
    });
  };
  
  // Context value
  const value = {
    ...state,
    login,
    logout,
    toggleTheme,
    setSetting,
    dispatch
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}