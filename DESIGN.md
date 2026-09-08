# StimeMC homepage design

## Scope and identity
Only `/`, on the isolated `codex/stimemc-cinematic` branch. Existing routes, navigation, APIs and authentication stay intact. Source claims come from the existing homepage and server mechanism content: Java/Bedrock crossplay through Geyser/ViaProxy, server-side modifications without client mods, player creations and community rules.

## Current direction — September 8 refinement
One native-scroll cinematic stage: STIME → ENTER THE WORLD → JAVA × BEDROCK → A WORLD. A SYSTEM. → BEYOND VANILLA → ONE WORLD → JOIN STIME. The lighthouse reconstruction follows the supplied Minecraft reference, using original Java 1.21.1 block textures. September 9 correction: keep the interface and aligned network black/white, but restore original Minecraft colors on buildings, foliage and terrain. Complementary shader code is not executed in the browser.

## Visual foundations
Black #090909 background, white #f5f5f5 lettering, gray borders and infrastructure. One Pretendard/Noto Sans KR/system sans family throughout. Readable dark #111111f5 cards behind all chapter explanations and titles. Large STIME remains a separate cinematic wordmark. Every homepage action uses the same dark fill, one-pixel border, 3px radius and clear white hover/focus treatment.

Remove tiny HUD annotations, scroll instructions, side chapter rail, quality/motion controls and the fifth-beat photograph. The persistent JOIN STIME action remains. Each description completely disappears before its successor appears; chapters have a deliberate blank interval. Hidden descriptions are inert, including when loading completes inside an interval.

## Composition
Desktop: large wordmark, world toward the right, explanation card left. Portrait mobile: title/world and readable card use separately positioned layers, technology cards above the network. Short landscape: compact left copy and right scene, with the join action clear of the card. Native touch scrolling is never intercepted. Use stable svh sizing, safe areas and at least 44px action targets.

## Geometry and animation
Offline axis-aligned surface union removes both whole-block and partial slab/roof overlaps, retaining one owner per coplanar surface. Preserve UV offsets after clipping. Hand off the physical world to 1,080 closed textured cubes sampled from its actual block locations. Cubes spin and cross through a broad deterministic cloud before settling into three exact 6×10×6 racks. Their texture color transitions to neutral white only as alignment completes. Reverse scrolling reconstructs the world. Portrait scatter uses 72% of the desktop travel distance. Never morph culled terrain fragments into disconnected cubes. Technology packets and waves animate continuously while visible; settled physical-world scenes sleep. Hidden tabs/offscreen scenes stop rendering.

## Performance and fallback
One merged textured world draw: 27,862 triangles, 64,782 compressed geometry bytes. Network: 12,960 triangles in one instanced draw. Target fewer than 20 calls, 45k triangles and 2.4 million framebuffer pixels. One padded 256×128 atlas, baked directional light, no shadow maps or post-processing. Clamp mip derivatives within atlas padding. Geometry expands once from bounded 24-byte face records.

Quality is always automatic: device signals choose the initial level, sustained expensive frames reduce quality; no user settings. Low retains the complete architecture while reducing pixel ratio, particle count and frame rate. OS reduced-motion still receives a readable static story with the model poster; missing WebGL/assets and context loss use the same fallback. No-JS links remain functional.

## Verification
See `docs/homepage-refinements-validation.md` for the 13 requested changes and current evidence. Browser checks cover 10 viewport sizes, all narrative beats, native touch, delayed loading, static fallback, navigation and language, plus CPU/device throttling. Emulation does not establish physical-device thermal or GPU performance.
