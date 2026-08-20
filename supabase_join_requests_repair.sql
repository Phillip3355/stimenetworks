BEGIN;

-- Run this once in the Supabase SQL Editor for an existing installation.
-- It replaces only the administrator read/delete checks; submitted rows remain intact.
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_stimemc_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = (SELECT auth.uid())
      AND lower(coalesce(email, '')) IN (
        'cwj120408@gmail.com',
        'kimjc.120211@gmail.com'
      )
  );
$$;

REVOKE ALL ON FUNCTION private.is_stimemc_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_stimemc_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_stimemc_join_requests()
RETURNS SETOF public.join_requests
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT request.*
  FROM public.join_requests AS request
  WHERE private.is_stimemc_admin()
  ORDER BY request.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.complete_stimemc_join_request(request_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH deleted AS (
    DELETE FROM public.join_requests AS request
    WHERE request.id = $1
      AND private.is_stimemc_admin()
    RETURNING 1
  )
  SELECT EXISTS (SELECT 1 FROM deleted);
$$;

REVOKE ALL ON FUNCTION public.get_stimemc_join_requests() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.complete_stimemc_join_request(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_stimemc_join_requests() TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_stimemc_join_request(UUID) TO authenticated;

GRANT SELECT, DELETE ON TABLE public.join_requests TO authenticated;

DROP POLICY IF EXISTS "StimeMC admins can read join requests" ON public.join_requests;
CREATE POLICY "StimeMC admins can read join requests"
  ON public.join_requests
  FOR SELECT
  TO authenticated
  USING ((SELECT private.is_stimemc_admin()));

DROP POLICY IF EXISTS "StimeMC admins can delete join requests" ON public.join_requests;
CREATE POLICY "StimeMC admins can delete join requests"
  ON public.join_requests
  FOR DELETE
  TO authenticated
  USING ((SELECT private.is_stimemc_admin()));

NOTIFY pgrst, 'reload schema';

COMMIT;
