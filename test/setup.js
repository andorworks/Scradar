// IntersectionObserver Mock
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.elements = new Set();
  }

  observe(element) {
    this.elements.add(element);
    // Don't automatically trigger callback in tests
    // Let the test control when intersection happens
  }

  unobserve(element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }
  
  // Helper method for testing
  trigger(entries) {
    this.callback(entries, this);
  }
};

// requestAnimationFrame Mock
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 16);
};

global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

// scrollY Mock
Object.defineProperty(window, 'scrollY', {
  writable: true,
  value: 0
});

Object.defineProperty(window, 'scrollX', {
  writable: true,
  value: 0
});

// innerHeight/innerWidth Mock
Object.defineProperty(window, 'innerHeight', {
  writable: true,
  value: 768
});

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  value: 1024
});

// scrollTo Mock
window.scrollTo = jest.fn((x, y) => {
  if (typeof x === 'object') {
    window.scrollX = x.left || 0;
    window.scrollY = x.top || 0;
  } else {
    window.scrollX = x;
    window.scrollY = y;
  }
});

// getComputedStyle Mock enhancement
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (element) => {
  const style = originalGetComputedStyle(element);
  style.getPropertyValue = jest.fn((prop) => {
    return element.style.getPropertyValue(prop) || '';
  });
  return style;
};
