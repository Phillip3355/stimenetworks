import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, statSync } from 'node:fs';

// Never read environment files (including their historical Git blobs).
const allowed = path => (!/(^|\/)\.env(?:\.|$)/.test(path) || path === '.env.example')
  && !/^(node_modules|\.next|scratch|\.git)\//.test(path)
  && (/\.(?:tsx?|m?js|json|sql|md|ya?ml|toml|txt)$/.test(path) || path === '.env.example')
  && !/lock\.json$/.test(path);
const findings = [];
const patterns = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ['supabase-secret', /sb_secret_[A-Za-z0-9_-]{20,}/g],
  ['telegram-token', /\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/g],
  ['provider-secret', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|sk_(?:live|test)_[A-Za-z0-9]{20,}|AKIA[A-Z0-9]{16})\b/g],
];
function inspect(path, content, revision = 'working-tree') {
  for (const [kind, regex] of patterns) for (const match of content.matchAll(regex)) {
    findings.push({ path, revision, line: content.slice(0,match.index).split('\n').length, kind });
  }
  for (const match of content.matchAll(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)) {
    try {
      if (JSON.parse(Buffer.from(match[0].split('.')[1], 'base64url').toString()).role === 'service_role') {
        findings.push({ path, revision, line: content.slice(0,match.index).split('\n').length, kind: 'service-role-jwt' });
      }
    } catch { /* Not a JWT. */ }
  }
}
const files = execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8'}).split('\0').filter(allowed);
for (const file of new Set(files)) if (existsSync(file) && statSync(file).size < 2_000_000) inspect(file,readFileSync(file,'utf8'));
let historyBlobs = 0;
if (process.argv.includes('--history')) {
  const objects = execFileSync('git',['rev-list','--objects','--all'],{encoding:'utf8'}).trim().split('\n');
  for (const entry of objects) {
    const [sha,...parts] = entry.split(' '); const file = parts.join(' ');
    if (!allowed(file)) continue;
    const size = Number(execFileSync('git',['cat-file','-s',sha],{encoding:'utf8'}));
    if (size > 2_000_000) continue;
    inspect(file,execFileSync('git',['cat-file','blob',sha],{encoding:'utf8'}),sha.slice(0,12));
    historyBlobs++;
  }
}
console.log(JSON.stringify({ checkedFiles: files.length, historyBlobs, findings }, null, 2));
process.exitCode = findings.length ? 1 : 0;
