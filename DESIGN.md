# StimeMC Server Group Design System

The approved source is `docs/superpowers/specs/2026-10-09-stimemc-server-group-redesign.md`. The brand hierarchy is STIMEMC → SERVER → SEASON / CONTENT. The first message is “ONE COMMUNITY. MORE WORLDS.” / “여러 세계, 하나의 Stime.”

## Brand and facts

StimeMC is the parent Minecraft server group. Public server choices are THE GREAT WAR and SURVIVAL only. The Great War is CURRENT and preparing to operate a single war-focused season. CURRENT identifies its place in the group and never means online. Survival is PLANNED / COMING LATER, with release date and version undecided. Its Vanilla / Vanilla+ direction, server-side mods and datapacks remain plans.

Geyser-powered Java × Bedrock crossplay is a primary shared feature of every StimeMC server. Repeat this feature on the homepage, hub and details while keeping Survival visibly planned. Separate the conceptual group connection graphic from the historically verified ViaProxy implementation. No new infrastructure, live players, gameplay systems, addresses, ports, release dates or versions may be invented.

`app/shared/serverGroup.mjs` is the shared registry. Actual connection, release and version fields remain null. The connection helper returns a language-neutral state; only current, active servers with published edition data can enable Copy. Bedrock requires a complete address and integer port in 1–65535. Existing Java 1.21.1 copy belongs to the previously published guide and is not a confirmed version for either new server.

## Foundations

| Role | Value |
| --- | --- |
| Canvas | #071013 |
| Surface | #0b191d |
| Raised | #10242a |
| Primary text | #edf5f2 |
| Secondary text | #b3c7c4 |
| Muted text | #91aaa7 |
| Mint accent | #8fe2cc |
| Blue accent | #8cb9d1 |
| Hairline | rgba(166,211,201,.20) |
| War emphasis | #d5b09a |

Use rectangular world panels, thin borders, 0–6px corners and clear typographic hierarchy. Avoid large blur, neon and rounded dashboard cards. Main content reaches at most 1400px; reading text stays around 42–68ch. English display text uses a condensed local sans-serif stack; Korean uses Pretendard / Noto Sans KR / system sans-serif. No external font is required. Mobile body copy starts at 15px with 1.7 line-height. Long labels must wrap within their column.

Real screenshots are StimeMC archive images unless their server provenance is verified. Preserve the originals and optimize with next/image and responsive sizes. Never imply an archive image is a new Great War or Survival map. Survival uses typography and graphics rather than a fabricated screenshot.

## Shared shell

Navigation groups are Servers, News, Guide, About and Join. Guide contains rules, recovery and support. About contains home, mechanism and history; News keeps website updates. All documented public routes remain accessible. `/News` is a case-sensitive historical report route distinct from `/news`. Administrator entry remains in the existing authorized support flow.

The fixed header keeps the visible StimeMC name, Join, KO/EN control and menu trigger at 320px. Full primary links appear only while they fit; the compact header keeps the full menu available. Every navigation action has at least a 44px touch target. The menu supports native internal scrolling, safe areas, keyboard focus cycling, Escape, focus return, and scroll lock. Unrelated background regions become inert and hidden from assistive technology while the dialog is open. The dialog contains its own language control.

A visible-on-focus skip link moves focus to the page content. Root metadata identifies the server group and preparation/planning facts; page-specific metadata is supplied by the page work. Viewport fit covers device safe areas. The language provider, analytics and speed insights remain integrated.

## Page composition

The homepage moves from a short brand hero to the two server panels, each server’s direction, a Java × Bedrock / Geyser scene, a labeled StimeMC archive, real news and Join guidance. Essential server state and CTA remain visible without hover or waiting for animation.

The server hub and detail pages use the same registry as Join. Join separates server status and edition selection; missing connection values produce an honest preparation or planning state without fake disabled examples. Rules and recovery retain existing policy meaning and distinguish historical regulations from unpublished server-specific rules. News keeps report URLs and original text. Website updates are explicitly website records. Technology separates shared Geyser direction from verified legacy implementation. History entries remain unchanged.

Support preserves member and guest entry, inquiry lists, conversations, input validation and mobile list/detail transitions. Taskboard preserves its authorized inquiry and report tools. No signup form or voice/STAGE feature is part of this design.

## Responsive layout and motion

Desktop and wide tablets use two readable server columns. Portrait tablets and mobile stack panels as soon as a useful reading width is lost. Mobile has a short hero, immediate status and CTA, one-column reading and native page scroll. Avoid prolonged sticky scenes or desktop layouts compressed sideways.

Framer Motion is already installed. `MotionProvider` applies MotionConfig reducedMotion="user" across the shell; individual scroll scenes also show complete stationary content under reduced motion. Use small, one-time opacity/transform reveals with no loops, scroll interception, WebGL, cursor tracking or new heavy libraries. Motion must never hide required content indefinitely.

Check actual DOM viewport and overflow at 1920×1080, 1440×900, 1366×768, 1280×800, 1024×1366, 1366×1024, 800×1280, 768×1024, 430×932, 390×844, 360×800 and 320px. Include rotation, keyboard menu, reduced motion, footer and long Korean text. Report real-device Safari/Android limitations explicitly.
