# StimeMC Light Redesign Notes

Updated 2026-10-10. The latest white design brief replaces all earlier visual directions. `DESIGN.md` describes the current system; `app/styles/main.css` is authoritative for live tokens.

## What changed

The interface now uses white/light surfaces, Inter for all headings and prose, Geist Mono for technical details, black primary actions, restrained mint indicators, 8px controls and 12px panels. The homepage has centered text above a wide archival image and white server panels. Information pages use the shared three-column `DocsLayout` with route filtering and anchored TOC; narrow screens use native disclosures. Support and administration have dedicated portal and workspace layouts. The mechanism page uses the compact crossplay diagram. Footer groups become native mobile accordions.

History, updates, news and Markdown reports retain their original records. News has preserved empty/error handling, and report code/table regions scroll within the reading column. Join, policy, support and taskboard layouts change presentation while keeping their existing handlers and access boundaries.

## Preserved contracts

- Keep all public and operational routes, report slugs and inquiry alert APIs. `/News` is a case-sensitive historical report route distinct from `/news`. Static server routes take precedence over the report catchall.
- Preserve historical text, report Markdown, rule/punishment/appeal/recovery meanings and Korean/English UI, including unavailable/error states. Previously published Java 1.21.1 instructions remain historical guidance.
- Keep the server registry factual: The Great War is current/preparing; Survival is planned/coming later. Neither implies online access. Null release/version/connection data stays unpublished. Archive images remain explicitly historical.
- Preserve Supabase schema, RLS/RPC authorization, realtime conversations, guest inquiry codes, member ownership, rate limits, administrator authorization, report publishing and atomic notification claims. UI visibility never substitutes for backend authorization.
- Preserve Google OAuth destination validation, member/guest support, mobile list/conversation transitions and message scrolling. Keep the language provider, analytics and Speed Insights. No signup-request or voice/STAGE workflow is introduced.
- Copy is enabled only for eligible current/active servers with complete published edition data. Bedrock requires an address and an integer port from 1 to 65535. Fixtures are never published as actual connection details.

## Verification record

The responsive follow-up raises tiny metadata/captions to at least 12px, restores 44px mobile/touch targets, darkens muted labels for contrast, and corrects 280px card/header compositions. Conversation and report workspaces use available-width breakpoints. Content-sized numeric/arrow columns survive enlarged text; future connection copy/fallback controls span their panel. Markdown scroll regions support keyboard focus.

The device audit, enlarged-text checks, short-dialog/fold-resize checks and synthetic member/admin states are recorded in `docs/verification/stimemc-responsive-2026-10-10`. Browser device ratios are emulations; physical-device and unavailable-browser testing must not be implied.

Conversation scrolling positions a newly opened stacked panel below the fixed header, then scrolls only its message feed. The composer remains visible on portrait phones; message updates preserve the outer page position.

Evidence is stored in `docs/verification/stimemc-light-2026-10-10`, including screenshots, content/backend baselines and functional fixture results. Fixtures document controlled UI states, not production activity. Use recorded lint, type, test, isolated-build and browser results when reporting completion; do not carry forward old baseline counts or unverified device claims.

Do not open, read, print, copy or modify `.env.local`. Preview/build verification uses dummy public configuration without copying an environment file. Verification does not submit production inquiries, send external notifications or alter production data.
