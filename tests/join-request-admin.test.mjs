import test from 'node:test';
import assert from 'node:assert/strict';

import { completeAdminJoinRequest, loadAdminJoinRequests } from '../app/lib/joinRequestAdmin.mjs';

const requestRows = [
  {
    id: 'request-1',
    edition: 'java',
    minecraft_nickname: 'Stime_Player',
    inviter_name: '없음',
    contact: 'diagnostic-local',
    rules_agreed: true,
    privacy_agreed: true,
    created_at: '2026-08-20T00:00:00.000Z',
  },
];

function createClient({ email, authError = null, queryError = null, rows = requestRows }) {
  let requestsQueried = false;

  return {
    get requestsQueried() {
      return requestsQueried;
    },
    auth: {
      async getUser() {
        return {
          data: { user: email ? { id: 'admin-id', email } : null },
          error: authError,
        };
      },
    },
    async rpc(name, args) {
      requestsQueried = true;
      if (name === 'complete_stimemc_join_request') {
        assert.deepEqual(args, { request_id: 'request-1' });
        return { data: true, error: queryError };
      }
      assert.equal(name, 'get_stimemc_join_requests');
      return { data: rows, error: queryError };
    },
  };
}

test('loads join requests only after Supabase verifies an allowed administrator', async () => {
  const client = createClient({ email: 'CWJ120408@GMAIL.COM' });

  assert.deepEqual(await loadAdminJoinRequests(client), requestRows);
  assert.equal(client.requestsQueried, true);
});

test('does not query private join requests for an unlisted account', async () => {
  const client = createClient({ email: 'player@example.com' });

  await assert.rejects(
    () => loadAdminJoinRequests(client),
    (error) => error.code === 'ADMIN_REQUIRED',
  );
  assert.equal(client.requestsQueried, false);
});

test('surfaces the database error instead of displaying an empty request list', async () => {
  const queryError = Object.assign(new Error('permission denied'), { code: '42501' });
  const client = createClient({ email: 'kimjc.120211@gmail.com', queryError });

  await assert.rejects(() => loadAdminJoinRequests(client), queryError);
});

test('completes a join request through the protected administrator RPC', async () => {
  const client = createClient({ email: 'cwj120408@gmail.com' });

  assert.equal(await completeAdminJoinRequest(client, 'request-1'), true);
});
