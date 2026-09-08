// This guard never prints the supplied key. It also runs in next.config.ts,
// before Next can inline an accidentally configured secret into browser assets.
export function assertPublicSupabaseKey(key) {
  if (!key) return;
  let secret = key.startsWith('sb_secret_');
  const payload = key.split('.')[1];
  if (payload) {
    try {
      const value = JSON.parse(atob(payload.replaceAll('-', '+').replaceAll('_', '/')));
      secret ||= value.role === 'service_role';
    } catch { /* Publishable keys do not have a JWT payload. */ }
  }
  if (secret) throw new Error('A privileged Supabase key must never use a NEXT_PUBLIC environment variable.');
}
