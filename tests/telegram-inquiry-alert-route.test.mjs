import assert from 'node:assert/strict';
import test from 'node:test';
import {
  claimInquiryForTelegramAlert,
  handleInquiryAlert,
  markInquiryTelegramAlertSent,
  releaseInquiryTelegramAlert,
} from '../app/lib/telegramInquiryAlertRoute.mjs';

test('claims a stored inquiry once before it can produce an alert', async () => {
  const requests = [];
  const client = {
    async rpc(name, args) {
      requests.push({ name, args });
      return {
        data: [{
          id: 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f',
          inquiry_type: '버그 신고',
          created_at: '2026-09-01T12:30:00.000Z',
          claim_token: '2bd98e08-f2cd-4e56-a4ff-b7fecf01e2c5',
        }],
        error: null,
      };
    },
  };

  const inquiry = await claimInquiryForTelegramAlert(client, 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f');

  assert.deepEqual(inquiry, {
    id: 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f',
    inquiryType: '버그 신고',
    createdAt: '2026-09-01T12:30:00.000Z',
    claimToken: '2bd98e08-f2cd-4e56-a4ff-b7fecf01e2c5',
  });
  assert.deepEqual(requests, [{
    name: 'claim_inquiry_telegram_alert',
    args: { p_inquiry_id: 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f' },
  }]);
});

test('uses stored inquiry data instead of forged browser metadata', async () => {
  const sent = [];
  const completed = [];
  const response = await handleInquiryAlert(new Request('https://stimemc.xyz/api/telegram/inquiry-alert', {
    method: 'POST',
    body: JSON.stringify({
      inquiryId: 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f',
      inquiryType: 'FORGED',
      createdAt: '2000-01-01T00:00:00.000Z',
    }),
  }), {
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'server-only-key',
    TELEGRAM_BOT_TOKEN: 'bot-token',
    TELEGRAM_CHAT_ID: 'chat-id',
    SITE_URL: 'https://stimemc.xyz',
  }, {
    createSupabaseClient: () => ({}),
    claimInquiry: async () => ({
      id: 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f',
      inquiryType: '저장된 유형',
      createdAt: '2026-09-01T12:30:00.000Z',
      claimToken: '2bd98e08-f2cd-4e56-a4ff-b7fecf01e2c5',
    }),
    sendAlert: async (input) => {
      sent.push(input);
      return { sent: true };
    },
    markAlertSent: async (...args) => completed.push(args),
  });

  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { ok: true });
  assert.deepEqual(sent, [{
    botToken: 'bot-token',
    chatId: 'chat-id',
    siteUrl: 'https://stimemc.xyz',
    inquiryId: 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f',
    inquiryType: '저장된 유형',
    createdAt: '2026-09-01T12:30:00.000Z',
  }]);
  assert.deepEqual(completed, [[
    {},
    'a0f8ad5d-75f8-4c9d-8a65-1df54857274f',
    '2bd98e08-f2cd-4e56-a4ff-b7fecf01e2c5',
  ]]);
});

test('does not alert when the inquiry was already claimed', async () => {
  const response = await handleInquiryAlert(new Request('https://stimemc.xyz/api/telegram/inquiry-alert', {
    method: 'POST',
    body: JSON.stringify({ inquiryId: 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f' }),
  }), {}, {
    createSupabaseClient: () => ({}),
    claimInquiry: async () => null,
    sendAlert: async () => {
      throw new Error('An already claimed inquiry must not send a duplicate alert.');
    },
  });

  assert.equal(response.status, 202);
});

test('releases the alert claim when Telegram delivery fails so it can be retried', async () => {
  const released = [];
  await handleInquiryAlert(new Request('https://stimemc.xyz/api/telegram/inquiry-alert', {
    method: 'POST',
    body: JSON.stringify({ inquiryId: 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f' }),
  }), {}, {
    createSupabaseClient: () => ({}),
    claimInquiry: async () => ({
      id: 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f',
      inquiryType: '기타',
      createdAt: '2026-09-01T12:30:00.000Z',
      claimToken: '2bd98e08-f2cd-4e56-a4ff-b7fecf01e2c5',
    }),
    sendAlert: async () => ({ sent: false, reason: 'telegram_request_failed' }),
    releaseAlert: async (...args) => released.push(args),
  });

  assert.deepEqual(released, [[
    {},
    'a0f8ad5d-75f8-4c9d-8a65-1df54857274f',
    '2bd98e08-f2cd-4e56-a4ff-b7fecf01e2c5',
  ]]);
});

test('uses the claim token when finalizing or releasing an alert', async () => {
  const calls = [];
  const client = {
    async rpc(name, args) {
      calls.push({ name, args });
      return { data: null, error: null };
    },
  };

  await markInquiryTelegramAlertSent(client, 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f', '2bd98e08-f2cd-4e56-a4ff-b7fecf01e2c5');
  await releaseInquiryTelegramAlert(client, 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f', '2bd98e08-f2cd-4e56-a4ff-b7fecf01e2c5');

  assert.deepEqual(calls, [
    {
      name: 'mark_inquiry_telegram_alert_sent',
      args: {
        p_inquiry_id: 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f',
        p_claim_token: '2bd98e08-f2cd-4e56-a4ff-b7fecf01e2c5',
      },
    },
    {
      name: 'release_inquiry_telegram_alert',
      args: {
        p_inquiry_id: 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f',
        p_claim_token: '2bd98e08-f2cd-4e56-a4ff-b7fecf01e2c5',
      },
    },
  ]);
});

test('rejects a notification without an inquiry identifier', async () => {
  const response = await handleInquiryAlert(new Request('https://stimemc.xyz/api/telegram/inquiry-alert', {
    method: 'POST',
    body: JSON.stringify({}),
  }), {});

  assert.equal(response.status, 400);
});
