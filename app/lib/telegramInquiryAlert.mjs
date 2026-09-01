export function buildInquiryDetailUrl(siteUrl, inquiryId) {
  const url = new URL('/taskboard', siteUrl);
  url.searchParams.set('inquiry', inquiryId);
  return url.toString();
}

export function formatInquiryReceivedAt(createdAt) {
  const date = new Date(createdAt);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute} KST`;
}

export async function sendTelegramInquiryAlert({
  botToken,
  chatId,
  siteUrl,
  inquiryId,
  inquiryType,
  createdAt,
  fetchImpl = fetch,
  timeoutMs = 10_000,
}) {
  if (!botToken || !chatId || !siteUrl) {
    return { sent: false, reason: 'telegram_not_configured' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        chat_id: chatId,
        text: `🔔 문의 도착\n유형: ${inquiryType}\n시간: ${formatInquiryReceivedAt(createdAt)}`,
        reply_markup: {
          inline_keyboard: [[{
            text: '문의 바로가기',
            url: buildInquiryDetailUrl(siteUrl, inquiryId),
          }]],
        },
      }),
    });
    const payload = await response.json().catch(() => null);

    if (response.ok && payload?.ok === true) return { sent: true };

    const description = typeof payload?.description === 'string'
      ? payload.description
      : `HTTP ${response.status}`;
    return { sent: false, reason: `telegram_request_failed: ${description}` };
  } catch {
    return { sent: false, reason: 'telegram_request_failed' };
  } finally {
    clearTimeout(timeout);
  }
}
