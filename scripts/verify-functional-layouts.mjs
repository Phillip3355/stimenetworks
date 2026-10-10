// TEST ONLY: synthetic sessions and read-only responses inside local browser
// contexts. Never submits an inquiry, publishes a report or accesses live data.
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const [origin, stubOrigin, moduleRoot, outputDirectory, executablePath] = process.argv.slice(2);
const comprehensive = process.argv.includes('--comprehensive');
const visual = process.argv.includes('--visual');
mkdirSync(outputDirectory, { recursive: true });
assert.ok(origin.startsWith('http://127.0.0.1:') && stubOrigin.startsWith('http://127.0.0.1:'));
const { chromium } = createRequire(path.join(moduleRoot, 'package.json'))('playwright');
const browser = await chromium.launch({ headless: true, executablePath });
const user = { id: 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f', email: 'layout-fixture@example.test', aud: 'authenticated', role: 'authenticated', email_confirmed_at: '2026-10-09T00:00:00Z', app_metadata: { provider: 'google' }, user_metadata: {}, identities: [], created_at: '2026-10-09T00:00:00Z' };
const inquiry = { id: 'b0f8ad5d-75f8-4c9d-8a65-1df54857274f', user_id: user.id, nickname: 'TEST ONLY — Layout player', inquiry_code: 'STM-FIXTURE', status: 'open', created_at: '2026-10-09T00:00:00Z' };
const messages = ['user', 'admin'].map((sender, index) => ({ id: `fixture-message-${index}`, inquiry_id: inquiry.id, sender, message: index ? 'TEST ONLY — 이 화면은 레이아웃 검사 자료입니다. 실제 문의나 답변이 아닙니다.' : 'TEST ONLY — 문의 내용과 긴 줄의 모바일 표시를 확인합니다. ' + '레이아웃검사'.repeat(22), created_at: '2026-10-09T00:00:00Z' }));
const timestamp = Math.floor(Date.now() / 1000);
const jwt = [ { alg: 'HS256', typ: 'JWT' }, { sub: user.id, aud: 'authenticated', role: 'authenticated', iat: timestamp, exp: timestamp + 3600 } ].map(value => Buffer.from(JSON.stringify(value)).toString('base64url')).join('.') + '.test-only-signature';
const session = { access_token: jwt, refresh_token: 'test-only-refresh', token_type: 'bearer', expires_in: 3600, expires_at: timestamp + 3600, user };
const storageKey = `sb-${new URL(stubOrigin).hostname.split('.')[0]}-auth-token`;
const checks = [];
const writes = [];
const failures = [];
const errors = [];
const variants = comprehensive ? [
  [280,653,1], [320,740,1], [360,800,1], [390,844,1], [653,720,1],
  [768,1024,1], [1024,768,1], [1280,720,1], [1366,768,1], [1440,900,1], [1920,1080,1],
  [740,360,1], [844,390,1], [390,330,1], [1366,768,1.25], [1024,768,1.5],
] : visual ? [[320,740,1],[1366,768,1]] : [[360,800,1],[1440,900,1]];
try {
  for (const role of comprehensive ? ['member','admin','denied'] : ['member','admin']) {
    const admin = role === 'admin';
    const denied = role === 'denied';
    const context = await browser.newContext({ reducedMotion: process.argv.includes('--motion') ? 'no-preference' : 'reduce' });
    await context.addInitScript(({ storageKey, session }) => localStorage.setItem(storageKey, JSON.stringify(session)), { storageKey, session });
    await context.route(stubOrigin + '/**', async route => {
      const request = route.request();
      const url = new URL(request.url());
      const headers = { 'access-control-allow-origin': origin, 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'content-type': 'application/json' };
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
      let data;
      if (url.pathname === '/auth/v1/user' && request.method() === 'GET') data = user;
      else if (url.pathname === '/rest/v1/rpc/is_support_admin') data = admin;
      else if (request.method() !== 'GET') { writes.push(url.pathname); return route.fulfill({ status: 405, headers, body: '{}' }); }
      else if (url.pathname === '/rest/v1/inquiries') data = [inquiry];
      else if (url.pathname === '/rest/v1/inquiry_messages') data = messages;
      else if (url.pathname === '/rest/v1/reports') data = [{ id: 'fixture-report', slug: 'TEST-ONLY-report', created_at: '2026-10-09T00:00:00Z' }];
      else data = [];
      return route.fulfill({ status: 200, headers, body: JSON.stringify(data) });
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    for (const [width,height,zoom] of variants) for (const language of comprehensive ? ['ko','en'] : ['ko']) {
      await page.setViewportSize({ width, height });
      await page.goto(origin + (admin || denied ? '/taskboard' : '/support'), { waitUntil: 'networkidle' });
      if(denied) await page.getByRole('heading',{name:'Access Denied',exact:true}).waitFor();
      else await page.getByRole('button', { name: /STM-FIXTURE/ }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      if(language==='en') await page.locator('header button[aria-label="Switch to English"]').click();
      await page.evaluate(value => { document.body.style.zoom = String(value); }, zoom);
      const checkLayout = async state => {
        if(process.argv.includes('--motion'))await page.waitForTimeout(700);
        const layout = await page.evaluate(() => {
          const visible = node => node.checkVisibility({checkVisibilityCSS:true,checkOpacity:true}) && node.getBoundingClientRect().width>0 && node.getBoundingClientRect().height>0;
          const label = node => node.id || (node.getAttribute('aria-label') || node.textContent).trim().slice(0,80);
          const nodes = [...document.querySelectorAll('main button,main input,main textarea,main select')].filter(visible);
          return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
            controls:nodes.filter(node=>{ const r=node.getBoundingClientRect(); return r.left< -1 || r.right>innerWidth+1; }).map(label),
            smallInputs:nodes.filter(node=>['INPUT','TEXTAREA','SELECT'].includes(node.tagName) && parseFloat(getComputedStyle(node).fontSize)<16).map(label),
            smallButtons:nodes.filter(node=>node.tagName==='BUTTON' && parseFloat(getComputedStyle(node).fontSize)<14).map(label),
            shortButtons:nodes.filter(node=>node.tagName==='BUTTON' && (node.getBoundingClientRect().height<43.5 || node.getBoundingClientRect().width<43.5)).map(label),
            clipped:[...document.querySelectorAll('main h1,main h2,main h3,main p,main label,main button,main strong')].filter(visible).filter(node=>node.clientWidth && node.scrollWidth>node.clientWidth+2).map(label)
          };
        });
        const check = { role: `synthetic ${role}`, width,height,zoom,language,state,...layout };
        if(state==='conversation' && width<=760 && height>=650 && zoom===1){
          const input=page.locator('main form input').last();
          const box=await input.boundingBox();
          assert.ok(box && box.y>=64 && box.y+box.height<=height,'Conversation input stays in the viewport');
        }
        checks.push(check);
        if(layout.scrollWidth>width+1 || layout.controls.length || layout.smallInputs.length || layout.smallButtons.length || layout.shortButtons.length || layout.clipped.length) failures.push(check);
        if(!comprehensive || (language==='en' && zoom===1 && [320,653,1366].includes(width))) await page.screenshot({ path: path.join(outputDirectory, `${role}-${state}-${width}-${language}${visual?'-viewport':''}.jpg`), type: 'jpeg', quality: 78, fullPage: !visual });
      };
      if(denied) { await checkLayout('access-denied'); console.log(`Audited access denied ${width}×${height}, ${language}, zoom ${zoom}.`); continue; }
      await checkLayout('inquiry-list');
      await page.getByRole('button', { name: /STM-FIXTURE/ }).click();
      await page.getByText(messages[0].message, { exact: true }).waitFor();
      await checkLayout('conversation');
      if (admin) {
        await page.getByRole('button', { name: /^(보고서 발행|Publish Report)$/ }).click();
        await page.getByText(/^(새 보고서 발행|Publish New Report)$/).waitFor();
        await checkLayout('report-editor');
      } else {
        const back = page.getByRole('button', { name: /목록|Back to List/ });
        if(await back.isVisible()) await back.click();
        await page.getByRole('button', { name: /새 문의|New inquiry/ }).click();
        await page.locator('#member-inquiry-nickname').waitFor();
        await checkLayout('inquiry-form');
      }
      console.log(`Audited ${admin?'admin':'member'} ${width}×${height}, ${language}, zoom ${zoom}.`);
    }
    await context.close();
  }
  assert.equal(writes.length, 0, 'No mutation request may be made');
  writeFileSync(path.join(outputDirectory, comprehensive?'functional-comprehensive-checks.json':'functional-fixture-checks.json'), JSON.stringify({ fixture: 'Synthetic localhost sessions and read-only intercepted data; no real authentication or live submissions.', checks, failures, errors, writes }, null, 2));
  console.log(JSON.stringify({checks:checks.length, failures:failures.length,errors,writes}));
  if(failures.length || errors.length) process.exitCode=1;
} finally { await browser.close(); }
