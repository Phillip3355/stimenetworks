-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create inquiries table
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  inquiry_code TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Keep this table in sync with any extra addresses in NEXT_PUBLIC_ADMIN_EMAILS.
INSERT INTO public.support_admins (email)
VALUES ('cwj120408@gmail.com'), ('kimjc.120211@gmail.com')
ON CONFLICT (email) DO NOTHING;

ALTER TABLE public.support_admins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.support_admins FROM anon, authenticated, PUBLIC;

CREATE INDEX IF NOT EXISTS inquiries_guest_ip_created_at_idx
  ON public.inquiries (guest_ip, created_at)
  WHERE user_id IS NULL;

CREATE OR REPLACE FUNCTION public.is_support_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.support_admins
    WHERE email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

REVOKE ALL ON FUNCTION public.is_support_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_support_admin() TO anon, authenticated;

-- 3. Protect direct table access. Anonymous visitors use the scoped RPCs below.
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inquiries_owner_select ON public.inquiries;
CREATE POLICY inquiries_owner_select ON public.inquiries
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_support_admin()
  );

DROP POLICY IF EXISTS inquiries_owner_insert ON public.inquiries;
CREATE POLICY inquiries_owner_insert ON public.inquiries
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS inquiries_owner_update ON public.inquiries;
CREATE POLICY inquiries_owner_update ON public.inquiries
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_support_admin()
  )
  WITH CHECK (
    auth.uid() = user_id
    OR public.is_support_admin()
  );

DROP POLICY IF EXISTS inquiries_owner_delete ON public.inquiries;
CREATE POLICY inquiries_owner_delete ON public.inquiries
  FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_support_admin()
  );

DROP POLICY IF EXISTS messages_owner_select ON public.inquiry_messages;
CREATE POLICY messages_owner_select ON public.inquiry_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inquiries
      WHERE public.inquiries.id = inquiry_messages.inquiry_id
        AND (
          public.inquiries.user_id = auth.uid()
          OR public.is_support_admin()
        )
    )
  );

DROP POLICY IF EXISTS messages_owner_insert ON public.inquiry_messages;
CREATE POLICY messages_owner_insert ON public.inquiry_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inquiries
      WHERE public.inquiries.id = inquiry_messages.inquiry_id
        AND (
          public.inquiries.user_id = auth.uid()
          OR public.is_support_admin()
        )
    )
  );

-- Anonymous operations are intentionally exposed only as code-scoped functions.
CREATE OR REPLACE FUNCTION public.create_guest_inquiry(
  p_nickname text,
  p_inquiry_type text,
  p_content text,
  p_purpose text
)
RETURNS public.inquiries
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_inquiry public.inquiries;
  code text;
  client_ip text := split_part(
    coalesce(
      (nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-forwarded-for'),
      'unknown'
    ),
    ',',
    1
  );
BEGIN
  IF length(trim(coalesce(p_nickname, ''))) = 0
    OR length(trim(coalesce(p_content, ''))) = 0
    OR length(trim(coalesce(p_purpose, ''))) = 0 THEN
    RAISE EXCEPTION 'Required inquiry fields are missing' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('guest-create:' || trim(client_ip), 0));

  IF (
    SELECT count(*)
    FROM public.inquiries
    WHERE user_id IS NULL
      AND guest_ip = trim(client_ip)
      AND created_at >= timezone('utc'::text, now()) - interval '1 hour'
  ) >= 3 THEN
    RAISE EXCEPTION 'Too many guest inquiries' USING ERRCODE = 'P0001';
  END IF;

  LOOP
    code := 'STM-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 18));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.inquiries WHERE inquiry_code = code);
  END LOOP;

  INSERT INTO public.inquiries (user_id, nickname, inquiry_code, status, guest_ip)
  VALUES (NULL, trim(p_nickname), code, 'open', trim(client_ip))
  RETURNING * INTO new_inquiry;

  INSERT INTO public.inquiry_messages (inquiry_id, sender, message)
  VALUES (
    new_inquiry.id,
    'user',
    '[문의 유형] ' || trim(coalesce(p_inquiry_type, '기타')) || E'\n[문의 내용]\n' || trim(p_content) || E'\n\n[문의 목적]\n' || trim(p_purpose)
  );

  RETURN new_inquiry;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_guest_inquiry(p_inquiry_code text)
