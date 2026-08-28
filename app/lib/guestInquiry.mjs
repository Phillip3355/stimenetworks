export function normalizeInquiryCode(value) {
  const code = value.trim().toUpperCase();
  return /^STM-[A-Z0-9]{6,18}$/.test(code) ? code : null;
}

export function canAccessGuestInquiry(inquiry) {
  return inquiry?.user_id === null;
}

export function buildGuestInquiryPayload({
  nickname,
  inquiryType,
  inquiryContent,
  inquiryPurpose,
  inquiryCode,
}) {
  return {
    inquiry: {
      user_id: null,
      nickname: nickname.trim(),
      inquiry_code: inquiryCode,
      status: 'open',
    },
    initialMessage: `[문의 유형] ${inquiryType}\n[문의 내용]\n${inquiryContent.trim()}\n\n[문의 목적]\n${inquiryPurpose.trim()}`,
  };
}
