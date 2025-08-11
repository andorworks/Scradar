import { RefCallback } from 'react';
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

export interface UseScradarOptions extends ScradarOptions {}

export interface UseScradarElementConfig extends ScradarSettings {}

export interface UseScradarConfigsConfigs {
  [key: string]: ScradarSettings | ((element: HTMLElement) => ScradarSettings);
}

export function useScradar(options?: UseScradarOptions): Scradar | null;

export function useScradarElement(
  config?: UseScradarElementConfig,
  dependencies?: any[]
): RefCallback<HTMLElement>;

export function useScradarConfigs(
  configs?: UseScradarConfigsConfigs
): (newConfigs: UseScradarConfigsConfigs) => void;

export function setScradarConfigs(configs: UseScradarConfigsConfigs): void;

export function cleanupScradar(): void; 