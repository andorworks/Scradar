import ScradarController from './controller.js';
import { throttleRaf, eventSpeaker, parseElementOptions } from './utils.js';
import ScradarDebug from './debug.js';

export default class Scradar {
  static version = '2.0.0';
  static defaults = {
    target: '.scradar',
    root: null,
    trigger: null,
    prefix: '',
    progressVisible: false,
    progressFill: false,
    progressFull: false,
    progressStart: false,
    progressEnd: false,
    offsetStart: false,
    offsetEnd: false,
    peak: null,
    once: false,
    totalProgress: true,
    boundary: false,
    momentum: false,
    horizontal: false,
    container: null,
    receiver: null,
    delay: null,
    breakpoint: null,
    eventListen: null,
    debug: false,
  };

  // Global configurations
  static configs = {};

  #elements = [];
  #options;
  #root;
  #scrollHandler = null;
  #resizeHandler = null;
  #wheelHandler = null;
  #keydownHandler = null;
  #observer = null;
  #shadowDom = null;
  #isDestroyed = false;
  #prevScroll = null;
  #scrollDir = 0;
  #momentum = {
    step: 0,
    deltaY: 0,
    firstValue: 0,
    timer: null,
    isMomentum: false,
  };
  #keydownScrollY = null;
  #scrollingWithKeydown = false;
  #debugger = null;
  #boundaryTarget = null;

  constructor(target, options = {}) {
    // Parse parameters
    if (typeof target === 'object' && target !== null && !target.nodeType) {
      options = target;
      target = null;
    }
    
    this.#options = { ...Scradar.defaults, ...options };
    if (typeof target === 'string') {
      this.#options.target = target;
    }
    
    this.#root = this.#options.root 
      ? document.querySelector(this.#options.root) 
      : window;
    
    this.#init();
  }

  #init() {
    if (this.#isDestroyed) return;

    // Find targets
    const selector = this.#options.target || '.scradar';
    this.#elements = Array.from(document.querySelectorAll(selector));

    // Shadow DOM for triggers
    const triggerWrapper = document.createElement('div');
    triggerWrapper.id = 'scradarTriggerWrapper';
    triggerWrapper.style.display = 'none';
    document.body.append(triggerWrapper);
    this.#shadowDom = triggerWrapper.attachShadow({ mode: 'open' });

    // Attach controller to each element
    this.#elements.forEach(el => {
      el.scradar = new ScradarController(el, this.#options, this.#shadowDom, {
        configs: Scradar.configs
      });
    });

    // Setup observer
    this.#observer = new IntersectionObserver(
      this.#onIntersect.bind(this), 
      { 
        root: this.#root === window ? null : this.#root,
        threshold: [0, 0.00001, 0.99999, 1] 
      }
    );
    this.#elements.forEach(el => this.#observer.observe(el));

    // Setup event handlers
    this.#scrollHandler = throttleRaf(this.#onScroll.bind(this));
    this.#resizeHandler = throttleRaf(this.#onResize.bind(this));
    this.#wheelHandler = throttleRaf(this.#onWheel.bind(this));
    this.#keydownHandler = this.#onKeydown.bind(this);

    const scrollTarget = this.#root === window ? window : this.#root;
    scrollTarget.addEventListener('scroll', this.#scrollHandler, { passive: true });
    window.addEventListener('resize', this.#resizeHandler);
    window.addEventListener('wheel', this.#wheelHandler, { passive: true });
    document.addEventListener('keydown', this.#keydownHandler);

    // Debug overlay
    if (this.#options.debug) {
      this.#debugger = new ScradarDebug(this);
    }

    // Initial calculation
    this.update();
  }

  #onIntersect(entries) {
    entries.forEach(entry => {
      const ctrl = entry.target.scradar;
      if (!ctrl) return;
      
      if (entry.intersectionRatio !== 0 && !ctrl.settings.done) {
        ctrl.settings.mount = true;
        ctrl.settings.unmount = false;
      } else {
        ctrl.settings.mount = false;
      }
    });
  }

  #onScroll() {
    if (this.#isDestroyed) return;

    const currentScroll = this.#root === window 
      ? window.scrollY 
      : this.#root.scrollTop;
    const windowHeight = window.innerHeight;

    // Scroll direction detection
    if (this.#prevScroll !== null) {
      if (currentScroll > this.#prevScroll) {
        if (this.#scrollDir !== 1) {
          this.#scrollDir = 1;
          document.documentElement.dataset.scradarScroll = 1;
          eventSpeaker(window, 'scrollTurn', { scroll: 1 });
        }
      } else if (currentScroll < this.#prevScroll) {
        if (this.#scrollDir !== -1) {
          this.#scrollDir = -1;
          document.documentElement.dataset.scradarScroll = -1;
          eventSpeaker(window, 'scrollTurn', { scroll: -1 });
        }
      } else {
        this.#scrollDir = 0;
        document.documentElement.dataset.scradarScroll = 0;
      }
    }

    // Reset check for instant scroll to top
    if (Math.abs(this.#prevScroll - currentScroll) > 300 && currentScroll === 0) {
      this.#prevScroll = 0;
      this.update();
      return;
    }

    this.#prevScroll = currentScroll;

    // Total progress
    if (this.#options.totalProgress) {
      const docHeight = document.documentElement.scrollHeight;
      const progress = currentScroll / (docHeight - windowHeight);
      document.documentElement.dataset.scradarProgress = progress;
      this.progress = progress;
    }

    // Update elements
    this.#elements.forEach(el => el.scradar && el.scradar.update());

    // Boundary target detection
    if (this.#options.boundary) {
      this.#updateBoundaryTarget();
    }

    // Debug update
    if (this.#debugger) {
      this.#debugger.update();
    }
  }

  #onResize() {
    if (this.#isDestroyed) return;
    this.#elements.forEach(el => el.scradar && el.scradar.update(true));
    if (this.#debugger) this.#debugger.update();
  }

  #onWheel(e) {
    if (this.#isDestroyed) return;
    
    // Momentum detection
    this.#momentum.deltaY = e.deltaY;
    this.#momentum.step++;
    clearTimeout(this.#momentum.timer);

    if ((this.#momentum.step > 10 && Math.abs(this.#momentum.deltaY) <= 10) || 
        Math.abs(this.#momentum.deltaY) <= 2) {
      this.#momentum.step = 0;
      this.#momentum.firstValue = this.#momentum.deltaY;
      this.#momentum.isMomentum = false;
    } else if (this.#momentum.step === 1 && 
               Math.abs(this.#momentum.deltaY) > Math.abs(this.#momentum.firstValue)) {
      this.#momentum.isMomentum = true;
      eventSpeaker(window, 'momentum', {
        status: this.#momentum.deltaY > 0 ? 1 : -1
      });
    }

    this.#momentum.timer = setTimeout(() => {
      this.#momentum.step = 0;
      this.#momentum.isMomentum = false;
    }, 80);
  }

  #onKeydown(e) {
    if ((e.metaKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) ||
        e.key === 'Tab' || e.key === 'Home' || e.key === 'End') {
      this.#scrollingWithKeydown = true;
      this.#keydownScrollY = this.#root === window 
        ? window.scrollY 
        : this.#root.scrollTop;
      this.#scrollCheck();
    }
  }

  #scrollCheck() {
    if (this.#keydownScrollY !== null) {
      const currentScroll = this.#root === window 
        ? window.scrollY 
        : this.#root.scrollTop;
      
      if (this.#scrollingWithKeydown || this.#keydownScrollY !== currentScroll) {
        this.#scrollingWithKeydown = false;
        this.#keydownScrollY = currentScroll;
        throttleRaf(this.#scrollCheck.bind(this))();
      } else {
        this.update();
        this.#keydownScrollY = null;
      }
    }
  }

  #updateBoundaryTarget() {
    const boundary = typeof this.#options.boundary === 'number' 
      ? this.#options.boundary 
      : 0.5;
    const windowHeight = window.innerHeight;
    const boundaryLine = windowHeight * boundary;
    
    const activeElements = this.#elements.filter(el => 
      el.dataset.scradarTitle && +el.dataset.scradarIn === 1
    );

    if (!activeElements.length) {
      if (this.#boundaryTarget) {
        document.documentElement.dataset.scradarTarget = '# ' + this.#boundaryTarget;
      }
    } else {
      const target = activeElements.length === 1 
        ? activeElements[0]
        : activeElements.sort((a, b) => {
          const aRect = a.getBoundingClientRect();
          const bRect = b.getBoundingClientRect();
          const aDistance = Math.abs(aRect.top + aRect.height / 2 - boundaryLine);
          const bDistance = Math.abs(bRect.top + bRect.height / 2 - boundaryLine);
          return aDistance - bDistance;
        })[0];
      
      this.#boundaryTarget = target.dataset.scradarTitle;
      document.documentElement.dataset.scradarTarget = this.#boundaryTarget;
    }
  }

  // Public methods
  get elements() {
    return this.#elements;
  }

  get scroll() {
    return this.#scrollDir;
  }

  update() {
    if (this.#isDestroyed) return;
    this.#elements.forEach(el => {
      if (el.scradar) {
        el.scradar.settings.unmount = false;
        el.scradar.update();
      }
    });
    if (this.#debugger) this.#debugger.update();
  }

  destroy() {
    if (this.#isDestroyed) return;
    
    const scrollTarget = this.#root === window ? window : this.#root;
    scrollTarget.removeEventListener('scroll', this.#scrollHandler);
    window.removeEventListener('resize', this.#resizeHandler);
    window.removeEventListener('wheel', this.#wheelHandler);
    document.removeEventListener('keydown', this.#keydownHandler);
    
    if (this.#observer) {
      this.#observer.disconnect();
    }
    
    if (this.#shadowDom && this.#shadowDom.host) {
      this.#shadowDom.host.remove();
    }
    
    this.#elements.forEach(el => {
      if (el.scradar) {
        el.scradar.destroy();
        delete el.scradar;
      }
    });
    
    if (this.#debugger) {
      this.#debugger.destroy();
    }
    
    this.#elements = [];
    this.#isDestroyed = true;
  }
}
