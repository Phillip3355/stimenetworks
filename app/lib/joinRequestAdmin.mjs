import { isAdminEmail } from './adminPolicy.mjs';

export class JoinRequestAdminError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'JoinRequestAdminError';
    this.code = code;
  }
}

export async function loadAdminJoinRequests(client, configuredEmails = '') {
  const { data: { user }, error: authError } = await client.auth.getUser();

  if (authError || !user) {
    throw new JoinRequestAdminError('AUTH_REQUIRED', 'The administrator session is not valid.');
  }

  if (!isAdminEmail(user.email, configuredEmails)) {
    throw new JoinRequestAdminError('ADMIN_REQUIRED', 'The signed-in account is not an administrator.');
  }

  const { data, error } = await client.rpc('get_stimemc_join_requests');

  if (error) throw error;
  return data ?? [];
}

export async function completeAdminJoinRequest(client, requestId) {
  const { data, error } = await client.rpc('complete_stimemc_join_request', {
    request_id: requestId,
  });

  if (error) throw error;
  return data === true;
}
