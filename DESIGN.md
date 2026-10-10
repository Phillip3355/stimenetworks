---
version: alpha
name: StimeMC Light Website
description: Atmospheric Minecraft marketing and readable information surfaces.
colors:
  primary: "#111111"
  secondary: "#4b5563"
  tertiary: "#3772cf"
  neutral: "#ffffff"
  canvas: "#ffffff"
  canvas-dark: "#0d171c"
  surface: "#f6f7f8"
  surface-soft: "#fafbfc"
  surface-raised: "#edf1f4"
  surface-code: "#111b24"
  on-surface: "#111827"
  ink: "#111827"
  body: "#374151"
  mute: "#5b687a"
  disabled: "#94a3b8"
  hairline: "#e5e7eb"
  hairline-soft: "#eef0f2"
  hairline-strong: "#cdd3d9"
  primary-pressed: "#333333"
  on-primary: "#ffffff"
  brand-green: "#00d4a4"
  brand-green-deep: "#087f68"
  brand-green-soft: "#e8f8f2"
  hero-sky-from: "#cfe8f6"
  hero-sky-to: "#fff8e9"
  hero-dark-from: "#073932"
  hero-dark-to: "#2b8275"
  on-dark: "#ffffff"
  on-dark-muted: "#b9d1ce"
  error: "#d13e55"
  success: "#087f68"
  warning: "#b96f19"
typography:
  hero-display: { fontFamily: Inter, fontSize: 72px, fontWeight: 600, lineHeight: 1.05, letterSpacing: -2px }
  display-lg: { fontFamily: Inter, fontSize: 56px, fontWeight: 600, lineHeight: 1.1, letterSpacing: -1.5px }
  heading-1: { fontFamily: Inter, fontSize: 48px, fontWeight: 600, lineHeight: 1.1, letterSpacing: -1px }
  heading-2: { fontFamily: Inter, fontSize: 36px, fontWeight: 600, lineHeight: 1.2, letterSpacing: -0.5px }
  heading-3: { fontFamily: Inter, fontSize: 28px, fontWeight: 600, lineHeight: 1.3 }
  heading-4: { fontFamily: Inter, fontSize: 22px, fontWeight: 600, lineHeight: 1.3 }
  heading-5: { fontFamily: Inter, fontSize: 18px, fontWeight: 600, lineHeight: 1.4 }
  subtitle: { fontFamily: Inter, fontSize: 18px, fontWeight: 400, lineHeight: 1.5 }
  body-md: { fontFamily: Inter, fontSize: 16px, fontWeight: 400, lineHeight: 1.5 }
  body-sm: { fontFamily: Inter, fontSize: 14px, fontWeight: 400, lineHeight: 1.5 }
  caption: { fontFamily: Inter, fontSize: 13px, fontWeight: 400, lineHeight: 1.5 }
  micro: { fontFamily: Geist Mono, fontSize: 12px, fontWeight: 500, lineHeight: 1.5 }
  button: { fontFamily: Inter, fontSize: 14px, fontWeight: 500, lineHeight: 1.5 }
  code: { fontFamily: Geist Mono, fontSize: 14px, fontWeight: 400, lineHeight: 1.5 }
rounded:
  none: 0px
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  xxl: 24px
  full: 9999px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  xxxl: 40px
  section-sm: 48px
  section: 64px
  section-lg: 96px
  hero: 120px
components:
  button-primary: { backgroundColor: "{colors.primary}", textColor: "{colors.on-primary}", typography: "{typography.button}", rounded: "{rounded.md}", padding: 10px }
  button-primary-pressed: { backgroundColor: "{colors.primary-pressed}", textColor: "{colors.on-primary}", typography: "{typography.button}", rounded: "{rounded.md}" }
  button-primary-disabled: { backgroundColor: "{colors.primary}", textColor: "{colors.on-primary}", typography: "{typography.button}", rounded: "{rounded.md}" }
  button-accent-green: { backgroundColor: "{colors.brand-green}", textColor: "{colors.primary}", typography: "{typography.button}", rounded: "{rounded.md}" }
  button-on-dark: { backgroundColor: "{colors.on-dark}", textColor: "{colors.primary}", typography: "{typography.button}", rounded: "{rounded.md}" }
  button-secondary: { backgroundColor: "{colors.canvas}", textColor: "{colors.ink}", typography: "{typography.button}", rounded: "{rounded.md}" }
  form-control: { backgroundColor: "{colors.canvas}", textColor: "{colors.ink}", typography: "{typography.body-md}", rounded: "{rounded.md}", height: 44px }
  form-control-focused: { backgroundColor: "{colors.canvas}", textColor: "{colors.ink}", typography: "{typography.body-md}", rounded: "{rounded.md}", height: 44px }
  card-base: { backgroundColor: "{colors.canvas}", textColor: "{colors.body}", rounded: "{rounded.lg}", padding: "{spacing.xl}" }
  docs-route-active: { backgroundColor: "{colors.surface}", textColor: "{colors.ink}", typography: "{typography.body-sm}", rounded: "{rounded.sm}" }
  code-block: { backgroundColor: "{colors.surface-code}", textColor: "{colors.on-dark}", typography: "{typography.code}", rounded: "{rounded.md}", padding: "{spacing.md}" }
