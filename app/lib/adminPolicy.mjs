const requiredAdminEmails = [
  'cwj120408@gmail.com',
  'kimjc.120211@gmail.com',
];

export function getAdminEmails(configuredEmails = '') {
  const configured = configuredEmails
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return [...new Set([...requiredAdminEmails, ...configured])];
}

export function isAdminEmail(email, configuredEmails = '') {
  if (!email) return false;
  return getAdminEmails(configuredEmails).includes(email.trim().toLowerCase());
}
