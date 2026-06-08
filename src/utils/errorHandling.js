import { notificationService } from './notificationService';
import { notifyUnauthorized } from './authEvents';

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

function categorizeError(error) {
  if (!navigator.onLine || error.message?.includes('network') || error.message?.includes('Network Error')) {
    return ERROR_CATEGORIES.NETWORK;
  }

  if (error.response) {
    const status = error.response.status;

    if (status === 401) return ERROR_CATEGORIES.AUTHENTICATION;
    if (status === 403) return ERROR_CATEGORIES.AUTHORIZATION;
    if (status === 404) return ERROR_CATEGORIES.NOT_FOUND;
    if (status >= 400 && status < 500) return ERROR_CATEGORIES.CLIENT;
    if (status >= 500) return ERROR_CATEGORIES.SERVER;
  }

  if (
    error.name === 'ValidationError'
    || error.message?.toLowerCase().includes('validation')
    || error.errors
  ) {
    return ERROR_CATEGORIES.VALIDATION;
  }

  return ERROR_CATEGORIES.UNKNOWN;
}

function getUserFriendlyMessage(error) {
  const category = categorizeError(error);
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

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (category === ERROR_CATEGORIES.VALIDATION && error.errors) {
    const firstError = Object.values(error.errors)[0];
    if (typeof firstError === 'string') return firstError;
  }

  return defaultMessages[category];
}

export function handleError(error, options = {}) {
  const { silent = false, callback } = options;
  const userMessage = getUserFriendlyMessage(error);

  if (!silent) {
    notificationService.error('Er is een fout opgetreden', userMessage);
  }

  if (typeof callback === 'function') {
    callback(error);
  }

  if (categorizeError(error) === ERROR_CATEGORIES.AUTHENTICATION) {
    setTimeout(() => {
      notifyUnauthorized();
    }, 2000);
  }
}

export function withErrorHandling(asyncFn, options = {}) {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      handleError(error, options);
      throw error;
    }
  };
}
