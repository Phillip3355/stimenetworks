import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
const base = process.env.CINEMATIC_ORIGIN || 'http://127.0.0.1:3100';
const output = 'scratch/cinematic';
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = { viewports: [], profiles: [], checks: [], errors: [] };
const checksOnly = process.argv.includes('--checks-only');
if (checksOnly && existsSync(`${output}/results.json`)) results.viewports = JSON.parse(readFileSync(`${output}/results.json`, 'utf8')).viewports;

async function pageFor(options = {}) {
  const context = await browser.newContext(options);
  // Deployment-only analytics have no local server; don't pollute diagnostics.
  await context.route('**/_vercel/**', route => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  const page = await context.newPage();
  page.on('pageerror', error => results.errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && /THREE|WebGL|shader|hydration/i.test(message.text()) && !/Error creating WebGL context/.test(message.text())) results.errors.push(message.text()); });
  return { context, page };
}
async function open(page, mode = 'cinematic') {
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForSelector(`main[data-mode="${mode}"]`);
}
async function chapter(page, index) {
  const button = page.locator('main nav button').nth(index);
  if (await button.isVisible()) await button.click();
  else await page.evaluate(index => { const track = document.querySelector('[class*="timeline_"]'); window.scrollTo({ top: index / 6 * (track.offsetHeight - track.firstElementChild.offsetHeight), behavior: 'instant' }); }, index);
  await page.waitForFunction(index => document.querySelector('main').dataset.active === String(index), index);
  await page.waitForTimeout(650);
}
async function stats(page) {
  return page.locator('[data-quality]').evaluate(el => ({ ...el.dataset, width: el.querySelector('canvas').width, height: el.querySelector('canvas').height }));
}

