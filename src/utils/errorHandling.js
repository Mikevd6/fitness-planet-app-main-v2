/**
 * Error handling utility - Consistente foutafhandeling in de hele applicatie
 */

import { notificationService } from './notificationService';

// Error categorieën voor betere gebruikersfeedback
const ERROR_CATEGORIES = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  CLIENT: 'client',
  UNKNOWN: 'unknown'
};

/**
 * Bepaal de categorie van een error voor betere gebruikersberichten
 * @param {Error} error - De error om te categoriseren
 * @returns {string} Error categorie
 */
function categorizeError(error) {
  // Network errors
  if (!navigator.onLine || error.message?.includes('network') || error.message?.includes('Network Error')) {
    return ERROR_CATEGORIES.NETWORK;
  }
  
  // Axios or fetch errors
  if (error.response) {
    const status = error.response.status;
    
    if (status === 401) return ERROR_CATEGORIES.AUTHENTICATION;
    if (status === 403) return ERROR_CATEGORIES.AUTHORIZATION;
    if (status === 404) return ERROR_CATEGORIES.NOT_FOUND;
    if (status >= 400 && status < 500) return ERROR_CATEGORIES.CLIENT;
    if (status >= 500) return ERROR_CATEGORIES.SERVER;
  }
  
  // Validation errors
  if (error.name === 'ValidationError' || 
      error.message?.toLowerCase().includes('validation') ||
      error.errors) {
    return ERROR_CATEGORIES.VALIDATION;
  }
  
  return ERROR_CATEGORIES.UNKNOWN;
}

/**
 * Genereer een gebruikersvriendelijke foutmelding op basis van de fout
 * @param {Error} error - De fout om te vertalen
 * @returns {string} Gebruikersvriendelijke foutmelding
 */
function getUserFriendlyMessage(error) {
  const category = categorizeError(error);
  
  // Standaardberichten per categorie
  const defaultMessages = {
    [ERROR_CATEGORIES.NETWORK]: 'Er is een netwerkprobleem opgetreden. Controleer je internetverbinding.',
    [ERROR_CATEGORIES.VALIDATION]: 'Sommige ingevoerde gegevens zijn niet geldig. Controleer je invoer.',
    [ERROR_CATEGORIES.AUTHENTICATION]: 'Je moet opnieuw inloggen om door te gaan.',
    [ERROR_CATEGORIES.AUTHORIZATION]: 'Je hebt geen toegang tot deze functie.',
    [ERROR_CATEGORIES.NOT_FOUND]: 'De gevraagde informatie kon niet worden gevonden.',
    [ERROR_CATEGORIES.SERVER]: 'Er is een probleem met de server. Probeer het later opnieuw.',
    [ERROR_CATEGORIES.CLIENT]: 'Er is een probleem opgetreden in de app. Probeer het opnieuw.',
    [ERROR_CATEGORIES.UNKNOWN]: 'Er is een onverwachte fout opgetreden. Probeer het opnieuw.'
  };
  
  // Controleer op specifieke foutberichten van de API
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Controleer op validatiefouten met specifieke veldmeldingen
  if (category === ERROR_CATEGORIES.VALIDATION && error.errors) {
    const firstError = Object.values(error.errors)[0];
    if (typeof firstError === 'string') {
      return firstError;
    }
  }
  
  return defaultMessages[category];
}

/**
 * Handelt een error consistent af in de hele applicatie
 * @param {Error} error - De te behandelen error
 * @param {Object} options - Extra opties voor de afhandeling
 * @param {boolean} options.silent - Of de fout stil afgehandeld moet worden (geen notificatie)
 * @param {string} options.context - Context waarin de fout optrad
 * @param {Function} options.callback - Optionele callback na afhandeling
 */
export function handleError(error, options = {}) {
  const { silent = false, context = '', callback } = options;
  
  // Log de fout voor ontwikkelaars
  console.error(`Error ${context ? `in ${context}` : ''}:`, error);
  
  // Bepaal het gebruikersvriendelijke bericht
  const userMessage = getUserFriendlyMessage(error);
  
  // Toon een notificatie als niet stil
  if (!silent) {
    notificationService.error('Er is een fout opgetreden', userMessage);
  }
  
  // Voer callback uit indien aanwezig
  if (callback && typeof callback === 'function') {
    callback(error);
  }
  
  // Speciale afhandeling voor authenticatiefouten
  if (categorizeError(error) === ERROR_CATEGORIES.AUTHENTICATION) {
    // Redirect naar login pagina na korte timeout zodat gebruiker het bericht kan zien
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  }
}

/**
 * Wrapt een async functie met consistente foutafhandeling
 * @param {Function} asyncFn - De async functie om te wrappen
 * @param {Object} options - Opties voor foutafhandeling
 * @returns {Function} Gewrapte functie met ingebouwde foutafhandeling
 */
export function withErrorHandling(asyncFn, options = {}) {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      handleError(error, options);
      throw error; // Re-throw voor verdere afhandeling indien nodig
    }
  };
}