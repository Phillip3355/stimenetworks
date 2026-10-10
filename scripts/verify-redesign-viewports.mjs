// Read-only local browser audit; uses a supplied Playwright installation.
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const [origin, moduleRoot, outputDirectory, browserExecutable] = process.argv.slice(2);
const interactionsOnly = process.argv.includes('--interactions-only');
assert.ok(origin?.startsWith('http://127.0.0.1:'), 'Use a local preview');
assert.ok(moduleRoot && outputDirectory, 'Provide browser module root and evidence directory');
const requireBrowser = createRequire(path.join(path.resolve(moduleRoot), 'package.json'));
const { chromium } = requireBrowser('playwright');
mkdirSync(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(browserExecutable ? { executablePath: browserExecutable } : {}) });
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error' && /hydration|hydrated|didn't match/i.test(message.text())) errors.push(message.text()); });
const routes = ['/', '/servers', '/servers/the-great-war', '/servers/survival', '/join', '/rules', '/recovery-guidelines', '/news', '/News', '/__test-only-markdown', '/updates', '/history', '/server-mechanism', '/support', '/taskboard', '/auth/callback'];
const viewports = [{ width: 360, height: 800 }, { width: 430, height: 932 }, { width: 768, height: 1024 }, { width: 1366, height: 768 }, { width: 1440, height: 900 }];
const checks = [];
async function settle() {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].filter(image => {
    const rect = image.getBoundingClientRect();
    return rect.top < innerHeight && rect.bottom > 0;
  }).every(image => image.complete));
}
async function capture(filename, fullPage = true) {
  if (fullPage) {
    for (const image of await page.locator('main img').all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(node => node.decode().catch(() => {}));
    }
    await page.evaluate(() => scrollTo(0, 0));
  }
  await page.screenshot({ path: path.join(outputDirectory, filename), type: 'jpeg', quality: 78, fullPage });
}
try {
  for (const viewport of viewports) {
    if (interactionsOnly) break;
    await page.setViewportSize(viewport);
    for (const route of routes) {
      const response = await page.goto(origin + route, { waitUntil: 'networkidle' });
      await settle();
      const layout = await page.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        headings: [...document.querySelectorAll('main h1')].map(node => node.textContent),
        font: getComputedStyle(document.body).fontFamily,
        outOfBoundsControls: [...document.querySelectorAll('main a,main button,main input,main select,main textarea')].filter(node => {
          const r = node.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && (r.left < -1 || r.right > innerWidth + 1);
        }).map(node => node.textContent?.trim().slice(0,70) || node.id),
      }));
      const check = { route, viewport, status: response.status(), ...layout };
      checks.push(check);
      assert.equal(check.status, 200, `${route} at ${viewport.width}`);
      assert.ok(check.scrollWidth <= viewport.width + 1, `Page overflow: ${route} at ${viewport.width}`);
      assert.ok(check.bodyWidth <= viewport.width + 1, `Body overflow: ${route} at ${viewport.width}`);
      assert.equal(check.outOfBoundsControls.length, 0, `Controls overflow: ${route} at ${viewport.width}: ${check.outOfBoundsControls}`);
      if (viewport.width === 360 || viewport.width === 1440) {
        const slug = route === '/' ? 'home' : route === '/News' ? 'report-News' : route.slice(1).replaceAll('/', '-');
        await capture(`${slug}-${viewport.width}.jpg`);
        if (route === '/') await capture(`home-top-${viewport.width}.jpg`, false);
      }
    }
    console.log(`Verified ${routes.length} routes at ${viewport.width}px`);
  }
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto(origin + '/');
  await settle();
  assert.ok(await page.locator('header a[aria-label="StimeMC home"]').isVisible());
  assert.ok(await page.locator('header a[href="/join"]').isVisible());
  const trigger = page.getByRole('button', { name: '메뉴 열기', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: '전체 메뉴' });
  await dialog.waitFor({ state: 'visible' });
  assert.equal(await page.locator('#site-content').evaluate(node => node.inert), true);
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  await page.keyboard.press('Shift+Tab');
  assert.equal(await dialog.evaluate(node => node.contains(document.activeElement)), true);
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  assert.equal(await trigger.evaluate(node => node === document.activeElement), true);
  await page.getByRole('button', { name: 'Switch to English', exact: true }).click();
  await page.waitForFunction(() => document.documentElement.lang === 'en');
  assert.match(await page.locator('#home-title').innerText(), /ONE COMMUNITY/);
  await page.getByRole('link', { name: 'Explore servers', exact: true }).click();
  await page.waitForURL(origin + '/servers');
  await settle();
  assert.match(await page.locator('main h1').innerText(), /Our worlds/);
  await page.getByRole('button', { name: '한국어로 전환', exact: true }).click();
  await page.goto(origin + '/support');
  await settle();
  await page.getByRole('button', { name: '비회원 문의하기', exact: true }).click();
  const guest = page.getByRole('dialog');
  await guest.waitFor({ state: 'visible' });
  assert.equal(await guest.evaluate(node => Math.round(node.getBoundingClientRect().width)), 320, 'Mobile guest drawer uses the full viewport width');
  await capture('support-guest-menu-320.jpg');
  await page.getByRole('button', { name: /^문의 시작하기/ }).click();
  await page.locator('#guest-inquiry-nickname').waitFor({ state: 'visible' });
  await capture('support-guest-form-320.jpg');
  await page.keyboard.press('Escape');
  await page.goto(origin + '/rules');
  await settle();
  await page.getByRole('button', { name: /도둑질·소유물 침해 금지/ }).click();
  assert.ok(await page.locator('[data-active="true"]').innerText().then(text => text.includes('소유물')));
  await capture('rules-selected-320.jpg');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(origin + '/');
  await settle();
  await page.locator('#worlds-title').scrollIntoViewIfNeeded();
  assert.ok((await page.locator('article').first().evaluate(node => getComputedStyle(node).transform)) === 'none', 'Reduced-motion world panels must be stationary');
  await capture('worlds-reduced-motion-1440.jpg', false);
  const motionContext = await browser.newContext({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } });
  const motionPage = await motionContext.newPage();
  await motionPage.goto(origin + '/', { waitUntil: 'networkidle' });
  await motionPage.locator('#worlds-title').scrollIntoViewIfNeeded();
  await motionPage.screenshot({ path: path.join(outputDirectory, 'worlds-motion-1440.jpg'), type: 'jpeg', quality: 78 });
  await motionContext.close();
  assert.equal(errors.length, 0, `Browser errors: ${errors.join('; ')}`);
  writeFileSync(path.join(outputDirectory, interactionsOnly ? 'interaction-checks.json' : 'viewport-checks.json'), JSON.stringify({ checks, interactions: '320px shell, menu focus/escape/inert, language, guest menu/form, rule selection, reduced and normal motion', errors }, null, 2));
  console.log(`Passed ${checks.length} route/viewport checks, keyboard/menu/language/form/rule/motion interactions; no browser page errors.`);
} finally {
  writeFileSync(path.join(outputDirectory, interactionsOnly ? 'partial-interaction-checks.json' : 'partial-viewport-checks.json'), JSON.stringify({ checks, errors }, null, 2));
  await browser.close();
}
