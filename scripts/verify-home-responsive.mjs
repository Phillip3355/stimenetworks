// Read-only browser regressions for the homepage; use an isolated local preview.
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const [origin, moduleRoot, outputDirectory, executablePath] = process.argv.slice(2);
assert.match(origin, /^http:\/\/127\.0\.0\.1:\d+$/);
const { chromium } = createRequire(path.join(moduleRoot, 'package.json'))('playwright');
mkdirSync(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath });
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage();
const checks = [], failures = [], errors = [], writes = [];
page.on('pageerror', error => errors.push(error.message));
await page.route('**/*', route => {
  if (!['GET', 'HEAD'].includes(route.request().method())) {
    writes.push(route.request().url());
    return route.abort();
  }
  return route.continue();
});
const check = (name, passed, details = {}) => {
  const result = { name, passed, ...details };
  checks.push(result);
  if (!passed) failures.push(result);
};

try {
  for (const language of ['ko', 'en']) {
    await page.setViewportSize({ width: 360, height: 900 });
    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    if (language === 'en') await page.getByRole('button', { name: 'Switch to English', exact: true }).click();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => document.querySelector('header button[aria-controls="site-menu"]')?.getAttribute('aria-expanded') === 'false');
    for (const width of [280, 320, 360, 430, 479, 480, 767, 768, 900, 1023, 1024, 1100, 1366, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const state = await page.evaluate(() => {
        const section = id => document.getElementById(id).closest('section');
        const rect = node => node.getBoundingClientRect().toJSON();
        const style = node => getComputedStyle(node);
        const hero = section('home-title'), worlds = section('worlds-title');
        const crossplay = section('crossplay-title'), archive = section('archive-title');
        const guide = section('home-guide-title');
        const jump = hero.querySelector('figcaption a');
        const editions = [...crossplay.querySelectorAll('h3')].map(node => rect(node.parentElement));
        const archiveFigures = [...archive.querySelectorAll('figure')];
        const archiveRail = archiveFigures[0].parentElement;
        const heroActions = hero.querySelector('a[href="/servers"]').parentElement;
        const guideActions = guide.querySelector('a').parentElement;
        const menu = document.querySelector('header button[aria-controls="site-menu"]');
        const nav = document.querySelector('header nav');
        const visible = node => node.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true });
        const scrollParent = node => {
          for (let parent = node.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
            if (['auto', 'scroll'].includes(style(parent).overflowX) && parent.scrollWidth > parent.clientWidth) return true;
          }
          return false;
        };
        const clipped = [...document.querySelectorAll('main h1,main h2,main h3,main p,main figcaption,main a,main li,footer a')]
          .filter(visible).filter(node => node.clientWidth && node.scrollWidth > node.clientWidth + 2 && !scrollParent(node))
          .map(node => node.textContent.trim().slice(0, 80));
        return {
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          clipped, menuVisible: visible(menu), navVisible: visible(nav),
          jumpSize: parseFloat(style(jump).fontSize), jumpHeight: rect(jump).height,
          heroAlignment: style(heroActions).justifyContent, guideAlignment: style(guideActions).justifyContent,
          editions, bridge: rect([...crossplay.querySelectorAll('span')].find(node => node.textContent === 'GEYSER').parentElement),
          panels: [...worlds.querySelectorAll('article')].map(node => ({ visual: rect(node.querySelector('figure')), copy: rect(node.querySelector('figure').nextElementSibling) })),
          footerGroups: [...document.querySelectorAll('.footerGroup')].map(rect),
          rail: rect(archiveRail), archiveScrolls: archiveRail.scrollWidth > archiveRail.clientWidth,
          archiveCards: archiveFigures.map(rect), captions: archiveFigures.map(node => node.querySelector('figcaption').lastElementChild.textContent),
          serverHeadingCount: [...document.querySelectorAll('main h3')].filter(node => node.textContent === 'THE GREAT WAR').length,
          metadataSizes: [...hero.querySelectorAll('figcaption > div > span'), ...worlds.querySelectorAll('[class*="status_"]'), ...archive.querySelectorAll('figcaption'), ...document.querySelectorAll('main time')].map(node => parseFloat(style(node).fontSize)),
        };
      });
      const details = { width, language };
      check('No page overflow or clipped prose', !state.overflow && !state.clipped.length, { ...details, clipped: state.clipped });
      check('One navigation mode per breakpoint', state.menuVisible === (width < 1024) && state.navVisible === (width >= 1024), details);
      check('Jump link retains a readable label and touch target', state.jumpSize >= 13 && state.jumpHeight >= 44, details);
      check('Server introduction occurs once', state.serverHeadingCount === 1, details);
      check('Archive captions describe distinct images', new Set(state.captions).size === 7, details);
      check('Important metadata remains readable', state.metadataSizes.every(size => size >= 13), details);
      if (width <= 767) {
        check('Hero and closing actions share alignment', state.heroAlignment === state.guideAlignment, details);
        check('Archive scrolls sideways in one compact row', state.archiveScrolls && state.rail.height < 460 && Math.abs(state.archiveCards[0].top - state.archiveCards[6].top) < 2, details);
        check('Archive images retain readable card widths', state.archiveCards.every(card => card.width >= Math.min(180, state.rail.width * 0.65)), details);
      }
      if (width < 480) {
        const [java, bedrock] = state.editions;
        check('Both editions feed the same bridge', Math.abs(java.top - bedrock.top) < 2 && java.bottom <= state.bridge.top && bedrock.bottom <= state.bridge.top, details);
      }
      if (width >= 768 && width <= 1023) {
        check('Tablet card text has the full panel width', state.panels.every(({ visual, copy }) => copy.top >= visual.bottom - 1 && Math.abs(copy.width - visual.width) < 2), details);
      }
      if (width >= 768 && width <= 1100) {
        const [first, , third, fourth, fifth] = state.footerGroups;
        check('Tablet footer second row fills its available width', Math.abs(fourth.left - first.left) < 2 && Math.abs(fifth.right - third.right) < 2, details);
      }
      if ([280, 360, 768, 1024, 1440].includes(width)) {
        for (const id of ['home-title', 'worlds-title', 'crossplay-title', 'archive-title', 'home-guide-title']) {
          const target = page.locator(`section[aria-labelledby="${id}"]`);
          await target.screenshot({ path: path.join(outputDirectory, `${id}-${width}-${language}.png`) });
        }
      }
    }
    console.log(`Checked homepage layout at 14 widths (${language}).`);
  }
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  const archive = page.locator('section[aria-labelledby="archive-title"]');
  const rail = archive.locator('figure').first().locator('..');
  await rail.scrollIntoViewIfNeeded();
  const lastImage = archive.locator('figure').last();
  await lastImage.scrollIntoViewIfNeeded();
  check('All seven archive images remain reachable', await rail.evaluate(node => node.scrollLeft > 0));
  await rail.evaluate(node => { node.scrollLeft = 0; });
  check('Archive can receive keyboard focus', await rail.evaluate(node => node.tabIndex >= 0));
  if (await rail.evaluate(node => node.tabIndex >= 0)) {
    await rail.focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.activeElement.scrollLeft > 0);
    check('Keyboard moves the archive rail', true);
  }
  const trigger = page.getByRole('button', { name: '메뉴 열기', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: '전체 메뉴', exact: true });
  await dialog.waitFor();
  await page.keyboard.press('Shift+Tab');
  check('Mobile menu traps focus', await dialog.evaluate(node => node.contains(document.activeElement)));
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('header').inert);
  await dialog.waitFor({ state: 'hidden' });
  check('Escape returns focus to the menu trigger', await trigger.evaluate(node => document.activeElement === node));
  await trigger.click();
  await dialog.waitFor();
  await page.setViewportSize({ width: 1024, height: 900 });
  check('Desktop resize dismisses the mobile menu', await dialog.waitFor({ state: 'hidden', timeout: 1500 }).then(() => true, () => false));
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('header').inert);
  const guideLink = page.locator('header nav > div').filter({ has: page.locator('a[href="/rules"]') }).first();
  check('Desktop exposes detailed navigation', await guideLink.count() > 0);
  if (await guideLink.count()) {
    await guideLink.locator('a').first().focus();
    check('Desktop sublinks work without hover', await guideLink.locator('a[href="/support"]').waitFor({ state: 'visible', timeout: 2000 }).then(() => true, () => false));
    await guideLink.locator('a[href="/support"]').focus();
    await page.keyboard.press('Escape');
    check('Escape dismisses desktop sublinks and restores primary-link focus', await guideLink.locator('a[href="/support"]').waitFor({ state: 'hidden', timeout: 2000 }).then(() => true, () => false) && await guideLink.locator('a').first().evaluate(node => document.activeElement === node));
    await page.locator('header a[aria-label="StimeMC home"]').focus();
    await guideLink.locator('a').first().focus();
    check('Keyboard can reopen a dismissed desktop group', await guideLink.locator('a[href="/support"]').waitFor({ state: 'visible', timeout: 2000 }).then(() => true, () => false));
    const brand = page.locator('header a[aria-label="StimeMC home"]');
    await brand.focus();
    await guideLink.hover();
    await guideLink.locator('a[href="/support"]').waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');
    check('Escape dismisses hover-only navigation without stealing focus', await guideLink.locator('a[href="/support"]').waitFor({ state: 'hidden', timeout: 2000 }).then(() => true, () => false) && await brand.evaluate(node => document.activeElement === node));
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await lastImage.scrollIntoViewIfNeeded();
  check('Archive remains visible with normal motion', await page.waitForFunction(() => {
    const figure = document.querySelector('section[aria-labelledby="archive-title"] figure:last-child');
    return getComputedStyle(figure).opacity === '1';
  }, null, { timeout: 2000 }).then(() => true, () => false));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['/servers', '/server-mechanism']) {
    for (const width of [280, 360, 768, 1024]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(origin + route, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.fonts.ready);
      const fits = await page.evaluate(() => {
        const visible = node => node.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true });
        const clipped = [...document.querySelectorAll('main h1,main h2,main h3,main p,main a')].filter(visible)
          .filter(node => node.clientWidth && node.scrollWidth > node.clientWidth + 2);
        return document.documentElement.scrollWidth <= innerWidth + 1 && !clipped.length;
      });
      check('Shared components still fit related pages', fits, { width, route });
      if (width === 280) await page.screenshot({ path: path.join(outputDirectory, `${route.slice(1)}-280.png`), fullPage: true });
    }
    console.log(`Checked related page ${route}.`);
  }
  check('No unexpected browser errors', errors.length === 0, { errors });
  check('No mutation requests', writes.length === 0, { writes });
} finally {
  writeFileSync(path.join(outputDirectory, 'homepage-checks.json'), JSON.stringify({ checks, failures, errors, writes }, null, 2));
  console.log(JSON.stringify({ checks: checks.length, failures: failures.length, failedChecks: failures }, null, 2));
  await browser.close();
  if (failures.length || errors.length || writes.length) process.exitCode = 1;
}
