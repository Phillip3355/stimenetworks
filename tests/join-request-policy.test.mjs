import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildWhitelistCommand,
  classifyJoinRequestSubmitError,
  getJoinRequestSubmitErrorCode,
  normalizeJoinRequest,
  validateJoinRequest,
} from '../app/lib/joinRequestPolicy.mjs';

const validRequest = {
  edition: 'java',
  minecraftNickname: 'Stime_Player',
  inviterName: ' 없음 ',
  contact: ' 카카오톡 stime-player ',
  rulesAgreed: true,
  privacyAgreed: true,
};

test('normalizes a complete join request before it is submitted', () => {
  assert.deepEqual(normalizeJoinRequest(validRequest), {
    edition: 'java',
    minecraft_nickname: 'Stime_Player',
    inviter_name: '없음',
    contact: '카카오톡 stime-player',
    rules_agreed: true,
    privacy_agreed: true,
  });
});

test('rejects a request when required consent or contact information is missing', () => {
  assert.deepEqual(
    validateJoinRequest({ ...validRequest, contact: ' ', privacyAgreed: false }),
    ['contact', 'privacyAgreed'],
  );
});

test('rejects a one-character contact before the database constraint is reached', () => {
  assert.deepEqual(
    validateJoinRequest({ ...validRequest, contact: '1' }),
    ['contact'],
  );
});

test('classifies plain Supabase error objects instead of hiding their cause', () => {
  assert.equal(classifyJoinRequestSubmitError({ code: '23505' }), 'duplicate');
  assert.equal(classifyJoinRequestSubmitError({ code: '23514' }), 'constraint');
  assert.equal(classifyJoinRequestSubmitError({ code: '42501' }), 'permission');
  assert.equal(classifyJoinRequestSubmitError({ code: 'PGRST301' }), 'unknown');
});

test('preserves a safe Supabase error code for actionable submission feedback', () => {
  assert.equal(getJoinRequestSubmitErrorCode({ code: 'PGRST301' }), 'PGRST301');
  assert.equal(getJoinRequestSubmitErrorCode({ code: 42501 }), '42501');
  assert.equal(getJoinRequestSubmitErrorCode({ message: 'network failed' }), 'UNKNOWN');
});

test('rejects malformed Java nicknames while allowing Bedrock gamertags with spaces', () => {
  assert.deepEqual(
    validateJoinRequest({ ...validRequest, minecraftNickname: 'bad nickname' }),
    ['minecraftNickname'],
  );
  assert.deepEqual(
    validateJoinRequest({
      ...validRequest,
      edition: 'bedrock',
      minecraftNickname: 'Bedrock Player',
    }),
    [],
  );
});

test('builds the correct copy-ready whitelist command for each edition', () => {
  assert.equal(buildWhitelistCommand('java', 'Stime_Player'), '/whitelist add Stime_Player');
  assert.equal(buildWhitelistCommand('bedrock', 'Bedrock Player'), '/fwhitelist add "Bedrock Player"');
});
