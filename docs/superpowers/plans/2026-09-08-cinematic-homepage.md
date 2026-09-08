# Cinematic homepage implementation plan

**Goal:** Redesign only `/` as StimeMC's continuous voxel-to-network journey.
**Architecture:** Route-local React presentation, independently lazy-loaded raw Three.js renderer, pure timeline and quality policy. Existing layout, navigation, routes, server code and authentication are unchanged.
**Tech stack:** Existing Next.js/React/CSS Modules; Three.js only added runtime dependency.
**Spec:** `DESIGN.md`.

## Constraints
Use the isolated sibling worktree on `codex/stimemc-cinematic`. Baseline snapshot `bf5da6d` contains the user's current application state. Do not access `.env.local`. All local preview configuration is dummy public configuration. No production deployment or database changes.

## Tasks (inline execution)
- [x] Inspect source, isolate current application state, run baseline (81 tests).
- [x] Add behavioral tests for clamped timeline, boundary continuity, mobile camera difference, quality caps, sustained downshift and recovery boundaries. Run them failing before adding the pure module.
- [x] Implement `app/components/home/timeline.mjs`: `sampleTimeline(progress, mobile)`, `chooseQuality(signals)`, `qualitySettings(level, dpr, width, height)`, `adaptQuality(level, samples)`. Assert numeric stability across the entire timeline and constrained framebuffer budgets.
- [x] Implement route-local `CinematicHome.tsx` plus scoped CSS and vector fallback. Use existing language context and verified facts. Replace only `app/page.tsx`. Remove the single obsolete feature-card source assertion, replacing coverage with browser-visible story/navigation checks.
- [x] Implement procedural geometry in `world.ts` and `scene.ts`: resource ownership, instancing, simple shaders, animated connections, demand scheduling, conservative defaults, disposal and context-loss fallback.
- [x] Run tests/lint/typecheck/build using the isolated worktree and dummy public configuration.
- [x] Launch production preview; browser-test required viewports, scroll, menu, keyboard, language, fallback, reduced motion and CPU/quality conditions. Profile active and idle rendering, inspect screenshots, and fix material issues.
- [x] Document results and limitations in `docs/cinematic-homepage-validation.md`. Verify the diff from the snapshot contains only homepage code, dependencies, relevant tests, design and validation files. Preserve worktree for review.
