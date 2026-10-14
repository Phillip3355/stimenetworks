// Real browser interactions against an isolated build and intercepted test data.
// No production sessions, databases or clipboard contents are accessed.
import assert from 'node:assert/strict';
import { existsSync, readdirSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';

const [buildDirectory, moduleRoot, executablePath] = process.argv.slice(2);
assert.equal(path.dirname(path.resolve(buildDirectory)).toLowerCase(), path.resolve(tmpdir()).toLowerCase());
assert.ok(path.basename(buildDirectory).startsWith('stimemc-security-build-'));
assert.ok(existsSync(path.join(buildDirectory, '.next/BUILD_ID')));
assert.ok(!readdirSync(buildDirectory).some(name => name.startsWith('.env')));
const { chromium } = createRequire(path.join(moduleRoot, 'package.json'))('playwright');
const probe = createServer();
await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
const port = probe.address().port;
await new Promise(resolve => probe.close(resolve));
const origin = `http://127.0.0.1:${port}`;
const apiOrigin = 'https://example.supabase.co';
const env = Object.fromEntries(['PATH', 'Path', 'SYSTEMROOT', 'SystemRoot', 'WINDIR', 'TEMP', 'TMP', 'COMSPEC', 'ComSpec', 'PATHEXT']
  .filter(key => process.env[key]).map(key => [key, process.env[key]]));
Object.assign(env, { NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1', NEXT_PUBLIC_SUPABASE_URL: apiOrigin, NEXT_PUBLIC_SUPABASE_ANON_KEY: 'public-build-placeholder' });
const child = spawn(process.execPath, [path.resolve('node_modules/next/dist/bin/next'), 'start', '--hostname', '127.0.0.1', '--port', String(port)], { cwd: buildDirectory, env, stdio: 'ignore' });
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error('Isolated server exited');
    try { if ((await fetch(origin + '/taskboard', { signal: AbortSignal.timeout(500) })).ok) { ready = true; break; } } catch { /* Starting. */ }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  assert.ok(ready, 'Isolated server must start');
  browser = await chromium.launch({ headless: true, executablePath });
  const errors = [];
  for (const [width, language] of [[1366, 'ko'], [320, 'ko'], [1366, 'en'], [320, 'en']]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const user = { id: '11111111-1111-4111-8111-111111111111', email: 'fixture@example.test', aud: 'authenticated', role: 'authenticated', email_confirmed_at: '2026-10-13T00:00:00Z', app_metadata: { provider: 'google' }, user_metadata: {}, identities: [], created_at: '2026-10-13T00:00:00Z' };
    const timestamp = Math.floor(Date.now() / 1000);
    const token = [{ alg: 'HS256', typ: 'JWT' }, { sub: user.id, aud: 'authenticated', role: 'authenticated', exp: timestamp + 3600 }].map(value => Buffer.from(JSON.stringify(value)).toString('base64url')).join('.') + '.test';
    const session = { access_token: token, refresh_token: 'test-only', token_type: 'bearer', expires_in: 3600, expires_at: timestamp + 3600, user };
    await context.addInitScript(session => {
      localStorage.setItem('sb-example-auth-token', JSON.stringify(session));
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => {
        if (window.__denyClipboard) throw new Error('Clipboard denied');
        window.__copiedReportLink = value;
      } } });
    }, session);
    await context.routeWebSocket('wss://example.supabase.co/**', socket => socket.close());
    let report = { id: '22222222-2222-4222-8222-222222222222', slug: 'report/october', content: '# Original news\n\nExisting Markdown.', created_at: '2026-10-13T00:00:00Z' };
    let legacyReport = { id: '33333333-3333-4333-8333-333333333333', slug: 'News', content: '# Legacy News\n\nKeep this URL.', created_at: '2026-08-19T07:29:15.546Z' };
    let releaseDeletion;
    let signalDeletion;
    const deletionStarted = new Promise(resolve => { signalDeletion = resolve; });
    const mutations = [];
    await context.route(apiOrigin + '/**', async route => {
      const request = route.request();
      const url = new URL(request.url());
      const headers = { 'access-control-allow-origin': origin, 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS', 'content-type': 'application/json' };
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
      let data = [];
      if (url.pathname === '/auth/v1/user') data = user;
      else if (url.pathname === '/rest/v1/rpc/is_support_admin') data = true;
      else if (url.pathname === '/rest/v1/reports') {
        if (request.method() === 'PATCH') {
          const legacy = url.searchParams.get('id') === `eq.${legacyReport.id}`;
          assert.equal(url.searchParams.get('id'), `eq.${legacy ? legacyReport.id : report.id}`);
          const payload = request.postDataJSON();
          mutations.push({ method: request.method(), payload });
          if (payload.slug === 'report/already-used') return route.fulfill({ status: 409, headers, body: JSON.stringify({ code: '23505', message: 'Duplicate slug', details: null, hint: null }) });
          assert.deepEqual(Object.keys(payload).sort(), ['content', 'slug']);
          if (legacy) { legacyReport = { ...legacyReport, ...payload }; data = legacyReport; }
          else { report = { ...report, ...payload }; data = report; }
        } else if (request.method() === 'DELETE') {
          assert.equal(url.searchParams.get('id'), `eq.${report.id}`);
          mutations.push({ method: 'DELETE' });
          await new Promise(resolve => { releaseDeletion = resolve; signalDeletion(); });
          return route.fulfill({ status: 204, headers });
        } else {
          assert.equal(request.method(), 'GET', 'Edits must not create or delete records');
          data = url.searchParams.has('id')
            ? url.searchParams.get('id') === `eq.${legacyReport.id}` ? legacyReport : report
            : [report, legacyReport];
        }
      } else assert.equal(request.method(), 'GET');
      return route.fulfill({ status: 200, headers, body: JSON.stringify(data) });
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + '/taskboard');
    await page.getByRole('button', { name: '보고서 발행', exact: true }).waitFor();
    if (language === 'en') await page.locator('header button[aria-label="Switch to English"]').click();
    const text = (ko, en) => language === 'ko' ? ko : en;
    await page.getByRole('button', { name: text('보고서 발행', 'Publish Report'), exact: true }).click();
    const row = () => page.getByText(`/${report.slug}`, { exact: true }).locator('..').locator('..');
    await row().getByRole('button', { name: text('링크 복사', 'Copy Link'), exact: true }).click();
    await page.getByText(text('링크를 복사했습니다.', 'Link copied.'), { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => window.__copiedReportLink), origin + '/report/october');
    await row().getByRole('button', { name: text('수정하기', 'Edit'), exact: true }).click();
    await page.getByRole('heading', { name: text('보고서 수정', 'Edit Report'), exact: true }).waitFor();
    assert.equal(await page.locator('#report-slug').inputValue(), 'report/october');
    assert.equal(await page.locator('#report-content').inputValue(), '# Original news\n\nExisting Markdown.');
    await page.locator('#report-content').fill('Discard this edit');
    await page.getByRole('button', { name: text('수정 취소', 'Cancel Editing'), exact: true }).click();
    assert.equal(await page.locator('#report-content').inputValue(), '');
    assert.equal(mutations.length, 0, 'Cancellation must not write to the database');
    await row().getByRole('button', { name: text('수정하기', 'Edit'), exact: true }).click();
    await page.getByRole('button', { name: text('수정 저장', 'Save Changes'), exact: true }).waitFor();
    await page.locator('#report-slug').fill('report/already-used');
    await page.locator('#report-content').fill('# Revised news\n\nUpdated Markdown.');
    await page.getByRole('button', { name: text('수정 저장', 'Save Changes'), exact: true }).click();
    await page.getByText(text('이미 존재하는 URL 경로입니다.', 'This URL path already exists.'), { exact: true }).waitFor();
    assert.equal(await page.locator('#report-content').inputValue(), '# Revised news\n\nUpdated Markdown.');
    await page.locator('#report-slug').fill('report/revised');
    await page.getByRole('button', { name: text('수정 저장', 'Save Changes'), exact: true }).click();
    await page.getByText(text('보고서 수정이 저장되었습니다.', 'Report changes saved successfully.'), { exact: true }).waitFor();
    assert.equal(await row().getByRole('link', { name: text('보기', 'View'), exact: true }).getAttribute('href'), '/report/revised');
    assert.equal(report.created_at, '2026-10-13T00:00:00Z');
    assert.equal(mutations.length, 2);
    await page.evaluate(() => { window.__denyClipboard = true; });
    await row().getByRole('button', { name: text('링크 복사', 'Copy Link'), exact: true }).click();
    const manual = row().getByRole('textbox');
    await manual.waitFor();
    assert.equal(await manual.inputValue(), origin + '/report/revised');
    await manual.focus();
    assert.equal(await manual.evaluate(node => node.selectionEnd - node.selectionStart), (origin + '/report/revised').length);
    await row().getByRole('button', { name: text('수정하기', 'Edit'), exact: true }).click();
    await page.getByRole('button', { name: text('수정 저장', 'Save Changes'), exact: true }).waitFor();
    assert.equal(await page.locator('#report-content').inputValue(), '# Revised news\n\nUpdated Markdown.');
    const layout = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      clipped: [...document.querySelectorAll('main button,main input,main textarea')].filter(node => node.checkVisibility()).filter(node => { const box = node.getBoundingClientRect(); return box.left < -1 || box.right > innerWidth + 1; }).map(node => node.id || node.textContent),
    }));
    assert.deepEqual(layout, { overflow: false, clipped: [] });
    const output = path.join(buildDirectory, 'report-verification');
    mkdirSync(output, { recursive: true });
    await page.screenshot({ path: path.join(output, `news-edit-${width}-${language}.png`), fullPage: true });
    const legacyRow = page.getByText('/News', { exact: true }).locator('..').locator('..');
    page.once('dialog', dialog => dialog.accept());
    await row().getByRole('button', { name: text('삭제', 'Delete'), exact: true }).click();
    await deletionStarted;
    assert.equal(await legacyRow.getByRole('button', { name: text('수정하기', 'Edit'), exact: true }).isDisabled(), true, 'A pending deletion must not allow another report to be edited');
    assert.equal(await page.locator('#report-content').isDisabled(), true);
    releaseDeletion();
    await page.getByRole('heading', { name: text('새 보고서 발행', 'Publish New Report'), exact: true }).waitFor();
    await legacyRow.getByRole('button', { name: text('수정하기', 'Edit'), exact: true }).click();
    await page.getByRole('button', { name: text('수정 저장', 'Save Changes'), exact: true }).waitFor();
    assert.equal(await page.locator('#report-slug').inputValue(), 'News');
    await page.locator('#report-content').fill('# Legacy News\n\nRevised without changing the URL.');
    await page.getByRole('button', { name: text('수정 저장', 'Save Changes'), exact: true }).click();
    await page.getByText(text('보고서 수정이 저장되었습니다.', 'Report changes saved successfully.'), { exact: true }).waitFor();
    assert.equal(legacyReport.slug, 'News');
    assert.equal(legacyReport.created_at, '2026-08-19T07:29:15.546Z');
    assert.equal(await legacyRow.getByRole('link', { name: text('보기', 'View'), exact: true }).getAttribute('href'), '/News');
    console.log(`Passed edit, cancel, duplicate URL, copy fallback, layout, pending deletion and legacy /News: ${width}px ${language}`);
    await context.close();
  }
  assert.deepEqual(errors, []);
} finally {
  await browser?.close();
  child.kill();
}
