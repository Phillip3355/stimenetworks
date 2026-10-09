# Fresh whole-branch review — StimeMC server group

Reviewed range: `a8cfac1..f9df372`, branch `codex/stimemc-server-group`.
Reviewer: final_branch_review. Read-only review; only this requested report was written. No branch/index/HEAD changes, application edits, environment-file access, operational writes, login, notifications, deployment, push or merge.

## Scope and evidence

Read the approved specification, implementation plan, DESIGN.md, REDESIGN_NOTES.md, progress ledger and final-review package; reviewed the application, style, test and verification-script changes in separate passes against the actual checkout. Inspected all three supplied screenshots and parsed the evidence JSON. The route records contain exactly 168 samples across 14 routes and all 12 required dimensions, with zero recorded overflow, clipped headings or undersized sampled buttons; the 24 transient missing-h1 samples are disclosed. The second artifact contains 12 modal, 12 historical-report, four synthetic-Markdown and two settled Taskboard samples.

The recorded 82-test/lint/type/build/security-smoke successes are prior controller/implementer evidence, not fresh executions by this reviewer. I did not repeat those suites. A focused, file-free SSR check of the actual ConnectionGuide and ServerDetail components was performed to resolve the lifecycle concern described below. It used React server rendering, TypeScript transpilation in memory, mocked language/styles/Link boundaries, and a process-local registry fixture; it did not alter real server data or contact any service.

## Strengths

- The central connection gate fails closed for planned/preparing/unsupported/incomplete data and checks valid Bedrock ports. Copy fallback handles denied or unavailable clipboard access without exposing unpublished values.
- Current content consistently identifies The Great War as preparing and Survival as planned. Geyser crossplay is prominent in the Hero, hub, detail pages and a dedicated motion scene. Archive images are clearly identified, optimized with responsive sizes, and kept separate from new-server claims.
- Original rule/history data and recovery-policy bodies are preserved; new scope notices avoid inventing war exceptions or Survival policies. Existing uppercase report slugs are passed through unchanged; static server routes use normal App Router precedence.
- Home news has a bounded read, real empty/error states and no fabricated categories. Report rendering retains the existing title extraction and Markdown plugins. The timestamp fix eliminates locale day-period variability while preserving the community time zone.
- Native guest dialogs, focus cycling/return, label associations, the menu's inert background, edition-tab keys and reduced-motion CSS/component fallbacks are concrete accessibility improvements. Support request handlers, auth/admin contracts and security/database code are unchanged in this branch.
- No new dependencies or invented operational metrics were introduced. Verification uses environment-free source copies and a read-only local fixture, with real-device and production-service limitations stated accurately.

## Issues

### Critical (must fix)

None found.

### Important (should fix)

1. **A registry-only launch update leaves public status and publication claims contradictory.**
   - Primary locations: `app/components/ConnectionGuide.tsx:42`, `app/components/ServerDetail.tsx:18`, `app/components/ServerDetail.tsx:36`.
   - Related locations: `app/components/ServerWorlds.tsx:32`, `app/components/PolicyScope.tsx:21`, `app/components/ServerDirections.tsx:16`, `app/components/CrossplayBridge.tsx:33`.
   - Each listed component treats every non-planned record as preparing, and the detail page unconditionally states that its connection information and version are unpublished. These branches never consult `status`, publication data, or the connection presentation. The problem therefore extends beyond the two deferred components in the ledger.
   - Verified trigger: promote an in-memory Survival record to `lifecycle: 'current', status: 'active'`, give it a published Java address and confirmed version/release fields, and update its descriptive copy. The real gate returns `ready` and `canCopy: true`; real Join markup simultaneously contains the address and `CURRENT / PREPARING`; real detail markup still contains both `Connection information unpublished` and `Connection information and version have not been published.` No production values were used.
   - Impact: when the explicitly supported launch transition occurs, players receive conflicting answers about whether the server can be joined and whether its published details exist. It also defeats the approved requirement that registry changes update the card, detail and Join states together. Current preparing/planned production records are correct; this is a supported-transition defect, not a present-day exposure of hidden connection data.
   - Fix: derive operational status and publication wording from the registry through a shared presentation helper, retaining separate lifecycle/status/connection concepts. Use that presentation across the hub/cards, detail, Join and crossplay/policy labels. Avoid implying live online telemetry. Check confirmed version/release values before asserting that they are undecided. Add a meaningful active-record rendering/behavior check alongside the existing helper-only gate tests, including ready and active-but-unpublished variants. Keep the actual registry records preparing/planned.

