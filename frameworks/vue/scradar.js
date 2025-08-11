import Scradar from '../../src/scradar.js';

// Global Scradar instance for Vue apps
let globalScradar = null;
let instanceCount = 0;

// Cleanup function
const cleanupGlobalInstance = () => {
  if (globalScradar && instanceCount === 0) {
    globalScradar.destroy();
    globalScradar = null;
  }
};

// Vue 3 Plugin
export default {
  install(app, globalOptions = {}) {
    // Initialize global Scradar instance
    if (!globalScradar) {
      globalScradar = new Scradar(globalOptions);
    }
    instanceCount++;

    // Vue 3 directive
    app.directive('scradar', {
      mounted(el, binding) {
        const options = { ...globalOptions, ...binding.value };
        
        // Apply configuration to element
        if (options && typeof options === 'object') {
          el.setAttribute('data-scradar', JSON.stringify(options));
        }
        
        // Store reference for cleanup
        el.__scradar_config = options;
        
        // Update global instance
        if (globalScradar) {
          globalScradar.update();
        }
      },
      
      updated(el, binding) {
        const newOptions = { ...globalOptions, ...binding.value };
        
        // Update configuration if changed
        if (JSON.stringify(el.__scradar_config) !== JSON.stringify(newOptions)) {
          el.__scradar_config = newOptions;
          el.setAttribute('data-scradar', JSON.stringify(newOptions));
          
          if (globalScradar) {
            globalScradar.update();
          }
        }
      },
      
      unmounted(el) {
        // Remove data attribute
        el.removeAttribute('data-scradar');
        delete el.__scradar_config;
        
        // Update global instance
        if (globalScradar) {
          globalScradar.update();
        }
      }
    });
    
    // Global properties
    app.config.globalProperties.$scradar = globalScradar;
    
    // Global configs method
    app.config.globalProperties.$scradarConfigs = (configs) => {
      Scradar.configs = { ...Scradar.configs, ...configs };
      if (globalScradar) {
        globalScradar.update();
      }
    };
    
    // Cleanup method
    app.config.globalProperties.$scradarCleanup = () => {
      instanceCount--;
      cleanupGlobalInstance();
    };
    
    // Provide Scradar instance to components
    app.provide('scradar', globalScradar);
    app.provide('scradarConfigs', (configs) => {
      Scradar.configs = { ...Scradar.configs, ...configs };
      if (globalScradar) {
        globalScradar.update();
      }
    });
  }
};

// Vue 2 compatibility
export const ScradarVue2 = {
  install(Vue, globalOptions = {}) {
    // Initialize global Scradar instance
    if (!globalScradar) {
      globalScradar = new Scradar(globalOptions);
    }
    instanceCount++;

    Vue.directive('scradar', {
      bind(el, binding) {
        const options = { ...globalOptions, ...binding.value };
        
        if (options && typeof options === 'object') {
          el.setAttribute('data-scradar', JSON.stringify(options));
        }
        
        el.__scradar_config = options;
        
        if (globalScradar) {
          globalScradar.update();
        }
      },
      
      update(el, binding) {
        const newOptions = { ...globalOptions, ...binding.value };
        
        if (JSON.stringify(el.__scradar_config) !== JSON.stringify(newOptions)) {
          el.__scradar_config = newOptions;
          el.setAttribute('data-scradar', JSON.stringify(newOptions));
          
          if (globalScradar) {
            globalScradar.update();
          }
        }
      },
      
      unbind(el) {
        el.removeAttribute('data-scradar');
        delete el.__scradar_config;
        
        if (globalScradar) {
          globalScradar.update();
        }
      }
    });
    
    Vue.prototype.$scradar = globalScradar;
    Vue.prototype.$scradarConfigs = (configs) => {
      Scradar.configs = { ...Scradar.configs, ...configs };
      if (globalScradar) {
        globalScradar.update();
      }
    };
    Vue.prototype.$scradarCleanup = () => {
      instanceCount--;
      cleanupGlobalInstance();
    };
  }
};

// Composition API utilities for Vue 3
export function useScradar(options = {}) {
  return {
    instance: globalScradar,
    update: () => globalScradar?.update(),
    destroy: () => {
      instanceCount--;
      cleanupGlobalInstance();
    }
  };
}

export function useScradarConfigs(configs = {}) {
  Scradar.configs = { ...Scradar.configs, ...configs };
  if (globalScradar) {
    globalScradar.update();
  }
  
  return {
    update: (newConfigs) => {
      Scradar.configs = { ...Scradar.configs, ...newConfigs };
      if (globalScradar) {
        globalScradar.update();
      }
    }
  };
}

// Utility functions
export function setScradarConfigs(configs) {
  Scradar.configs = { ...Scradar.configs, ...configs };
  if (globalScradar) {
    globalScradar.update();
  }
}

export function cleanupScradar() {
  if (globalScradar) {
    globalScradar.destroy();
    globalScradar = null;
    instanceCount = 0;
  }
}
