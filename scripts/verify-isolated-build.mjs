// Next automatically reads local environment files. Build a copy that never
// contains them, using only dummy public configuration and no production data.
import { cpSync, copyFileSync, mkdtempSync, symlinkSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../', import.meta.url));
const target = mkdtempSync(path.join(tmpdir(), 'stimemc-security-build-'));
for (const name of ['app', 'public']) cpSync(path.join(source, name), path.join(target, name), {
  recursive: true, filter: file => !path.basename(file).startsWith('.env'),
});
for (const name of ['package.json','package-lock.json','tsconfig.json','next.config.ts','postcss.config.mjs']) {
  copyFileSync(path.join(source,name),path.join(target,name));
}
symlinkSync(path.join(source,'node_modules'),path.join(target,'node_modules'),'junction');
if (readdirSync(target).some(name => name.startsWith('.env'))) throw new Error('Unexpected environment file');
const env = Object.fromEntries(['PATH','Path','SYSTEMROOT','SystemRoot','WINDIR','TEMP','TMP','COMSPEC','ComSpec','PATHEXT'].filter(key=>process.env[key]).map(key=>[key,process.env[key]]));
Object.assign(env, {
  NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1',
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'public-build-placeholder',
});
console.log(`Isolated build: ${target}`);
const result = spawnSync(process.execPath, [path.join(source,'node_modules/next/dist/bin/next'),'build','--webpack'], {
  cwd: target, env, stdio: 'inherit',
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
if (!existsSync(path.join(target,'.next/BUILD_ID'))) throw new Error('Missing production build');
console.log(`Verified production output: ${target}`);