### Minor (nice to have)

1. **Expected failure diagnostic makes successful tests look noisy.**
   - `tests/telegram-inquiry-alert-route.test.mjs:201` injects the expected `telegram_request_failed` result at line 215; the production logger at `app/server/telegramInquiryAlertRoute.mjs:167` writes the warning.
   - This is unchanged baseline behavior and not a notification attempt or application regression. It can obscure unexpected future warnings in CI output.
   - Optional fix in test maintenance: capture and assert the expected warning with a scoped test mock, restoring the logger after the test. Do not silence the production diagnostic. This does not block merging.

## Deferred-item triage

- **ConnectionGuide/PolicyScope future-active hardcoding:** promoted to the Important finding above because the same defect affects every principal server surface and contradicts an explicit supported transition. The focused check demonstrates the contradiction, rather than relying on a hypothetical helper mismatch.
- **Telegram fixture diagnostic:** confirmed as existing, expected, injected-failure noise; Minor only.
- **Fixture startup failures before cleanup:** `scripts/preview-report-fixture.mjs:33` opens the stub before the `try` at line 54. Explicit cleanup would indeed be skipped by errors during copy/setup. However, this is a standalone Node CLI with no outer catch or uncaught-exception handler: those failures terminate the process and the OS closes its listener; startup after child creation is inside `try/finally`. I found no demonstrated persistent listener/child leak from the reported path. Moving resource acquisition under a single cleanup scope and adding explicit listen/spawn error handling would be reasonable optional hardening, but does not warrant a defect or merge blocker on the evidence available.

## Recommendations

Resolve the shared status/publication finding as one cohesive change, then perform focused planned/preparing/active render checks and the affected existing gate/copy tests. The current responsive composition and request/security contracts need no redesign to address it. Retain the documented verification limits when reporting completion.

## Declined to judge

Every considered behavior not independently established by this review is listed here for controller ruling:

- Actual iOS Safari, Android Chrome, Samsung Internet, physical rotation and notched-device safe-area behavior: no such device surface was available; responsive CSS and recorded desktop viewport emulation were reviewed, not treated as real-device proof.
- Runtime OS reduced-motion preference changes: no advertised emulation surface; reviewed MotionConfig, useReducedMotion and CSS fallbacks, but do not claim a runtime pass.
- Live OAuth completion, production Supabase success, authenticated member/admin interactions, operational inquiry submission/reply and post-submit guest-code notice behavior: testing them would require credentials or prohibited operational actions. Relevant changed rendering/focus code and unchanged handlers were reviewed; existing automated evidence remains the available support.
- Historical report fixture fidelity to the originally stored Markdown: the fixture is explicitly a public DOM-text capture, and no production database was read. Rendering/extraction code and separate synthetic Markdown coverage were reviewed; the fixture is not proof of byte-identical stored Markdown.
- Independent reproduction of every browser interaction and motion measurement: reviewed source, screenshots and durable measurements and ran the focused SSR check; did not duplicate the controller's completed browser/suite matrix without a concrete unresolved doubt.
- Rewriting legacy policy/history because they describe retired servers: deliberately preserved by the approved contract; the new scope/archive labels explain their context. The policy selector's retention of the labeled original reference is acceptable and is not treated as a missing filter.

## Assessment

**Ready to merge? With fixes.**

The current redesign is cohesive, truthful about today's servers, and preserves the sensitive functional contracts. Fix the verified registry-transition inconsistency before calling the approved registry-driven design complete; no Critical issues were found, and the two remaining deferred maintenance concerns are nonblocking.
