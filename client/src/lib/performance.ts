// Usage:
// import { performanceMonitor, usePerformanceMeasure, measureApiCall } from './performance';
// performanceMonitor.startTimer('my-task'); ... performanceMonitor.endTimer('my-task');
// await measureApiCall('api-call', () => fetch(...));
// In a React component: usePerformanceMeasure('ComponentName');

import React from 'react';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private observers: Set<(metric: PerformanceMetric) => void> = new Set();

  startTimer(name: string, metadata?: Record<string, any>): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  endTimer(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance timer "${name}" not found`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    // Log slow operations
    if (metric.duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`, metric.metadata);
    }

    // Notify observers
    this.observers.forEach(observer => observer(metric));

    return metric.duration;
  }

  measureAsync<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    this.startTimer(name, metadata);
    return fn().finally(() => {
      this.endTimer(name);
    });
  }

  measureSync<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    this.startTimer(name, metadata);
    try {
      const result = fn();
      this.endTimer(name);
      return result;
    } catch (error) {
      this.endTimer(name);
      throw error;
    }
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  addObserver(observer: (metric: PerformanceMetric) => void): void {
    this.observers.add(observer);
  }

  removeObserver(observer: (metric: PerformanceMetric) => void): void {
    this.observers.delete(observer);
  }
}

// Global performance monitor
export const performanceMonitor = new PerformanceMonitor();

// React hook for measuring component render time
export function usePerformanceMeasure(name: string) {
  React.useEffect(() => {
    performanceMonitor.startTimer(`render:${name}`);
    return () => {
      performanceMonitor.endTimer(`render:${name}`);
    };
  });
}

// Higher-order component for measuring render performance
export function withPerformanceMeasure<P extends Record<string, any>>(
  WrappedComponent: React.ComponentType<P>,
  name: string
) {
  return function PerformanceMeasuredComponent(props: P) {
    usePerformanceMeasure(name);
    return React.createElement(WrappedComponent, props);
  };
}

// Utility for measuring API calls
export async function measureApiCall<T>(
  name: string,
  apiCall: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return performanceMonitor.measureAsync(name, apiCall, metadata);
}

// Log performance metrics periodically
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const metrics = performanceMonitor.getMetrics();
    const slowMetrics = metrics.filter(m => m.duration && m.duration > 500);
    if (slowMetrics.length > 0) {
      console.group('Performance Report');
      slowMetrics.forEach(metric => {
        console.log(`${metric.name}: ${metric.duration?.toFixed(2)}ms`, metric.metadata);
      });
      console.groupEnd();
    }
  }, 30000); // Every 30 seconds
} 