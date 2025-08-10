import { 
  parseOptions, 
  parseElementOptions,
  updateDataAndCss, 
  capitalize, 
  eventSpeaker,
  getViewportSize
} from './utils.js';

export default class ScradarController {
  constructor(el, globalOptions, shadowDom, globalConfigs = {}) {
    this.el = el;
    this.shadowDom = shadowDom;
    this.settings = { 
      ...globalOptions, 
      ...parseElementOptions(el, globalConfigs)
    };
    this.init = false;
    this.triggerId = null;
    
    // Container reference
    this.container = null;
    this.containerSize = 0;
    
    // Progress values
    this.visibility = 0;
    this.fill = 0;
    this.cover = 0;
    this.enter = 0;
    this.exit = 0;
    this.peak = 0;
    
    // Offset values
    this.offsetEnter = 0;
    this.offsetExit = 0;
    
    // State tracking
    this.wasIn = false;
    this.wasFull = false;
    this.isFull = false;
    
    // Step tracking
    this.currentVisibilityStep = null;
    this.currentFillStep = null;
    this.currentCoverStep = null;
    this.currentEnterStep = null;
    this.currentExitStep = null;
    
    this.#init();
  }

  #init() {
    // Parse progress options
    this.#parseProgressOptions();
    
    // Parse steps
    this.#parseSteps();
    
    // Parse peak
    this.#parsePeak();
  
    // Create trigger if needed
    this.#createTrigger();
    
    // Set container reference
    this.#setContainer();
    
