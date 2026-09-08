-- Schema generator input. Deploy schema.sql, not this file alone.

-- 1. Create inquiries table
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  inquiry_code TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  telegram_alert_sent_at TIMESTAMP WITH TIME ZONE,
  telegram_alert_claimed_at TIMESTAMP WITH TIME ZONE,
  telegram_alert_claim_token UUID
);

ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS telegram_alert_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS telegram_alert_claimed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS telegram_alert_claim_token UUID;

CREATE UNIQUE INDEX IF NOT EXISTS inquiries_inquiry_code_key
  ON public.inquiries (inquiry_code);

-- 2. Create inquiry_messages table
CREATE TABLE IF NOT EXISTS public.inquiry_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE CASCADE,
  sender TEXT NOT NULL, -- 'user' or 'admin'
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  telegram_alert_sent_at TIMESTAMP WITH TIME ZONE,
  telegram_alert_claimed_at TIMESTAMP WITH TIME ZONE,
  telegram_alert_claim_token UUID
);

ALTER TABLE public.inquiry_messages
  ADD COLUMN IF NOT EXISTS telegram_alert_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.inquiry_messages
  ADD COLUMN IF NOT EXISTS telegram_alert_claimed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.inquiry_messages
  ADD COLUMN IF NOT EXISTS telegram_alert_claim_token UUID;

ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS guest_ip TEXT;

