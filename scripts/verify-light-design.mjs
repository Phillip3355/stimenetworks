// Read-only localhost UI verification. Never signs in or submits data.
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
const [origin, productionOrigin, moduleRoot, outputDirectory, executablePath] = process.argv.slice(2);
assert.ok([origin, productionOrigin].every(value => value.startsWith('http://127.0.0.1:')));
const { chromium } = createRequire(path.join(moduleRoot, 'package.json'))('playwright');
const browser = await chromium.launch({ headless: true, executablePath });
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const checks = [];
const docs = ['/join', '/rules', '/recovery-guidelines', '/news', '/updates', '/history', '/server-mechanism', '/News', '/__test-only-markdown'];
try {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const route of docs) {
    await page.goto(origin + route, { waitUntil: 'networkidle' });
    const navigation = page.getByRole('complementary', { name: '페이지 안내', exact: true });
    const toc = page.getByRole('complementary', { name: '페이지 목차', exact: true });
    assert.ok(await navigation.isVisible());
    assert.ok(await toc.isVisible());
    const broken = await toc.locator('a').evaluateAll(nodes => nodes.filter(node => !document.getElementById(decodeURIComponent(node.hash.slice(1)))).map(node => node.hash));
    assert.deepEqual(broken, [], route + ': TOC targets exist');
    const reading = await page.locator('main > div').evaluate(node => node.getBoundingClientRect().width);
    assert.ok(reading <= 721, route + ': reading measure');
    const colors = await page.evaluate(() => ({ canvas: getComputedStyle(document.body).backgroundColor, headingFont: getComputedStyle(document.querySelector('main h1')).fontFamily }));
    assert.equal(colors.canvas, 'rgb(255, 255, 255)');
    assert.match(colors.headingFont, /Inter|inter/i);
    checks.push({ route, width: 1440, readingWidth: reading, ...colors, tocTargets: 'valid' });
  }
  await page.goto(origin + '/rules', { waitUntil: 'networkidle' });
  const sidebar = page.getByRole('complementary', { name: '페이지 안내', exact: true });
  await page.getByRole('searchbox', { name: '안내 페이지 찾기' }).fill('복구');
  assert.equal(await sidebar.locator('nav a').count(), 1);
  assert.equal(await sidebar.locator('nav a').getAttribute('href'), '/recovery-guidelines');
  await page.getByRole('searchbox', { name: '안내 페이지 찾기' }).fill('no-such-guide');
  await page.getByRole('status').filter({ hasText: '일치하는 페이지가 없습니다.' }).waitFor();
  checks.push({ behavior: 'Guide filtering and empty state', passed: true });
  await page.setViewportSize({ width: 320, height: 740 });
  for (const route of docs) {
    await page.goto(origin + route, { waitUntil: 'networkidle' });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), route + ': 320px page overflow');
    const disclosure = page.locator('main details').first();
    await disclosure.locator('summary').click();
    assert.equal(await disclosure.getAttribute('open'), '');
    assert.ok(await disclosure.getByRole('link', { name: '복구 가이드', exact: true }).isVisible());
    checks.push({ route, width: 320, guideDrawer: 'usable', overflow: false });
  }
  await page.goto(productionOrigin + '/', { waitUntil: 'networkidle' });
  const footer = page.locator('footer details').first();
  await footer.scrollIntoViewIfNeeded();
  assert.equal(await footer.getAttribute('open'), null);
  await footer.locator('summary').click();
  await footer.locator('a[href="/servers"]').waitFor({ state: 'visible' });
  await footer.locator('summary').click();
  assert.equal(await footer.getAttribute('open'), null);
  checks.push({ behavior: 'Mobile footer accordion opens and closes', passed: true });
  const missing = await page.goto(productionOrigin + '/__nonexistent-light-design-page', { waitUntil: 'networkidle' });
  assert.equal(missing.status(), 404);
  assert.ok(await page.getByRole('link', { name: /홈으로 이동/ }).isVisible());
  checks.push({ behavior: 'Custom 404 and home action', passed: true });
  // Model a notched viewport by substituting only CSS environment functions.
  for (const route of ['/', '/join', '/servers', '/servers/the-great-war']) {
    await page.goto(origin + route, { waitUntil: 'networkidle' });
    const safeAreaStyles = await page.evaluate(() => [...document.styleSheets].flatMap(sheet => {
      try { return [...sheet.cssRules].map(rule => rule.cssText); } catch { return []; }
    }).join('\n').replaceAll('env(safe-area-inset-top)', '47px'));
    await page.addStyleTag({ content: safeAreaStyles });
    const headerBottom = await page.locator('header').first().evaluate(node => node.getBoundingClientRect().bottom);
    const firstContent = route === '/join' ? page.locator('main details').first() : page.locator('main h1');
    const contentTop = await firstContent.evaluate(node => node.getBoundingClientRect().top);
    assert.ok(contentTop >= headerBottom, route + ': safe-area content clearance');
    if (route === '/') {
      await page.getByRole('button', { name: '메뉴 열기', exact: true }).click();
      const menuTop = await page.getByRole('dialog', { name: '전체 메뉴' }).evaluate(node => node.getBoundingClientRect().top);
      assert.ok(menuTop >= 47, 'Menu stays below the simulated notch');
      await page.keyboard.press('Escape');
    }
    checks.push({ route, behavior: '47px simulated CSS top safe area', headerBottom, contentTop });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(productionOrigin + '/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outputDirectory, 'production-home-top-1440.png') });
  await page.goto(productionOrigin + '/rules', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outputDirectory, 'production-rules-top-1440.png') });
  assert.deepEqual(errors, []);
  writeFileSync(path.join(outputDirectory, 'light-design-checks.json'), JSON.stringify({ checks, errors }, null, 2));
  console.log(`Passed ${checks.length} light design, navigation, 320px layout and 404 checks.`);
} finally { await browser.close(); }
