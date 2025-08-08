export function parseOptions(str) {
  try {
    return JSON.parse(
      str
        .replace(/'/g, '"')
        .replace(/([\w\d]+):/g, '"$1":')
        .replace(/:"([^"]+)"/g, (match, p1) => {
          // Handle already quoted values
          if (p1.startsWith('"') && p1.endsWith('"')) {
            return ':' + p1;
          }
          return ':"' + p1 + '"';
        })
    );
  } catch (e) {
    console.warn('Scradar: Failed to parse options', str, e);
    return {};
  }
}

export function parseElementOptions(element, globalConfigs = {}) {
  const scradarValue = element.dataset.scradar;
  const configKey = element.dataset.scradarConfig;
  
  // 1. Configuration file check (supports both static and dynamic configs)
  if (configKey) {
    // Check global configuration
    if (window.scradarConfigs && window.scradarConfigs[configKey]) {
      const config = window.scradarConfigs[configKey];
      // If config is a function, call it with the element
      if (typeof config === 'function') {
        return config(element);
      }
      return config;
    }
    // Check Scradar-specific configuration
    if (globalConfigs.configs && globalConfigs.configs[configKey]) {
      const config = globalConfigs.configs[configKey];
      // If config is a function, call it with the element
      if (typeof config === 'function') {
        return config(element);
      }
      return config;
    }
  }
  
  // 2. Inline JSON check
  if (scradarValue) {
    try {
      return JSON.parse(
        scradarValue
          .replace(/'/g, '"')
          .replace(/([\w\d]+):/g, '"$1":')
          .replace(/:"([^"]+)"/g, (match, p1) => {
            if (p1.startsWith('"') && p1.endsWith('"')) {
              return ':' + p1;
            }
            return ':"' + p1 + '"';
          })
      );
    } catch (e) {
      console.warn('Scradar: Failed to parse options', scradarValue, e);
    }
  }
  
  return {};
}

export function updateDataAndCss(targets, settings, type, value) {
  if (!settings[type] && type !== 'peak') return;
  
  targets = Array.isArray(targets) ? targets : [targets];
  const prefix = settings.prefix ? settings.prefix + '-' : '';
  const types = settings[type] || ['css'];
  
  types.forEach(outputType => {
    if (outputType === 'data') {
      const attrName = prefix + type.replace(/([A-Z])/g, '-$1').toLowerCase();
      targets.forEach(el => {
        el.dataset[attrName] = value;
      });
    } else if (outputType === 'css') {
      const propName = '--' + prefix + type.replace(/([A-Z])/g, '-$1').toLowerCase();
      targets.forEach(el => {
        el.style.setProperty(propName, value);
      });
    }
  });
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function eventSpeaker(target, eventName, detail = {}) {
  target = Array.isArray(target) ? target : [target];
  target.forEach(el => {
    el.dispatchEvent(new CustomEvent(eventName, { detail }));
  });
}

export function throttleRaf(fn) {
  let ticking = false;
  return (...args) => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        fn(...args);
        ticking = false;
      });
      ticking = true;
    }
  };
}

export function getViewportSize(target, type) {
  if (target === window) {
    const dummy = document.createElement('div');
    dummy.style[type] = type === 'width' ? '100vw' : '100vh';
    dummy.style.position = 'fixed';
    dummy.style.pointerEvents = 'none';
    document.body.append(dummy);
    const size = type === 'width' ? dummy.offsetWidth : dummy.offsetHeight;
    dummy.remove();
    return size || (type === 'width' ? window.innerWidth : window.innerHeight);
  } else {
    return type === 'width' ? target.offsetWidth : target.offsetHeight;
  }
}
