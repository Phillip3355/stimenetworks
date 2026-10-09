import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const renderEnvironment = Object.fromEntries(
  ['PATH', 'Path', 'SYSTEMROOT', 'SystemRoot', 'WINDIR', 'TEMP', 'TMP', 'COMSPEC', 'ComSpec', 'PATHEXT']
    .filter(key => process.env[key]).map(key => [key, process.env[key]]),
);
const launched = {
  lifecycle: 'current', status: 'active',
  descriptionKo: '공개된 야생 서버입니다.', descriptionEn: 'A published survival server.',
  directionKo: ['기본 야생 플레이.'], directionEn: ['Core survival play.'],
  version: '1.22.3', release: '2026-12-01',
  connection: { java: { address: 'java.example.test' }, bedrock: { address: 'bedrock.example.test', port: 25000 } },
};
function render(file, server, options = {}) {
  const result = spawnSync(process.execPath, [path.join(root, 'tests/helpers/render-server-surface.mjs')], {
    cwd: root, env: renderEnvironment, input: JSON.stringify({ file: path.join(root, file), server, ...options }), encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}
const surfaces = ['ServerWorlds', 'ServerDirections', 'CrossplayBridge', 'PolicyScope'];

test('registry launch updates rendered card, detail and full Join without preparing or unpublished contradictions', () => {
  const card = render('app/components/ServerWorlds.tsx', launched);
  const detail = render('app/components/ServerDetail.tsx', launched, { props: 'server' });
  const join = render('app/join/page.tsx', launched);
  for (const markup of [card, detail, join]) {
    assert.match(markup, /Active/);
    assert.doesNotMatch(markup, /CURRENT \/ PREPARING|world in preparation|world is in preparation|Preparing to operate|Connection information unpublished|Connection information and version have not been published|Release date and version undecided/);
  }
  assert.match(detail, /1\.22\.3/);
  assert.match(detail, /2026-12-01/);
  assert.match(detail, /Connection information published/);
  assert.match(join, /<code>java\.example\.test<\/code>/);
  assert.match(join, />Copy server address<\/button>/);
  assert.doesNotMatch(join, /<code>25000<\/code>/);
});

test('active unpublished server renders active status while keeping unavailable connections honest', () => {
  const server = { ...launched, connection: null, version: null, release: null };
  for (const [file, options] of [['app/components/ServerWorlds.tsx', {}], ['app/components/ServerDetail.tsx', { props: 'server' }], ['app/join/page.tsx', {}]]) {
    const markup = render(file, server, options);
    assert.match(markup, /Active/);
    assert.doesNotMatch(markup, /Preparing|CURRENT \/ PREPARING|Copy server address|java\.example\.test|Connection information published/);
    if (file.includes('ServerDetail')) assert.match(markup, /Connection information unpublished/);
    if (file.includes('join')) assert.match(markup, /Connection details for this edition have not been published/);
  }
});

test('active status retains confirmed version and release even before connections are published', () => {
  const markup = render('app/components/ServerDetail.tsx', { ...launched, connection: null }, { props: 'server' });
  assert.match(markup, /1\.22\.3/);
  assert.match(markup, /2026-12-01/);
  assert.match(markup, /Connection information unpublished/);
  assert.doesNotMatch(markup, /version.*(?:undecided|not been published)|Release date.*undecided/i);
});

test('edition-specific rendered Copy controls require complete published Bedrock data', () => {
  const ready = render('app/components/ConnectionGuide.tsx', launched, { edition: 'Bedrock' });
  assert.match(ready, /<code>bedrock\.example\.test<\/code>/);
  assert.match(ready, /<code>25000<\/code>/);
  assert.match(ready, />Copy port<\/button>/);
  const incomplete = render('app/components/ConnectionGuide.tsx', { ...launched, connection: { java: launched.connection.java, bedrock: { address: 'hidden.example.test', port: 0 } } }, { edition: 'Bedrock' });
  assert.match(incomplete, /CURRENT \/ ACTIVE/);
  assert.doesNotMatch(incomplete, /hidden\.example\.test|Copy server address|Copy port/);
  assert.match(incomplete, /Connection details for this edition have not been published/);
});

for (const [name, state] of [['preparing', { lifecycle: 'current', status: 'preparing' }], ['planned', { lifecycle: 'planned', status: 'active' }]]) {
  test(`${name} rendered card/detail/Join conceal supplied launch values and keep their truthful state`, () => {
    const server = { ...launched, ...state };
    for (const [file, options] of [['app/components/ServerWorlds.tsx', {}], ['app/components/ServerDetail.tsx', { props: 'server' }], ['app/components/ConnectionGuide.tsx', { edition: 'Bedrock' }]]) {
      const markup = render(file, server, options);
      assert.match(markup, name === 'planned' ? /PLANNED \/ COMING LATER/ : /Preparing/);
      assert.doesNotMatch(markup, /java\.example\.test|bedrock\.example\.test|25000|1\.22\.3|2026-12-01|Copy server address|Copy port/);
    }
  });
}

test('related server and policy labels reflect active registry status without publishing dedicated rules', () => {
  for (const surface of surfaces) {
    const markup = render(`app/components/${surface}.tsx`, launched, { scope: 'survival', props: surface === 'PolicyScope' ? { kind: 'rules' } : {} });
    assert.match(markup, /ACTIVE|Active/);
    assert.doesNotMatch(markup, /PREPARING|Preparing|planned direction|world in preparation/);
    if (surface === 'PolicyScope') assert.match(markup, /Dedicated server rules have not been published/);
  }
  const recovery = render('app/components/PolicyScope.tsx', launched, { scope: 'survival', props: { kind: 'recovery' } });
  assert.match(recovery, /CURRENT \/ ACTIVE/);
  assert.match(recovery, /Dedicated recovery policies have not been published/);
});

test('server route metadata follows a registry launch instead of claiming preparing or coming later', () => {
  for (const file of ['app/servers/survival/page.tsx', 'app/servers/the-great-war/page.tsx', 'app/servers/page.tsx', 'app/join/layout.tsx']) {
    const metadata = render(file, launched, { metadata: true });
    assert.doesNotMatch(JSON.stringify(metadata), /Coming later|계획|준비|미공개|미정/);
    assert.match(JSON.stringify(metadata), /SURVIVAL|공개된 야생/);
  }
});

test('home server guidance no longer calls the launched world preparing', () => {
  for (const file of ['app/components/HomeGuide.tsx', 'app/components/Hero.tsx', 'app/components/ServersHub.tsx']) {
    const markup = render(file, launched);
    assert.doesNotMatch(markup, /Preparing today|preparing to operate|world in preparation|planned as a separate world|is in preparation/);
  }
});
