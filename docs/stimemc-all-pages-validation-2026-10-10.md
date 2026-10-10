# StimeMC all-pages redesign — verification

Completed 2026-10-10, Asia/Seoul, in `C:/Users/hhajj/.codex/worktrees/stimemc-server-group/vibecode`.

## Delivered

The supplied design brief is applied across home, server hub, both server details, Join, rules, recovery, news, report template, website updates, history, technology, support, taskboard and authentication callback. Shared navigation, footer, typography and controls use the same system. `DESIGN.md` records the design and responsive behavior.

The homepage now uses full-width real Minecraft scenery and a scroll-driven parent-brand/world composition. Server visuals remain explicitly labeled archive imagery, with preparation/planned states preserved. Information pages use compact chapter navigation and controlled reading widths. Forms, conversations, administration and callback states follow the shared dark palette.

Historical content, report slugs including `/News`, Korean/English switching and backend handlers/contracts are preserved. No `.env.local` was read, copied, printed or changed. No live inquiry, report, email or Telegram action was submitted.

## Fresh checks

| Check | Result |
| --- | --- |
| `npm run lint` | Exit 0 |
| Full existing `npm test` | 91 passed, 0 failed |
| `npm run verify:build` | Exit 0; production compilation and TypeScript passed |
| `npx --yes @google/design.md lint DESIGN.md` | Exit 0 |
| `git diff --check` | Exit 0 |
| Production smoke | 14 routes returned 200; security headers, 5 API rejection cases and browser-chunk server-secret isolation passed |
| Viewport matrix | 16 route/template cases × 5 widths = 80 checks; no page/body/control overflow and no browser page/hydration errors |
| Functional layout fixtures | 12 checks for member/admin inquiry lists, conversations, inquiry forms and report editor; no mutation requests |
| Interaction checks | 320px header/menu, focus trap/return, Escape, inert background, SPA language switching, guest drawer/form, selected rule, reduced and normal motion passed |

Widths: 360, 430, 768, 1366 and 1440px. Additional interactions run at 320px. The 16 matrix cases are 14 static/public page routes plus the `/News` article and a synthetic long Markdown article.

## Issues found and repaired

- Local variable fonts now declare their 100–900 weight axes; font variables live on the root element so the UI font tokens resolve correctly.
- Fragment destinations have a consistent offset below the fixed header.
- Server and first-client markup show the same complete stationary content; motion preferences apply after hydration. Hero, world and crossplay motion use scroll-derived transforms. History remains immediately readable.
- Reduced-motion support/admin controls no longer fade in from transparent initial states.
- The mobile guest dialog overrides the browser's default maximum width. A failing 320px drawer assertion reproduced its 284px width, then passed at 320px after the CSS fix.

## Evidence and boundaries

Evidence is in `docs/verification/stimemc-all-pages-2026-10-09/`: `viewport-checks.json`, `interaction-checks.json`, `functional-fixture-checks.json`, and desktop/mobile screenshots.

Report previews use the existing public report capture and a clearly labeled synthetic Markdown stress case. Member/admin layouts use synthetic sessions and read-only intercepted localhost data, with every fixture visibly marked TEST ONLY. This verifies visual states without a real account or production submission; it does not claim a new live authentication or delivery test. Browser checks use headless installed Chrome. Physical iOS Safari/Android devices were not available.

The final production preview is an isolated build with placeholder public configuration. Source changes remain in the requested worktree for review.
