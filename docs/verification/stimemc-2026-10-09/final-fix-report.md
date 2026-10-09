# Final-review fix wave

Worktree: `C:\Users\hhajj\.codex\worktrees\stimemc-server-group\vibecode`.
Branch/base: `codex/stimemc-server-group`, `f9df372`.
Application commit: `27c37a0134c7178e371f1e392cae40bd4af746da`.
Validation documentation/evidence commit: `a67912613afb35ce1c46c10eba22c8fd760248bb` (amended after integrating corrected controller browser evidence).

## Implemented

- Shared `getServerPresentation` separates lifecycle, published operation status and gated connection publication. Current/active now displays Active; current/preparing and planned retain their original presentation. Status is a registry statement, without live telemetry. Edition-specific address/port copy still uses the unchanged fail-closed connection gate.
- Active ready detail shows connection publication and confirmed nonblank string `version`/`release` values. Active-but-unpublished detail and Join stay honest about unavailable addresses; confirmed version/release values remain visible even when no connection is published. Planned/preparing supplied test values stay hidden.
- Applied shared presentation to ConnectionGuide, ServerDetail, ServerWorlds, PolicyScope, ServerDirections and CrossplayBridge. ServersHub, actual Join header, relevant home status/guidance and root/home/server/Join metadata no longer contradict a supported registry launch. Current copy/layout is unchanged.
- Dedicated rules/recovery notices remain unpublished even for active records. Original policy/history bodies, both actual registry records, brand profile, CSS, request/auth/admin/server handlers and verification scripts are unchanged.
- Expected Telegram injected-failure warning is captured/asserted with `t.mock.method(console, 'warn')` and restored in `t.after`. Production warning behavior is untouched.
- No deferred fixture-startup hardening, unrelated cleanup, operational actions, credentials, messages, deployment, push, merge or environment-file access.

## Necessary changed files

Application/shared: `app/shared/serverGroup.mjs`; `app/components/{ConnectionGuide,ServerDetail,ServerWorlds,PolicyScope,ServerDirections,CrossplayBridge,ServersHub,Hero,HomeGuide}.tsx`; `app/join/{page,layout}.tsx`; `app/{page,layout}.tsx`; `app/servers/page.tsx`; `app/servers/{survival,the-great-war}/page.tsx`.

Tests: `tests/server-surfaces.test.mjs`, `tests/helpers/render-server-surface.mjs`, `tests/telegram-inquiry-alert-route.test.mjs`.

Documentation: `docs/stimemc-redesign-validation-2026-10-09.md`, plus controller-owned `docs/verification/stimemc-2026-10-09/final-launch-viewport-checks.json`. Original screenshots and viewport/report/modal matrices retain their truthful provenance. An initial controller attempt repeated DOM 1440×900 in all 60 records; the implementer identified that discrepancy before staging, and the controller discarded that attempted artifact and reran the acceptance on the selected tab with explicit requested-versus-actual guards. Only the corrected evidence is integrated.

## TDD and focused evidence

Before production edits:

```text
node --conditions=react-server --experimental-strip-types --test tests/server-surfaces.test.mjs
tests 8 / pass 2 / fail 6 / cancelled 0 / skipped 0
```

Six failures reproduced launched card/detail/Join preparation claims, absent confirmed values, inaccurate related labels and stale route metadata. Two existing fail-closed preparing/planned cases passed. An additional home-guidance check was then added before its home components were edited:

```text
node --conditions=react-server --experimental-strip-types --test --test-name-pattern="home server guidance" tests/server-surfaces.test.mjs
tests 1 / pass 0 / fail 1
```

The full Join and home checks exposed hardcoded preparing group copy adjacent to the reviewed components; these changes address the same concrete launch contradiction.

Rendered tests run real TSX components through in-memory TypeScript transpilation and React server rendering. The client-capable render worker runs without `react-server` conditions; language/CSS/Link/image/motion are boundary doubles, while registry/status/connection functions are real. A disposable process-local registry contains synthetic data only, with allowlisted OS environment. Assertions inspect actual markup/controls, not source/JSX snapshots. Edition selection and policy scope are seeded at their hook boundary so both states can render without adding test APIs to production.

One interim targeted attempt had 46/51 passes because the new test fixture replaced the exported array while the real group helper retained its lexical default array; the fixture was corrected to mutate only the disposable worker's real registry array. Subsequent GREEN:

```text
node --conditions=react-server --experimental-strip-types --test tests/server-surfaces.test.mjs tests/server-group.test.mjs tests/guide-interactions.test.mjs tests/report-date.test.mjs tests/request-security.test.mjs tests/telegram-inquiry-alert.test.mjs tests/telegram-inquiry-alert-route.test.mjs
tests 51 / pass 51 / fail 0 / cancelled 0 / skipped 0
```

