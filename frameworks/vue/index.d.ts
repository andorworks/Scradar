import { App, DirectiveBinding } from 'vue';
import { ScradarOptions, ScradarSettings } from '../../src/scradar';

declare class Scradar {
  static defaults: ScradarOptions;
  static configs: Record<string, ScradarSettings | ((element: HTMLElement) => ScradarSettings)>;
  
  constructor(target?: string | ScradarOptions, options?: ScradarOptions);
  
  readonly elements: HTMLElement[];
  readonly root: Element | Window;
  readonly scroll: 1 | -1 | 0;
  readonly progress: number;
  
  update(): void;
  destroy(): void;
  refresh(): void;
  
  on(event: string, callback: (detail: any) => void): void;
  off(event: string, callback: (detail: any) => void): void;
}

export interface VueScradarOptions extends ScradarOptions {}

export interface VueScradarConfigs {
  [key: string]: ScradarSettings | ((element: HTMLElement) => ScradarSettings);
}

// Vue 3 Plugin
declare const ScradarVue: {
  install(app: App, globalOptions?: VueScradarOptions): void;
};

// Vue 2 Plugin
declare const ScradarVue2: {
  install(Vue: any, globalOptions?: VueScradarOptions): void;
};

// Composition API
export function useScradar(options?: VueScradarOptions): {
  instance: Scradar | null;
  update: () => void;
  destroy: () => void;
};

export function useScradarConfigs(configs?: VueScradarConfigs): {
  update: (newConfigs: VueScradarConfigs) => void;
};

// Utility functions
export function setScradarConfigs(configs: VueScradarConfigs): void;
export function cleanupScradar(): void;

// Vue 3 global properties
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $scradar: Scradar;
    $scradarConfigs: (configs: VueScradarConfigs) => void;
    $scradarCleanup: () => void;
  }
}

// Vue 2 global properties
declare module 'vue/types/vue' {
  interface Vue {
    $scradar: Scradar;
    $scradarConfigs: (configs: VueScradarConfigs) => void;
    $scradarCleanup: () => void;
  }
}

export default ScradarVue;
export { ScradarVue2 }; 