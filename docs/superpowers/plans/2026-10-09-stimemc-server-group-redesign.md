# StimeMC Server Group Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved responsive StimeMC server-group redesign with prominent Geyser crossplay motion and preserved existing functionality.

**Architecture:** Keep Next App Router, CSS Modules and Framer Motion. A shared registry drives server visibility and Join behavior; brand shell and focused motion components serve every device. Existing reports, support, policies and historic URLs remain intact.

**Tech Stack:** Next.js 16.3.4, React 19.2.8, Framer Motion 12.35.2, CSS Modules, current Supabase integration.

**Spec:** `docs/superpowers/specs/2026-10-09-stimemc-server-group-redesign.md`.

## Global Constraints

- StimeMC is the parent Minecraft server group; show only THE GREAT WAR and SURVIVAL.
- Great War: CURRENT, operating preparation, no fabricated systems/address/version/live metrics. Survival: PLANNED / COMING LATER, date and version undecided.
- Geyser Java × Bedrock crossplay is a shared primary feature of every StimeMC server. Survival remains clearly planned.
- Keep existing URLs including case-sensitive report `/News`, historical report text, rule and recovery policy meaning, member/guest support, OAuth, admin and security contracts.
- Never read, print, copy or edit `.env.local`. Use a worktree without environment files and dummy public config for verification. No production writes, message sends or deployment.
- Dark teal/blue/mint brand; rectangular world panels, typography, thin borders. Real images are archive images unless server provenance is verified. No fabricated Survival screenshot.
- Mobile/tablet/desktop equal: touch targets ≥44px, no hover-only information, reduced-motion, safe-area, native scroll. No WebGL/new heavy dependencies.
- Preserve existing code and security tests; remove only outdated tests that pin intentionally replaced visual/copy decisions. Add meaningful behavior tests for eligibility gates.

## Review Focus

1. Planned or preparing server with leaked address data: never offer direct Join/Copy as playable.
2. 320px and tablet rotation: header, status, CTA, tabs and menus remain usable without horizontal overflow.
3. Keyboard/reduced motion: all essential information is visible without reveals; menu traps and returns focus.
4. Missing news data: show accurate empty/error state; do not fabricate posts or assign unsupported server tags.
5. Legacy policy/version/screenshots: do not silently apply them to the new war server or planned Survival.

### Task 1: Shared registry, brand shell and server navigation

**Files:** Create `app/shared/serverGroup.mjs`, `tests/server-group.test.mjs`, `app/components/MotionProvider.tsx`; modify `app/shared/siteContent.mjs`, `app/styles/main.css`, `app/components/Navbar.tsx`, `app/styles/navbar.module.css`, `app/components/Footer.tsx`, `app/layout.tsx`, `tests/site-content.test.mjs`, `DESIGN.md`, `REDESIGN_NOTES.md`.

**Interfaces:** Produces `brandProfile`, `servers`, `getServerBySlug(slug)`, `getConnectionPresentation(server, edition, language='ko')` from serverGroup.mjs. Each server has id/slug/name, lifecycle current|planned, status preparing|planned, type, descriptionKo/En, directionKo/En string arrays, editions, crossplay='Geyser', clientModRequired=false, href, connection=null, release=null, version=null. `getConnectionPresentation` returns `{state: 'planned'|'preparing'|'unpublished'|'ready'|'unsupported', address: string|null, port: number|null, canCopy: boolean}`. It exposes connection values only when lifecycle=current, status=active, connection data exists for the requested edition; otherwise values null and canCopy=false. Future active data fixtures are allowed in tests, never rendered as actual current data.

- [ ] Write tests via namespace import so missing helper fails an assertion, not module import. Hand fixtures: planned with supplied address yields planned/null/false; preparing with supplied address yields preparing/null/false; active Java with address yields ready/address/true; active Bedrock requires both address and valid port; unsupported edition yields unsupported/null/false. Unknown slug returns undefined.
- [ ] Run `node --test tests/server-group.test.mjs`; expect assertion failures for missing implementation. Implement the minimal registry/gates; rerun, expect pass.
- [ ] Revise shared brand/navigation data: Servers, News, Guide, About, Join; all prior public routes exposed. Remove old One World brand messaging; keep history and rule nodes unchanged. Leave reusable exports consumed by untouched legacy components until Task 2 decides whether to remove them.
- [ ] Update tokens to the spec palette, focus/skip link/touch-target styles, Footer group copy and responsive navigation. Keep StimeMC name visible at 320px, Join visible outside menu, KO/EN control and menu keyboard/scroll-lock behavior. Disable unrelated background content while modal menu is open without breaking focus return.
- [ ] Add reduced-motion provider plus honest per-page root metadata and viewport safe-area support. Preserve analytics and existing support/auth integrations.
- [ ] Rewrite DESIGN.md and stale REDESIGN_NOTES.md around actual current functions and approved spec. Update tests that freeze old navigation/copy choices; keep behavioral route coverage and policy invariants.
- [ ] Run whole `npm test` and targeted lint of changed code; read output; commit only owned files. Report baseline→head, test evidence and concerns.

### Task 2: Homepage, server pages and Geyser motion

**Files:** Modify `app/page.tsx`, `app/components/Hero.tsx`, `app/styles/hero.module.css`; create focused components such as `ServerWorlds.tsx`, `CrossplayBridge.tsx`, `HomeArchive.tsx`, `HomeNews.tsx`, `ServerDetail.tsx`, and matching CSS Modules; create `/servers`, `/servers/the-great-war`, `/servers/survival`; update obsolete home content/motion tests and unused exports as appropriate.

