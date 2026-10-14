import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import { createClient } from '@supabase/supabase-js';

const source = await readFile(new URL('../app/client/reports.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const links = await import('../app/shared/reportManagement.mjs').catch(error => {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
  return {};
});
const id = '11111111-1111-4111-8111-111111111111';

function reportsClient(respond) {
  const supabase = createClient('https://reports.example.test', 'public-test-key', {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: respond },
  });
  const loaded = { exports: {} };
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(name => {
    if (name === 'client-only') return {};
    if (name === './supabase') return { supabase };
    throw new Error(`Unexpected import: ${name}`);
  }, loaded, loaded.exports);
  return loaded.exports;
}

test('editing loads the selected report body by its stable ID', async () => {
  const report = { id, slug: 'news/october', content: '# Existing news\n\nBody', created_at: '2026-10-13T00:00:00Z' };
  const client = reportsClient(async (url, options) => {
    const request = new URL(url);
    assert.equal(options.method, 'GET');
    assert.equal(request.searchParams.get('id'), `eq.${id}`);
    assert.equal(request.searchParams.get('select'), 'id,slug,content,created_at');
    return Response.json(report);
  });
  assert.equal(typeof client.getReport, 'function', 'Report editing must load the current body');
  const result = await client.getReport(id);
  assert.equal(result.error, null);
  assert.deepEqual(result.data, report);
});

test('saving edits updates only the selected record and preserves its publication date', async () => {
  const updated = { id, slug: 'news/revised', created_at: '2026-10-13T00:00:00Z' };
  const client = reportsClient(async (url, options) => {
    const request = new URL(url);
    assert.equal(options.method, 'PATCH', 'Editing must never insert a duplicate report');
    assert.equal(request.pathname, '/rest/v1/reports');
    assert.equal(request.searchParams.get('id'), `eq.${id}`);
    assert.deepEqual(JSON.parse(options.body), { slug: 'news/revised', content: '# Revised\n\nNew body' });
    assert.equal(request.searchParams.get('select'), 'id,slug,created_at');
    return Response.json(updated);
  });
  assert.equal(typeof client.updateReport, 'function', 'Report editing must support updates');
  const result = await client.updateReport(id, 'news/revised', '# Revised\n\nNew body');
  assert.equal(result.error, null);
  assert.deepEqual(result.data, updated);
});

test('a missing or unauthorized report cannot be reported as successfully saved', async () => {
  const client = reportsClient(async () => Response.json({ code: 'PGRST116', message: 'No matching record', details: '0 rows', hint: null }, { status: 406 }));
  assert.equal(typeof client.updateReport, 'function');
  const result = await client.updateReport(id, 'news/revised', '# Revised');
  assert.equal(result.data, null);
  assert.equal(result.error.code, 'PGRST116');
});

test('duplicate URL errors are returned to the editor', async () => {
  const client = reportsClient(async () => Response.json({ code: '23505', message: 'Duplicate slug', details: null, hint: null }, { status: 409 }));
  assert.equal(typeof client.updateReport, 'function');
  const result = await client.updateReport(id, 'news/existing', '# Revised');
  assert.equal(result.error.code, '23505');
});

test('link copying uses the full current-site URL including nested and Korean paths', async () => {
  assert.equal(typeof links.copyReportLink, 'function', 'Reports need a copy-link action');
  let copied;
  const result = await links.copyReportLink('news/소식', 'https://stimemc.xyz', {
    writeText: async value => { copied = value; },
  });
  assert.equal(copied, 'https://stimemc.xyz/news/%EC%86%8C%EC%8B%9D');
  assert.deepEqual(result, { state: 'copied', value: copied });
});

test('clipboard absence or denial returns a usable URL for manual copying', async () => {
  assert.equal(typeof links.copyReportLink, 'function');
  for (const clipboard of [undefined, { writeText: async () => { throw new Error('Denied'); } }]) {
    assert.deepEqual(await links.copyReportLink('news/october', 'http://localhost:3000', clipboard), {
      state: 'manual', value: 'http://localhost:3000/news/october',
    });
  }
});
