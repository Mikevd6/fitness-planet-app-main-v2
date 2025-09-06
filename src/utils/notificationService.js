/**
 * Enhanced NotificationService - Verbeterde notificaties met toegankelijkheid
 */

class NotificationService {
  constructor() {
    this.listeners = [];
    this.notificationQueue = [];
    this.currentId = 1;
    this.maxNotifications = 3; // Maximum aantal zichtbare notificaties
    this.defaultDuration = 5000; // Standaard toon duur in ms
    
    // Toegankelijkheid: creëer een ARIA live region
    this.createAriaLiveRegion();
  }
  
  /**
   * Creëer een ARIA live region voor screenreaders
   */
  createAriaLiveRegion() {
    if (typeof document !== 'undefined') {
      // Alleen in browser environment
      const existingRegion = document.getElementById('notification-live-region');
      
      if (!existingRegion) {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'notification-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        
        document.body.appendChild(liveRegion);
      }
    }
  }
  
  /**
   * Update ARIA live region met nieuwste notificatie voor screenreaders
   * @param {Object} notification - Notificatieobject
   */
  updateAriaLiveRegion(notification) {
    if (typeof document !== 'undefined') {
      const liveRegion = document.getElementById('notification-live-region');
      if (liveRegion) {
        liveRegion.textContent = `${notification.title}: ${notification.message}`;
      }
    }
  }

  /**
   * Luisteraar toevoegen voor notificaties
   * @param {Function} listener - Functie die aangeroepen wordt bij nieuwe notificaties
   * @returns {Function} Functie om de luisteraar te verwijderen
   */
  addListener(listener) {
    if (typeof listener === 'function') {
      this.listeners.push(listener);
    }
    
    // Return unsubscribe functie
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notificeer alle luisteraars
   * @param {Object} notification - Notificatie object
   */
  notifyListeners(notification) {
    this.listeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
    
    // Update ARIA live region voor toegankelijkheid
    this.updateAriaLiveRegion(notification);
  }

  /**
   * Verwerk notificatie queue
   */
  processQueue() {
    const visibleCount = this.notificationQueue.filter(n => !n.dismissed).length;
    
    if (visibleCount < this.maxNotifications && this.notificationQueue.length > visibleCount) {
      // Find next queued notification
      const nextNotification = this.notificationQueue.find(n => n.queued);
      
      if (nextNotification) {
        nextNotification.queued = false;
        this.notifyListeners({ ...nextNotification, action: 'SHOW' });
        
        // Auto dismiss after duration
        if (nextNotification.duration > 0) {
          setTimeout(() => {
            this.dismiss(nextNotification.id);
          }, nextNotification.duration);
        }
      }
    }
  }

  /**
   * Genereer een nieuwe notificatie
   * @param {string} type - Notificatietype (success, error, info, warning)
   * @param {string} title - Notificatietitel
   * @param {string} message - Notificatiebericht
   * @param {Object} options - Extra opties
   * @returns {Object} Het notificatieobject
   */
  createNotification(type, title, message, options = {}) {
    const id = this.currentId++;
    const visibleCount = this.notificationQueue.filter(n => !n.dismissed).length;
    const shouldQueue = visibleCount >= this.maxNotifications;
    
    const notification = {
      id,
      type,
      title,
      message,
      timestamp: new Date(),
      dismissed: false,
      queued: shouldQueue,
      duration: options.duration ?? this.defaultDuration,
      actions: options.actions || []
    };
    
    this.notificationQueue.push(notification);
    
    if (!shouldQueue) {
      this.notifyListeners({ ...notification, action: 'SHOW' });
      
      // Auto dismiss after duration
      if (notification.duration > 0) {
        setTimeout(() => {
          this.dismiss(id);
        }, notification.duration);
      }
    }
    
    return notification;
  }

  /**
   * Verwijder een notificatie
   * @param {number} id - ID van de notificatie
   */
  dismiss(id) {
    const index = this.notificationQueue.findIndex(n => n.id === id);
    
    if (index !== -1) {
      const notification = this.notificationQueue[index];
      
      if (!notification.dismissed) {
        notification.dismissed = true;
        
        // Notify listeners about dismissal
        this.notifyListeners({ ...notification, action: 'DISMISS' });
        
        // Process queue to show next notification
        setTimeout(() => {
          this.processQueue();
          
          // Remove from queue after animation completed
          setTimeout(() => {
            this.notificationQueue = this.notificationQueue.filter(n => n.id !== id);
          }, 300); // Animation duration
        }, 100);
      }
    }
  }

  /**
   * Succesnotificatie tonen
   * @param {string} title - Titel
   * @param {string} message - Bericht
   * @param {Object} options - Extra opties
   */
  success(title, message, options = {}) {
    return this.createNotification('success', title, message, options);
  }

  /**
   * Foutnotificatie tonen
   * @param {string} title - Titel
   * @param {string} message - Bericht
   * @param {Object} options - Extra opties
   */
  error(title, message, options = {}) {
    return this.createNotification('error', title, message, {
      ...options,
      duration: options.duration ?? 0 // Error notifications don't auto-dismiss by default
    });
  }

  /**
   * Infonotificatie tonen
   * @param {string} title - Titel
   * @param {string} message - Bericht
   * @param {Object} options - Extra opties
   */
  info(title, message, options = {}) {
    return this.createNotification('info', title, message, options);
  }

  /**
   * Waarschuwingsnotificatie tonen
   * @param {string} title - Titel
   * @param {string} message - Bericht
   * @param {Object} options - Extra opties
   */
  warning(title, message, options = {}) {
    return this.createNotification('warning', title, message, options);
  }

  /**
   * Alle notificaties verwijderen
   */
  clearAll() {
    const visibleNotifications = this.notificationQueue.filter(n => !n.dismissed);
    
    visibleNotifications.forEach(notification => {
      this.dismiss(notification.id);
    });
  }
}

// Exporteer singleton instance
export const notificationService = new NotificationService();