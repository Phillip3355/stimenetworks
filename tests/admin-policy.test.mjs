import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAdminEmails,
  isAdminEmail,
} from '../app/lib/adminPolicy.mjs';

test('required StimeMC administrators are authorized without deployment config', () => {
  assert.equal(isAdminEmail('cwj120408@gmail.com'), true);
  assert.equal(isAdminEmail('KIMJC.120211@GMAIL.COM'), true);
});

test('configured administrators are merged and normalized', () => {
  assert.deepEqual(
    getAdminEmails(' Existing@Example.com, second@example.com '),
    [
      'cwj120408@gmail.com',
      'kimjc.120211@gmail.com',
      'existing@example.com',
      'second@example.com',
    ],
  );
});

test('unlisted email is not authorized', () => {
  assert.equal(isAdminEmail('visitor@example.com'), false);
  assert.equal(isAdminEmail(undefined), false);
});
