export async function notifyInquiryCreated({ inquiryId, fetchImpl = fetch }) {
  try {
    await fetchImpl('/api/telegram/inquiry-alert', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ inquiryId }),
    });
  } catch {
    // The inquiry has already been stored; notification delivery is best-effort.
  }
}