RETURNS SETOF public.inquiries
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.inquiries
  WHERE user_id IS NULL
    AND inquiry_code = upper(trim(p_inquiry_code))
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_guest_inquiry_messages(p_inquiry_code text)
RETURNS SETOF public.inquiry_messages
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT messages.*
  FROM public.inquiry_messages AS messages
  JOIN public.inquiries AS inquiries ON inquiries.id = messages.inquiry_id
  WHERE inquiries.user_id IS NULL
    AND inquiries.inquiry_code = upper(trim(p_inquiry_code))
  ORDER BY messages.created_at ASC;
$$;

CREATE OR REPLACE FUNCTION public.send_guest_inquiry_message(p_inquiry_code text, p_message text)
RETURNS public.inquiry_messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  guest_inquiry public.inquiries;
  new_message public.inquiry_messages;
  client_ip text := split_part(
    coalesce(
      (nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-forwarded-for'),
      'unknown'
    ),
    ',',
    1
  );
BEGIN
  SELECT * INTO guest_inquiry
  FROM public.inquiries
  WHERE user_id IS NULL
    AND inquiry_code = upper(trim(p_inquiry_code))
  LIMIT 1;

  IF guest_inquiry.id IS NULL OR length(trim(coalesce(p_message, ''))) = 0 THEN
    RAISE EXCEPTION 'Guest inquiry or message is invalid' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('guest-message:' || guest_inquiry.id::text, 0));

  IF (
    SELECT count(*)
    FROM public.inquiry_messages AS messages
    JOIN public.inquiries AS inquiries ON inquiries.id = messages.inquiry_id
    WHERE inquiries.id = guest_inquiry.id
      AND messages.sender = 'user'
      AND messages.created_at >= timezone('utc'::text, now()) - interval '10 minutes'
  ) >= 30 THEN
    RAISE EXCEPTION 'Too many guest messages' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.inquiry_messages (inquiry_id, sender, message)
  VALUES (guest_inquiry.id, 'user', trim(p_message))
  RETURNING * INTO new_message;

  UPDATE public.inquiries SET status = 'open', updated_at = timezone('utc'::text, now())
  WHERE id = guest_inquiry.id;

  RETURN new_message;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_guest_inquiry(text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_guest_inquiry(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_guest_inquiry_messages(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.send_guest_inquiry_message(text, text) TO anon, authenticated;

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
      telegram_alert_claimed_at = timezone('utc'::text, now()),
      telegram_alert_claim_token = new_claim_token
    FROM initial_message
    WHERE inquiries.id = initial_message.inquiry_id
      AND inquiries.telegram_alert_sent_at IS NULL
      AND (
        inquiries.telegram_alert_claimed_at IS NULL
        OR inquiries.telegram_alert_claimed_at < timezone('utc'::text, now()) - interval '15 minutes'
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
    telegram_alert_sent_at = timezone('utc'::text, now()),
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

REVOKE ALL ON FUNCTION public.claim_inquiry_telegram_alert(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mark_inquiry_telegram_alert_sent(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_inquiry_telegram_alert(uuid, uuid) FROM PUBLIC;
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
      telegram_alert_claimed_at = timezone('utc'::text, now()),
      telegram_alert_claim_token = new_claim_token
    WHERE messages.id = p_message_id
      AND messages.sender = 'user'
      AND messages.telegram_alert_sent_at IS NULL
      AND (
        messages.telegram_alert_claimed_at IS NULL
        OR messages.telegram_alert_claimed_at < timezone('utc'::text, now()) - interval '15 minutes'
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

-- 4. Enable Realtime for inquiry_messages
-- This allows the chat to update instantly when a new message is inserted
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiry_messages;

-- 5. Create reports table for custom dynamic routes (e.g. notices, updates)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL, -- The custom URL path e.g. "report/update-1"
  content TEXT NOT NULL, -- Markdown content
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Disable RLS for reports (as previously agreed for this project)
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;
