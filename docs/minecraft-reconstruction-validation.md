# Photo-based Minecraft reconstruction

This revision follows the user's supplied lighthouse screenshot. The user named
Complementary Shaders and explicitly prioritized Minecraft fidelity, textures,
color and modeling. Work remains in `codex/stimemc-cinematic`, isolated at
`C:/Users/hhajj/Desktop/stimemc-cinematic`. Compare this revision against `3601443`.
Only homepage scene components/assets, build tools, tests and documentation change.
No other route, API, authentication, production checkout or environment file is modified.

## Reconstruction

- Tall octagonal brick/andesite lighthouse with alternating bands, stone corbels,
  projecting timber window frames, dark balcony rails, glowing lantern room and
  stepped spruce cap. The screenshot's visible silhouette guides the proportions.
- The foreground house has a steep spruce stair roof with its ridge across the
  facade, brick walls, timber corners, stone foundation, chimney and barrel props.
- Gravel clearing, lampposts, still-water shoreline, stepped ground and dense
  birch/spruce woodland replace the former abstract low-poly settlement.
- 29 original 16px block images from Minecraft Java 1.21.1 are packed into one
  256×128 padded atlas. Archive and individual PNG hashes are verified against
  recorded provenance in `public/home/minecraft/sources.json`.
- Side/end-grain mappings, original pixel magnification, per-block UV repetition
  and half-block stair cropping preserve Minecraft material scale. Derivative-aware
  mip sampling reduces distant shimmer without blurring nearby pixels.
- Warm face lighting, offline two-ray voxel shadows and contact shading approximate
  the reference's light. Complementary shader code is not executed or bundled.
  No live shadow maps, bloom, path tracing or animated water is used.
- Hidden architecture and off-camera terrain are inferred, not recovered from a
  world save. This is a reconstruction, not a one-to-one export of the source world.

## Performance design

The complete world uses 35,726 triangles in one draw. All mobile quality levels
retain the same architecture. Technology transitions reuse the same block centers
and add the existing bounded line, packet and portal geometry.

An initial full-vertex encoding transferred 585,901 bytes. Replacing it with compact
offline-lit face records reduces the model to **68,675 bytes gzip**, without reducing
the geometry. The browser expands 17,863 bounded records once into approximately
4.43 MB of vertex/index data. It performs no voxel visibility search or shadow ray
casting at runtime. The texture atlas is 7,646 bytes on disk and about 171 KiB on
the GPU including mipmaps. The renderer still sleeps when idle or hidden.

Unsupported WebGL is rejected before any model download. Geometry, gzip, image,
context-loss and cancellation failures dispose temporary resources and show a
static poster captured from the actual model. Reduced-motion and no-JavaScript
visitors use that same poster with the existing complete static story.

## Final verification

- 89 unit/integration tests, ESLint, TypeScript and the production build passed.
  Existing routes remain in the build output.
- 70 chapter captures across 360×800, 430×932, 768×1024, 1366×768, 1440×900,
  2560×1080, 844×390, 667×375, 740×360 and 360×640 passed layout and render budgets.
  Portrait tablets now use a centered camera and vertical copy arrangement.
- Language, wheel/touch scrolling, chapter navigation, quality/motion controls,
  menu Escape/focus, join navigation and back/remount passed.
- Reduced motion, no JavaScript, unavailable WebGL, failed/corrupt geometry,
  missing atlas, canceled loading and context loss during/after loading passed.
  Unsupported/static modes do not request the 3D model. No application or shader
  errors were recorded.
- Independent review caught flipped vertical texture mapping, unnecessary model
  downloads on unsupported GPUs, and context loss while loading. All were fixed
  and rechecked. The packed geometry format was also reviewed.

Chrome 152 / Windows / Intel UHD observations, with one fresh browser per profile:

| Profile | Browser RAF p95 | Last render submission CPU | JS heap | Long tasks during journey |
| --- | ---: | ---: | ---: | --- |
| Desktop | 8.4 ms | 0.1 ms | 14.7 MB | None |
| 6× CPU slowdown, low | 49.9 ms | 0.8 ms | 15.1 MB | 10, between 51–180 ms |
| Portrait, 4× CPU slowdown, low | 16.7 ms | 2.0 ms | 16.0 MB | None |

All three profiles stopped rendering after settling. The measured transition uses
8 calls / 36,254 triangles, within the existing <20 / <45k budgets. Severe CPU
throttling still causes occasional stutter; this is not a locked-FPS claim.

A diagnostic run identified first-use driver shader compilation in a slow scroll.
Transition materials are now compiled before the cinematic stage is activated.
Profiling runs are isolated from deliberate context-loss tests to avoid inheriting
their driver churn. Shared-machine measurements still vary between runs.

At 1.28 Mbps / 150ms latency / 4× CPU slowdown, the final run measured FCP 1,604 ms,
LCP 3,324 ms and cinematic ready 6,380 ms. Model transfer including response overhead
was 68,975 bytes; shared/application JavaScript transferred 426,310 bytes. The first
full-vertex encoding took 11,798 ms to become ready in an earlier run under the same
nominal throttle; this is an observational comparison, not a controlled field study.
SwiftShader retained the cinematic mode at balanced quality, with RAF p50/p95 of
12.5/33.3 ms. Raw results and captures are in ignored `scratch/cinematic/`.

## Reproduction

```text
node scripts/import-minecraft-textures.mjs
node scripts/build-minecraft-atlas.mjs
node scripts/build-settlement.mjs
npm run preview:cinematic
```

Asset import needs system bsdtar ZIP support. The original client archive remains
in ignored scratch storage. After starting the preview, regenerate its poster with
`node scripts/capture-settlement-poster.mjs`.

Checks: `npm test`, `npm run lint`, `npm run test:cinematic`, and
`npm run profile:cinematic`. The preview uses dummy public configuration and is
for visual/route validation; no live authentication or submissions are configured.

Physical Android/iPhone thermal, battery, memory-pressure and Safari/Firefox testing
remain unavailable. Browser RAF cadence is not rendered FPS; JavaScript heap excludes
GPU and browser-process memory. No guaranteed low-end frame rate is claimed.
