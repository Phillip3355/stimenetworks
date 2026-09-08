import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const target = path.resolve(process.argv[2] ?? '');
assert.equal(path.dirname(target).toLowerCase(), path.resolve(tmpdir()).toLowerCase());
assert.ok(path.basename(target).startsWith('stimemc-security-build-'));
assert.ok(existsSync(path.join(target,'.next/BUILD_ID')));
assert.ok(!readdirSync(target).some(name=>name.startsWith('.env')));
const probe = createServer();
await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));
const port = probe.address().port;
await new Promise(resolve=>probe.close(resolve));
const source = fileURLToPath(new URL('../',import.meta.url));
const env = Object.fromEntries(['PATH','Path','SYSTEMROOT','SystemRoot','WINDIR','TEMP','TMP','COMSPEC','ComSpec','PATHEXT'].filter(key=>process.env[key]).map(key=>[key,process.env[key]]));
Object.assign(env,{NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',NEXT_PUBLIC_SUPABASE_URL:'https://example.supabase.co',NEXT_PUBLIC_SUPABASE_ANON_KEY:'public-build-placeholder'});
const child = spawn(process.execPath,[path.join(source,'node_modules/next/dist/bin/next'),'start','--hostname','127.0.0.1','--port',String(port)],{cwd:target,env,stdio:'ignore'});
const origin = `http://127.0.0.1:${port}`;
try {
  let ready = false;
  for(let i=0;i<120;i++) {
    if(child.exitCode !== null) throw new Error('Isolated server exited');
    try { if((await fetch(origin,{signal:AbortSignal.timeout(500)})).ok){ready=true;break;} } catch { /* Starting. */ }
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  assert.ok(ready,'Server did not start');
  const routes = ['/','/join','/support','/taskboard','/auth/callback','/rules','/history','/updates','/recovery-guidelines','/server-mechanism'];
  for(const route of routes) {
    const response = await fetch(origin+route);
    assert.equal(response.status,200,route);
    assert.equal(response.headers.get('x-content-type-options'),'nosniff');
    assert.equal(response.headers.get('x-frame-options'),'DENY');
    assert.equal(response.headers.get('x-powered-by'),null);
    assert.ok(response.headers.get('content-security-policy').includes("frame-ancestors 'none'"));
  }
  const endpoint=origin+'/api/telegram/inquiry-alert';
  const cases=[
    [{inquiryId:'a0f8ad5d-75f8-4c9d-8a65-1df54857274f'}, {},401],
    [{}, {},400],
    [{}, {origin:'https://attacker.test'},403],
    [{text:'a'.repeat(3000)}, {},413],
  ];
  for(const [body,headers,status] of cases) {
    const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json',...headers},body:JSON.stringify(body)});
    assert.equal(response.status,status);
    assert.equal(response.headers.get('cache-control'),'no-store');
  }
  assert.equal((await fetch(endpoint)).status,405);
  const chunks = path.join(target,'.next/static');
  function inspect(dir) {
    for(const entry of readdirSync(dir,{withFileTypes:true})) {
      const file=path.join(dir,entry.name);
      if(entry.isDirectory()) inspect(file);
      else if(file.endsWith('.js')) assert.doesNotMatch(readFileSync(file,'utf8'),/SUPABASE_SERVICE_ROLE_KEY|TELEGRAM_BOT_TOKEN|api\.telegram\.org/);
    }
  }
  inspect(chunks);
  console.log(`Passed: ${routes.length} page responses, security headers, 5 API rejection cases, server-secret isolation in browser chunks.`);
} finally {
  child.kill();
  await new Promise(resolve=>child.once('exit',resolve));
}
