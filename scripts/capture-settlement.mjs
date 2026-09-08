import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
await mkdirSync('scratch/cinematic/reference', { recursive: true });
for (const [width, height] of [[1440, 900], [390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.route('**/_vercel/**', route => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  page.on('pageerror', error => console.log('PAGE ERROR', error.message));
  page.on('console', message => { if (message.type() === 'error') console.log(message.text()); });
  await page.goto('http://127.0.0.1:3100', { waitUntil: 'networkidle' });
  await page.waitForSelector('main[data-mode="cinematic"]');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `scratch/cinematic/reference/${width}-hero.png` });
  console.log(width, await page.locator('[data-quality]').evaluate(el => ({ ...el.dataset })));
  if (width === 1440) {
    await page.locator('main nav button').nth(1).click();
    await page.waitForTimeout(1400);
    await page.screenshot({ path: 'scratch/cinematic/reference/desktop-enter.png' });
  }
  await page.close();
}
await browser.close();
