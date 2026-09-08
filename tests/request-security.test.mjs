import test from 'node:test';
import assert from 'node:assert/strict';
import { authorizeInquiryAlert, readSmallJson } from '../app/server/requestSecurity.mjs';
import { handleInquiryAlert } from '../app/server/telegramInquiryAlertRoute.mjs';
import { normalizeReportSlug, validInquiryInput } from '../app/shared/inputPolicy.mjs';

function client() {
  const rows = {
    inquiries: [{ id: 'member-ticket', user_id: 'owner' }, { id: 'guest-ticket', user_id: null, inquiry_code: 'STM-GUEST123456789ABCD' }],
    inquiry_messages: [{ id: 'member-message', inquiry_id: 'member-ticket', sender: 'user' },
      { id: 'guest-message', inquiry_id: 'guest-ticket', sender: 'user' }, { id: 'reply', inquiry_id: 'guest-ticket', sender: 'admin' }],
  };
  return {
    auth: { async getUser(token) { return token === 'invalid' ? { error: new Error('expired') } : { data: { user: { id: token } } }; } },
    from(table) {
      let result = rows[table];
      const query = { select() { return query; }, eq(key,value) { result = result.filter(row=>row[key]===value); return query; },
        is(key,value) { return query.eq(key,value); }, async maybeSingle() { return { data: result[0] ?? null }; } };
      return query;
    },
  };
}
const request = token => new Request('https://stimemc.xyz/api/telegram/inquiry-alert', { headers: token ? { authorization: `Bearer ${token}` } : {} });

test('alert authorization verifies token and exact member ownership', async () => {
  assert.equal(await authorizeInquiryAlert(client(),request('owner'),{ inquiryId: 'member-ticket' }),true);
  assert.equal(await authorizeInquiryAlert(client(),request('other'),{ inquiryId: 'member-ticket' }),false);
  assert.equal(await authorizeInquiryAlert(client(),request('invalid'),{ inquiryId: 'member-ticket' }),false);
  assert.equal(await authorizeInquiryAlert(client(),request('owner'),{ messageId: 'member-message' }),true);
  assert.equal(await authorizeInquiryAlert(client(),request('other'),{ messageId: 'member-message' }),false);
});
test('guest codes authorize only their own inquiry and user messages', async () => {
  const guestCode = 'STM-GUEST123456789ABCD';
  assert.equal(await authorizeInquiryAlert(client(),request(),{ inquiryId:'guest-ticket',guestCode }),true);
  assert.equal(await authorizeInquiryAlert(client(),request(),{ messageId:'guest-message',guestCode }),true);
  for (const target of [{ inquiryId:'member-ticket' },{ messageId:'member-message' },{ messageId:'reply' }]) {
    assert.equal(await authorizeInquiryAlert(client(),request(),{ ...target,guestCode }),false);
  }
  assert.equal(await authorizeInquiryAlert(client(),request(),{ inquiryId:'guest-ticket',guestCode:'STM-WRONG123456789ABCD' }),false);
});
test('JSON bodies are bounded even without a Content-Length header', async () => {
  await assert.rejects(()=>readSmallJson(new Request('https://example.test',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:'a'.repeat(3000)})})), error=>error.status===413);
});
test('cross-site browser alerts are rejected before privileged work', async () => {
  const response = await handleInquiryAlert(new Request('https://stimemc.xyz/api/telegram/inquiry-alert',{
    method:'POST',headers:{origin:'https://attacker.test','content-type':'application/json'},body:'{}',
  }));
  assert.equal(response.status,403);
  assert.equal(response.headers.get('cache-control'),'no-store');
});
test('report routes reject traversal, external destinations and reserved paths', () => {
  for (const value of ['../support','//evil.test','https://evil.test','auth/callback','api/test','news','a?x=1','a#b','a%2fb']) assert.equal(normalizeReportSlug(value),null);
  assert.equal(normalizeReportSlug('/report/공지-1'),'report/공지-1');
});
test('inquiry validation bounds all fields before submitting', () => {
  const valid = { nickname:'Steve',inquiryType:'기타',content:'내용',purpose:'목적' };
  assert.equal(validInquiryInput(valid),true);
  assert.equal(validInquiryInput({...valid,content:'a'.repeat(8001)}),false);
  assert.equal(validInquiryInput({...valid,purpose:''}),false);
});
