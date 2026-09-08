import { handleInquiryAlert } from '../../../server/telegramInquiryAlertRoute.mjs';

export const maxDuration = 15;

export async function POST(request: Request) {
  return handleInquiryAlert(request);
}
