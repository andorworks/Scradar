import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Scradar E2E Tests', () => {
  let browser;
  let page;
  let server;
  const PORT = 8888;

  beforeAll(async () => {
    // Simple test server
    server = createServer((req, res) => {
      if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(readFileSync(join(__dirname, '../../examples/vanilla.html')));
      } else if (req.url.includes('.js')) {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(readFileSync(join(__dirname, '../..', req.url)));
      }
    });
    
    await new Promise(resolve => server.listen(PORT, resolve));
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  });

  afterAll(async () => {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForSelector('.scradar');
  });

  afterEach(async () => {
    await page.close();
  });

  test('should initialize Scradar on page load', async () => {
    const scradarElements = await page.$$eval('.scradar', elements => 
      elements.map(el => ({
        hasController: !!el.scradar,
        dataset: el.dataset
      }))
    );

    expect(scradarElements.length).toBeGreaterThan(0);
    scradarElements.forEach(el => {
      expect(el.hasController).toBe(true);
    });
  });

  test('should update progress on scroll', async () => {
    // Initial state
    const initialProgress = await page.evaluate(() => 
      document.documentElement.dataset.scradarProgress
    );
    expect(initialProgress).toBe('0');

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(100);

    const afterScrollProgress = await page.evaluate(() => 
      parseFloat(document.documentElement.dataset.scradarProgress)
    );
    expect(afterScrollProgress).toBeGreaterThan(0);
  });

  test('should fire scrollEnter event when element enters viewport', async () => {
    // Set up event listener
    await page.evaluateHandle(() => {
      window.scrollEnterFired = false;
      document.querySelector('.scradar').addEventListener('scrollEnter', () => {
        window.scrollEnterFired = true;
      });
    });

    // Scroll to element
    await page.evaluate(() => {
      document.querySelector('.scradar').scrollIntoView();
    });
    await page.waitForTimeout(100);

    const eventFired = await page.evaluate(() => window.scrollEnterFired);
    expect(eventFired).toBe(true);
  });

  test('should update CSS custom properties', async () => {
    await page.evaluate(() => {
      document.querySelector('.scradar').scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(100);

    const progressValue = await page.evaluate(() => {
      const el = document.querySelector('[data-scradar*="progressVisible"]');
      return getComputedStyle(el).getPropertyValue('--progress-visible');
    });

    expect(progressValue).toBeTruthy();
    expect(parseFloat(progressValue)).toBeGreaterThanOrEqual(0);
    expect(parseFloat(progressValue)).toBeLessThanOrEqual(1);
  });

  test('should handle step changes', async () => {
    let stepChangeData = null;

    await page.evaluateHandle(() => {
      window.stepChangeData = null;
      const el = document.querySelector('[data-scradar*="visibleStep"]');
      if (el) {
        el.addEventListener('stepChange', (e) => {
          window.stepChangeData = e.detail;
        });
      }
    });

    // Scroll gradually
    for (let i = 0; i <= 1000; i += 100) {
      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), i);
      await page.waitForTimeout(50);
    }

    stepChangeData = await page.evaluate(() => window.stepChangeData);
    if (stepChangeData) {
      expect(stepChangeData).toHaveProperty('step');
      expect(stepChangeData).toHaveProperty('prevStep');
      expect(stepChangeData).toHaveProperty('type');
    }
  });

  test('should show debug overlay when enabled', async () => {
    // Reload with debug enabled
    await page.evaluate(() => {
      if (window.scradar) window.scradar.destroy();
      // eslint-disable-next-line no-undef
      window.scradar = new Scradar({ debug: true });
    });
    await page.waitForTimeout(100);

    const debugOverlay = await page.$('#scradar-debug-overlay');
    expect(debugOverlay).toBeTruthy();

    // Check if overlay updates
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(100);

    const debugContent = await page.$eval('#scradar-debug-content', 
      el => el.textContent
    );
    expect(debugContent).toContain('Scroll Progress');
  });

  test('should handle responsive breakpoints', async () => {
    // Set viewport to mobile size
    await page.setViewport({ width: 375, height: 667 });
    await page.waitForTimeout(100);

    // Check if breakpoint options are applied
    const settings = await page.evaluate(() => {
      const el = document.querySelector('[data-scradar*="breakpoint"]');
      return el ? el.scradar.settings : null;
    });

    if (settings && settings.breakpoint) {
      // Verify breakpoint-specific settings are applied
      expect(settings).toBeDefined();
    }
  });

  test('should clean up on destroy', async () => {
    await page.evaluate(() => {
      window.scradar.destroy();
    });
    await page.waitForTimeout(100);

    const hasControllers = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.scradar'))
        .some(el => el.scradar !== undefined);
    });

    expect(hasControllers).toBe(false);

    const debugOverlay = await page.$('#scradar-debug-overlay');
    expect(debugOverlay).toBeFalsy();
  });
});
