import { NextResponse } from 'next/server';
import { handleInquiryAlert } from '../../../lib/telegramInquiryAlertRoute.mjs';

export async function POST(request: Request) {
  const response = await handleInquiryAlert(request);
  const payload = await response.json();

  return NextResponse.json(payload, { status: response.status });
}
