export interface ScradarOptions {
  target?: string;
  root?: Element | Window | null;
  boundary?: boolean | number;
  totalProgress?: boolean;
  momentum?: boolean;
  debug?: boolean;
  prefix?: string;
}

export interface ScradarSettings {
  progressVisible?: boolean | string | string[];
  progressFill?: boolean | string | string[];
  progressFull?: boolean | string | string[];
  progressStart?: boolean | string | string[];
  progressEnd?: boolean | string | string[];
  offsetStart?: boolean | string | string[];
  offsetEnd?: boolean | string | string[];
  visibleStep?: number[];
  fillStep?: number[];
  fullStep?: number[];
  startStep?: number[];
  endStep?: number[];
  peak?: number[] | { start: number; peak: number; end: number };
  once?: boolean;
  trigger?: string;
  horizontal?: boolean;
  container?: string;
  receiver?: string;
  delay?: string;
  breakpoint?: Record<number, Partial<ScradarSettings>>;
  eventListen?: string | string[];
}

export interface ScradarController {
  el: HTMLElement;
  settings: ScradarSettings;
  progressVisible: number;
  progressFill: number;
  progressFull: number;
  progressStart: number;
  progressEnd: number;
  progressPeak: number;
  offsetStart: number;
  offsetEnd: number;
  containerSize: number;
  update(resize?: boolean): void;
  destroy(): void;
}

export interface ScradarEventDetail {
  from?: 'top' | 'bottom';
  isInitial?: boolean;
  value?: number;
  step?: number;
  prevStep?: number;
  maxStep?: number;
  type?: string;
  scroll?: 1 | -1 | 0;
  status?: 1 | -1;
}

declare global {
  interface HTMLElement {
    scradar?: ScradarController;
  }
  
  interface HTMLElementEventMap {
    'scrollEnter': CustomEvent<ScradarEventDetail>;
    'scrollExit': CustomEvent<ScradarEventDetail>;
    'fullIn': CustomEvent<ScradarEventDetail>;
    'fullOut': CustomEvent<ScradarEventDetail>;
    'fire': CustomEvent<ScradarEventDetail>;
    'collisionEnter': CustomEvent<ScradarEventDetail>;
    'collisionExit': CustomEvent<ScradarEventDetail>;
    'stepChange': CustomEvent<ScradarEventDetail>;
    'progressVisibleUpdate': CustomEvent<ScradarEventDetail>;
    'progressFillUpdate': CustomEvent<ScradarEventDetail>;
    'progressFullUpdate': CustomEvent<ScradarEventDetail>;
    'progressStartUpdate': CustomEvent<ScradarEventDetail>;
    'progressEndUpdate': CustomEvent<ScradarEventDetail>;
    'progressPeakUpdate': CustomEvent<ScradarEventDetail>;
    'offsetStartUpdate': CustomEvent<ScradarEventDetail>;
    'offsetEndUpdate': CustomEvent<ScradarEventDetail>;
  }
  
  interface WindowEventMap {
    'scrollTurn': CustomEvent<ScradarEventDetail>;
    'momentum': CustomEvent<ScradarEventDetail>;
  }
  
  interface DocumentEventMap {
    'scradarReady': CustomEvent<{ scradar: Scradar }>;
  }
}

declare class Scradar {
  static defaults: ScradarOptions;
  
  constructor(target?: string | ScradarOptions, options?: ScradarOptions);
  
  readonly elements: HTMLElement[];
  readonly root: Element | Window;
  readonly scroll: 1 | -1 | 0;
  readonly progress: number;
  
  update(): void;
  destroy(): void;
  refresh(): void;
  
  on(event: string, callback: (detail: ScradarEventDetail) => void): void;
  off(event: string, callback: (detail: ScradarEventDetail) => void): void;
}

export default Scradar;

export = Scradar;