try {
  for (const [width, height] of (checksOnly ? [] : [[360, 800], [430, 932], [768, 1024], [1366, 768], [1440, 900], [2560, 1080], [844, 390], [667, 375], [740, 360], [360, 640]])) {
    const { context, page } = await pageFor({ viewport: { width, height }, deviceScaleFactor: width < 760 ? 3 : 1, isMobile: width < 760, hasTouch: width < 760 });
    await open(page);
    const captures = [];
    for (const index of [0, 1, 2, 3, 4, 5, 6]) {
      if (index) await chapter(page, index);
      await page.screenshot({ path: `${output}/${width}x${height}-${index}.png`, scale: 'css' });
      const bounds = await page.locator(`[data-chapter="${index}"]`).evaluate(el => {
        const copy = el.firstElementChild.getBoundingClientRect();
        const title = el.querySelector('h2').getBoundingClientRect();
        const transport = document.querySelector('[class*="transport_"]').getBoundingClientRect();
        const image = el.querySelector('figure')?.getBoundingClientRect();
        return { copyBottom: copy.bottom, titleRight: title.right, transportTop: transport.top, imageTop: image?.top, overflow: document.documentElement.scrollWidth > innerWidth, width: innerWidth, height: innerHeight };
      });
      captures.push({ chapter: index, ...bounds });
      assert.equal(bounds.overflow, false, `${width}x${height} chapter ${index}: horizontal overflow`);
      assert.ok(bounds.copyBottom <= bounds.height - 30, `${width}x${height} chapter ${index}: copy clipped below viewport (${bounds.copyBottom})`);
      assert.ok(bounds.copyBottom < bounds.transportTop + 5, `${width}x${height} chapter ${index}: copy overlaps transport`);
      if (index === 5 && width < 760 && height > width) assert.ok(bounds.copyBottom < bounds.imageTop, `${width}x${height}: world image overlaps its link`);
      const render = await stats(page);
      captures[captures.length - 1].render = render;
      assert.ok(Number(render.calls) <= 20);
      assert.ok(Number(render.triangles) < 45000);
      assert.ok(render.width * render.height <= 2401000);
    }
    results.viewports.push({ width, height, captures, render: await stats(page) });
    await context.close();
  }

  // Interactions remain real browser actions rather than source-text assertions.
  const { context, page } = await pageFor({ viewport: { width: 1440, height: 900 } });
  await open(page);
  await page.getByRole('button', { name: 'Switch to English' }).click();
  assert.ok(await page.getByText('A familiar world. More underneath.').isVisible());
  await page.mouse.wheel(0, 850);
  await page.waitForTimeout(800);
  assert.ok(Number(await page.locator('main').getAttribute('data-active')) >= 1);
  await page.getByRole('button', { name: 'Site menu', exact: true }).count();
  await page.locator('button[aria-controls="site-menu"]').click();
  assert.ok(await page.getByRole('dialog').isVisible());
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  assert.equal(await page.getByRole('dialog').count(), 0);
  assert.equal(await page.locator('button[aria-controls="site-menu"]').evaluate(el => el === document.activeElement), true);
  await page.getByRole('combobox', { name: '3D quality' }).selectOption('low');
  assert.equal((await stats(page)).quality, 'low');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForSelector('main[data-mode="static"]');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForSelector('main[data-mode="cinematic"]');
  assert.equal((await stats(page)).quality, 'low', 'OS motion changes must preserve the selected quality');
  await page.getByRole('button', { name: 'MOTION OFF', exact: false }).click();
  await page.waitForSelector('main[data-mode="static"]');
  assert.equal(await page.locator('main canvas').count(), 0);
  assert.equal(await page.locator('main [inert]').count(), 0);
  await page.getByRole('button', { name: 'ENABLE 3D', exact: false }).click();
  await page.waitForSelector('main[data-mode="cinematic"]');
  assert.equal(await page.locator('main canvas').count(), 1);
  await chapter(page, 6);
  await page.getByRole('link', { name: 'Join StimeMC', exact: false }).click();
  await page.waitForURL('**/join');
  assert.equal(await page.locator('canvas').count(), 0);
  await page.goBack();
  await page.waitForSelector('main[data-mode="cinematic"]');
  assert.equal(await page.locator('canvas').count(), 1);
  results.checks.push('language, wheel, menu Escape/focus, quality, motion toggle, join route, back/remount');
  await context.close();

  // Reproduce preference changes while the lazy renderer is still in flight.
  {
    const { context, page } = await pageFor({ viewport: { width: 1366, height: 768 } });
    let release;
    const hold = new Promise(resolve => { release = resolve; });
    let requested;
    const pending = new Promise(resolve => { requested = resolve; });
    await context.route('**/_next/static/chunks/*.js', async route => {
      const response = await route.fetch();
      const body = await response.text();
      if (body.includes('aScatter') && body.includes('uExplode')) { requested(); await hold; }
      await route.fulfill({ response, body });
    });
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await Promise.race([pending, new Promise((_, reject) => setTimeout(() => reject(new Error('Scene import was not intercepted')), 10000))]);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForSelector('main[data-mode="static"]');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    release();
    await page.waitForSelector('main[data-mode="cinematic"]');
    assert.equal(await page.locator('main canvas').count(), 1, 'Pending imports cannot create duplicate renderers');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForSelector('main[data-mode="static"]');
    assert.equal(await page.locator('main canvas').count(), 0, 'Every created renderer is disposed');
    results.checks.push('Preference changes during delayed renderer import');
    await context.close();
  }

  for (const mode of ['reduced', 'webgl', 'context-loss', 'no-js']) {
    const { context, page } = await pageFor({ viewport: { width: 390, height: 844 }, reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference', javaScriptEnabled: mode !== 'no-js' });
    if (mode === 'webgl') await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, ...args) { return /^webgl/.test(type) ? null : original.call(this, type, ...args); };
    });
    if (mode === 'no-js') await page.goto(base, { waitUntil: 'networkidle' });
    else await open(page, mode === 'context-loss' ? 'cinematic' : 'static');
    if (mode === 'context-loss') {
      await page.locator('main canvas').evaluate(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
      await page.waitForSelector('main[data-mode="static"]');
    }
    assert.equal(await page.locator('main canvas').count(), 0);
    assert.equal(await page.locator('main [inert]').count(), 0);
    assert.equal(await page.locator('main [aria-hidden="true"][data-chapter]').count(), 0);
    assert.equal(await page.locator('main h2').count(), 7);
    if (mode === 'no-js') {
      assert.ok(await page.locator('[class*="wordmark_"]').evaluate(el => el.getBoundingClientRect().bottom < innerHeight));
      await page.getByRole('link', { name: /세계 안으로/ }).click();
      // RAF polling is unreliable with script execution disabled; allow the
      // site's native CSS smooth anchor scroll to finish before sampling it.
      await page.waitForTimeout(1000);
      assert.ok(await page.evaluate(() => scrollY) > 500, 'The no-JS entry link remains functional');
      await page.goto(base, { waitUntil: 'networkidle' });
    }
    await page.screenshot({ path: `${output}/${mode}.png` });
    results.checks.push(mode);
    await context.close();
  }

  for (const [name, width, height, rate, low] of [['desktop', 1440, 900, 1, false], ['slow-desktop', 1366, 768, 6, true], ['mobile-low', 390, 844, 4, true]]) {
    const { context, page } = await pageFor({ viewport: { width, height }, isMobile: width < 760, hasTouch: width < 760, deviceScaleFactor: width < 760 ? 3 : 1 });
    if (low) await page.addInitScript(() => { Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 2 }); Object.defineProperty(navigator, 'deviceMemory', { get: () => 2 }); });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate });
    await open(page);
    await page.evaluate(() => {
      window.__longTasks = [];
      new PerformanceObserver(list => window.__longTasks.push(...list.getEntries().map(e => e.duration))).observe({ type: 'longtask', buffered: false });
    });
    const profile = await page.evaluate(async () => {
      const frames = [];
      const host = document.querySelector('[data-quality]');
      const counts = [];
      const start = performance.now();
      let last = start;
      await new Promise(resolve => {
        function tick(now) {
          frames.push(now - last); last = now;
          window.scrollTo({ top: (now - start) / 5500 * (document.querySelector('[class*="timeline_"]').offsetHeight - innerHeight), behavior: 'instant' });
          counts.push(Number(host.dataset.frames));
          if (now - start < 5500) requestAnimationFrame(tick); else resolve();
        }
        requestAnimationFrame(tick);
      });
      frames.sort((a, b) => a - b);
      return { browserRafP50: frames[Math.floor(frames.length * .5)], browserRafP95: frames[Math.floor(frames.length * .95)], longTasks: window.__longTasks, renderedFrames: Math.max(...counts) - Math.min(...counts), memoryBytes: performance.memory?.usedJSHeapSize };
    });
    await page.waitForTimeout(1600);
    const before = await stats(page);
    await page.waitForTimeout(1000);
    const after = await stats(page);
    assert.equal(after.frames, before.frames, `${name}: idle renderer must sleep`);
    if (low) assert.equal(after.quality, 'low');
    if (width < 760) {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 660 }] });
      for (let y = 640; y >= 220; y -= 40) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(500);
      assert.ok(await page.evaluate(() => scrollY) > 100, 'Native touch scroll must work');
    }
    results.profiles.push({ name, cpuThrottle: rate, ...profile, render: after });
    await context.close();
  }
  assert.deepEqual(results.errors, []);
  console.log(JSON.stringify(results, null, 2));
} finally {
  writeFileSync(`${output}/results.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