---
# StimeMC — Light Website Design System

Updated 2026-10-10 (Asia/Seoul). The latest user brief supersedes earlier visual specifications. This is a light website with disciplined typography, white panels, thin borders, black primary actions and sparse mint accents. The authoritative CSS values are in `app/styles/main.css`.

## Overview

Use atmospheric Minecraft imagery for the main marketing surfaces and dense, readable information layouts for the deeper routes. Mint marks deliberate actions and active states; ordinary prose stays neutral.

## Colors

| Named token | CSS token | Value / role |
| --- | --- | --- |
| `colors.canvas` | `--color-canvas` | #ffffff · page canvas |
| `colors.surface` | `--color-surface` | #f6f7f8 · quiet panels |
| `colors.surface-soft` | `--color-surface-soft` | #fafbfc · subtle section contrast |
| `colors.surface-raised` | `--color-surface-raised` | #edf1f4 · selected technical surfaces |
| `colors.surface-code` | `--color-surface-code` | #111b24 · dark code blocks |
| `colors.ink` | `--color-ink` | #111827 · headings and primary text |
| `colors.body` | `--color-body`, `--color-charcoal` | #374151 · prose |
| `colors.secondary` | `--color-text-soft` | #4b5563 · secondary text |
| `colors.mute` | `--color-mute`, `--color-steel` | #5b687a · readable metadata on white and subtle gray surfaces |
| `colors.disabled` | `--color-muted` | #94a3b8 · unavailable controls |
| `colors.hairline` | `--color-hairline` | #e5e7eb · 1px dividers |
| `colors.hairline-soft` | `--color-hairline-soft` | #eef0f2 · quieter borders |
| `colors.hairline-strong` | `--color-hairline-strong` | #cdd3d9 · emphasized borders |
| `colors.primary` | `--color-primary` | #111111 · dominant CTA |
| `colors.primary-pressed` | `--color-primary-dark` | #333333 · pressed action |
| `colors.on-primary` | `--color-on-primary` | #ffffff · black-button text |
| `colors.brand-green` | `--color-brand-green` | #00d4a4 · sparse accents and selection indicators |
| `colors.brand-green-deep` | `--color-brand-green-deep`, `--color-accent` | #087f68 · readable active/link text and focus |
| `colors.brand-green-soft` | `--color-brand-green-soft` | #e8f8f2 · restrained success/selected tint |
| `colors.hero-sky-from/to` | `--color-hero-sky-from/to` | #cfe8f6 → #fff8e9 · homepage introduction |
| `colors.hero-dark-from/to` | `--color-hero-dark-from/to` | #073932 → #2b8275 · local crossplay feature band |
| `colors.on-dark` | `--color-on-dark` | #ffffff · inverted feature text |
| `colors.on-dark-muted` | `--color-on-dark-muted` | #b9d1ce · inverted metadata |
| `colors.success/warning/error` | `--color-success/warning/danger` | #087f68 / #b96f19 / #d13e55 · functional states |

The website has one light theme. Dark code blocks and the crossplay feature band are local component surfaces. Mint never replaces black as the default button color or becomes a general prose color.

## Typography

Inter is the sole UI, prose and display family through `--font-sans`; `--font-display` aliases it. Korean text uses the existing sans-serif fallbacks. Geist Mono through `--font-mono` is limited to code, dates, versions, status and technical metadata. Both fonts are locally hosted with swap loading; there is no third display face.

