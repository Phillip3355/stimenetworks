import assert from 'node:assert/strict';
import test from 'node:test';
import * as serverGroup from '../app/shared/serverGroup.mjs';

const suppliedConnection = {
  java: { address: 'java.example.test' },
  bedrock: { address: 'bedrock.example.test', port: 25000 },
};

function present(server, edition) {
  assert.equal(typeof serverGroup.getConnectionPresentation, 'function');
  return serverGroup.getConnectionPresentation(server, edition);
}

test('planned servers conceal supplied connection data', () => {
  assert.deepEqual(present({ lifecycle: 'planned', status: 'active', editions: ['Java', 'Bedrock'], connection: suppliedConnection }, 'Java'),
    { state: 'planned', address: null, port: null, canCopy: false });
});

test('preparing servers conceal supplied connection data', () => {
  assert.deepEqual(present({ lifecycle: 'current', status: 'preparing', editions: ['Java', 'Bedrock'], connection: suppliedConnection }, 'Bedrock'),
    { state: 'preparing', address: null, port: null, canCopy: false });
});

test('active Java exposes the published address without inventing a port', () => {
  assert.deepEqual(present({ lifecycle: 'current', status: 'active', editions: ['Java', 'Bedrock'], connection: suppliedConnection }, 'Java'),
    { state: 'ready', address: 'java.example.test', port: null, canCopy: true });
});

test('active Bedrock exposes only a complete address and valid port pair', () => {
  assert.deepEqual(present({ lifecycle: 'current', status: 'active', editions: ['Java', 'Bedrock'], connection: suppliedConnection }, 'Bedrock'),
    { state: 'ready', address: 'bedrock.example.test', port: 25000, canCopy: true });
  for (const port of [undefined, null, 0, -1, 65536, 2.5, '25000']) {
    assert.deepEqual(present({ lifecycle: 'current', status: 'active', editions: ['Bedrock'], connection: { bedrock: { address: 'bedrock.example.test', port } } }, 'Bedrock'),
      { state: 'unpublished', address: null, port: null, canCopy: false });
  }
});

test('missing and blank publication data never enables copy', () => {
  for (const connection of [null, {}, { java: { address: '' } }, { java: { address: '   ' } }, { java: { address: 123 } }]) {
    assert.deepEqual(present({ lifecycle: 'current', status: 'active', editions: ['Java'], connection }, 'Java'),
      { state: 'unpublished', address: null, port: null, canCopy: false });
  }
});

test('unsupported editions never expose connection data', () => {
  assert.deepEqual(present({ lifecycle: 'current', status: 'active', editions: ['Java'], connection: suppliedConnection }, 'Bedrock'),
    { state: 'unsupported', address: null, port: null, canCopy: false });
  assert.deepEqual(present({ lifecycle: 'current', status: 'active', editions: ['Java'], connection: suppliedConnection }, 'Console'),
    { state: 'unsupported', address: null, port: null, canCopy: false });
});

test('unknown lifecycle and operation states cannot publish connection data', () => {
  for (const server of [undefined, { lifecycle: 'archived', status: 'active' }, { lifecycle: 'current', status: 'offline' }]) {
    assert.deepEqual(present(server && { ...server, editions: ['Java'], connection: suppliedConnection }, 'Java'),
      { state: 'unpublished', address: null, port: null, canCopy: false });
  }
});

test('server selection resolves only the two documented slugs', () => {
  assert.equal(typeof serverGroup.getServerBySlug, 'function');
  assert.equal(serverGroup.getServerBySlug('the-great-war')?.href, '/servers/the-great-war');
  assert.equal(serverGroup.getServerBySlug('survival')?.href, '/servers/survival');
  assert.equal(serverGroup.getServerBySlug('unknown'), undefined);
});

test('the published registry keeps both current and planned connection actions unavailable', () => {
  assert.ok(Array.isArray(serverGroup.servers));
  assert.equal(serverGroup.servers.length, 2);
  for (const server of serverGroup.servers) {
    assert.deepEqual(server.editions, ['Java', 'Bedrock']);
    assert.equal(server.crossplay, 'Geyser');
    assert.equal(server.clientModRequired, false);
    assert.equal(server.connection, null);
    assert.equal(server.release, null);
    assert.equal(server.version, null);
    for (const edition of server.editions) {
      assert.deepEqual(present(server, edition), {
        state: server.slug === 'survival' ? 'planned' : 'preparing',
        address: null, port: null, canCopy: false,
      });
    }
  }
});
