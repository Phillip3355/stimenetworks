BEGIN;

-- Next.js paths are case-sensitive: /News is a published report, /news is
-- the archive. Keep existing report links editable without renaming them.
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_valid_input;
ALTER TABLE public.reports ADD CONSTRAINT reports_valid_input CHECK (
  char_length(slug) BETWEEN 1 AND 200
  AND slug ~ '^[A-Za-z0-9가-힣_-]+(/[A-Za-z0-9가-힣_-]+)*$'
  AND split_part(slug,'/',1) NOT IN ('api','_next','auth','taskboard','support','join','news','rules','history','updates','recovery-guidelines','server-mechanism')
  AND char_length(btrim(content)) BETWEEN 1 AND 200000
) NOT VALID;

COMMIT;
