-- Existing installations: run this whole transaction after taking a DB backup.
-- Requires the existing support/join/Telegram tables and claim functions.
BEGIN;

-- Avoid interpreting a timezone-less UTC timestamp a second time in the session timezone.
ALTER TABLE public.inquiries ALTER COLUMN created_at SET DEFAULT now(), ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.inquiry_messages ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.reports ALTER COLUMN created_at SET DEFAULT now(), ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.support_admins ALTER COLUMN created_at SET DEFAULT now();

-- Supabase may grant EXECUTE directly through default privileges. Revoking
-- PUBLIC alone does not remove those grants from these service-only functions.
REVOKE ALL ON FUNCTION public.claim_inquiry_telegram_alert(uuid),
  public.mark_inquiry_telegram_alert_sent(uuid,uuid), public.release_inquiry_telegram_alert(uuid,uuid),
  public.claim_inquiry_message_telegram_alert(uuid), public.mark_inquiry_message_telegram_alert_sent(uuid,uuid),
  public.release_inquiry_message_telegram_alert(uuid,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_inquiry_telegram_alert(uuid),
  public.mark_inquiry_telegram_alert_sent(uuid,uuid), public.release_inquiry_telegram_alert(uuid,uuid),
  public.claim_inquiry_message_telegram_alert(uuid), public.mark_inquiry_message_telegram_alert_sent(uuid,uuid),
  public.release_inquiry_message_telegram_alert(uuid,uuid) TO service_role;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION public.is_support_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users AS u
    JOIN public.support_admins AS a ON lower(a.email) = lower(u.email)
    WHERE u.id = (SELECT auth.uid()) AND u.email_confirmed_at IS NOT NULL
  );
$$;
REVOKE ALL ON FUNCTION public.is_support_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_support_admin() TO authenticated;

CREATE OR REPLACE FUNCTION private.is_stimemc_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT public.is_support_admin();
$$;
REVOKE ALL ON FUNCTION private.is_stimemc_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_stimemc_admin() TO authenticated;

-- Remove all prior permissive policies on these app-owned tables, including
-- policies with legacy names: permissive RLS policies are combined with OR.
DO $$ DECLARE p record; BEGIN
  FOR p IN SELECT schemaname, tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN
      ('reports','inquiries','inquiry_messages','join_requests','support_admins')
  LOOP EXECUTE format('DROP POLICY %I ON %I.%I',p.policyname,p.schemaname,p.tablename); END LOOP;
END $$;

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_admins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.reports, public.inquiries, public.inquiry_messages,
  public.join_requests, public.support_admins FROM PUBLIC, anon, authenticated;

GRANT SELECT ON public.reports TO anon, authenticated;
GRANT INSERT (slug,content), UPDATE (slug,content), DELETE ON public.reports TO authenticated;
CREATE POLICY reports_public_read ON public.reports FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY reports_admin_insert ON public.reports FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_support_admin()));
CREATE POLICY reports_admin_update ON public.reports FOR UPDATE TO authenticated USING ((SELECT public.is_support_admin())) WITH CHECK ((SELECT public.is_support_admin()));
CREATE POLICY reports_admin_delete ON public.reports FOR DELETE TO authenticated USING ((SELECT public.is_support_admin()));

GRANT SELECT ON public.inquiries, public.inquiry_messages TO authenticated;
GRANT UPDATE (status), DELETE ON public.inquiries TO authenticated;
GRANT INSERT (inquiry_id,sender,message) ON public.inquiry_messages TO authenticated;
CREATE POLICY inquiries_read ON public.inquiries FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_support_admin()));
CREATE POLICY inquiries_status ON public.inquiries FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_support_admin()))
  WITH CHECK ((user_id = (SELECT auth.uid()) AND status = 'open') OR (SELECT public.is_support_admin()));
CREATE POLICY inquiries_admin_delete ON public.inquiries FOR DELETE TO authenticated USING ((SELECT public.is_support_admin()));
CREATE POLICY messages_read ON public.inquiry_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.inquiries i WHERE i.id = inquiry_id AND
    (i.user_id = (SELECT auth.uid()) OR (SELECT public.is_support_admin())))
);
CREATE POLICY messages_insert ON public.inquiry_messages FOR INSERT TO authenticated WITH CHECK (
  (sender = 'admin' AND (SELECT public.is_support_admin())) OR
  (sender = 'user' AND EXISTS (SELECT 1 FROM public.inquiries i WHERE i.id = inquiry_id AND i.user_id = (SELECT auth.uid())))
);

