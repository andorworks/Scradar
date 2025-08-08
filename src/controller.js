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
    this.progressVisible = 0;
    this.progressFill = 0;
    this.progressFull = 0;
    this.progressStart = 0;
    this.progressEnd = 0;
    this.progressPeak = 0;
    
    // Offset values
    this.offsetStart = 0;
    this.offsetEnd = 0;
    
    // State tracking
    this.wasIn = false;
    this.wasFull = false;
    this.isFull = false;
    
    // Step tracking
    this.currentVisibleStep = null;
    this.currentFillStep = null;
    this.currentFullStep = null;
    this.currentStartStep = null;
    this.currentEndStep = null;
    
    this.#init();
  }

  #init() {
    // Parse progress options
    this.#parseProgressOptions();
    
    // Parse steps
    this.#parseSteps();
    
    // Parse peak
    this.#parsePeak();
    
    // Parse event listeners
    this.#parseEventListeners();
    
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
      'progressVisible', 'progressFill', 'progressFull', 
      'progressStart', 'progressEnd', 'offsetStart', 'offsetEnd'
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
    const stepTypes = ['visible', 'fill', 'full', 'start', 'end'];
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

  #parseEventListeners() {
    if (this.settings.eventListen && !Array.isArray(this.settings.eventListen)) {
      this.settings.eventListen = [this.settings.eventListen];
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
    // progressVisible: 0 (before) ~ 1 (after)
    this.progressVisible = elEnd / (-containerSize - elSize) + 1;
    this.progressVisible = Math.max(0, Math.min(1, this.progressVisible));
    
    // progressFill: -1 (before) ~ 0 (filling) ~ 1 (after)
    if (this.settings.progressFill) {
      if (elSize > containerSize) {
        if (elStart <= 0 && elStart >= -sizeGap) {
          this.progressFill = 0;
        } else if (elStart < -sizeGap) {
          this.progressFill = 1 - (elStart + elSize) / containerSize;
        } else {
          this.progressFill = -elStart / containerSize;
        }
      } else {
        // Element is smaller than container
        this.progressFill = -elStart / (elSize > containerSize ? containerSize : elSize);
      }
      this.progressFill = Math.max(-1, Math.min(1, this.progressFill));
    }
    
    // progressFull: 0 (before) ~ 1 (after)
    if (this.settings.progressFull && elSize > containerSize) {
      const progressFull = ((elStart + delayOffset) / -sizeGap);
      this.progressFull = Math.max(0, Math.min(1, progressFull));
    } else {
      this.progressFull = 0;
    }
    
    // progressStart & progressEnd
    const contentSize = elSize - delayOffset;
    this.progressStart = (elEnd / -containerSize) * (containerSize / contentSize) + 1;
    this.progressEnd = (elStart + sizeGap) / (containerSize + sizeGap);
    
    // progressPeak
    if (this.settings.peak && this.settings.peak.peak !== undefined) {
      const { start, peak, end } = this.settings.peak;
      if (this.progressVisible < start || this.progressVisible > end) {
        this.progressPeak = 0;
      } else {
        this.progressPeak = this.progressVisible <= peak
          ? (this.progressVisible - start) / (peak - start)
          : (end - this.progressVisible) / (end - peak);
        this.progressPeak = Math.max(0, Math.min(1, this.progressPeak));
      }
    }
  }

  #updateOutputs() {
    const receiver = this.settings.receiver
      ? Array.from(document.querySelectorAll(this.settings.receiver))
      : [];
    const targets = [this.el, ...receiver];
    
    // Update progress values
    if (this.settings.progressVisible) {
      updateDataAndCss(targets, this.settings, 'progressVisible', this.progressVisible);
      this.#fireProgressEvent('progressVisible', this.progressVisible);
    }
    
    if (this.settings.progressFill) {
      updateDataAndCss(targets, this.settings, 'progressFill', this.progressFill);
      this.#fireProgressEvent('progressFill', this.progressFill);
    }
    
    if (this.settings.progressFull) {
      updateDataAndCss(targets, this.settings, 'progressFull', this.progressFull);
      this.#fireProgressEvent('progressFull', this.progressFull);
    }
    
    if (this.settings.progressStart) {
      updateDataAndCss(targets, this.settings, 'progressStart', this.progressStart);
      this.#fireProgressEvent('progressStart', this.progressStart);
    }
    
    if (this.settings.progressEnd) {
      updateDataAndCss(targets, this.settings, 'progressEnd', this.progressEnd);
      this.#fireProgressEvent('progressEnd', this.progressEnd);
    }
    
    if (this.progressPeak !== undefined && this.settings.peak) {
      updateDataAndCss(targets, this.settings, 'progressPeak', this.progressPeak);
      this.#fireProgressEvent('progressPeak', this.progressPeak);
    }
    
    // Update offset values
    if (this.settings.offsetStart) {
      const offsetStart = this.settings.horizontal 
        ? this.el.getBoundingClientRect().left 
        : this.el.getBoundingClientRect().top;
      updateDataAndCss(targets, this.settings, 'offsetStart', offsetStart);
      this.#fireProgressEvent('offsetStart', offsetStart);
    }
    
    if (this.settings.offsetEnd) {
      const rect = this.el.getBoundingClientRect();
      const offsetEnd = this.settings.horizontal
        ? this.containerSize - rect.right
        : this.containerSize - rect.bottom;
      updateDataAndCss(targets, this.settings, 'offsetEnd', offsetEnd);
      this.#fireProgressEvent('offsetEnd', offsetEnd);
    }
  }

  #fireProgressEvent(type, value) {
    if (this.settings.eventListen && this.settings.eventListen.includes(type)) {
      eventSpeaker(this.el, `${type}Update`, { value });
    }
  }

  #checkSteps() {
    ['visible', 'fill', 'full', 'start', 'end'].forEach(type => {
      const stepKey = `${type}Step`;
      if (!Array.isArray(this.settings[stepKey])) return;
      
      const progress = this[`progress${capitalize(type)}`];
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
    
    // Start/End markers
    if (isIn) {
      this.el.dataset.scradarStart = elStart <= 0 ? 1 : 0;
      this.el.dataset.scradarEnd = elEnd >= containerSize ? 1 : 0;
      
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
            from: +this.el.dataset.scradarStart ? 'bottom' : 'top',
            isInitial: !this.init
          });
        }
        this.wasFull = isFull;
        this.isFull = isFull;
      }
    } else {
      this.el.dataset.scradarStart = 0;
      this.el.dataset.scradarEnd = 0;
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
