BEGIN;

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

DROP POLICY IF EXISTS "Anyone can submit a valid join request" ON public.join_requests;
CREATE POLICY "Anyone can submit a valid join request"
  ON public.join_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    edition IN ('java', 'bedrock')
    AND char_length(btrim(minecraft_nickname)) BETWEEN 1 AND 32
    AND char_length(btrim(inviter_name)) BETWEEN 1 AND 80
    AND char_length(btrim(contact)) BETWEEN 2 AND 120
    AND rules_agreed = TRUE
    AND privacy_agreed = TRUE
  );

DROP POLICY IF EXISTS "StimeMC admins can read join requests" ON public.join_requests;
CREATE POLICY "StimeMC admins can read join requests"
  ON public.join_requests
  FOR SELECT
  TO authenticated
  USING (
    lower(coalesce(auth.jwt() ->> 'email', '')) IN (
      'cwj120408@gmail.com',
      'kimjc.120211@gmail.com'
    )
  );

DROP POLICY IF EXISTS "StimeMC admins can delete join requests" ON public.join_requests;
CREATE POLICY "StimeMC admins can delete join requests"
  ON public.join_requests
  FOR DELETE
  TO authenticated
  USING (
    lower(coalesce(auth.jwt() ->> 'email', '')) IN (
      'cwj120408@gmail.com',
      'kimjc.120211@gmail.com'
    )
  );

COMMIT;
