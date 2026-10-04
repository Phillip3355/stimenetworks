-- Read-only checks: returns counts, never row contents or secret tokens.
SELECT 'inquiries_invalid_nickname_or_status' AS check_name, count(*) AS affected_rows
FROM public.inquiries WHERE char_length(btrim(nickname)) NOT BETWEEN 1 AND 80 OR status NOT IN ('open','replied');
SELECT 'confirmed_administrators' AS check_name, count(*) AS affected_rows
FROM public.support_admins a JOIN auth.users u ON lower(a.email)=lower(u.email) WHERE u.email_confirmed_at IS NOT NULL;
SELECT 'required_tables' AS check_name, tablename FROM pg_tables WHERE schemaname='public'
AND tablename IN ('inquiries','inquiry_messages','reports','support_admins');
