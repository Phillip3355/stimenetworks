# StimeMC redesign verification — 2026-10-09

Verified on branch `codex/stimemc-server-group`, final application revision `f82d0d9`. The controller performed browser checks; the integrated-verification implementer ran the commands below. No production credentials, operational submissions, login, external messages, deployment, push or merge were used.

## Final automated checks

| Check | Command | Observed result |
| --- | --- | --- |
| Full tests | `npm test` | Exit 0; 82 passed, 0 failed/skipped/cancelled |
| Lint | `npm run lint` | Exit 0; no diagnostics |
| Isolated production build | `npm run verify:build` | Exit 0; Next 16.3.4 webpack compilation, TypeScript and all 15 static pages completed |
| Explicit types | `node node_modules/typescript/bin/tsc --noEmit --incremental false --project <isolated-build>/tsconfig.json` | Exit 0; no diagnostics |
| Production smoke | `node scripts/smoke-isolated-build.mjs <isolated-build> --keep-alive` | 14 page responses; security headers, 5 API rejection cases and browser-chunk secret isolation passed |
| Original content comparison | Import baseline `a8cfac1:app/shared/siteContent.mjs` and compare current exports | Exact equality for `historyEntries`, `ruleMindMap`, and all 16 Korean/English rule-detail results |

The test suite prints one expected simulated Telegram failure message while testing failure containment. It does not send a real notification. Database authorization tests use an isolated local database.

The build runs from a separate temporary source copy. Only `app`, `public`, listed configuration/package files and a dependency junction are included. Copy filters exclude every name starting with `.env`; root and copied source trees were checked to contain zero environment files. Child processes receive only allowlisted OS variables, disabled telemetry and dummy public Supabase configuration. `.env.local` was never opened, read, copied, printed or modified.

Smoke coverage: `/`, `/servers`, `/servers/the-great-war`, `/servers/survival`, `/news`, `/join`, `/support`, `/taskboard`, `/auth/callback`, `/rules`, `/history`, `/updates`, `/recovery-guidelines`, `/server-mechanism`. Readiness uses `/servers` with a short deadline because the dynamic homepage awaits a bounded news query. Every response returned 200 with `nosniff`, `DENY`, no `X-Powered-By`, and CSP `frame-ancestors 'none'`. Local alert endpoint checks returned 401, 400, 403, 413 and 405 as expected; POST rejections retained `Cache-Control: no-store`. Built browser JavaScript contained none of the checked server-secret identifiers or Telegram endpoint string.

## Exact viewport coverage

The controller confirmed actual DOM viewport dimensions, not merely requested browser settings. [Route measurements](verification/stimemc-2026-10-09/route-viewport-checks.json) contain 168 samples: all 14 routes above at all 12 sizes.

| DOM width × height | Route samples | Horizontal document overflow | Clipped headings | Sampled undersized buttons |
| --- | ---: | ---: | ---: | ---: |
| 1920 × 1080 | 14 | 0 | 0 | 0 |
| 1440 × 900 | 14 | 0 | 0 | 0 |
| 1366 × 768 | 14 | 0 | 0 | 0 |
| 1280 × 800 | 14 | 0 | 0 | 0 |
| 1024 × 1366 | 14 | 0 | 0 | 0 |
| 1366 × 1024 | 14 | 0 | 0 | 0 |
| 800 × 1280 | 14 | 0 | 0 | 0 |
| 768 × 1024 | 14 | 0 | 0 | 0 |
| 430 × 932 | 14 | 0 | 0 | 0 |
| 390 × 844 | 14 | 0 | 0 | 0 |
| 360 × 800 | 14 | 0 | 0 | 0 |
| 320 × 800 | 14 | 0 | 0 | 0 |

The matrix preserves 24 initial missing-h1 observations from transient Taskboard loading and auth callback states. These are not silently discarded. Subsequent settled Taskboard checks at 320 × 800 and 1440 × 900 observed `Taskboard Auth` as the main h1, no overflow, and an in-bounds Google auth button (70.4px/48px respectively). The callback returned to home. No login was initiated.

## Browser behavior and design

