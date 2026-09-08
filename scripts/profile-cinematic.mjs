import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
mkdirSync('scratch/cinematic', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
await context.route('**/_vercel/**', route => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send('Network.enable');
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 160000, uploadThroughput: 80000 });
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await page.addInitScript(() => { window.__lcp = 0; new PerformanceObserver(list => { window.__lcp = list.getEntries().at(-1).startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); });
const start = Date.now();
await page.goto('http://127.0.0.1:3100', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('main[data-mode="cinematic"]');
const readyMs = Date.now() - start;
await page.waitForTimeout(1000);
const loading = await page.evaluate(() => {
  const resources = performance.getEntriesByType('resource');
  const canvas = document.querySelector('canvas');
  const gl = canvas.getContext('webgl2');
  const debug = gl.getExtension('WEBGL_debug_renderer_info');
  return { fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime, lcp: window.__lcp, jsTransferred: resources.filter(e => e.name.includes('.js')).reduce((n, e) => n + e.transferSize, 0), imageTransferred: resources.filter(e => e.initiatorType === 'img').reduce((n, e) => n + e.transferSize, 0), renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : 'unavailable' };
});
await page.evaluate(() => { const track = document.querySelector('[class*="timeline_"]'); window.scrollTo({ top: (2.5 / 6) * (track.offsetHeight - track.firstElementChild.offsetHeight), behavior: 'instant' }); });
await page.waitForTimeout(1200);
const transition = await page.locator('[data-quality]').evaluate(el => ({ drawCalls: Number(el.dataset.calls), triangles: Number(el.dataset.triangles) }));
await browser.close();
const weakBrowser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const weak = await weakBrowser.newPage({ viewport: { width: 390, height: 844 } });
await weak.goto('http://127.0.0.1:3100', { waitUntil: 'networkidle' });
await weak.waitForFunction(() => document.querySelector('main')?.dataset.mode !== 'loading');
const weakMode = await weak.locator('main').getAttribute('data-mode');
let software = {};
if (weakMode === 'cinematic') {
  software = await weak.evaluate(async () => {
    const host = document.querySelector('[data-quality]');
    const gl = host.querySelector('canvas').getContext('webgl2');
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : 'unavailable';
    const frames = [];
    let last = performance.now();
    const start = last;
    await new Promise(resolve => {
      function tick(now) {
        frames.push(now - last); last = now;
        window.scrollTo({ top: (now - start) / 5000 * (document.querySelector('[class*="timeline_"]').offsetHeight - innerHeight), behavior: 'instant' });
        if (now - start < 5000) requestAnimationFrame(tick); else resolve();
      }
      requestAnimationFrame(tick);
    });
    frames.sort((a,b) => a-b);
    return { renderer, rafP50: frames[Math.floor(frames.length * .5)], rafP95: frames[Math.floor(frames.length * .95)], quality: host.dataset.quality };
  });
}
await weak.screenshot({ path: 'scratch/cinematic/software-webgl.png' });
await weakBrowser.close();
const result = { network: '1.28 Mbps / 150ms latency', cpuThrottle: 4, readyMs, ...loading, transition, softwareWebGLMode: weakMode, software };
writeFileSync('scratch/cinematic/loading-results.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
