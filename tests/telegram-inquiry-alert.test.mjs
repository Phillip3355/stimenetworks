import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildInquiryDetailUrl,
  formatInquiryReceivedAt,
  sendTelegramInquiryAlert,
} from '../app/lib/telegramInquiryAlert.mjs';
import {
  notifyInquiryCreated,
  notifyInquiryMessageCreated,
} from '../app/lib/inquiryAlertClient.mjs';

test('builds an admin deep link for the exact inquiry', () => {
  assert.equal(
    buildInquiryDetailUrl('https://stimemc.xyz/', 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f'),
    'https://stimemc.xyz/taskboard?inquiry=a0f8ad5d-75f8-4c9d-8a65-1df54857274f',
  );
});

test('formats the received time in Korea Standard Time', () => {
  assert.equal(
    formatInquiryReceivedAt('2026-09-01T12:30:00.000Z'),
    '2026-09-01 21:30 KST',
  );
});

test('sends the inquiry reminder with an inline detail button', async () => {
  const calls = [];
  const result = await sendTelegramInquiryAlert({
    botToken: 'test-bot-token',
    chatId: 'chat-123',
    siteUrl: 'https://stimemc.xyz',
    inquiryId: 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f',
    inquiryType: '버그 신고',
    createdAt: '2026-09-01T12:30:00.000Z',
    senderName: 'Steve',
    messagePreview: '서버 접속이',
    fetchImpl: async (...args) => {
      calls.push(args);
      return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), { status: 200 });
    },
  });

  assert.deepEqual(result, { sent: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'https://api.telegram.org/bottest-bot-token/sendMessage');
  assert.deepEqual(JSON.parse(calls[0][1].body), {
    chat_id: 'chat-123',
    text: '🔔 문의 도착\n보낸 사람: Steve\n내용: 서버 접속\n유형: 버그 신고\n시간: 2026-09-01 21:30 KST',
    reply_markup: {
      inline_keyboard: [[{
        text: '문의 바로가기',
        url: 'https://stimemc.xyz/taskboard?inquiry=a0f8ad5d-75f8-4c9d-8a65-1df54857274f',
      }]],
    },
  });
});

test('prevents sender and preview text from adding forged Telegram alert lines', async () => {
  const calls = [];

  await sendTelegramInquiryAlert({
    botToken: 'test-bot-token',
    chatId: 'chat-123',
    siteUrl: 'https://stimemc.xyz',
    inquiryId: 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f',
    inquiryType: '기타',
    createdAt: '2026-09-01T12:30:00.000Z',
    senderName: 'Steve\n유형: 위조',
    messagePreview: '도움\r\n시간: 위조',
    fetchImpl: async (...args) => {
      calls.push(args);
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    },
  });

  assert.equal(
    JSON.parse(calls[0][1].body).text,
    '🔔 문의 도착\n보낸 사람: Steve 유형: 위조\n내용: 도움 시간\n유형: 기타\n시간: 2026-09-01 21:30 KST',
  );
});

test('contains a Telegram delivery failure without throwing', async () => {
  const result = await sendTelegramInquiryAlert({
    botToken: 'test-bot-token',
    chatId: 'chat-123',
    siteUrl: 'https://stimemc.xyz',
    inquiryId: 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f',
    inquiryType: '기타',
    createdAt: '2026-09-01T12:30:00.000Z',
    fetchImpl: async () => new Response(JSON.stringify({ ok: false }), { status: 500 }),
  });

  assert.deepEqual(result, { sent: false, reason: 'telegram_request_failed: HTTP 500' });
});

test('bounds the Telegram request with an abort signal', async () => {
  const result = await sendTelegramInquiryAlert({
    botToken: 'test-bot-token',
    chatId: 'chat-123',
    siteUrl: 'https://stimemc.xyz',
    inquiryId: 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f',
    inquiryType: '기타',
    createdAt: '2026-09-01T12:30:00.000Z',
    fetchImpl: async (_url, options) => {
      assert.ok(options.signal instanceof AbortSignal);
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    },
  });

  assert.deepEqual(result, { sent: true });
});

test('notifies the server only after an inquiry has an identifier and creation time', async () => {
  const calls = [];

  await notifyInquiryCreated({
    inquiryId: 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f',
    inquiryType: '버그 신고',
    createdAt: '2026-09-01T12:30:00.000Z',
    fetchImpl: async (...args) => {
      calls.push(args);
      return new Response(null, { status: 202 });
    },
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], '/api/telegram/inquiry-alert');
  assert.deepEqual(JSON.parse(calls[0][1].body), {
    inquiryId: 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f',
  });
});

test('notifies the server for a newly stored inquiry message', async () => {
  const calls = [];

  await notifyInquiryMessageCreated({
    messageId: 'd362625a-8843-492b-88bc-3d62f88f24a3',
    fetchImpl: async (...args) => {
      calls.push(args);
      return new Response(null, { status: 202 });
    },
  });

  assert.equal(calls.length, 1);
  assert.deepEqual(JSON.parse(calls[0][1].body), {
    messageId: 'd362625a-8843-492b-88bc-3d62f88f24a3',
  });
});

test('does not surface notification delivery errors to the inquiry flow', async () => {
  await assert.doesNotReject(() => notifyInquiryCreated({
    inquiryId: 'a0f8ad5d-75f8-4c9d-8a65-1df54857274f',
    fetchImpl: async () => {
      throw new Error('Network unavailable');
    },
  }));
});