- Header/menu bounds passed all sizes. Mobile keyboard focus cycles inside the menu; Escape restores focus; background inert state and scroll lock were observed. Both document-language transitions were verified.
- Homepage Hero/title/CTA, parent brand rail and two server panels remain readable. The Great War is current/preparing; Survival is planned, with undecided date/version. No unpublished address or Copy control appeared. Java/Bedrock is identified as a shared Geyser feature, with planned status retained for Survival.
- Native keyboard scrolling and tablet portrait/landscape layouts were observed. Join ArrowRight focuses/selects Bedrock, Home returns Java, and the selected tab alone has `tabindex=0`.
- Rules selection opens the requested item and closes the first. Scope options are legacy/The Great War/Survival. Selecting either new server shows the dedicated-rules-unpublished notice while preserving the original reference. Original history and rules also passed exact baseline comparison.
- Guest chooser/create/lookup dialogs contain forward/backward Tab focus at 320px, Escape restores the guest entry focus, and dialogs render in the native top layer. All 12 sizes fit the viewport within subpixel rounding (≤0.4px); close controls are 44px and four form fields are 16px with associated accessible labels. No support form was submitted and no guest code was entered.
- Geyser runtime animation was observed through DOM styles before entry, during native-scroll entry and after settling: inputs moved from −12px/+12px through −5.56px/+5.56px to no transform; the bridge moved from `scaleX(.35)` through `.679` to no transform. Content remained readable throughout.
- At 390 × 844, Hero used Next image optimization with `w=384`, responsive preload, and seven archive images remained lazy. One local optimized Hero response was WebP, 16,036 bytes, versus the original PNG's 6,789,582 bytes. This measures one image response, not total page transfer. Images are labeled archive records, not newly fabricated server screenshots.

## Historical report and Markdown verification

Production preview uses dummy configuration and exercises the genuine news failure state. Successful article rendering was verified separately with `scripts/preview-report-fixture.mjs` in another environment-file-free temporary source copy and a local HTTP Supabase stub. The stub serves only read-only test reports; POST/PUT/PATCH/DELETE each returned 405, and a lowercase `eq.news` article query returned 406. No fixture data was added to the application or a real database.

The `/News` fixture uses title, date and body text captured by the controller from the publicly readable historical article at `https://stimemc.xyz/News`. The [public DOM capture](verification/stimemc-2026-10-09/public-report-fixture.json) is retained as test-only verification data. The runner prepends the captured title as a Markdown h1; the body is the observed public DOM text, not a claim that the original stored Markdown was retrieved. All 12 viewport sizes had no document overflow and an in-bounds title. `/news` remained a separate archive list and preserved its uppercase `/News` link.

The explicitly labeled `/__test-only-markdown` synthetic article exercises a long title, table, code, link and Korean body at 1440, 768, 390 and 320px. Document overflow stayed zero; code and table scrolling remained local, with links/body wrapping. It is not StimeMC news. Detailed [report and modal measurements](verification/stimemc-2026-10-09/report-and-modal-checks.json) are retained.

Browser verification found and drove the reviewed `f82d0d9` timestamp fix: Node and Chrome produced different Korean ICU day periods before the fix. A fresh browser tab on the updated fixture observed deterministic Korean/English 24-hour timestamps for the real afternoon sample (2026-08-19 16:29 Seoul) and synthetic morning sample (2026-10-09 09:00 Seoul), correct `document.lang` changes and empty browser error logs after initial load and language toggles. No hydration mismatch remained in those checks.

Reproduce the report fixture without the ignored plan workspace:

```sh
node scripts/preview-report-fixture.mjs docs/verification/stimemc-2026-10-09/public-report-fixture.json
```

The runner prints fresh local URLs, checks read-only POST rejection and exact case-sensitive capture lookup, and keeps its child preview/stub running until stopped. The capture JSON shape is `{ "title": "…", "body": "…", "slug": "News", "created_at": "ISO timestamp" }`. The synthetic fixture is generated only inside this test runner.

Selected final output:

```text
tests 82 / pass 82 / fail 0 / cancelled 0 / skipped 0
Compiled successfully in 6.5s
Finished TypeScript in 2.5s
Generating static pages using 19 workers (15/15)
Verified production output: C:\Users\hhajj\AppData\Local\Temp\stimemc-security-build-1mztjU
Passed: 14 page responses, security headers, 5 API rejection cases, server-secret isolation in browser chunks.
```

## Screenshots and provenance

The controller replaced and visually inspected these production screenshots from the dummy-config preview at revision `63154af`. The intervening `f82d0d9` change only affects report timestamp formatting and its tests; pictured homepage/Geyser sections are unchanged. Screenshots contain no development pill.

- [Desktop homepage, 1440 × 900](verification/stimemc-2026-10-09/home-desktop-1440.jpg)
- [Mobile homepage, 390 × 844](verification/stimemc-2026-10-09/home-mobile-390.jpg)
- [Geyser scene, desktop 1440 × 900](verification/stimemc-2026-10-09/crossplay-desktop-1440.jpg)

## Verification limits

Browser control supplied exact viewport overrides and native scroll, but did not advertise reduced-motion emulation. MotionConfig, component fallbacks and CSS reduced-motion rules were reviewed; reduced-motion runtime was not verified. Real iOS Safari, Android Chrome and Samsung Internet were unavailable. Viewport orientation changes are layout checks, not proof of physical-device rotation or safe-area behavior on those devices. Real production Supabase connection success, OAuth completion and operational support submission were not tested. Independent whole-branch review is coordinated by the controller after this verification commit.
