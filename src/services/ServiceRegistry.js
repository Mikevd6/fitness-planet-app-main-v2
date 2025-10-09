/**
 * ServiceRegistry - Centrale hub voor applicatieservices
 * Maakt het toevoegen van nieuwe features eenvoudiger door centrale registratie
 */

class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.initializers = new Map();
  }

  /**
   * Registreer een service met een unieke naam
   * @param {string} name - Unieke naam van de service
   * @param {Object} service - Service instantie
   * @param {Function} [initializer] - Optionele initializer functie
   */
  register(name, service, initializer = null) {
    if (this.services.has(name)) {
      console.warn(`Service '${name}' is already registered and will be overwritten`);
    }
    
    this.services.set(name, service);
    
    if (initializer && typeof initializer === 'function') {
      this.initializers.set(name, initializer);
    }
    
    return this; // Voor method chaining
  }

  /**
   * Haal een geregistreerde service op
   * @param {string} name - Naam van de service
   * @returns {Object|null} De service of null als deze niet bestaat
   */
  get(name) {
    if (!this.services.has(name)) {
      console.warn(`Service '${name}' is not registered`);
      return null;
    }
    
    return this.services.get(name);
  }

  /**
   * Controleer of een service geregistreerd is
   * @param {string} name - Naam van de service
   * @returns {boolean} True als de service bestaat
   */
  has(name) {
    return this.services.has(name);
  }

  /**
   * Verwijder een service
   * @param {string} name - Naam van de service
   * @returns {boolean} True als de service verwijderd is
   */
  unregister(name) {
    const removed = this.services.delete(name);
    this.initializers.delete(name);
    return removed;
  }

  /**
   * Initialiseer alle services met geregistreerde initializers
   * @returns {Promise<void>} Promise die resolved wanneer alle services geïnitialiseerd zijn
   */
  async initializeAll() {
    const initPromises = [];
    
    for (const [name, initializer] of this.initializers.entries()) {
      const service = this.services.get(name);
      if (service) {
        try {
          const promise = Promise.resolve(initializer(service));
          initPromises.push(promise);
        } catch (error) {
          console.error(`Error initializing service '${name}':`, error);
          initPromises.push(Promise.reject(error));
        }
      }
    }
    
    return Promise.all(initPromises);
  }

  /**
   * Reset de registry door alle services te verwijderen
   */
  reset() {
    this.services.clear();
    this.initializers.clear();
  }
}

// Singleton instance
export const serviceRegistry = new ServiceRegistry();

// Standaard services registreren
import { storage } from '../utils/localStorage';
import { apiService } from '../utils/apiService';
import { notificationService } from '../utils/notificationService';
import { healthCheckService } from '../utils/healthCheck';

// Standaard services registreren
serviceRegistry
  .register('storage', storage)
  .register('api', apiService)
  .register('notifications', notificationService)
  .register('healthCheck', healthCheckService, (service) => {
    if (process.env.NODE_ENV === 'production') {
      service.start();
    }
    return Promise.resolve();
  });

// Helper functie om snel services te verkrijgen
export const getService = (name) => serviceRegistry.get(name);