**Interfaces:** Consumes Task 1 serverGroup registry and brand tokens. HomeNews receives real report summaries `{id,slug,title,createdAt}` plus loadFailed. ServerDetail receives an existing registry server; no new game-system fields. Every shared component remains bilingual.

- [ ] Keep meaningful tests of registry eligibility and route contract; no source-code/string snapshot tests for reversible visual changes. Use browser/runtime checks for UI rather than tests that mirror JSX.
- [ ] Build short brand Hero with real archive image in a deliberate image window, large StimeMC hierarchy, English two-line community/worlds message, Korean one-line subtitle, server CTA and minimal information. Avoid an image darkened beyond recognition.
- [ ] Build the signature brand→two-worlds reveal with short desktop sticky segment, CSS responsive stack and tablet/mobile non-sticky fallback. Registry statuses always visible; semantic heading/links exist before interaction. Scroll never captured. Offscreen effects do not loop. Reduced motion shows all content immediately.
- [ ] Build prominent Geyser connection scene: Java and Bedrock converge through a labeled bridge and connect conceptually to StimeMC servers. Support reduced motion and mobile/tablet layouts. Say all servers share Geyser; distinguish planned Survival. Keep geometry conceptual, not fabricated routing infra.
- [ ] Include concise war/survival direction sections, archive using actual seven screenshots with explicit provenance labels, actual recent report summaries and final guide CTA. Server-side home query uses existing getPublishedReports; error/empty accurate. Avoid blocking page on long failing dummy network query during QA: use bounded existing query if needed without exposing credentials, or a genuine cache-safe partial streaming boundary.
- [ ] Build `/servers` hub and both detail routes from registry with common StimeMC shell, breadcrumbs, status, Geyser badge, truthful copy and guide/rule/news links. No fake war screenshot or Survival address/date. Exact existing rules remain accessible without claiming war-specific applicability.
- [ ] Use Next image `sizes`, priority only for Hero, lazy archive and reserved aspect ratios; max primary content 1400px. Render static shell/news on server where practical, isolate language/motion in clients.
- [ ] Run full `npm test`, targeted lint and type check after UI generation. Remove/update only obsolete old homepage test expectations. Commit owned code; report screenshots/QA unavailable until integrated review rather than claiming all devices tested.

### Task 3: Existing information and functional pages

**Files:** Modify Join, Rules, Recovery, Technology, History, NewsArchive, Updates and report visual files; create shared guide components/styles and page metadata layouts where required. Support/Taskboard/Auth styles may be adjusted to the common system but their request/auth/data handlers remain intact. Add no schema migration.

**Interfaces:** Consumes registry gate and brand tokens; preserves getRuleDetail/ruleMindMap original policy, historyEntries, getPublishedReports, reportPresentation and support contracts. Join has accessible edition tabs; connection presentation never emits null/fake values as Copy controls.

- [ ] Use existing full suite for support/security invariants. Add behavior tests only if changing eligibility or other meaningful logic; run RED first. No snapshot/source tests for simple reskin.
- [ ] Redesign Join as server state first, Java/Bedrock tabs and clearly identified legacy public guide. Planned/current preparation shown honestly; absent addresses have no fabricated Copy button. On future eligible published addresses use separate accessible address/port copy feedback with fallback/error feedback.
- [ ] Rules: preserve every node, examples, punishment and reporting text. Display existing rules scope and war-specific rules unpublished; provide server filter with accurate pending state and mobile accordion. Recovery: same policies and 6-hour meaning, clear existing-policy scope and future server separation, no invented exceptions.
- [ ] Technology: remove One World brand headline, showcase shared Geyser motion/concept and keep actual ViaProxy/Geyser/current 1.21.1 reference as documented existing implementation. No fake group proxy routing. History: preserve all original entries and explain brand direction separately without inventing dates; mobile vertical timeline.
- [ ] News/report/updates: cohesive layouts, actual dates and content, legacy article URL preserved, updates labeled website updates. Metadata fits each page. Markdown tables/code overflow contained. No fabricated snippets or server categories.
- [ ] Support/Admin/Auth: shared dark teal surfaces/readable controls, safe-area, responsive forms/chat. Keep member/guest creation/lookup/replies, mobile navigation and admin routing. Do not modify server/client/security/database contracts.
- [ ] Complete all production checks: whole npm test, lint, type check and environment-free `npm run verify:build`. Record real output and commit owned files.

### Task 4: Integrated verification and independent review

**Files:** Verification evidence in `docs/stimemc-redesign-validation-2026-10-09.md`; development scripts only if required for reliable env-free preview. No changes to secret files.

- [ ] Prepare an environment-file-free preview/build with dummy public Supabase config. Confirm startup project directory contains no env file. Do not reuse production credentials or submit operational forms.
- [ ] Verify real DOM viewport for every requested size: 1920×1080, 1440×900, 1366×768, 1280×800, 1024×1366, 1366×1024, 800×1280, 768×1024, 430×932, 390×844, 360×800 and 320px. Browser controller limitation must be recorded if exact dimensions unavailable.
- [ ] Inspect homepage and all public routes, keyboard menu, Java/Bedrock tabs, rules accordions, planned/preparing states, reduced-motion and tablet orientation. Record horizontal overflow, header/title/CTA, touch, scroll and image behavior.
- [ ] Run current full tests/lint/build and isolated smoke routes. Record missing Safari/Android real-device surface honestly. Save desktop/mobile result screenshots as user-visible artifacts.
- [ ] Generate whole-branch review package and dispatch a fresh reviewer under requesting-code-review. Resolve actionable defects, verify affected behavior and final checks. Leave all changes on codex/stimemc-server-group; no push/deploy/merge.