CREATE TABLE IF NOT EXISTS public.support_admins (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Authoritative admin allowlist; never configured in the browser.
INSERT INTO public.support_admins (email)
VALUES ('cwj120408@gmail.com'), ('kimjc.120211@gmail.com')
ON CONFLICT (email) DO NOTHING;

ALTER TABLE public.support_admins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.support_admins FROM anon, authenticated, PUBLIC;

CREATE INDEX IF NOT EXISTS inquiries_guest_ip_created_at_idx
  ON public.inquiries (guest_ip, created_at)
  WHERE user_id IS NULL;

-- 3.5 Claim a fully persisted inquiry for a server-only Telegram alert.
DROP FUNCTION IF EXISTS public.claim_inquiry_telegram_alert(uuid);
CREATE OR REPLACE FUNCTION public.claim_inquiry_telegram_alert(p_inquiry_id uuid)
RETURNS TABLE (
  id uuid,
  inquiry_type text,
  created_at timestamp with time zone,
  claim_token uuid,
  sender_name text,
  message_preview text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_claim_token uuid := gen_random_uuid();
BEGIN
  RETURN QUERY
  WITH initial_message AS (
    SELECT messages.inquiry_id, messages.message
    FROM public.inquiry_messages AS messages
    WHERE messages.inquiry_id = p_inquiry_id
      AND messages.sender = 'user'
    ORDER BY messages.created_at ASC
    LIMIT 1
  ),
  claimed AS (
    UPDATE public.inquiries AS inquiries
    SET
      telegram_alert_claimed_at = now(),
      telegram_alert_claim_token = new_claim_token
    FROM initial_message
    WHERE inquiries.id = initial_message.inquiry_id
      AND inquiries.telegram_alert_sent_at IS NULL
      AND (
        inquiries.telegram_alert_claimed_at IS NULL
        OR inquiries.telegram_alert_claimed_at < now() - interval '15 minutes'
      )
    RETURNING inquiries.id, inquiries.created_at, inquiries.user_id, inquiries.nickname, initial_message.message
  )
  SELECT
    claimed.id,
    COALESCE(NULLIF(trim((regexp_match(claimed.message, '^\[문의 유형\]\s*([^\r\n]+)', 'm'))[1]), ''), '기타'),
    claimed.created_at,
    new_claim_token,
    CASE
      WHEN claimed.user_id IS NULL THEN '비로그인 유저'
      ELSE COALESCE(NULLIF(trim(claimed.nickname), ''), '로그인 유저')
    END,
    left(
      regexp_replace(
        COALESCE(
          NULLIF(split_part(split_part(claimed.message, '[문의 내용]', 2), '[문의 목적]', 1), ''),
          claimed.message
        ),
        '^[[:space:]]+',
        ''
      ),
      5
    )
  FROM claimed;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_inquiry_telegram_alert_sent(
  p_inquiry_id uuid,
  p_claim_token uuid
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.inquiries
  SET
    telegram_alert_sent_at = now(),
    telegram_alert_claimed_at = NULL,
    telegram_alert_claim_token = NULL
  WHERE id = p_inquiry_id
    AND telegram_alert_sent_at IS NULL
    AND telegram_alert_claim_token = p_claim_token;
$$;

CREATE OR REPLACE FUNCTION public.release_inquiry_telegram_alert(
  p_inquiry_id uuid,
  p_claim_token uuid
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.inquiries
  SET
    telegram_alert_claimed_at = NULL,
    telegram_alert_claim_token = NULL
  WHERE id = p_inquiry_id
    AND telegram_alert_sent_at IS NULL
    AND telegram_alert_claim_token = p_claim_token;
$$;

REVOKE ALL ON FUNCTION public.claim_inquiry_telegram_alert(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mark_inquiry_telegram_alert_sent(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_inquiry_telegram_alert(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_inquiry_telegram_alert(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_inquiry_telegram_alert_sent(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_inquiry_telegram_alert(uuid, uuid) TO service_role;

DROP FUNCTION IF EXISTS public.claim_inquiry_message_telegram_alert(uuid);
CREATE OR REPLACE FUNCTION public.claim_inquiry_message_telegram_alert(p_message_id uuid)
RETURNS TABLE (
  inquiry_id uuid,
  inquiry_type text,
  created_at timestamp with time zone,
  claim_token uuid,
  sender_name text,
  message_preview text
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
      telegram_alert_claimed_at = now(),
      telegram_alert_claim_token = new_claim_token
    WHERE messages.id = p_message_id
      AND messages.sender = 'user'
      AND messages.telegram_alert_sent_at IS NULL
      AND (
        messages.telegram_alert_claimed_at IS NULL
        OR messages.telegram_alert_claimed_at < now() - interval '15 minutes'
      )
    RETURNING messages.inquiry_id, messages.created_at, messages.message
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
    new_claim_token,
    CASE
      WHEN inquiries.user_id IS NULL THEN '비로그인 유저'
      ELSE COALESCE(NULLIF(trim(inquiries.nickname), ''), '로그인 유저')
    END,
    left(
      regexp_replace(
        COALESCE(
          NULLIF(split_part(split_part(claimed.message, '[문의 내용]', 2), '[문의 목적]', 1), ''),
          claimed.message
        ),
        '^[[:space:]]+',
        ''
      ),
      5
    )
  FROM claimed
  JOIN initial_message ON initial_message.inquiry_id = claimed.inquiry_id
  JOIN public.inquiries AS inquiries ON inquiries.id = claimed.inquiry_id;
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
    telegram_alert_sent_at = now(),
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

REVOKE ALL ON FUNCTION public.claim_inquiry_message_telegram_alert(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mark_inquiry_message_telegram_alert_sent(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_inquiry_message_telegram_alert(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_inquiry_message_telegram_alert(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_inquiry_message_telegram_alert_sent(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_inquiry_message_telegram_alert(uuid, uuid) TO service_role;

-- 5. Create reports table for custom dynamic routes (e.g. notices, updates)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL, -- The custom URL path e.g. "report/update-1"
  content TEXT NOT NULL, -- Markdown content
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition TEXT NOT NULL CHECK (edition IN ('java', 'bedrock')),
  minecraft_nickname TEXT NOT NULL CHECK (char_length(btrim(minecraft_nickname)) BETWEEN 1 AND 32),
  inviter_name TEXT NOT NULL CHECK (char_length(btrim(inviter_name)) BETWEEN 1 AND 80),
  contact TEXT NOT NULL CHECK (char_length(btrim(contact)) BETWEEN 2 AND 120),
  rules_agreed BOOLEAN NOT NULL CHECK (rules_agreed = TRUE),
  privacy_agreed BOOLEAN NOT NULL CHECK (privacy_agreed = TRUE),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS join_requests_pending_player_unique
  ON public.join_requests (edition, lower(btrim(minecraft_nickname)));

ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.join_requests FROM PUBLIC, anon, authenticated;
GRANT INSERT ON TABLE public.join_requests TO anon, authenticated;
GRANT SELECT, DELETE ON TABLE public.join_requests TO authenticated;

