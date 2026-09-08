import 'server-only';
import { normalizeInquiryCode } from '../shared/guestInquiry.mjs';

export async function readSmallJson(request, maxBytes = 2048) {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw Object.assign(new Error('JSON required'), { status: 415 });
  }
  if (Number(request.headers.get('content-length')) > maxBytes) {
    throw Object.assign(new Error('Body too large'), { status: 413 });
  }
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Missing body');
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw Object.assign(new Error('Body too large'), { status: 413 });
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export function isSameOriginRequest(request) {
  const origin = request.headers.get('origin');
  return request.headers.get('sec-fetch-site') !== 'cross-site'
    && (!origin || origin === new URL(request.url).origin);
}

// Validate identity and object ownership before any privileged notification RPC.
export async function authorizeInquiryAlert(client, request, { inquiryId, messageId, guestCode }) {
  const token = request.headers.get('authorization')?.match(/^Bearer ([^\s]+)$/i)?.[1];
  const code = normalizeInquiryCode(guestCode);
  if (!token && !code) return false;
  let userId;
  if (token) {
    const { data, error } = await client.auth.getUser(token);
    if (error || !data?.user) return false;
    userId = data.user.id;
  }
  let targetId = inquiryId;
  if (messageId) {
    const { data, error } = await client.from('inquiry_messages')
      .select('inquiry_id').eq('id', messageId).eq('sender', 'user').maybeSingle();
    if (error || !data) return false;
    targetId = data.inquiry_id;
  }
  let query = client.from('inquiries').select('id').eq('id', targetId);
  query = code ? query.is('user_id', null).eq('inquiry_code', code) : query.eq('user_id', userId);
  const { data, error } = await query.maybeSingle();
  return !error && Boolean(data);
}
