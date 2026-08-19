# StimeMC Living Archive Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved Living Server Archive design to every route while preserving inquiry, authentication, report, STAGE, WebRTC, realtime, and routing behavior.

**Architecture:** A pure route/content module supplies navigation and home feature destinations. Shared layout components and CSS tokens establish the visual system; focused Framer Motion client components provide navigation and scroll reveals. Existing operational page logic remains intact and receives the new system through its existing CSS module plus narrowly scoped markup changes.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, Framer Motion 12, Supabase, Node test runner.

**Spec:** `docs/superpowers/specs/2026-08-18-stime-living-archive-redesign.md`

## Global Constraints

- Preserve `/`, `/join`, `/support`, `/taskboard`, `/voice`, `/voice-[roomCode]`, `/server-mechanism`, `/rules`, `/recovery-guidelines`, `/updates`, `/auth/callback`, and dynamic report routes.
- Preserve Supabase tables `inquiries`, `inquiry_messages`, `reports`, `voice_rooms`, and `voice_room_members` and their realtime subscriptions.
- Preserve Google OAuth, the shared admin-email policy plus `NEXT_PUBLIC_ADMIN_EMAILS`, inquiry throttling, STAGE authorization, WebRTC, and the `/voice-[roomCode]` rewrite.
- Display exactly one selected language at a time through the existing `t(ko, en)` function.
- Use actual server images before generated artwork; do not copy reference branding, assets, copy, or exact composition.
- Support 360px, 430px, 768px, 1024px, and 1440px without horizontal overflow.
- Honor `prefers-reduced-motion` and keep essential content visible without animation.
- Preserve the user's existing uncommitted STAGE changes.

---

### Task 1: Route and Service Content Contract

**Files:**
- Create: `app/lib/siteContent.mjs`
- Create: `tests/site-content.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `navigationGroups`, `requiredNavigationPaths`, and `homeFeatures` arrays.
- `homeFeatures` entries expose `id`, `titleKo`, `titleEn`, `descriptionKo`, `descriptionEn`, `image`, `href`, and `direction`.

- [ ] **Step 1: Write the failing route tests**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { homeFeatures, requiredNavigationPaths } from '../app/lib/siteContent.mjs';

test('navigation preserves every public and operational route', () => {
  assert.deepEqual(requiredNavigationPaths, [
    '/', '/join', '/support', '/taskboard', '/voice',
    '/server-mechanism', '/rules', '/recovery-guidelines', '/updates',
  ]);
});

test('home feature learn-more links target documented services', () => {
  assert.deepEqual(homeFeatures.map(({ href }) => href), [
    '/join', '/server-mechanism', '/support',
  ]);
});
```

- [ ] **Step 2: Run the test and confirm the missing module failure**

Run: `node --test tests/site-content.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `app/lib/siteContent.mjs`.

- [ ] **Step 3: Implement the content module and broaden the test command**

Create the three documented feature records using `/minecraft.webp`, `/minecraft2.webp`, and `/NEW2.webp`. Export navigation groups containing every required route. Change the package test script to:

```json
"test": "node --experimental-strip-types --test tests/*.test.mjs"
```

- [ ] **Step 4: Run all tests**

Run: `npm test`

Expected: the content tests and existing voice-room policy tests pass.

- [ ] **Step 5: Commit the contract**

```bash
git add app/lib/siteContent.mjs tests/site-content.test.mjs package.json
git commit -m "test: lock Stime navigation and service links"
```

### Task 2: Global Foundations, Navigation, and Footer

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/styles/main.css`
- Modify: `app/globals.css`
- Modify: `app/components/Navbar.tsx`
- Modify: `app/styles/navbar.module.css`
- Modify: `app/components/Footer.tsx`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `navigationGroups` from Task 1.
- Produces: fixed responsive navigation, equal-cell locale control, menu overlay, site content offset, and global dark tokens.

- [ ] **Step 1: Replace global color, type, spacing, focus, form, and overflow tokens**

Use the exact foundation values from `DESIGN.md`. Add `body { overflow-x: clip; }`, `:focus-visible` outlines, balanced Korean headings, reduced-motion behavior, and `.siteContent` instead of the inline padding wrapper.

- [ ] **Step 2: Rebuild Navbar with width-aware states**

Render `StimeMC` as a text brand. Above 1000px show complete links; at 1000px and below show the menu button while retaining the equal-width KO/EN locale control. Keep route-close behavior and add `aria-expanded`, `aria-controls`, Escape close, and background scroll locking.

- [ ] **Step 3: Rebuild the menu overlay and footer**

The overlay lists every navigation group, uses one selected language, and exposes visible focus. The footer repeats core routes and the brand without placeholder contact data.

- [ ] **Step 4: Ignore visual companion artifacts**

Append `/.superpowers/` to `.gitignore` so brainstorming screens do not enter the product diff.

- [ ] **Step 5: Run lint**

Run: `npm run lint`

Expected: no new lint errors in shared layout components.

