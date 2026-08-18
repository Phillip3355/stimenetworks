# Immersive Web Design Skill

## Goal

Create a personal Codex skill named `immersive-web-design`. Given a homepage brief and, optionally, one or more reference URLs or screenshots, it must take a project from visual analysis through a project-local `DESIGN.md` and a production-ready animated React homepage.

## Scope

Use the reference-first workflow popularized by getdesign.md, without copying a reference site or treating one reference as a mandatory visual style. Extract reusable design decisions—visual hierarchy, palette roles, typography, spacing, layout rhythm, component conventions, imagery treatment, and interaction character—then adapt them to the user's product and content.

Target Next.js App Router, React, Tailwind CSS, and Framer Motion by default. Respect an existing project's stack and patterns when they differ.

## Workflow

1. Inspect the project and collect the product goal, audience, conversion action, available content, and reference links or assets.
2. Analyze each reference through visible, publicly available page state. Record observations rather than copying branded content, assets, or exact layouts.
3. Write or update a project-local `DESIGN.md` before creating UI. Include design intent, token roles, type scale, spacing scale, layout rules, component patterns, image treatment, interaction vocabulary, responsive behavior, and explicit anti-patterns.
4. Propose a homepage narrative and visual direction. Obtain approval before implementation when the requested work is creative or materially changes the product.
5. Build the page from focused React components. Keep static content server-rendered where possible and isolate interactive motion in client components.
6. Apply purposeful motion: entrance sequencing, viewport reveals, hover and focus feedback, state transitions, and only context-appropriate scroll effects.
7. Validate behavior at desktop and mobile widths, keyboard navigation, color contrast, reduced-motion support, image/layout stability, and build/lint checks.

## Motion System

Use Framer Motion as the preferred motion layer. Define a small, coherent vocabulary rather than applying unrelated effects:

- Reveal: short opacity and vertical-offset entrances, sequenced only where hierarchy benefits.
- Interaction: responsive button, link, card, and control feedback with stable layout.
- Emphasis: one primary visual moment per page or section; avoid competing perpetual animation.
- Transition: preserve context between content states and do not delay essential content.

Honor `prefers-reduced-motion` by removing nonessential transforms, looping motion, and scroll-linked animation while keeping content and controls fully usable.

## Guardrails

- Do not reproduce a reference site's copyrighted copy, logos, photographs, or exact page composition.
- Do not default to generic centered-hero + three-card landing pages when the product story calls for a stronger narrative.
- Do not use animation that causes vestibular discomfort, impairs readability, shifts layout, blocks input, or harms initial-load performance.
- Do not add a client boundary only for decorative styling.
- Do not claim visual, accessibility, or performance quality without inspecting the result.

## Skill Package

Create the package at `C:\\Users\\hhajj\\.codex\\skills\\immersive-web-design`.

- `SKILL.md`: concise activation criteria and the end-to-end workflow.
- `agents/openai.yaml`: generated UI metadata matching the skill.
- `references/design-analysis.md`: reference-analysis template and `DESIGN.md` outline.
- `references/motion-and-quality.md`: Framer Motion patterns, reduced-motion rules, performance limits, and final verification checklist.

No fixed page template is included: the design system must be derived for each project.

## Success Criteria

- The skill triggers for homepage, landing page, marketing site, or React website work that needs reference-driven visual design, motion, or a `DESIGN.md`.
- A URL can be used as an input to generate a distinct project-local `DESIGN.md` and implementation plan.
- The implementation workflow includes code, responsive behavior, animation, and quality checks rather than stopping at a design document.
- The skill is discoverable in Codex, passes structural validation, and makes no assumptions about proprietary reference assets.