| Named token | Size / weight / line height | Use |
| --- | --- | --- |
| `typography.hero-display` | 72px / 600 / 1.05 | Centered homepage message; 56px tablet, 44–36px mobile |
| `typography.heading-1` | Up to 48px / 600 / 1.1–1.2 | Information-page titles; typically 32px mobile |
| `typography.heading-2` | 36px / 600 / 1.2–1.3 | Major section heading |
| `typography.heading-3` | 28px / 600 / 1.3 | Document chapters |
| `typography.heading-4` | 22px / 600 / 1.3 | Panel headings |
| `typography.heading-5` | 18px / 600 / 1.4 | Compact headings |
| `typography.subtitle` | 18px / 400 / 1.5 | Hero supporting copy |
| `typography.body-md` | 16px / 400 / 1.5 | All primary prose |
| `typography.body-sm` | 14px / 400–500 / 1.5 | Navigation and secondary copy |
| `typography.caption` | 13px / 400 / 1.5 | Help text |
| `typography.micro` | 12px / 500–600 / 1.4–1.5 | Technical labels |
| `typography.button` | 14px / 500 / 1.3–1.5 | Actions |
| `typography.code` | 14px / 400 / 1.5 | Code blocks; 13px on narrow screens |

Large headings use modest negative tracking. Body copy retains a comfortable reading measure and wraps long Korean labels within its column.

## Layout

| Named token | Value / application |
| --- | --- |
| `spacing.base` | 4px base; prefer 8px increments |
| `spacing.xs/sm/md/lg/xl/xxl` | 8 / 12 / 16 / 20 / 24 / 32px |
| `spacing.section-sm/section/section-lg` | 48 / 64 / 96px; documents use 24–32px chapter gaps |
| `layout.wide` | `--container-wide`: 1280px; 32px desktop and 16px mobile side gutters |
| `layout.reading` | `--container-reading`: 720px |
| `layout.navigation` | `--nav-height`: 64px |
| `radius.micro/nav/control/panel/visual` | 4 / 6 / 8 / 12 / 16px |
| `depth.flat` | No shadow; thin hairline border for documents, forms and panels |
| `depth.visual` | Restrained shadow for the homepage archive image frame |

Controls use `--radius-sm` (8px), standard panels use `--radius-lg` (12px). Full pills are limited to compact badges and intentional selectors.

## Elevation & Depth

Use hairline borders for ordinary information surfaces. Reserve the diffuse visual shadow for large archive imagery and floating menus; selected surfaces remain mostly flat.

## Shapes

Controls use 8px corners, panels 12px, and major image framing up to 16px. Pills are reserved for short status indicators and intentional selectors.

## Components

| Component | Base composition | Named state variants |
| --- | --- | --- |
| `button-primary` | Black rectangle, white 14px label, 8px radius | `-pressed`: primary-pressed; `-disabled`: visibly unavailable with disabled semantics; `-focused`: 2px deep-mint outline |
| `button-secondary` | White/transparent, hairline border, ink label | `-pressed`: surface-raised; `-disabled`: muted; `-focused`: deep-mint outline |
| `docs-route` | Compact 14px navigation row | `-active`: light surface, ink label, mint marker; `-focused`: visible outline |
| `docs-toc` | 13px section links, real anchor IDs | `-active`: deep-mint text; `-focused`: visible outline |
| `edition-tab` | Text tabs and thin bottom divider | `-active`: ink underline and selected semantics; `-disabled`: unavailable; `-focused`: visible outline |
| `form-control` | Labeled white input, hairline border, 8px radius | `-focused`: deep-mint border/outline; `-disabled`: muted and non-editable; error/success use semantic tokens |
| `server-panel` | White bordered 12px panel; visible lifecycle status | `-active`: eligible published connection action only; `-disabled`: honest preparation/planning state |
| `document-panel` | Flat white prose, light callout, dark code and contained table scrolling | Links retain visible focus and active feedback |
| `native-disclosure` | Native details/summary for compact navigation, TOC and footer | `-active`: open content; `-focused`: visible keyboard outline |

Desktop actions are generally 36–40px high; mobile controls and navigation reach 44px. Hover adds quiet background or text feedback without revealing required information.

## Do's and Don'ts

Keep mint sparse, body prose at 16px/1.5, buttons rectangular, and meaningful content available without hover. Avoid competing accents, excessive shadows, forced scrolling and oversized empty sections.

## Page composition

