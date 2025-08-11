import { RefCallback } from 'react';
import { ScradarOptions, ScradarSettings } from '../../src/scradar';

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