// Performance monitoring utility for production
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private errors: Array<{ error: string; timestamp: number; context?: any }> = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track page load performance
  trackPageLoad(pageName: string) {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.set(`${pageName}_load_time`, navigation.loadEventEnd - navigation.loadEventStart);
        this.metrics.set(`${pageName}_dom_content_loaded`, navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
        this.metrics.set(`${pageName}_first_paint`, performance.getEntriesByName('first-paint')[0]?.startTime || 0);
        this.metrics.set(`${pageName}_first_contentful_paint`, performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0);
      }
    }
  }

  // Track API call performance
  trackApiCall(endpoint: string, duration: number, success: boolean) {
    const key = `${endpoint}_${success ? 'success' : 'error'}`;
    this.metrics.set(key, duration);
    
    if (!success) {
      this.errors.push({
        error: `API call failed: ${endpoint}`,
        timestamp: Date.now(),
        context: { endpoint, duration }
      });
    }
  }

  // Track authentication performance
  trackAuth(action: 'login' | 'logout' | 'signup', duration: number, success: boolean) {
    const key = `auth_${action}_${success ? 'success' : 'error'}`;
    this.metrics.set(key, duration);
    
    if (!success) {
      this.errors.push({
        error: `Auth ${action} failed`,
        timestamp: Date.now(),
        context: { action, duration }
      });
    }
  }

  // Track component render performance
  trackComponentRender(componentName: string, duration: number) {
    this.metrics.set(`component_${componentName}_render`, duration);
  }

  // Get performance report
  getReport() {
    return {
      metrics: Object.fromEntries(this.metrics),
      errors: this.errors,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }

  // Send performance data to analytics (placeholder for production)
  sendToAnalytics() {
    if (process.env.NODE_ENV === 'production') {
      const report = this.getReport();
      // TODO: Send to your analytics service
      console.log('Performance Report:', report);
      
      // Example: Send to Supabase for logging
      // supabase.from('performance_logs').insert(report);
    }
  }

  // Clear metrics (useful for testing)
  clear() {
    this.metrics.clear();
    this.errors = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Auto-send performance data every 5 minutes in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  setInterval(() => {
    performanceMonitor.sendToAnalytics();
  }, 5 * 60 * 1000);
} 