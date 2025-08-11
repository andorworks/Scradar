import { useEffect, useRef, useCallback, useMemo } from 'react';
import Scradar from '../../src/scradar.js';

// Global Scradar instance for performance optimization
let globalScradar = null;
let instanceCount = 0;

// Cleanup function to destroy global instance when no components are using it
const cleanupGlobalInstance = () => {
  if (globalScradar && instanceCount === 0) {
    globalScradar.destroy();
    globalScradar = null;
  }
};

export function useScradar(options = {}) {
  const scradarRef = useRef(null);
  const optionsRef = useRef(options);
  const isInitializedRef = useRef(false);

  // Memoize options to prevent unnecessary re-initialization
  const memoizedOptions = useMemo(() => options, [
    options.target,
    options.debug,
    options.boundary,
    options.totalProgress,
    options.momentum
  ]);

  // Initialize Scradar
  const initializeScradar = useCallback(() => {
    if (isInitializedRef.current) return;

    // Use global instance for better performance in SPA
    if (!globalScradar) {
      globalScradar = new Scradar(memoizedOptions);
    } else {
      // Update existing instance with new options
      globalScradar.update();
    }

    instanceCount++;
    scradarRef.current = globalScradar;
    isInitializedRef.current = true;
  }, [memoizedOptions]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (isInitializedRef.current) {
      instanceCount--;
      isInitializedRef.current = false;
      cleanupGlobalInstance();
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeScradar();
    return cleanup;
  }, [initializeScradar, cleanup]);

  // Update when options change
  useEffect(() => {
    if (scradarRef.current && optionsRef.current !== options) {
      optionsRef.current = options;
      scradarRef.current.update();
    }
  }, [options]);

  // Handle route changes in SPA
  useEffect(() => {
    const handleRouteChange = () => {
      if (scradarRef.current) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          scradarRef.current.update();
        }, 100);
      }
    };

    // Listen for route changes (works with most React routers)
    window.addEventListener('popstate', handleRouteChange);
    
    // For React Router v6
    if (window.history && window.history.pushState) {
      const originalPushState = window.history.pushState;
      window.history.pushState = function(...args) {
        originalPushState.apply(this, args);
        handleRouteChange();
      };
    }

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return scradarRef.current;
}

// Hook for individual elements
export function useScradarElement(config = {}, dependencies = []) {
  const elementRef = useRef(null);
  const configRef = useRef(config);

  const scradarElement = useCallback((node) => {
    if (node) {
      elementRef.current = node;
      
      // Apply configuration
      if (configRef.current) {
        node.setAttribute('data-scradar', JSON.stringify(configRef.current));
      }
    }
  }, [dependencies]);

  // Update configuration when it changes
  useEffect(() => {
    if (elementRef.current && configRef.current !== config) {
      configRef.current = config;
      elementRef.current.setAttribute('data-scradar', JSON.stringify(config));
      
      // Trigger update if global instance exists
      if (globalScradar) {
        globalScradar.update();
      }
    }
  }, [config, dependencies]);

  return scradarElement;
}

// Hook for managing global configurations
export function useScradarConfigs(configs = {}) {
  useEffect(() => {
    Scradar.configs = { ...Scradar.configs, ...configs };
    
    // Update existing instance if available
    if (globalScradar) {
      globalScradar.update();
    }
  }, [configs]);

  return useCallback((newConfigs) => {
    Scradar.configs = { ...Scradar.configs, ...newConfigs };
    if (globalScradar) {
      globalScradar.update();
    }
  }, []);
}

// Utility function for manual control
export function setScradarConfigs(configs) {
  Scradar.configs = { ...Scradar.configs, ...configs };
  if (globalScradar) {
    globalScradar.update();
  }
}

// Cleanup function for manual cleanup (useful in tests)
export function cleanupScradar() {
  if (globalScradar) {
    globalScradar.destroy();
    globalScradar = null;
    instanceCount = 0;
  }
}
