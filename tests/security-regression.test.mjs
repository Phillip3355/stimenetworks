import test from 'node:test';
import assert from 'node:assert/strict';
import { handleInquiryAlert } from '../app/server/telegramInquiryAlertRoute.mjs';
import { assertPublicSupabaseKey } from '../app/shared/publicSupabaseConfig.mjs';

test('an unauthenticated caller cannot trigger privileged Telegram work', async () => {
  let claimed = false;
  const response = await handleInquiryAlert(new Request('https://stimemc.xyz/api/telegram/inquiry-alert', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ inquiryId: 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f' }),
  }), {}, {
    createSupabaseClient: () => ({}),
    claimInquiry: async () => { claimed = true; return null; },
  });
  assert.equal(response.status, 401);
  assert.equal(claimed, false);
});

test('public Supabase configuration rejects privileged keys without disclosing them', () => {
  const jwt = ['header',Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url'),'signature'].join('.');
  for (const secret of [jwt, 'sb_secret_' + 'fake-value']) {
    assert.throws(()=>assertPublicSupabaseKey(secret),error=>!error.message.includes(secret));
  }
  assert.doesNotThrow(()=>assertPublicSupabaseKey('sb_publishable_placeholder'));
});
