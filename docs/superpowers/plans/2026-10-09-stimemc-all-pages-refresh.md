# StimeMC all-pages visual refresh

**Goal:** Apply the user-supplied cinematic Minecraft design brief to every existing page in the requested worktree.

**Source:** User attachment, `docs/superpowers/specs/2026-10-09-stimemc-server-group-redesign.md`, and the existing server registry. This is a visual refresh of existing flows, with no backend or data-contract changes.

## Constraints

- Never access `.env.local`. Preview and production checks use dummy public configuration.
- Preserve Korean/English, original policy/history/report content, authentication, member/guest support, admin controls and all report URLs.
- Keep CURRENT/PREPARING and PLANNED/COMING LATER truthful. Archive images remain explicitly labeled as previous-world records.
- Use the existing React/Next.js/Framer Motion stack. No new product dependencies or fabricated imagery/data.
- Native scroll, complete stationary reduced-motion content, 44px touch controls and keyboard navigation.

## Work

- [x] Shared foundations: local Inter/Geist Mono, dark forest canvas, restrained mint, 8px controls/12px panels, 1280px information container; update DESIGN.md.
- [x] Shell and marketing: unboxed full desktop navigation, cinematic full-width image hero, spatial world reveal, two immersive server panels, server hub/details, crossplay, archive/news/join sections and footer.
- [x] Information: history, news, report/fallback pages, website updates and technology. Preserve source text, improve reading hierarchy and narrow-screen layouts.
- [x] Functional: join, rules, recovery, member/guest support, admin taskboard and authentication callback. Preserve handlers and states; improve forms, navigation and conversations.
- [x] Integration: inspect all route changes, run full existing tests, lint and an isolated production build.
- [x] Browser verification: every route at 360, 430, 768, 1366 and 1440px; inspect representative screenshots, keyboard menu, reduced motion, bilingual states, report rendering and actionable form states. Record actual results and limitations.

Independent page families are assigned separate files. The primary implementer owns shared styles and marketing components, then reviews and integrates the page work.
