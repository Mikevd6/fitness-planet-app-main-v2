/**
 * Feature Flags hook - Voor het veilig toevoegen van nieuwe functionaliteit
 * Zorgt ervoor dat nieuwe features geleidelijk kunnen worden uitgerold of getest
 */

import { useState, useEffect } from 'react';

// In-memory cache voor feature flags
const featureFlagCache = new Map();

// Default waarden voor lokale ontwikkeling
const DEV_FLAGS = {
  newRecipeFilter: true,
  advancedNutritionTracking: true,
  aiMealSuggestions: false,
  progressGraphs: true,
  newProfilePage: false
};

/**
 * Haalt feature flags op van API of gebruikt gecachte waarden
 * 
 * @param {string} flagName - Naam van de feature flag
 * @param {boolean} defaultValue - Default waarde als flag niet bestaat
 * @returns {boolean} Of de feature actief is
 */
export const useFeatureFlag = (flagName, defaultValue = false) => {
  const [isEnabled, setIsEnabled] = useState(() => {
    // Check cache first
    if (featureFlagCache.has(flagName)) {
      return featureFlagCache.get(flagName);
    }
    
    // Gebruik ontwikkelingswaarden in development mode
    if (process.env.NODE_ENV === 'development') {
      return DEV_FLAGS[flagName] ?? defaultValue;
    }
    
    return defaultValue;
  });

  useEffect(() => {
    // Skip API call als we al een waarde in cache hebben
    if (featureFlagCache.has(flagName)) {
      setIsEnabled(featureFlagCache.get(flagName));
      return;
    }
    
    const fetchFeatureFlag = async () => {
      try {
        // In een echte applicatie zou dit van een API komen
        // Voor dit voorbeeld gebruiken we lokale mock data
        
        // Simuleer API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Mock response
        const response = {
          flags: {
            newRecipeFilter: true,
            advancedNutritionTracking: true,
            aiMealSuggestions: process.env.NODE_ENV === 'development',
            progressGraphs: true,
            newProfilePage: false
          }
        };
        
        const enabled = response.flags[flagName] ?? defaultValue;
        
        // Update cache
        featureFlagCache.set(flagName, enabled);
        
        // Update state
        setIsEnabled(enabled);
      } catch (error) {
        console.error(`Error fetching feature flag ${flagName}:`, error);
        
        // Gebruik default bij fout
        setIsEnabled(defaultValue);
      }
    };
    
    fetchFeatureFlag();
  }, [flagName, defaultValue]);
  
  return isEnabled;
};

/**
 * Component voor conditioneel renderen op basis van feature flags
 * 
 * @example
 * <FeatureFlag name="newProfilePage">
 *   <NewProfileComponent />
 * </FeatureFlag>
 */
export const FeatureFlag = ({ name, defaultValue = false, children, fallback = null }) => {
  const isEnabled = useFeatureFlag(name, defaultValue);
  
  if (isEnabled) {
    return children;
  }
  
  return fallback;
};