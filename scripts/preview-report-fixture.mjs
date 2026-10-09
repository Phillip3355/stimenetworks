// Local, read-only report-rendering fixture. Never used by application data.
// Pass a JSON public DOM capture with title, body, slug and created_at fields.
import assert from 'node:assert/strict';
import { cpSync, copyFileSync, mkdtempSync, readdirSync, readFileSync, symlinkSync } from 'node:fs';
import { createServer } from 'node:http';
import { createServer as createPortProbe } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

assert.ok(process.argv[2], 'Provide the public report fixture JSON path');
const capture = JSON.parse(readFileSync(process.argv[2], 'utf8'));
for (const field of ['title', 'body', 'slug', 'created_at']) assert.equal(typeof capture[field], 'string', field);
const reports = [{ id: 'public-dom-report', slug: capture.slug, created_at: capture.created_at, content: `# ${capture.title}\n\n${capture.body}` }, {
  id: 'synthetic-test-report', slug: '__test-only-markdown', created_at: '2026-10-09T00:00:00Z',
  content: '# TEST ONLY — 긴 한국어 제목과 Markdown 작은 화면 검사\n\n이 문서는 합성 레이아웃 검사 자료입니다. 실제 StimeMC 공지가 아닙니다.\n\n' +
    '| 열 | 긴 내용 |\n| --- | --- |\n| 자료 | ' + 'unbroken-test-value'.repeat(14) + ' |\n\n```text\n' + 'long-code-line-'.repeat(30) + '\n```\n\n' +
    '[긴 링크 표시 ' + '한국어'.repeat(30) + '](https://example.com/)\n\n' + '긴한국어본문'.repeat(60),
}];
const stub = createServer((request, response) => {
  response.setHeader('content-type', 'application/json');
  response.setHeader('cache-control', 'no-store');
  if (request.method !== 'GET') { response.writeHead(405); response.end('{"message":"read-only test fixture"}'); return; }
  const url = new URL(request.url, 'http://127.0.0.1');
  if (url.pathname !== '/rest/v1/reports') { response.writeHead(404); response.end('{}'); return; }
  const slugFilter = url.searchParams.get('slug');
  const data = slugFilter ? reports.filter(report => `eq.${report.slug}` === slugFilter) : reports;
  const single = request.headers.accept?.includes('application/vnd.pgrst.object+json');
  if (single && data.length !== 1) { response.writeHead(406); response.end('{"message":"No matching test report"}'); return; }
  response.writeHead(200); response.end(JSON.stringify(single ? data[0] : data));
});
await new Promise(resolve => stub.listen(0, '127.0.0.1', resolve));
const stubOrigin = `http://127.0.0.1:${stub.address().port}`;
assert.equal((await fetch(stubOrigin + '/rest/v1/reports', { method: 'POST' })).status, 405);
assert.equal((await (await fetch(stubOrigin + '/rest/v1/reports?slug=' + encodeURIComponent(`eq.${capture.slug}`), { headers: { accept: 'application/vnd.pgrst.object+json' } })).json()).slug, capture.slug);

const source = fileURLToPath(new URL('../', import.meta.url));
const target = mkdtempSync(path.join(tmpdir(), 'stimemc-report-fixture-'));
for (const name of ['app', 'public']) cpSync(path.join(source, name), path.join(target, name), {
  recursive: true, filter: file => !path.basename(file).startsWith('.env'),
});
for (const name of ['package.json', 'package-lock.json', 'tsconfig.json', 'next.config.ts', 'postcss.config.mjs']) copyFileSync(path.join(source, name), path.join(target, name));
symlinkSync(path.join(source, 'node_modules'), path.join(target, 'node_modules'), 'junction');
assert.ok(!readdirSync(target).some(name => name.startsWith('.env')));
const env = Object.fromEntries(['PATH', 'Path', 'SYSTEMROOT', 'SystemRoot', 'WINDIR', 'TEMP', 'TMP', 'COMSPEC', 'ComSpec', 'PATHEXT'].filter(key => process.env[key]).map(key => [key, process.env[key]]));
Object.assign(env, { NODE_ENV: 'development', NEXT_TELEMETRY_DISABLED: '1', NEXT_PUBLIC_SUPABASE_URL: stubOrigin, NEXT_PUBLIC_SUPABASE_ANON_KEY: 'public-build-placeholder' });
const probe = createPortProbe();
await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
const port = probe.address().port;
await new Promise(resolve => probe.close(resolve));
const child = spawn(process.execPath, [path.join(source, 'node_modules/next/dist/bin/next'), 'dev', '--webpack', '--hostname', '127.0.0.1', '--port', String(port)], { cwd: target, env, stdio: 'inherit' });
const origin = `http://127.0.0.1:${port}`;
try {
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (child.exitCode !== null) throw new Error('Fixture preview exited');
    try { if ((await fetch(origin + '/servers', { signal: AbortSignal.timeout(1000) })).ok) { ready = true; break; } } catch { /* Initial compilation. */ }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  assert.ok(ready, 'Fixture preview did not start');
  console.log(`TEST ONLY public DOM report: ${origin}/${capture.slug}`);
  console.log(`TEST ONLY synthetic Markdown: ${origin}/__test-only-markdown`);
  console.log(`Fixture stub: ${stubOrigin}; source: ${target}; child PID: ${child.pid}. Stop this command to clean up.`);
  await new Promise(resolve => { process.once('SIGINT', resolve); process.once('SIGTERM', resolve); child.once('exit', resolve); });
} finally {
  if (child.exitCode === null && child.signalCode === null) {
    const exited = new Promise(resolve => child.once('exit', resolve));
    child.kill(); await exited;
  }
  await new Promise(resolve => stub.close(resolve));
}
