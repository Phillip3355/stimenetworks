// Narrow browser data operations. Postgres RPCs own validation, quotas and atomic writes.
export function createMemberInquiry(client, { nickname, inquiryType, content, purpose }) {
  return client.rpc('create_member_inquiry', {
    p_nickname: nickname.trim(), p_inquiry_type: inquiryType,
    p_content: content.trim(), p_purpose: purpose.trim(),
  });
}
