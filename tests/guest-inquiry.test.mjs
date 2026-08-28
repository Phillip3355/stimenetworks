import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildGuestInquiryPayload,
  canAccessGuestInquiry,
  normalizeInquiryCode,
} from '../app/lib/guestInquiry.mjs';

test('normalizes a captured guest inquiry code for lookup', () => {
  assert.equal(normalizeInquiryCode(' stm-ab12cd '), 'STM-AB12CD');
  assert.equal(normalizeInquiryCode('stm-abcdefghijklmnopqr'), 'STM-ABCDEFGHIJKLMNOPQR');
  assert.equal(normalizeInquiryCode('not a ticket'), null);
});

test('builds an anonymous inquiry without attaching a Google account', () => {
  assert.deepEqual(
    buildGuestInquiryPayload({
      nickname: '손님',
      inquiryType: '기타',
      inquiryContent: '접속이 되지 않아요.',
      inquiryPurpose: '접속 방법을 알고 싶어요.',
      inquiryCode: 'STM-AB12CD',
    }),
    {
      inquiry: {
        user_id: null,
        nickname: '손님',
        inquiry_code: 'STM-AB12CD',
        status: 'open',
      },
      initialMessage: '[문의 유형] 기타\n[문의 내용]\n접속이 되지 않아요.\n\n[문의 목적]\n접속 방법을 알고 싶어요.',
    },
  );
});

test('allows guest lookup only for inquiries that have no signed-in owner', () => {
  assert.equal(canAccessGuestInquiry({ user_id: null }), true);
  assert.equal(canAccessGuestInquiry({ user_id: 'signed-in-user-id' }), false);
  assert.equal(canAccessGuestInquiry(null), false);
});
