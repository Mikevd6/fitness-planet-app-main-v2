import { apiService } from './apiService';

class HealthCheckService {
  constructor() {
    this.isRunning = false;
    this.checkInterval = 60000; // Check every minute
    this.lastCheck = null;
    this.uptimeLog = [];
    this.listeners = [];
    this.maxLogEntries = 1440; // Store last 24 hours (1 min checks)
  }
  
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.performCheck();
    
    this.intervalId = setInterval(() => {
      this.performCheck();
    }, this.checkInterval);
    
    console.log('Health check service started');
  }
  
  stop() {
    if (!this.isRunning) return;
    
    clearInterval(this.intervalId);
    this.isRunning = false;
    console.log('Health check service stopped');
  }
  
  async performCheck() {
    const timestamp = new Date();
    let status = 'down';
    let responseTime = 0;
    
    try {
      const startTime = performance.now();
      const response = await apiService.healthCheck();
      const endTime = performance.now();
      
      responseTime = Math.round(endTime - startTime);
      status = response.data?.status === 'ok' ? 'up' : 'degraded';
    } catch (error) {
      console.error('Health check failed:', error);
      status = 'down';
    }
    
    const checkResult = { timestamp, status, responseTime };
    this.lastCheck = checkResult;
    
    // Add to log and trim if needed
    this.uptimeLog.unshift(checkResult);
    if (this.uptimeLog.length > this.maxLogEntries) {
      this.uptimeLog = this.uptimeLog.slice(0, this.maxLogEntries);
    }
    
    // Notify listeners
    this.notifyListeners(checkResult);
    
    return checkResult;
  }
  
  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
    return () => this.removeListener(callback);
  }
  
  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }
  
  notifyListeners(checkResult) {
    this.listeners.forEach(callback => {
      try {
        callback(checkResult);
      } catch (error) {
        console.error('Error in health check listener:', error);
      }
    });
  }
  
  getUptimePercentage(hours = 24) {
    // Calculate uptime for the specified hours
    const relevantEntries = this.uptimeLog.filter(
      entry => new Date() - entry.timestamp < hours * 60 * 60 * 1000
    );
    
    if (relevantEntries.length === 0) return 100; // No data means we assume up
    
    const upEntries = relevantEntries.filter(entry => entry.status === 'up').length;
    return (upEntries / relevantEntries.length) * 100;
  }
  
  getAverageResponseTime(hours = 1) {
    // Calculate average response time for the specified hours
    const relevantEntries = this.uptimeLog.filter(
      entry => new Date() - entry.timestamp < hours * 60 * 60 * 1000
    );
    
    if (relevantEntries.length === 0) return 0;
    
    const totalTime = relevantEntries.reduce((sum, entry) => sum + entry.responseTime, 0);
    return Math.round(totalTime / relevantEntries.length);
  }
  
  getStatusReport() {
    const uptime24h = this.getUptimePercentage(24);
    const uptime1h = this.getUptimePercentage(1);
    const avgResponseTime = this.getAverageResponseTime(1);
    
    return {
      currentStatus: this.lastCheck?.status || 'unknown',
      uptime24h: uptime24h.toFixed(2) + '%',
      uptime1h: uptime1h.toFixed(2) + '%',
      avgResponseTime: avgResponseTime + 'ms',
      lastChecked: this.lastCheck?.timestamp || null,
      meets99Percent: uptime24h >= 99
    };
  }
}

// Create singleton instance
export const healthCheckService = new HealthCheckService();

// Initialize the service if in production
if (process.env.NODE_ENV === 'production') {
  healthCheckService.start();
}