    // Initial update
    this.update();
    this.init = true;
  }

  #setContainer() {
    this.container = this.settings.container 
      ? document.querySelector(this.settings.container) 
      : window;
    
    // Calculate container size using getViewportSize
    this.containerSize = this.settings.horizontal 
      ? getViewportSize(this.container, 'width')
      : getViewportSize(this.container, 'height');
  }

  #parseProgressOptions() {
    const progressTypes = [
      'visibility', 'fill', 'cover', 
      'enter', 'exit', 'offsetEnter', 'offsetExit'
    ];
    
    progressTypes.forEach(type => {
      if (this.settings[type] !== undefined) {
        if (!this.settings[type]) {
          delete this.settings[type];
        } else if (Array.isArray(this.settings[type])) {
          const validTypes = this.settings[type].filter(t => ['css', 'data'].includes(t));
          this.settings[type] = validTypes.length ? validTypes : ['css'];
        } else if (this.settings[type] === true) {
          this.settings[type] = ['css'];
        } else if (typeof this.settings[type] === 'string') {
          this.settings[type] = [this.settings[type]];
        }
      }
    });
  }

  #parseSteps() {
    const stepTypes = ['visibility', 'fill', 'cover', 'enter', 'exit'];
    stepTypes.forEach(type => {
      const key = `${type}Step`;
      if (Array.isArray(this.settings[key])) {
        this.settings[key] = [...new Set([-9999, ...this.settings[key], 9999])].sort((a, b) => a - b);
        this[`current${capitalize(type)}Step`] = 0;
      }
    });
  }

  #parsePeak() {
    if (Array.isArray(this.settings.peak) && this.settings.peak.length === 3) {
      const [start, peak, end] = this.settings.peak;
      this.settings.peak = { start, peak, end };
    }
  }

  #createTrigger() {
    if (!this.settings.trigger) return;
    
    const triggerArea = document.createElement('div');
    const triggerSettings = this.settings.trigger.trim().split(' ');
    
    Object.assign(triggerArea.style, {
      position: 'fixed',
      zIndex: -1,
      pointerEvents: 'none',
      opacity: 0,
      top: triggerSettings[0] || '0',
      right: triggerSettings[1] || triggerSettings[0] || '0',
      bottom: triggerSettings[2] || triggerSettings[0] || '0',
      left: triggerSettings[3] || triggerSettings[1] || triggerSettings[0] || '0',
    });
    
    triggerArea.id = 'trigger_' + (Math.random() + 1).toString(36).substring(2);
    triggerArea.setAttribute('tabindex', -1);
    this.triggerId = triggerArea.id;
    this.shadowDom.append(triggerArea);
  }

  update(resize = false) {
    if (this.settings.unmount && this.init) return;
    if (!this.settings.mount) {
      this.settings.unmount = true;
    }

    // Handle breakpoints on resize
    if (this.settings.breakpoint && resize) {
      this.#applyBreakpoint(window.innerWidth);
    }
    
    // Update container size (resize or container changed)
    if (resize || !this.containerSize) {
      this.#updateContainerSize();
    }

    // Get dimensions
    const rect = this.el.getBoundingClientRect();
    const horizontal = this.settings.horizontal;
    
    // Calculate sizes using proper container size
    const containerSize = this.containerSize;
    const elSize = horizontal ? this.el.offsetWidth : this.el.offsetHeight;
    const elStart = horizontal ? rect.left : rect.top;
    const elEnd = elStart + elSize;
    
    // Handle delay elements
    const delayOffset = this.#calculateDelayOffset(elStart, containerSize);
    const contentSize = elSize - delayOffset;
    const sizeGap = contentSize - containerSize;
    
    // Calculate progress values
    this.#calculateProgress(elStart, elEnd, elSize, containerSize, sizeGap, delayOffset);
    
    // Update data and CSS
    this.#updateOutputs();
    
    // Check steps
    this.#checkSteps();
    
    // Handle events
    this.#handleEvents(elStart, elEnd, containerSize);
    
    // Handle trigger collision
    if (this.triggerId) {
      this.#handleTriggerCollision(elStart, elEnd);
    }
  }

  #updateContainerSize() {
    // Container may have changed, so check again
    this.container = this.settings.container 
      ? document.querySelector(this.settings.container) 
      : window;
    
    // Calculate exact size using getViewportSize
    this.containerSize = this.settings.horizontal 
      ? getViewportSize(this.container, 'width')
      : getViewportSize(this.container, 'height');
  }

  #applyBreakpoint(windowWidth) {
    const originalSettings = this.el.dataset.scradar 
      ? parseOptions(this.el.dataset.scradar) 
      : {};
    
    Object.keys(this.settings.breakpoint)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach(bp => {
        if (windowWidth >= bp) {
          Object.assign(this.settings, this.settings.breakpoint[bp]);
        } else {
          Object.keys(this.settings.breakpoint[bp]).forEach(key => {
            if (originalSettings[key] !== undefined) {
              this.settings[key] = originalSettings[key];
            } else {
              delete this.settings[key];
            }
          });
        }
      });
    
    // Re-parse after breakpoint changes
    this.#parseProgressOptions();
    this.#parseSteps();
    
    // Update container after breakpoint changes (container settings may have changed)
    this.#updateContainerSize();
  }

  #calculateDelayOffset(elStart, containerSize) {
    if (!this.settings.delay) return 0;
    
    const delayElements = this.el.querySelectorAll(`${this.settings.delay}:not(.disabled)`);
    let offset = 0;
    
    delayElements.forEach(delayEl => {
      const delayRect = delayEl.getBoundingClientRect();
      const delaySize = this.settings.horizontal ? delayRect.width : delayRect.height;
      const _delayStart = this.settings.horizontal ? delayRect.left : delayRect.top;
      const delayPos = this.settings.horizontal ? delayEl.offsetLeft : delayEl.offsetTop;
      
      const viewedSize = Math.max(delaySize + delayPos + elStart, 0);
      
      if (viewedSize >= 0 && viewedSize <= delaySize) {
        offset += delaySize - Math.max(Math.min(viewedSize, delaySize), 0);
      } else if (
        delayEl.classList.contains('scradar__delay--end') &&
        viewedSize >= containerSize &&
        viewedSize <= containerSize + delaySize
      ) {
        offset += delaySize - Math.min(viewedSize - containerSize, delaySize);
      }
    });
    
    return Math.max(0, offset);
  }

  #calculateProgress(elStart, elEnd, elSize, containerSize, sizeGap, delayOffset) {
    // Optimized visibility calculation: 0 (before) ~ 1 (after)
    const visibilityDenominator = -containerSize - elSize;
    this.visibility = Math.max(0, Math.min(1, elEnd / visibilityDenominator + 1));
    
    // Optimized fill calculation: -1 (before) ~ 0 (filling) ~ 1 (after)
    if (this.settings.fill) {
      if (elSize > containerSize) {
        if (elStart <= 0 && elStart >= -sizeGap) {
          this.fill = 0;
        } else if (elStart < -sizeGap) {
          this.fill = 1 - (elStart + elSize) / containerSize;
        } else {
          this.fill = -elStart / containerSize;
        }
        this.fill = Math.max(-1, Math.min(1, this.fill));
      } else {
        // Element is smaller than container - optimized calculation
        this.fill = Math.max(-1, Math.min(1, -elStart / elSize));
      }
    }
    
    // cover: 0 (before) ~ 1 (after)
    if (this.settings.cover && elSize > containerSize) {
      const cover = ((elStart + delayOffset) / -sizeGap);
      this.cover = Math.max(0, Math.min(1, cover));
    } else {
      this.cover = 0;
    }
    
    // Optimized enter & exit calculations
    if (this.settings.enter || this.settings.exit) {
      const contentSize = elSize - delayOffset;
      if (this.settings.enter) {
        this.enter = (elEnd / -containerSize) * (containerSize / contentSize) + 1;
      }
      if (this.settings.exit) {
        this.exit = (elStart + sizeGap) / (containerSize + sizeGap);
      }
    }
    
    // Optimized peak calculation - only when needed
    if (this.settings.peak) {
      let peakConfig;
      
      // Handle both array and object formats
      if (Array.isArray(this.settings.peak)) {
        // Array format: [start, peak, end]
        const [start, peak, end] = this.settings.peak;
        peakConfig = { start, peak, end };
      } else if (this.settings.peak.peak !== undefined) {
        // Object format: { start, peak, end }
        peakConfig = this.settings.peak;
      }
      
      if (peakConfig) {
        const { start, peak, end } = peakConfig;
        if (this.visibility < start || this.visibility > end) {
          this.peak = 0;
        } else {
          const peakRange = this.visibility <= peak ? (peak - start) : (end - peak);
          const peakDiff = this.visibility <= peak ? (this.visibility - start) : (end - this.visibility);
          this.peak = Math.max(0, Math.min(1, peakDiff / peakRange));
        }
      }
    }
  }

  #updateOutputs() {
    // Cache receiver elements to avoid repeated DOM queries
    if (!this._receiverCache && this.settings.receiver) {
      this._receiverCache = Array.from(document.querySelectorAll(this.settings.receiver));
    }
    const targets = this.settings.receiver ? [this.el, ...this._receiverCache] : [this.el];
    
    // Update progress values
    if (this.settings.visibility) {
      updateDataAndCss(targets, this.settings, 'visibility', this.visibility);
      this.#fireProgressEvent('visibility', this.visibility);
    }
    
    if (this.settings.fill) {
      updateDataAndCss(targets, this.settings, 'fill', this.fill);
      this.#fireProgressEvent('fill', this.fill);
    }
    
    if (this.settings.cover) {
      updateDataAndCss(targets, this.settings, 'cover', this.cover);
      this.#fireProgressEvent('cover', this.cover);
    }
    
    if (this.settings.enter) {
      updateDataAndCss(targets, this.settings, 'enter', this.enter);
      this.#fireProgressEvent('enter', this.enter);
    }
    
    if (this.settings.exit) {
      updateDataAndCss(targets, this.settings, 'exit', this.exit);
      this.#fireProgressEvent('exit', this.exit);
    }
    
    if (this.peak !== undefined && this.settings.peak) {
      updateDataAndCss(targets, this.settings, 'peak', this.peak);
      this.#fireProgressEvent('peak', this.peak);
    }
    
    // Update offset values
    if (this.settings.offsetEnter) {
      const offsetEnter = this.settings.horizontal 
        ? this.el.getBoundingClientRect().left 
        : this.el.getBoundingClientRect().top;
      updateDataAndCss(targets, this.settings, 'offsetEnter', offsetEnter);
      this.#fireProgressEvent('offsetEnter', offsetEnter);
    }
    
    if (this.settings.offsetExit) {
      const rect = this.el.getBoundingClientRect();
      const offsetExit = this.settings.horizontal
        ? this.containerSize - rect.right
        : this.containerSize - rect.bottom;
      updateDataAndCss(targets, this.settings, 'offsetExit', offsetExit);
      this.#fireProgressEvent('offsetExit', offsetExit);
    }
  }

  #fireProgressEvent(type, value) {
    // Always fire progress events for consistency with documentation
    eventSpeaker(this.el, `${type}Update`, { value });
  }

  #checkSteps() {
    ['visibility', 'fill', 'cover', 'enter', 'exit'].forEach(type => {
      const stepKey = `${type}Step`;
      if (!Array.isArray(this.settings[stepKey])) return;
      
      const progress = this[type];
      const steps = this.settings[stepKey];
      let currentStep = null;
      
      for (let i = 0; i < steps.length - 1; i++) {
        if (progress >= steps[i] && progress < steps[i + 1]) {
          currentStep = i;
          break;
        }
      }
      
      const currentStepKey = `current${capitalize(type)}Step`;
      if (currentStep !== null && this[currentStepKey] !== currentStep) {
        eventSpeaker(this.el, 'stepChange', {
          type,
          step: currentStep,
          prevStep: this[currentStepKey],
          maxStep: steps.length - 2,
          isInitial: !this.init
        });
        
        this.el.dataset[`${type}Step`] = currentStep;
        this[currentStepKey] = currentStep;
      }
    });
  }

  #handleEvents(elStart, elEnd, containerSize) {
    const isIn = elEnd > 0 && elStart < containerSize;
    
    // In/Out events
    if (isIn !== this.wasIn) {
      this.el.dataset.scradarIn = isIn ? 1 : 0;
      
      if (isIn) {
        eventSpeaker(this.el, 'scrollEnter', {
          from: elStart < 0 ? 'top' : 'bottom',
          isInitial: !this.init
        });
      } else if (!this.settings.once || !this.settings.done) {
        eventSpeaker(this.el, 'scrollExit', {
          from: elEnd < containerSize ? 'top' : 'bottom',
          isInitial: !this.init
        });
      }
      
      if (this.settings.once && isIn) {
        this.settings.done = true;
      }
      
      this.wasIn = isIn;
    }
    
    // Enter/Exit markers
    if (isIn) {
      this.el.dataset.scradarEnter = elStart <= 0 ? 1 : 0;
      this.el.dataset.scradarExit = elEnd >= containerSize ? 1 : 0;
      
      // Full In/Out events
      const isFull = elStart <= 0 && elEnd >= containerSize;
      if (isFull !== this.wasFull) {
        if (isFull) {
          eventSpeaker(this.el, 'fullIn', {
            from: elStart < 0 ? 'top' : 'bottom',
            isInitial: !this.init
          });
        } else {
          eventSpeaker(this.el, 'fullOut', {
            from: +this.el.dataset.scradarEnter ? 'bottom' : 'top',
            isInitial: !this.init
          });
        }
        this.wasFull = isFull;
        this.isFull = isFull;
      }
    } else {
      this.el.dataset.scradarEnter = 0;
      this.el.dataset.scradarExit = 0;
    }
  }

  #handleTriggerCollision(elStart, elEnd) {
    const trigger = this.shadowDom.getElementById(this.triggerId);
    if (!trigger) return;
    
    const triggerRect = trigger.getBoundingClientRect();
    const triggerStart = this.settings.horizontal ? triggerRect.left : triggerRect.top;
    const triggerEnd = this.settings.horizontal 
      ? triggerRect.right 
      : triggerRect.bottom;
    
    const isColliding = elStart <= triggerEnd && elEnd >= triggerStart;
    const wasColliding = +this.el.dataset.collision === 1;
    const wasFired = +this.el.dataset.scradarFire === 1;
    
    if (isColliding && !wasColliding) {
      this.el.dataset.collision = 1;
      eventSpeaker(this.el, 'collisionEnter', {
        from: elStart <= triggerEnd ? 'top' : 'bottom',
        isInitial: !this.init
      });
      
      if (!wasFired) {
        this.el.dataset.scradarFire = 1;
        eventSpeaker(this.el, 'fire', {
          from: elStart <= triggerEnd ? 'top' : 'bottom',
          isInitial: !this.init
        });
      }
    } else if (!isColliding && wasColliding) {
      this.el.dataset.collision = 0;
      eventSpeaker(this.el, 'collisionExit', {
        from: elEnd >= triggerStart ? 'top' : 'bottom',
        isInitial: !this.init
      });
    }
  }

  destroy() {
    // Remove all data attributes
    Object.keys(this.el.dataset).forEach(key => {
      if (key.startsWith('scradar') || 
          key.includes('Step') || 
          key.includes('progress') || 
          key === 'collision') {
        delete this.el.dataset[key];
      }
    });
    
    // Remove CSS custom properties
    const styles = this.el.style;
    for (let i = styles.length - 1; i >= 0; i--) {
      const prop = styles[i];
      if (prop.startsWith('--')) {
        styles.removeProperty(prop);
      }
    }
    
    // Remove trigger from shadow DOM
    if (this.triggerId && this.shadowDom) {
      const trigger = this.shadowDom.getElementById(this.triggerId);
      if (trigger) trigger.remove();
    }
  }
}