GRANT INSERT (edition,minecraft_nickname,inviter_name,contact,rules_agreed,privacy_agreed) ON public.join_requests TO anon, authenticated;
GRANT SELECT, DELETE ON public.join_requests TO authenticated;
CREATE POLICY join_submit ON public.join_requests FOR INSERT TO anon, authenticated WITH CHECK (rules_agreed AND privacy_agreed);
CREATE POLICY join_admin_read ON public.join_requests FOR SELECT TO authenticated USING ((SELECT public.is_support_admin()));
CREATE POLICY join_admin_delete ON public.join_requests FOR DELETE TO authenticated USING ((SELECT public.is_support_admin()));

CREATE OR REPLACE FUNCTION public.get_stimemc_join_requests()
RETURNS SETOF public.join_requests LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT r.* FROM public.join_requests r WHERE public.is_support_admin() ORDER BY r.created_at DESC;
$$;
CREATE OR REPLACE FUNCTION public.complete_stimemc_join_request(request_id uuid)
RETURNS boolean LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = '' AS $$
  WITH deleted AS (DELETE FROM public.join_requests WHERE id = $1 AND public.is_support_admin() RETURNING 1)
  SELECT EXISTS (SELECT 1 FROM deleted);
$$;
REVOKE ALL ON FUNCTION public.get_stimemc_join_requests(), public.complete_stimemc_join_request(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_stimemc_join_requests(), public.complete_stimemc_join_request(uuid) TO authenticated;

-- NOT VALID preserves older rows while enforcing constraints for every new write.
ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_valid_input;
ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_valid_input CHECK (
  char_length(btrim(nickname)) BETWEEN 1 AND 80 AND status IN ('open','replied')
) NOT VALID;
ALTER TABLE public.inquiry_messages DROP CONSTRAINT IF EXISTS messages_valid_input;
ALTER TABLE public.inquiry_messages ADD CONSTRAINT messages_valid_input CHECK (
  inquiry_id IS NOT NULL AND sender IN ('user','admin') AND char_length(btrim(message)) BETWEEN 1 AND 12000
) NOT VALID;
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_valid_input;
ALTER TABLE public.reports ADD CONSTRAINT reports_valid_input CHECK (
  char_length(slug) BETWEEN 1 AND 200
  AND slug ~ '^[A-Za-z0-9가-힣_-]+(/[A-Za-z0-9가-힣_-]+)*$'
  AND lower(split_part(slug,'/',1)) NOT IN ('api','_next','auth','taskboard','support','join','news','rules','history','updates','recovery-guidelines','server-mechanism')
  AND char_length(btrim(content)) BETWEEN 1 AND 200000
) NOT VALID;
ALTER TABLE public.join_requests DROP CONSTRAINT IF EXISTS join_requests_safe_nickname;
ALTER TABLE public.join_requests ADD CONSTRAINT join_requests_safe_nickname CHECK (
  (edition = 'java' AND minecraft_nickname ~ '^[A-Za-z0-9_]{3,16}$') OR
  (edition = 'bedrock' AND char_length(btrim(minecraft_nickname)) BETWEEN 1 AND 32
    AND minecraft_nickname !~ '[[:cntrl:]"\\]')
) NOT VALID;

-- Initialize once with recent activity so deployment does not reset quotas.
DO $$ BEGIN
  IF to_regclass('private.request_events') IS NULL THEN
    CREATE TABLE private.request_events(key text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
    CREATE INDEX request_events_key_time ON private.request_events(key,created_at);
    CREATE INDEX request_events_time ON private.request_events(created_at);
    INSERT INTO private.request_events(key,created_at)
      SELECT md5('guest-create:ip:' || btrim(guest_ip)),created_at FROM public.inquiries
      WHERE user_id IS NULL AND guest_ip IS NOT NULL AND created_at >= now() - interval '1 hour';
    INSERT INTO private.request_events(key,created_at)
      SELECT md5('message:' || inquiry_id::text),created_at FROM public.inquiry_messages
      WHERE sender='user' AND created_at >= now() - interval '10 minutes';
  END IF;
END $$;
REVOKE ALL ON private.request_events FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION private.consume_limit(scope text, actor text, maximum integer, seconds integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE actor_key text := md5(scope || ':' || actor);
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(actor_key,0));
  DELETE FROM private.request_events WHERE created_at < now() - interval '1 day';
  IF (SELECT count(*) FROM private.request_events WHERE key=actor_key
      AND created_at >= now() - make_interval(secs => seconds)) >= maximum THEN
    RAISE EXCEPTION 'Request limit exceeded' USING ERRCODE = 'P0001';
  END IF;
  INSERT INTO private.request_events(key) VALUES (actor_key);
END;
$$;
REVOKE ALL ON FUNCTION private.consume_limit(text,text,integer,integer) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION private.request_actor()
RETURNS text LANGUAGE sql STABLE SET search_path = '' AS $$
  SELECT coalesce(auth.uid()::text, 'ip:' || btrim(split_part(coalesce(
    nullif(current_setting('request.headers',true),'')::jsonb ->> 'x-forwarded-for','unknown'),',',1)));
$$;
REVOKE ALL ON FUNCTION private.request_actor() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.validate_inquiry(nickname text, inquiry_type text, content text, purpose text)
RETURNS void LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF nickname IS NULL OR inquiry_type IS NULL OR content IS NULL OR purpose IS NULL
    OR char_length(btrim(nickname)) NOT BETWEEN 1 AND 80
    OR char_length(btrim(inquiry_type)) NOT BETWEEN 1 AND 80
    OR char_length(btrim(content)) NOT BETWEEN 1 AND 8000
    OR char_length(btrim(purpose)) NOT BETWEEN 1 AND 2000 THEN
    RAISE EXCEPTION 'Invalid inquiry fields' USING ERRCODE = '22023';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION private.validate_inquiry(text,text,text,text) FROM PUBLIC, anon, authenticated;

-- Replace guest RPC composite results so internal IPs/notification claim tokens
-- never appear in browser responses. The visible fields remain unchanged.
DROP FUNCTION IF EXISTS public.create_guest_inquiry(text,text,text,text);
CREATE FUNCTION public.create_guest_inquiry(p_nickname text,p_inquiry_type text,p_content text,p_purpose text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE r public.inquiries;
BEGIN
  PERFORM private.validate_inquiry(p_nickname,p_inquiry_type,p_content,p_purpose);
  PERFORM private.consume_limit('guest-create',private.request_actor(),3,3600);
  INSERT INTO public.inquiries(user_id,nickname,inquiry_code,status)
    VALUES (NULL,btrim(p_nickname),'STM-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,18)),'open') RETURNING * INTO r;
  INSERT INTO public.inquiry_messages(inquiry_id,sender,message) VALUES
    (r.id,'user','[문의 유형] ' || btrim(p_inquiry_type) || E'\n[문의 내용]\n' || btrim(p_content) || E'\n\n[문의 목적]\n' || btrim(p_purpose));
  RETURN jsonb_build_object('id',r.id,'user_id',r.user_id,'nickname',r.nickname,'inquiry_code',r.inquiry_code,'status',r.status,'created_at',r.created_at);
END;
$$;

CREATE OR REPLACE FUNCTION public.create_member_inquiry(p_nickname text,p_inquiry_type text,p_content text,p_purpose text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE r public.inquiries; member_id uuid := auth.uid();
BEGIN
  IF member_id IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
  PERFORM private.validate_inquiry(p_nickname,p_inquiry_type,p_content,p_purpose);
  -- Serialize the rolling one-hour check, including pre-migration inquiries.
  PERFORM pg_advisory_xact_lock(hashtextextended('member-create:' || member_id::text,0));
  IF (SELECT count(*) FROM public.inquiries WHERE user_id = member_id AND created_at >= now() - interval '1 hour') >= 3 THEN
    RAISE EXCEPTION 'Request limit exceeded' USING ERRCODE = 'P0001';
  END IF;
  INSERT INTO public.inquiries(user_id,nickname,inquiry_code,status)
    VALUES (member_id,btrim(p_nickname),'STM-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,18)),'open') RETURNING * INTO r;
  INSERT INTO public.inquiry_messages(inquiry_id,sender,message) VALUES
    (r.id,'user','[문의 유형] ' || btrim(p_inquiry_type) || E'\n[문의 내용]\n' || btrim(p_content) || E'\n\n[문의 목적]\n' || btrim(p_purpose));
  RETURN jsonb_build_object('id',r.id,'user_id',r.user_id,'nickname',r.nickname,'inquiry_code',r.inquiry_code,'status',r.status,'created_at',r.created_at);
END;
$$;

DROP FUNCTION IF EXISTS public.get_guest_inquiry(text);
CREATE FUNCTION public.get_guest_inquiry(p_inquiry_code text)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  SELECT jsonb_build_object('id',id,'user_id',user_id,'nickname',nickname,'inquiry_code',inquiry_code,'status',status,'created_at',created_at)
  FROM public.inquiries WHERE user_id IS NULL AND inquiry_code = upper(btrim(p_inquiry_code)) LIMIT 1;
$$;
DROP FUNCTION IF EXISTS public.get_guest_inquiry_messages(text);
CREATE FUNCTION public.get_guest_inquiry_messages(p_inquiry_code text)
RETURNS TABLE(id uuid,inquiry_id uuid,sender text,message text,created_at timestamptz)
LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  SELECT m.id,m.inquiry_id,m.sender,m.message,m.created_at FROM public.inquiry_messages m
  JOIN public.inquiries i ON i.id=m.inquiry_id WHERE i.user_id IS NULL AND i.inquiry_code=upper(btrim(p_inquiry_code))
  ORDER BY m.created_at ASC;
$$;
DROP FUNCTION IF EXISTS public.send_guest_inquiry_message(text,text);
CREATE FUNCTION public.send_guest_inquiry_message(p_inquiry_code text,p_message text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE inquiry uuid; m public.inquiry_messages;
BEGIN
  IF p_message IS NULL OR char_length(btrim(p_message)) NOT BETWEEN 1 AND 12000 THEN
    RAISE EXCEPTION 'Invalid message' USING ERRCODE = '22023';
  END IF;
  SELECT id INTO inquiry FROM public.inquiries WHERE user_id IS NULL AND inquiry_code=upper(btrim(p_inquiry_code));
  IF inquiry IS NULL THEN RAISE EXCEPTION 'Invalid inquiry' USING ERRCODE = '22023'; END IF;
  INSERT INTO public.inquiry_messages(inquiry_id,sender,message) VALUES (inquiry,'user',btrim(p_message)) RETURNING * INTO m;
  RETURN jsonb_build_object('id',m.id,'inquiry_id',m.inquiry_id,'sender',m.sender,'message',m.message,'created_at',m.created_at);
END;
$$;
REVOKE ALL ON FUNCTION public.create_guest_inquiry(text,text,text,text),public.get_guest_inquiry(text),public.get_guest_inquiry_messages(text),public.send_guest_inquiry_message(text,text),public.create_member_inquiry(text,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.create_guest_inquiry(text,text,text,text),public.get_guest_inquiry(text),public.get_guest_inquiry_messages(text),public.send_guest_inquiry_message(text,text) TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.create_member_inquiry(text,text,text,text) TO authenticated;

-- Limits apply to direct authenticated inserts as well as guest RPCs. Status
-- updates share the message transaction, so failed writes never leave stale state.
CREATE OR REPLACE FUNCTION private.guard_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NEW.sender = 'user' THEN
    PERFORM private.consume_limit('message',NEW.inquiry_id::text,30,600);
  END IF;
  UPDATE public.inquiries SET status = CASE WHEN NEW.sender='admin' THEN 'replied' ELSE 'open' END,
    updated_at=now() WHERE id=NEW.inquiry_id;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.guard_message() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS guard_message ON public.inquiry_messages;
CREATE TRIGGER guard_message AFTER INSERT ON public.inquiry_messages FOR EACH ROW EXECUTE FUNCTION private.guard_message();

CREATE OR REPLACE FUNCTION private.guard_join_request()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM private.consume_limit('join-submit',private.request_actor(),5,3600);
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.guard_join_request() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS guard_join_request ON public.join_requests;
CREATE TRIGGER guard_join_request BEFORE INSERT ON public.join_requests FOR EACH ROW EXECUTE FUNCTION private.guard_join_request();

-- A fresh schema is generated with these same policies. No realtime publication
-- is dropped here; existing subscriptions and unrelated tables remain intact.
NOTIFY pgrst, 'reload schema';
COMMIT;