### Task 3: Immersive Home and Slow Feature Reveals

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/components/Hero.tsx`
- Modify: `app/styles/hero.module.css`
- Modify: `app/components/CardsGrid.tsx`
- Modify: `app/styles/cards.module.css`

**Interfaces:**
- Consumes: `homeFeatures` from Task 1 and `useLanguage()`.
- Produces: image-led hero, `StimeMC` title, and three alternating feature cards with bilingual Learn more links.

- [ ] **Step 1: Rebuild the hero narrative**

Use `NEW2.webp` on desktop and a deliberate `minecraft2.webp` crop on mobile. Render the brand, concise server description, `/join` primary CTA, `/voice` secondary CTA, and a scroll indicator.

- [ ] **Step 2: Rebuild feature cards as an alternating story**

Each card renders an image, index, localized title and description, and localized `더 알아보기` / `Learn more` link. Do not hard-code `<br>` elements.

- [ ] **Step 3: Implement slow one-time Framer Motion reveals**

Use `useInView({ once: true, amount: 0.22 })`, alternating `x: 38` and `x: -38`, opacity 0→1, duration 1.05 seconds, and easing `[0.22, 0.75, 0.2, 1]`. Mobile CSS limits the visual translation to 22px. When reduced motion is preferred, render with no transform or delay.

- [ ] **Step 4: Run tests and lint**

Run: `npm test && npm run lint`

Expected: route contracts pass and home components add no lint errors.

### Task 4: Information, Report, and Authentication Pages

**Files:**
- Modify: `app/styles/server-mechanism.module.css`
- Modify: `app/styles/report.module.css`
- Modify: `app/auth/callback/page.tsx`

**Interfaces:**
- Consumes: existing class names used by `/join`, `/server-mechanism`, `/rules`, `/recovery-guidelines`, `/updates`, and dynamic reports.
- Produces: shared dark intros, numbered editorial sections, readable Markdown, and a branded auth state.

- [ ] **Step 1: Replace the shared information-page module**

Keep every exported class name currently referenced by the pages. Use dark surfaces, hairline dividers, natural Korean wrapping, 44px actions, one-column mobile sections, and stable card proportions.

- [ ] **Step 2: Redesign report typography**

Use a 760px reading measure, accessible table overflow, dark code surfaces, visible links, and mobile-safe padding.

- [ ] **Step 3: Redesign auth callback without changing redirect logic**

Replace inline light presentation with semantic status classes and localized StimeMC loading/error text.

- [ ] **Step 4: Run lint**

Run: `npm run lint`

Expected: information and auth pages compile without new warnings.

### Task 5: Support, Admin, STAGE, and Room Surfaces

**Files:**
- Modify: `app/styles/server-mechanism.module.css`
- Modify: `app/support/page.tsx`
- Modify: `app/taskboard/page.tsx`
- Modify: `app/voice/page.tsx`
- Modify: `app/voice/[roomCode]/page.tsx`

**Interfaces:**
- Consumes: all existing handlers, Supabase queries, realtime subscriptions, and WebRTC refs.
- Produces: dark operational panels, responsive forms, preserved mobile list/chat switch, and visible STAGE controls.

- [ ] **Step 1: Add operational surface classes and legacy-inline containment**

Define list, chat, toolbar, input, badge, tab, form-surface, room-grid, participant, and media-preview styles. Use narrowly scoped `!important` declarations only to neutralize existing inline white backgrounds while leaving data behavior untouched.

- [ ] **Step 2: Apply semantic wrappers to support and taskboard**

Replace inline-only presentation where needed with module classes. Preserve inquiry creation, reply, publication, STAGE creation/deletion, and mobile `activeChat` behavior exactly.

- [ ] **Step 3: Apply the system to STAGE list and room**

Preserve `filterStageRooms`, direct code navigation, `/voice-[roomCode]`, mic/screen permissions, admin speaker designation, and participant realtime state.

- [ ] **Step 4: Run policy and lint checks**

Run: `npm test && npm run lint`

Expected: STAGE policy tests pass and functional pages compile.

### Task 6: Build and Viewport Verification

**Files:**
- Modify only files required by failures found in this task.

**Interfaces:**
- Consumes: completed application.
- Produces: verified production build and recorded viewport evidence.

- [ ] **Step 1: Run automated verification**

Run: `npm test`, `npm run lint`, and `npm run build` separately. Record exact output and fix only regressions caused by this redesign.

- [ ] **Step 2: Run the production-equivalent local app**

Run `npm run dev` and verify `/`, `/join`, `/server-mechanism`, `/rules`, `/recovery-guidelines`, `/updates`, `/support`, `/taskboard`, `/voice`, `/auth/callback`, and a dynamic report route when data is available.

- [ ] **Step 3: Verify required viewports**

At 360px, 430px, 768px, 1024px, and 1440px confirm no horizontal overflow, navigation state transitions, equal KO/EN cells, natural heading wrapping, visible CTAs, one-column mobile feature cards, and usable forms.

- [ ] **Step 4: Verify motion and accessibility**

Confirm slow one-time feature reveals, no layout shift, keyboard menu access, visible focus, descriptive alt text, and reduced-motion visibility.

- [ ] **Step 5: Review the final diff**

Run: `git diff --check` and `git status --short`.

Expected: no whitespace errors; pre-existing STAGE changes remain present and no Supabase schema or route contract is accidentally altered.
