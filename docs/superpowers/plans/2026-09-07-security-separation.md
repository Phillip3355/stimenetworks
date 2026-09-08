# Security and application boundary cleanup

Goal: preserve public pages, Google login, member/guest inquiries, admin replies,
join applications, reports and Telegram alerts while enforcing authorization in
Postgres and separating browser, server and shared code.

The existing Next.js + Supabase architecture remains. A separate backend deploy
would add operational complexity without fixing direct database permissions.
Use `app/client` for browser access, `app/server` for server-only services,
`app/shared` for pure validation/presentation, and `database` for SQL.

Constraints: never access `.env.local`; preserve submitted data; do not deploy or
claim the live database is fixed without an authenticated database connection.
Verify builds in an isolated directory containing no environment files and only
dummy public Supabase configuration. Do not send actual notifications in tests.

- [x] Add failing regressions for unauthenticated alerts and unsafe input.
- [x] Protect alert requests with member ownership or guest code verification,
      bounded JSON, origin checks and no-store responses before privileged calls.
- [x] Separate browser/server Supabase clients and shared helpers; remove dead
      voice management and the unsafe ad-hoc production database test script.
- [x] Harden reports, inquiries, messages and join applications in a repeatable
      migration: authoritative confirmed admin identity, sender restrictions,
      immutable security columns, bounded input and transactional quotas.
- [x] Move member inquiry creation into an atomic database RPC; keep guest flows
      and realtime. Use the database administrator decision in all clients.
- [x] Update vulnerable dependencies, add compatible response security headers.
- [x] Run behavior tests, embedded Postgres authorization tests, lint, type check,
      isolated production build, and a redacted source/history secret scan.
- [x] Document findings, database application order, remaining live checks and
      deployment requirements in the repository.

Local implementation and verification complete. Live SQL application, deployment, and historical Telegram token rotation remain external actions; see README and the security report.
