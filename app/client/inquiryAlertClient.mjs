export async function notifyInquiryCreated({ inquiryId, accessToken = '', guestCode = '', fetchImpl = fetch }) {
  try {
    await fetchImpl('/api/telegram/inquiry-alert', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify({ inquiryId, ...(guestCode ? { guestCode } : {}) }),
    });
  } catch {
    // The inquiry has already been stored; notification delivery is best-effort.
  }
}

export async function notifyInquiryMessageCreated({ messageId, accessToken = '', guestCode = '', fetchImpl = fetch }) {
  try {
    await fetchImpl('/api/telegram/inquiry-alert', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify({ messageId, ...(guestCode ? { guestCode } : {}) }),
    });
  } catch {
    // The message has already been stored; notification delivery is best-effort.
  }
}