The homepage (`Hero`) uses centered text and black/outlined actions above a wide, clearly labeled StimeMC archive screenshot. `ServerWorlds` presents the two worlds as white panels. Shared crossplay uses the local green feature band; archive, published news and next actions return to the white canvas. Server hub/details reuse truthful registry states and labeled archive imagery.

`DocsLayout` structures Join, policy and information pages: 220px route sidebar, flexible reading column capped at 720px, 160px TOC, 40px gaps. At constrained desktop widths columns become 200px / flexible / 140px with 24px gaps. Below 1024px, the page becomes one reading column with native navigation/TOC disclosures. The route filter filters known destinations. `GuideHeader` supplies compact breadcrumbs, title and description inside that column.

History uses dated reference chapters; updates use a vertical website changelog; news uses a publication directory with real empty/error states; reports preserve Markdown, metadata and uppercase historical `/News` slugs. Mechanism uses `CrossplayBridge compact` inside the reading column and separates shared Geyser direction from the documented ViaProxy/Java 1.21.1 implementation. Support/taskboard preserve member, guest and authorized administration workflows in light forms and conversation layouts. OAuth callback keeps its original routing behavior.

The white shared header retains navigation, language control and the compact menu. Footer groups are expanded on desktop and become native accordions below 768px. Keyboard focus, menu focus return, safe-area spacing and native scrolling remain part of the shell. Motion stays restrained; reduced motion removes nonessential transforms and smooth scrolling.

## Motion refinements — 2026-10-10

- The main menu drops 48px into place over 340ms; related link groups enter with a short 25ms stagger. The backdrop fades independently in 180ms.
- Native guide/TOC and mobile footer disclosures expand in 280ms and collapse in 220ms. Repeated clicks reverse from the current height rather than restarting at an endpoint. Native keyboard behavior and document flow remain intact.
- Mobile guest dialogs rise from the bottom; desktop dialogs use a much smaller centered entrance. Native modal focus/scroll isolation remains until the closing transition finishes.
- Explicit chapter and archive-image targets enter once with opacity and a 20px lift over 460ms on desktop; mobile uses 12px/360ms. Existing hero/world motion remains independent. There is no interception of native scrolling.
- Content is visible in server HTML and on the first client render. Only targets below the viewport are prepared for entry after hydration. Focusing a pending link reveals its container immediately.
- Reduced-motion preferences disable nonessential movement and expansion animation, including when the preference changes during a transition. Every control remains immediately usable.

## Responsive readability refinements — 2026-10-10

- Metadata and image captions stay at least 12px. Body copy remains 16px/1.5. All form inputs use 16px to preserve legibility and avoid automatic mobile input zoom.
- Buttons, mobile links, breadcrumbs and touch navigation provide at least 44px targets. Desktop information navigation expands to 44px when a coarse pointer is detected.
- At 280px cover-screen widths, the header keeps its controls reachable with compact spacing. The hero title scales between 28px and 36px below 480px; edition/world cards stack below 480px.
- Inquiry and administration workspaces collapse according to their actual container width. Dialogs fit short viewports, scroll internally and keep their close control visible. Safe-area spacing remains part of their layout.
- Conversations open below the fixed navigation on stacked layouts. Incoming-message scrolling stays inside the message feed so it does not push the composer below the viewport.
- Numeric rule/recovery markers and news arrows use content-sized columns so enlarged text does not clip. Published connection controls span the complete server panel and preserve a readable manual-copy fallback.
- Markdown code and tables retain native horizontal scrolling and visible keyboard focus. Muted text uses #5b687a to meet contrast on raised gray surfaces.

## Content and verification

`app/shared/serverGroup.mjs` and `app/shared/siteContent.mjs` remain factual authorities. THE GREAT WAR is CURRENT / PREPARING; SURVIVAL is PLANNED / COMING LATER. These labels do not imply live access. Unpublished connection, version and release values remain unpublished. Archive screenshots do not establish either new server's map. Historical text, policies, bilingual states and backend authorization are preserved.

Redesign artifacts belong in `docs/verification/stimemc-light-2026-10-10`, motion checks in `docs/verification/stimemc-motion-2026-10-10`, and the full responsive audit in `docs/verification/stimemc-responsive-2026-10-10`. Record viewport, functional fixture and integration results there; this design specification does not claim unrecorded production, authenticated or real-device checks. Never open, read, print, copy or modify `.env.local` during this work.
