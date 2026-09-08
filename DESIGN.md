# StimeMC — A world, underneath

## Intent and observations
The homepage is a cinematic identity piece for Minecraft players. The primary action is the existing `/join` flow. The current site uses black, warm white, bilingual Korean/English content, compact fixed navigation, and real server screenshots. Source facts come exclusively from `serverProfile`, `homeFeatures`, and `serverMechanismFlow` in `app/shared/siteContent.mjs`: Java and Bedrock share a Java server through ViaProxy/Geyser, server-side mods expand play without client mods, player builds evolve, and rules protect creations. Rendered geometry is an artistic interpretation, not a map or live monitoring dashboard.

## Direction
A suspended voxel settlement becomes its own underlying network and then becomes a world again. One sticky stage and one native scroll timeline: STIME → ENTER THE WORLD → JAVA × BEDROCK → UNDER THE SURFACE → BEYOND VANILLA → ONE WORLD → JOIN STIME. Different moments use an approach, split, disassembly, network formation, axial rotation, reconstruction, and portal approach. Never a stack of feature cards.

## Foundations
- Canvas `#080e10`; ink `#edf4ea`; muted text `#a2b7b0`; mint `#b8f5cd`; orange `#ffad72`; hairlines at 18% mint.
- Oversized tightly tracked Arial Black/system display type; existing Korean sans for short supporting copy; system monospace for the chapter rail and technical annotations. No downloaded fonts.
- Square corner geometry, 1px technical rules, generous negative space, almost no panel surfaces. No glowing UI cards.
- The physical world uses moss, limestone, slate, timber, tiny warm windows, stepped terrain and cubic trees. Infrastructure uses mint lines and amber Bedrock packets.
- Existing global navbar/footer remain intact. All redesign styles are scoped to the homepage.

## Desktop composition
At 1440×900 the huge STIME title fills the upper field. The suspended world dominates the center/right, and a compact bilingual statement occupies the lower left. A fine chapter rail sits right. Bottom transport includes scroll direction, progress and a continuously available join link. Later titles move left as the camera moves inside the same stage. Real server imagery appears through an architectural aperture during the ONE WORLD beat, explicitly labeled as a server view.

## Mobile composition
At 360/390/430px the title sits above the world; supporting copy and CTA sit below it. A higher camera target, wider portrait FOV and centered scene replace the lateral desktop composition. The rail becomes small bottom chapter indicators. Stable svh sizing prevents browser chrome from changing scroll length. Native touch scrolling is never canceled. Controls are at least 44px with safe-area inset spacing. Landscape/short screens use compact side-by-side composition.

## Motion and accessibility
Scroll is the sole narrative clock. No scroll locking, smooth-scroll library, autoplay camera orbit, or required hover interactions. Mouse movement has a bounded secondary camera response. The GPU sleeps when settled or hidden. A visible motion toggle returns to an editorial static sequence. `prefers-reduced-motion`, unavailable/weak WebGL, context loss, or renderer import failure use that same intentional static sequence with a vector world, readable story, original screenshots, and working links. Inactive cinematic chapters are inert; keyboard users can skip the journey or select chapters.

## Performance budgets
Lazy import raw Three.js only on this route. One instanced voxel draw, one instanced network-node draw, a small fixed set of line/portal/packet draws; target <20 calls and <45k triangles. Procedural geometry, no 3D texture requests, no shadows/post-processing. Transform positions in the vertex shader instead of rewriting thousands of matrices each frame. Low starts at DPR ≤1 and 30fps; balanced ≤1.25 and 45fps; high ≤1.5 and 60fps. Cap total framebuffer pixels to 2.4 million. Downshift after sustained expensive frames; never oscillate upward. Low mode preserves all narrative geometry and cuts particles/render resolution. Save-data defaults low. Explicit visual quality control and static option are available.

## Verification
Run full existing tests, targeted timeline/quality tests, lint, typecheck, production build and browser checks at 360, 430, 768, 1366, 1440, ultrawide and landscape. Exercise native wheel/touch, keyboard/menu, language, route navigation, reduced motion, unavailable WebGL, context loss, slow CPU and low device signals. Capture render calls/triangles/frame timings plus idle behavior. Emulation is not physical-device thermal validation; report that limit.
