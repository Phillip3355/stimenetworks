export const INPUT_LIMITS = Object.freeze({ nickname: 80, inquiryType: 80, content: 8000, purpose: 2000, message: 12000, report: 200000 });
const reserved = new Set(['api', '_next', 'auth', 'taskboard', 'support', 'join', 'news', 'rules', 'history', 'updates', 'recovery-guidelines', 'server-mechanism']);

export function normalizeReportSlug(value) {
  if (typeof value !== 'string') return null;
  const slug = value.trim().replace(/^\/+/, '');
  if (slug.length > 200 || !/^[A-Za-z0-9가-힣_-]+(?:\/[A-Za-z0-9가-힣_-]+)*$/.test(slug)) return null;
  return reserved.has(slug.split('/')[0].toLowerCase()) ? null : slug;
}

export function validInquiryInput({ nickname, inquiryType, content, purpose }) {
  return Object.entries({ nickname, inquiryType, content, purpose }).every(([key, value]) =>
    typeof value === 'string' && value.trim().length > 0 && value.trim().length <= INPUT_LIMITS[key]);
}
