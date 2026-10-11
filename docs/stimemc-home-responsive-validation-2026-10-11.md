# Homepage responsive verification — 2026-10-11

The requested homepage fixes retain the existing visual system: desktop navigation has no redundant hamburger, mobile CTAs share centered alignment, both editions converge on Geyser, tablet server cards stack, the directions summary lives in each server card, the mobile archive scrolls horizontally, and the tablet footer fills both rows. Important metadata uses 13px and scene captions use 14px.

| Verification | Result |
| --- | --- |
| `npm.cmd test` | 91 passed, 0 failed |
| `npm.cmd run lint` | Exit 0, no warnings |
| `npm.cmd run verify:build` | Exit 0; production compilation and TypeScript passed |
| `scripts/verify-home-responsive.mjs` against the isolated production build | 258 checks passed, 0 failures, 0 browser errors |
| `git diff --check` | Exit 0 |

The browser matrix covers Korean and English at 280, 320, 360, 430, 479, 480, 767, 768, 900, 1023, 1024, 1100, 1366 and 1440px. Related `/servers` and `/server-mechanism` layouts were checked at 280, 360, 768 and 1024px. Checks include prose clipping and page overflow, readable jump links and metadata, parallel edition sources, full-width tablet card copy, balanced footer rows, and readable archive card widths. All seven archive images remain reachable by horizontal scrolling and keyboard.

Interaction checks cover mobile menu focus trapping and Escape return, dismissal when resizing to desktop, keyboard and hover access to desktop sublinks, Escape dismissal without stealing unrelated focus, keyboard reopening, and archive visibility with normal and reduced motion. No mutation requests were made.

Evidence is in [verification/stimemc-home-responsive-2026-10-11](verification/stimemc-home-responsive-2026-10-11/): `homepage-checks.json` and representative screenshots. Chrome was run headlessly against an isolated build using placeholder public configuration; this does not claim physical-device or live-service validation. No `.env.local` was opened, copied, displayed or modified.

The browser regression script accepts the localhost origin, a directory containing Playwright, an evidence output directory and the installed Chrome executable path. It adds no production dependency.
