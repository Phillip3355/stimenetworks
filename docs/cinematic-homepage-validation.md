# Cinematic homepage — implementation and validation

## Review boundary

- Worktree: `C:/Users/hhajj/Desktop/stimemc-cinematic`
- Branch: `codex/stimemc-cinematic`
- Application baseline: `bf5da6d`

The original `vibecode` checkout had substantial uncommitted work. A baseline snapshot of its application files was made in this separate worktree, excluding environment files. The redesign is a separate commit after that snapshot. Compare the redesign against `bf5da6d`; do not mistake the baseline snapshot for homepage changes.

Only the `/` route implementation is replaced. New components and scoped styles live under `app/components/home`. Existing layout, navigation, footer, all other pages, APIs, authentication, client/server/shared modules, database files, and Next configuration have no diff against the baseline. No deployment, production data operations, or access to `.env.local` occurred.

## What ships

- One sticky 3D stage with seven continuously interpolated camera poses, native scroll, split worlds, portal frames, voxel disassembly, network structures, packets and reconstruction.
- Existing source facts rewritten as concise Korean/English storytelling. The real server screenshot comes from the existing homepage assets. Geometry and annotations are artistic, not live server telemetry or a literal map.
- Portrait and short landscape compositions, native touch, reachable join and motion controls, quality selection, and preserved site navigation.
- Reduced-motion, failed WebGL, lost-context and failed-import alternatives. The vector fallback is memoized; no-JavaScript visitors receive visible artwork, all story content and functional anchor/join links.
- One instanced voxel mesh, shader-based position morphs, simple opaque materials, bounded points/packets, no WebGL textures, shadows or post-processing. Automatic conservative device selection and sustained-load downshifts. Renderer sleeps after settling and disposes on route/motion changes.

## Reproduce locally

In the isolated worktree, run `npm ci`, then `npm run preview:cinematic`. This builds and starts the preview at `http://127.0.0.1:3100` using dummy public Supabase configuration. The launcher refuses a checkout containing environment files other than `.env.example`. This preview is for the visual experience and route checks; live sign-in and submissions are not configured.

With the preview running:

```text
npm test
npm run lint
npm run test:cinematic
npm run profile:cinematic
```

The preview command includes a production build and TypeScript checks. `npm run test:cinematic -- --checks-only` reruns interactions and performance without repeating an already captured viewport matrix. Browser scripts require installed Chrome. Captures and raw JSON results are written to ignored `scratch/cinematic/`.

## Verification results

- 85 unit/integration tests passed. The previous card-layout source assertion was removed because that presentation is intentionally replaced; new behavior tests cover timeline continuity, overscroll, conservative quality, framebuffer limits and sustained downshift.
- ESLint, TypeScript and the production build passed. All original routes remain in the build output.
- 70 scene captures checked across 360×800, 430×932, 768×1024, 1366×768, 1440×900, 2560×1080, 844×390, 667×375, 740×360 and 360×640. No horizontal overflow, clipped copy, copy/transport collisions, or mobile screenshot/link overlaps.
- Korean/English toggle, wheel scrolling, native touch gestures, chapter selection, keyboard menu Escape/focus return, quality changes, motion off/on, join navigation and back/remount passed.
- OS reduced-motion changes preserve selected quality. A deliberately delayed scene import with rapid preference changes creates exactly one canvas; stopping disposes every canvas.
- Reduced motion, unavailable WebGL, explicit WebGL context loss, and disabled JavaScript passed. No application runtime or shader errors were recorded. Deployment-only Vercel analytics requests are intercepted in local browser tests because those endpoints are not served by `next start`.
- Independent code review found landscape, async initialization and stale-quality issues. All were fixed, covered by browser regressions and rechecked by the reviewer.

## Performance observations

Measured in Chrome 152 on Windows with Intel UHD integrated graphics. These are local observations, not guarantees for every device.

- Keyframes use 5–8 draw calls and at most 12,036 triangles. The measured split-to-network transition uses 9 draw calls and 12,036 triangles.
- Zero WebGL textures; 9 small geometry buffers after visiting all scenes. Framebuffer allocation is capped at 2.4 million pixels. Low/balanced/high pixel ratios cap at 1/1.25/1.5; frame-rate caps are 30/45/60 respectively.
- Lazy scene code is about 4.3 KB gzip; the two Three.js chunks together are about 135 KB gzip. Existing shared application code is additional. The real server screenshot transfers about 55 KB through Next image optimization.
- The browser test drives a 5.5-second journey, then confirms the rendered-frame counter stops during a one-second idle observation. All three profiles passed this idle check.

| Profile | Browser RAF p95 | Last sampled render submission CPU time | JS heap snapshot | Long tasks during journey |
| --- | ---: | ---: | ---: | --- |
| Desktop | 4.4 ms | 0.2 ms | 11.1 MB | None |
| 6× CPU slowdown, low quality | 33.1 ms | 0.2 ms | 10.3 MB | 2, at 56 and 84 ms |
| Portrait mobile, 4× CPU slowdown, low quality | 16.8 ms | 0.7 ms | 10.6 MB | None |

RAF timing describes browser callback cadence, **not rendered FPS**; rendering is separately capped and stops when idle. Submission CPU time is not GPU execution time. The heap figure excludes GPU/driver allocations and the browser process. Severe CPU throttling still produced occasional long tasks, so this is not a claim of a locked frame rate on all low-end hardware.

The loading profile uses 1.28 Mbps, 150 ms latency and 4× CPU slowdown. First contentful and largest contentful paint were both 1,220 ms; the cinematic renderer was ready at 4,451 ms. Total JavaScript transferred was 425,097 bytes, including shared application code. These are single local runs, not field percentiles.

A software-rendering pass forces ANGLE SwiftShader and exercises the complete journey. It retained the cinematic experience at balanced quality, with browser RAF p50/p95 of 12.5/45.8 ms. Raw measurements are retained in `scratch/cinematic/loading-results.json`; unavailable WebGL is separately covered by the static fallback test.

## Remaining validation limits

No physical Android/iPhone thermal, battery or sustained memory-pressure test was available. Safari and Firefox were not exercised. CPU/device/viewport emulation and SwiftShader coverage do not replace real-device testing. No production authentication, API writes, database operations or deployment were performed. The isolated branch and local preview are preserved for review.