Nine new rendered tests cover ready active card/detail/full Join; active-unpublished states; confirmed version/release without connection; complete/incomplete Bedrock controls; preparing/planned supplied values; all related labels and unpublished dedicated rules/recovery; route metadata; and home/server guidance. Existing guide-interaction tests exercise actual copy gating and manual fallback behavior.

## Final verification (application 27c37a0)

| Command | Actual final output |
| --- | --- |
| `npm test` | Exit 0; `tests 91 / pass 91 / fail 0 / cancelled 0 / skipped 0` |
| `npm run lint` | Exit 0; no diagnostics |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Exit 0; no diagnostics |
| `npm run verify:build` | Exit 0; compile 7.5s, TypeScript 3.1s, 15/15 static pages |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false --project C:\Users\hhajj\AppData\Local\Temp\stimemc-security-build-SEMPEt\tsconfig.json` | Exit 0; no diagnostics |
| `node scripts/smoke-isolated-build.mjs C:\Users\hhajj\AppData\Local\Temp\stimemc-security-build-SEMPEt --keep-alive` | `Passed: 14 page responses, security headers, 5 API rejection cases, server-secret isolation in browser chunks.`; remains alive intentionally |
| `node .superpowers/sdd/2026-10-09-stimemc-server-group-redesign/compare-current-render.mjs` | `Passed: 38 byte-identical current-registry rendered component/metadata comparisons against f9df372 (both languages, editions, detail records and policy scopes).` |
| `node .superpowers/sdd/2026-10-09-stimemc-server-group-redesign/verify-preserved-content.mjs` | `Passed: exact registry/brand equality to f9df372; exact history/rule-map and 16 bilingual rule-detail equality to a8cfac1.` |
| `git diff --check` | Exit 0; no whitespace errors |

Initial lint attempts found only newly introduced test-helper issues (reserved `module` local, unused boundary props, anonymous boundary display name); all were corrected. The final full suite was rerun after the last test-helper change and passed 91/91. Exactly one final application build and exactly one isolated smoke were run, after targeted verification. There was no failure/restart/rebuild cycle. Durable full final outputs are `final-fix-{tests,lint,build,smoke,current-render,preserved-content}.log` in this scratch workspace. Both explicit type checks were observed directly from the tool results: exit 0 and empty output. PowerShell's Tee-Object created no file when there was no output, so there are no separate type-check log files. The report's earlier reference to those nonexistent logs was corrected without repeating the checks.

## Corrected controller browser acceptance

The controller supplied the final artifact for application commit `27c37a0134c7178e371f1e392cae40bd4af746da` on preview6944, using selected browser tab 6. Its 60 `samples` cover the five affected routes (`/`, `/servers`, `/servers/the-great-war`, `/servers/survival`, `/join`) at all 12 original target dimensions. Every sample records `requestedViewport` and `actualViewport`; controller per-sample assertions reject any mismatch. The implementer independently parsed the saved artifact before staging: exactly 60 records, 12 actual dimensions with five route records per dimension, requested==actual throughout; no positive document overflow, clipped headings, sampled buttons under44px, empty h1 or current-state Copy controls. The initial incorrect attempt was not staged. No application/build/suite repeat was needed for this evidence-only correction.

## Preview and cleanup handles

- Latest production origin: `http://127.0.0.1:6944`.
- Keep-alive exec session: `9451`.
- Next child PID: `38408`; runner parent PID: `15908`.
- Build directory: `C:\Users\hhajj\AppData\Local\Temp\stimemc-security-build-SEMPEt`.
- Build process session `67589` completed exit 0. Preview is still alive; child PID was independently checked after smoke.
- Stop the keep-alive command for its `finally` cleanup, or stop only Next child PID `38408`; the keep-alive runner then observes exit and finishes. No earlier root-owned preview/fixture was stopped or restarted, including dev3123, prod1922 and fixture4017.
- Build copies exclude every `.env*` basename; child build/preview environments contain only allowlisted OS variables, disabled telemetry and dummy public Supabase config. No `.env.local` was opened, read, copied, printed or modified.

## Self-review and limits

Reviewed the full scoped diff, real registry/status precedence, edition publication completeness, confirmed-string checks, original policy notices, route metadata and test boundaries. Actual records remain The Great War current/preparing and Survival planned with null connection/release/version. No new runtime dependencies, telemetry claims, operational writes or source snapshots were added. Preservation comparison supports original screenshot/matrix provenance because current rendered outputs and styles did not change.

Synthetic launch behavior is component/connection coverage, not real server connectivity. Real mobile browsers/devices, reduced-motion preference changes, OAuth, live Supabase and operational support submission were not exercised. The controller's corrected current-state browser acceptance passed; one scoped re-review is coordinated by the controller, and its outcome is not claimed by this implementer.
