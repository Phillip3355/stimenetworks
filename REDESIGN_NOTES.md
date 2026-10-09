# StimeMC Redesign Preservation Notes

The approved redesign specification is `docs/superpowers/specs/2026-10-09-stimemc-server-group-redesign.md`. These notes describe the current application, not removed signup or voice features.

## Current functions

The application uses Next.js App Router, Supabase and existing Framer Motion. Public information includes home, Join guidance, mechanism, rules, recovery, website updates, news, history and Markdown reports. The redesign adds a server hub and details for The Great War and planned Survival.

Support offers Google OAuth member inquiries and guest inquiries identified by a private inquiry code. Members and authorized administrators can read and reply to their permitted conversations. Guest access stays scoped to the matching guest inquiry. Taskboard manages authorized inquiry responses and report publication. Telegram inquiry notifications use the existing server-side authorization and atomic claim contracts.

There is no current signup-request form or voice/STAGE UI. Legacy join-request storage is removed by the existing migrations. Do not restore those features or describe them as current.

## Preserve these contracts

Keep `/`, `/join`, `/support`, `/taskboard`, `/auth/callback`, `/server-mechanism`, `/rules`, `/recovery-guidelines`, `/updates`, `/news`, `/history`, existing report slugs and inquiry alert API routes. `/News` is a historical report slug with uppercase N; never normalize it to `/news`. New static `/servers`, `/servers/the-great-war` and `/servers/survival` routes take precedence over the report catch-all.

Preserve report Markdown and historical text. Rule, punishment, appeal and recovery meanings stay unchanged. No new war exceptions or invented Survival policy may be inferred from old rules. Existing 1.21.1 guidance remains identified as the previously published connection guide.

Preserve Supabase schema, RLS, RPCs, realtime subscriptions, inquiry codes, member/guest ownership, rolling three-per-hour limits, admin authorization, report publishing and notification claiming. UI visibility does not replace database authorization. Preserve OAuth destination validation, support/admin routing and client/server secret separation.

Maintain Korean and English UI text, including empty/error states. Keep mobile support list-to-conversation transitions, back navigation and message scrolling. Retain the language provider, analytics and Speed Insights in the root layout.

## Shared server truth

Use `app/shared/serverGroup.mjs` for all new server panels, details and Join decisions. The Great War is current/preparing; Survival is planned/planned. Both have Java and Bedrock editions, Geyser crossplay and no client-mod requirement. Release, version and connection remain null until facts are confirmed.

The eligibility helper conceals any supplied address for planned or preparing servers. Future active/current connection publication uses `connection.java = { address }` and `connection.bedrock = { address, port }`. Unsupported editions and incomplete data never enable Copy. A Bedrock port must be an integer between 1 and 65535. Test fixture addresses never become actual server data.

Keep reusable legacy homepage exports during the staged redesign until their consumers are replaced. Existing archive screenshots are historical records, not evidence of either new server’s map or systems.

## Verification boundaries

Do not open, read, print, copy or modify `.env.local`, and do not create an environment file in the isolated worktree. Use dummy public configuration for preview and builds. Never submit production inquiries, send real external messages, change production data or deploy as verification.

Baseline is commit b8007b4 with 69 passing tests. Preserve existing security/functionality tests. Replace tests that intentionally pin retired visual/copy decisions only when the corresponding consumer changes. Eligibility gate tests use hand-written planned/preparing/active fixtures and RED/GREEN evidence. Run the whole test suite and lint, then check types, isolated production build and responsive behavior as appropriate to the integrated redesign.
