import { sendTelegramInquiryAlert } from './telegramInquiryAlert.mjs';
import { createClient } from '@supabase/supabase-js';

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function claimInquiryForTelegramAlert(client, inquiryId) {
  const { data, error } = await client.rpc('claim_inquiry_telegram_alert', {
    p_inquiry_id: inquiryId,
  });
  if (error) throw error;

  const inquiry = Array.isArray(data) ? data[0] : data;
  if (!inquiry) return null;
  return {
    id: inquiry.id,
    inquiryType: inquiry.inquiry_type,
    createdAt: inquiry.created_at,
    claimToken: inquiry.claim_token,
  };
}

export async function markInquiryTelegramAlertSent(client, inquiryId, claimToken) {
  const { error } = await client.rpc('mark_inquiry_telegram_alert_sent', {
    p_inquiry_id: inquiryId,
    p_claim_token: claimToken,
  });
  if (error) throw error;
}

export async function releaseInquiryTelegramAlert(client, inquiryId, claimToken) {
  const { error } = await client.rpc('release_inquiry_telegram_alert', {
    p_inquiry_id: inquiryId,
    p_claim_token: claimToken,
  });
  if (error) throw error;
}

function createServerSupabaseClient(environment) {
  if (!environment.NEXT_PUBLIC_SUPABASE_URL || !environment.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createClient(environment.NEXT_PUBLIC_SUPABASE_URL, environment.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function handleInquiryAlert(
  request,
  environment = process.env,
  {
    createSupabaseClient = createServerSupabaseClient,
    claimInquiry = claimInquiryForTelegramAlert,
    sendAlert = sendTelegramInquiryAlert,
    markAlertSent = markInquiryTelegramAlertSent,
    releaseAlert = releaseInquiryTelegramAlert,
  } = {},
) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  if (
    typeof body?.inquiryId !== 'string'
    || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.inquiryId)
  ) {
    return json({ error: 'Invalid inquiry alert.' }, 400);
  }

  const client = createSupabaseClient(environment);
  if (!client) {
    console.warn('Telegram inquiry alert was not delivered: server_supabase_not_configured');
    return json({ ok: true }, 202);
  }

  try {
    const inquiry = await claimInquiry(client, body.inquiryId);
    if (!inquiry) return json({ ok: true }, 202);

    const result = await sendAlert({
      botToken: environment.TELEGRAM_BOT_TOKEN,
      chatId: environment.TELEGRAM_CHAT_ID,
      siteUrl: environment.SITE_URL,
      inquiryId: inquiry.id,
      inquiryType: inquiry.inquiryType,
      createdAt: inquiry.createdAt,
    });

    if (!result.sent) {
      await releaseAlert(client, inquiry.id, inquiry.claimToken);
      console.warn(`Telegram inquiry alert was not delivered: ${result.reason}`);
      return json({ ok: true }, 202);
    }

    await markAlertSent(client, inquiry.id, inquiry.claimToken);
  } catch {
    console.warn('Telegram inquiry alert was not delivered: inquiry_lookup_failed');
  }

  return json({ ok: true }, 202);
}
