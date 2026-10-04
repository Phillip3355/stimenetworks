-- Removes the retired server join request feature and all stored applications.
BEGIN;

DROP FUNCTION IF EXISTS public.get_stimemc_join_requests();
DROP FUNCTION IF EXISTS public.complete_stimemc_join_request(uuid);
-- Dropping the table also removes its policies, indexes and trigger.
DROP TABLE IF EXISTS public.join_requests;
DROP FUNCTION IF EXISTS private.guard_join_request();
DROP FUNCTION IF EXISTS private.is_stimemc_admin();

NOTIFY pgrst, 'reload schema';
COMMIT;
