-- Run this once in Supabase SQL Editor before deploying the matching app code.
ALTER TABLE public.inquiry_messages
  ADD COLUMN IF NOT EXISTS telegram_alert_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.inquiry_messages
  ADD COLUMN IF NOT EXISTS telegram_alert_claimed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.inquiry_messages
  ADD COLUMN IF NOT EXISTS telegram_alert_claim_token UUID;

CREATE OR REPLACE FUNCTION public.claim_inquiry_message_telegram_alert(p_message_id uuid)
RETURNS TABLE (
  inquiry_id uuid,
  inquiry_type text,
  created_at timestamp with time zone,
  claim_token uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_claim_token uuid := gen_random_uuid();
BEGIN
  RETURN QUERY
  WITH claimed AS (
    UPDATE public.inquiry_messages AS messages
    SET
      telegram_alert_claimed_at = timezone('utc'::text, now()),
      telegram_alert_claim_token = new_claim_token
    WHERE messages.id = p_message_id
      AND messages.sender = 'user'
      AND messages.telegram_alert_sent_at IS NULL
      AND (
        messages.telegram_alert_claimed_at IS NULL
        OR messages.telegram_alert_claimed_at < timezone('utc'::text, now()) - interval '15 minutes'
      )
    RETURNING messages.inquiry_id, messages.created_at
  ),
  initial_message AS (
    SELECT messages.inquiry_id, messages.message
    FROM public.inquiry_messages AS messages
    JOIN claimed ON claimed.inquiry_id = messages.inquiry_id
    WHERE messages.sender = 'user'
    ORDER BY messages.created_at ASC
    LIMIT 1
  )
  SELECT
    claimed.inquiry_id,
    COALESCE(NULLIF(trim((regexp_match(initial_message.message, '^\[문의 유형\]\s*([^\r\n]+)', 'm'))[1]), ''), '기타'),
    claimed.created_at,
    new_claim_token
  FROM claimed
  JOIN initial_message ON initial_message.inquiry_id = claimed.inquiry_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_inquiry_message_telegram_alert_sent(
  p_message_id uuid,
  p_claim_token uuid
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.inquiry_messages
  SET
    telegram_alert_sent_at = timezone('utc'::text, now()),
    telegram_alert_claimed_at = NULL,
    telegram_alert_claim_token = NULL
  WHERE id = p_message_id
    AND telegram_alert_sent_at IS NULL
    AND telegram_alert_claim_token = p_claim_token;
$$;

CREATE OR REPLACE FUNCTION public.release_inquiry_message_telegram_alert(
  p_message_id uuid,
  p_claim_token uuid
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.inquiry_messages
  SET
    telegram_alert_claimed_at = NULL,
    telegram_alert_claim_token = NULL
  WHERE id = p_message_id
    AND telegram_alert_sent_at IS NULL
    AND telegram_alert_claim_token = p_claim_token;
$$;

REVOKE ALL ON FUNCTION public.claim_inquiry_message_telegram_alert(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mark_inquiry_message_telegram_alert_sent(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_inquiry_message_telegram_alert(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_inquiry_message_telegram_alert(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_inquiry_message_telegram_alert_sent(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_inquiry_message_telegram_alert(uuid, uuid) TO service_role;
