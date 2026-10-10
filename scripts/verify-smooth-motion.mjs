// Local, read-only animation checks; no sign-in or data submissions.
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
const [origin, moduleRoot, outputDirectory, executablePath] = process.argv.slice(2);
assert.ok(origin.startsWith('http://127.0.0.1:'));
mkdirSync(outputDirectory, { recursive: true });
const { chromium } = createRequire(path.join(moduleRoot, 'package.json'))('playwright');
const browser = await chromium.launch({ headless: true, executablePath });
const checks = [];
const errors = [];
const sample = (locator, duration = 450) => locator.evaluate((node, duration) => new Promise(resolve => {
  const frames = []; const start = performance.now();
  const frame = () => {
    const style = getComputedStyle(node);
    frames.push({ opacity: Number(style.opacity), y: style.transform === 'none' ? 0 : new DOMMatrixReadOnly(style.transform).m42, height: node.getBoundingClientRect().height });
    if (performance.now() - start < duration && node.isConnected) requestAnimationFrame(frame); else resolve(frames);
  }; frame();
}), duration);
try {
  for (const preference of ['no-preference', 'reduce']) {
    const context = await browser.newContext({ reducedMotion: preference });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [360, 430, 768, 1366, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(origin + '/', { waitUntil: 'networkidle' });
      if (preference === 'no-preference') await page.locator('[data-reveal-state="pending"]').first().waitFor({ state: 'attached' });
      await page.getByRole('button', { name: '메뉴 열기', exact: true }).click();
      const menu = page.getByRole('dialog', { name: '전체 메뉴' });
      const menuFrames = await sample(menu);
      assert.ok(preference === 'reduce' ? menuFrames.every(frame => frame.y === 0) : menuFrames.some(frame => frame.y < -1), 'Menu motion matches preference');
      assert.equal(await page.locator('#site-content').evaluate(node => node.inert), true);
      await page.keyboard.press('Escape');
      await menu.waitFor({ state: 'hidden' });
      assert.ok(await page.getByRole('button', { name: '메뉴 열기', exact: true }).evaluate(node => node === document.activeElement));
      await page.goto(origin + '/support', { waitUntil: 'networkidle' });
      const trigger = page.getByRole('button', { name: '비회원 문의하기', exact: true });
      await trigger.click();
      const drawer = page.locator('dialog[open]');
      await drawer.waitFor();
      const drawerFrames = await sample(drawer);
      assert.ok(preference === 'reduce' ? drawerFrames.every(frame => frame.y === 0) : drawerFrames.some(frame => Math.abs(frame.y) > 1), 'Guest drawer actually moves');
      const box = await drawer.boundingBox();
      assert.equal(Math.round(box.width), width <= 760 ? width : 640);
      if (width > 760) assert.ok(Math.abs(box.x - (width - box.width) / 2) < 2, 'Desktop dialog remains centered');
      await page.keyboard.press('Escape');
      if (preference === 'no-preference') assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden', 'Exit retains modal lock');
      await drawer.waitFor({ state: 'hidden' });
      await page.waitForFunction(() => document.body.style.overflow !== 'hidden');
      assert.ok(await trigger.evaluate(node => node === document.activeElement));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      checks.push({ width, preference, menuMoved: menuFrames.some(frame => frame.y < -1), drawerMoved: drawerFrames.some(frame => Math.abs(frame.y) > 1), drawerWidth: box.width, exitFocusReturned: true });
    }
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(origin + '/rules', { waitUntil: 'networkidle' });
    const disclosure = page.locator('[data-animated-disclosure]').first();
    await disclosure.locator('summary').click();
    const expansion = await sample(disclosure.locator('[data-disclosure-content]'), 320);
    if (preference === 'no-preference') assert.ok(expansion[0].height < expansion.at(-1).height, 'Disclosure expands progressively');
    await disclosure.locator('summary').click();
    if (preference === 'no-preference') {
      assert.equal(await disclosure.locator('[data-disclosure-content]').evaluate(node => node.inert), true, 'Collapsing links are removed from keyboard navigation');
      await page.keyboard.press('Tab');
      assert.equal(await disclosure.locator('[data-disclosure-content]').evaluate(node => node.contains(document.activeElement)), false);
    }
    await page.waitForFunction(() => !document.querySelector('[data-animated-disclosure]').open);
    await disclosure.locator('summary').click();
    await disclosure.locator('summary').click();
    await page.waitForFunction(() => !document.querySelector('[data-animated-disclosure]').open);
    await disclosure.locator('summary').focus();
    await page.keyboard.press('Enter');
    assert.equal(await disclosure.getAttribute('open'), '');
    checks.push({ preference, behavior: 'Native disclosure expands, collapses, reverses and supports keyboard', passed: true });
    await page.goto(origin + '/', { waitUntil: 'networkidle' });
    if (preference === 'no-preference') {
      const pending = page.locator('figure[data-reveal-state="pending"]').first();
      await pending.waitFor({ state: 'attached' });
      await pending.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
      const frames = await sample(pending, 520);
      assert.ok(frames.some(frame => frame.opacity > 0 && frame.opacity < 1 && frame.y > 0), 'Scroll target fades and rises');
      assert.equal(frames.at(-1).opacity, 1);
      const focused = page.locator('[data-reveal-state="pending"] a').last();
      if (await focused.count()) {
        const focusResult = await focused.evaluate(node => {
          node.focus({ preventScroll: true });
          return { opacity: getComputedStyle(node.closest('[data-scroll-reveal]')).opacity, active: node === document.activeElement, inert: Boolean(node.closest('[inert]')), state: node.closest('[data-scroll-reveal]').dataset.revealState };
        });
        assert.equal(focusResult.opacity, '1', JSON.stringify(focusResult));
        assert.equal(focusResult.active, true);
      }
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => [...document.querySelectorAll('[data-scroll-reveal]')].every(node => getComputedStyle(node).opacity === '1'));
      await page.waitForFunction(() => !document.querySelector('[data-reveal-state]'));
      checks.push({ behavior: 'Scroll reveal, immediate focus visibility and live reduced-motion change', passed: true });
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.goto(origin + '/rules', { waitUntil: 'networkidle' });
      const liveDisclosure = page.locator('[data-animated-disclosure]').first();
      await liveDisclosure.locator('summary').click();
      assert.ok(await liveDisclosure.locator('[data-disclosure-content]').evaluate(node => node.getAnimations().length > 0));
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => !document.querySelector('[data-disclosure-content]').getAnimations().length);
      assert.equal(await liveDisclosure.getAttribute('open'), '');
      checks.push({ behavior: 'Changing reduced motion cancels an in-progress disclosure', passed: true });
    } else {
      assert.ok(await page.locator('[data-scroll-reveal]').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).opacity === '1' && getComputedStyle(node).transform === 'none')));
      checks.push({ behavior: 'Reduced-motion content is immediately visible', passed: true });
    }
    await context.close();
  }
  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await staticContext.newPage();
  await staticPage.goto(origin + '/history', { waitUntil: 'networkidle' });
  assert.ok(await staticPage.locator('[data-scroll-reveal]').evaluateAll(nodes => nodes.length > 0 && nodes.every(node => getComputedStyle(node).opacity === '1')));
  checks.push({ behavior: 'Server HTML remains visible without JavaScript', passed: true });
  await staticContext.close();
  assert.deepEqual(errors, []);
  console.log(`Passed ${checks.length} normal/reduced motion, drawer, disclosure, focus, scroll and no-JavaScript checks.`);
} finally {
  writeFileSync(path.join(outputDirectory, 'motion-checks.json'), JSON.stringify({ checks, errors }, null, 2));
  await browser.close();
}
