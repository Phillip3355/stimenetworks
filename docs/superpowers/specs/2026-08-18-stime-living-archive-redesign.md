# StimeMC Living Archive Redesign Specification

## Goal

Redesign every public, support, administration, STAGE, report, and authentication page with the approved Living Server Archive system while preserving all routes, Supabase contracts, authentication, realtime behavior, and mobile workflow described in `REDESIGN_NOTES.md`.

## Scope

The implementation covers `/`, `/join`, `/support`, `/taskboard`, `/voice`, `/voice-[roomCode]` through the existing rewrite, `/server-mechanism`, `/rules`, `/recovery-guidelines`, `/updates`, `/auth/callback`, and dynamic Markdown report routes.

The redesign does not alter Supabase table names, realtime channels, OAuth behavior, administrator detection, STAGE authorization, inquiry limits, or route rewrites.

## Architecture

1. Create one pure site-content module containing navigation groups and home feature routes. Components consume this module so route preservation is testable without rendering React.
2. Replace the current light token system with the dark Living Archive tokens documented in `DESIGN.md`.
3. Rebuild shared navigation, footer, home hero, and feature-story components. Keep content server-rendered where practical and isolate animation in focused client components.
4. Apply one shared visual language to the existing information and operational pages by updating their existing CSS modules. Preserve their data and event handlers.
5. Add targeted global overrides for legacy inline surfaces only where functional pages cannot be safely restructured without touching their data behavior.

## Required Routes and Links

Navigation must expose `/`, `/join`, `/support`, `/taskboard`, `/voice`, `/server-mechanism`, `/rules`, `/recovery-guidelines`, and `/updates`.

Home feature cards link as follows:

- Cross-platform play → `/join`
- Peaceful survival and server architecture → `/server-mechanism`
- STAGE and realtime help → `/support`

The Learn more label is bilingual via the existing `t(ko, en)` function. It must not display both languages at once.

## Page Requirements

### Home

- Display `StimeMC` in the navbar and hero.
- Use `NEW2.webp` as the primary desktop hero and a deliberate crop of `minecraft2.webp` or `NEW2.webp` on mobile.
- Present three feature cards with actual server images, descriptive text, and Learn more links.
- Cards reveal one at a time from alternating horizontal directions over 0.9–1.15 seconds.
- Avoid hard-coded line breaks in headings.

### Information Pages

- `/join`, `/server-mechanism`, `/rules`, `/recovery-guidelines`, and `/updates` use a shared dark page intro and numbered editorial sections.
- Existing copy and bilingual behavior remain intact.
- CTA controls meet 44px touch height and do not overflow at 360px.

### Support and Taskboard

- Preserve Google OAuth, inquiry creation, 1-hour limit, realtime replies, inquiry states, admin redirect, report publishing, and STAGE management.
- Re-skin list, chat, form, tabs, empty states, badges, and feedback surfaces.
- Preserve the mobile list/detail switch and back button.

### STAGE

- `/voice` lists only public STAGE rooms and provides direct code entry.
- `/voice-[roomCode]` preserves WebRTC audio, screen sharing, realtime participant state, admin deletion, and speaker permission behavior.
- Controls remain visible and usable on mobile.

### Reports and Auth

- Dynamic Markdown reports use the dark editorial article system with readable prose, tables, code, and blockquotes.
- Auth callback uses a centered dark status surface and preserves redirect behavior.

## Responsive Rules

- 360px and 430px: one-column content, 4:3 or 16:10 media, 44px controls, no horizontal overflow.
- 768px: compact navigation with language selector and menu button; two-column content may remain only when both columns have adequate reading width.
- 1024px: compact or full navigation based on available container width; operational pages retain usable split panes.
- 1440px: full navigation and immersive image-led composition.
- Korean headings use natural balanced wrapping with no hard-coded `<br>`.

## Motion and Accessibility

- Use transform and opacity only for reveal motion.
- Respect `prefers-reduced-motion` through Framer Motion and CSS fallbacks.
- Maintain semantic landmarks, visible focus, sufficient contrast, descriptive image alt text, and keyboard-operable menus.
- Menu opening locks background scroll, traps focus where practical, closes on route change, and returns focus to the trigger.

## Verification

- Add tests for required navigation routes and home Learn more destinations before implementing the content module.
- Run `npm test`, `npm run lint`, and `npm run build`.
- Verify 360px, 430px, 768px, 1024px, and 1440px with no horizontal overflow.
- Check the home reveal sequence, reduced-motion behavior, menu transition, bilingual alignment, support mobile switch, and STAGE listing/room entry surfaces.

## Preservation Constraints

All constraints in `REDESIGN_NOTES.md` are normative. Existing uncommitted STAGE changes in `app/taskboard/page.tsx`, `app/voice/page.tsx`, `app/voice/[roomCode]/page.tsx`, `app/components/Navbar.tsx`, `package.json`, and `supabase_schema.sql` must be preserved.
