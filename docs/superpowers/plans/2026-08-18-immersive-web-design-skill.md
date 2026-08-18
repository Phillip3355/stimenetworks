# Immersive Web Design Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create an auto-discoverable Codex skill that turns a homepage brief plus optional reference URLs into a reference-derived `DESIGN.md` and a high-quality React implementation for desktop and mobile.

**Architecture:** Keep activation and execution instructions in `SKILL.md`. Put reusable templates and detailed quality rules one level down in three focused references, so they are loaded only when needed. Use the Skill Creator initializer to generate valid package structure and UI metadata, then validate with its official checker.

**Tech Stack:** Codex skills, Markdown, YAML, Skill Creator `init_skill.py` and `quick_validate.py`.

**Spec:** `docs/superpowers/specs/2026-08-18-immersive-web-design-skill-design.md`

## Global Constraints

- Create the package at `C:\\Users\\hhajj\\.codex\\skills\\immersive-web-design`.
- Use lowercase hyphenated naming and only `name` and `description` in `SKILL.md` frontmatter.
- Analyze references through publicly visible state; never copy proprietary assets, copy, logos, or exact composition.
- Treat desktop and mobile as separate designs and inspect 360px, 430px, 768px, laptop, and primary desktop widths.
- Target Next.js App Router, React, Tailwind CSS, and Framer Motion by default while honoring an existing project stack.
- Include reduced-motion, accessibility, layout-stability, and performance checks.

---

### Task 1: Initialize the skill package

**Files:**
- Create: `C:\Users\hhajj\.codex\skills\immersive-web-design\SKILL.md`
- Create: `C:\Users\hhajj\.codex\skills\immersive-web-design\agents\openai.yaml`
- Create: `C:\Users\hhajj\.codex\skills\immersive-web-design\references\`

**Interfaces:**
- Produces: a valid skill directory consumed by Codex discovery and the later reference files.

- [ ] **Step 1: Verify the package is absent**

Run: `Test-Path 'C:\Users\hhajj\.codex\skills\immersive-web-design'`

Expected: `False`; if it exists, inspect and update it rather than overwriting it.

- [ ] **Step 2: Initialize package and metadata**

Run:

```powershell
python 'C:\Users\hhajj\.codex\skills\.system\skill-creator\scripts\init_skill.py' immersive-web-design --path 'C:\Users\hhajj\.codex\skills' --resources references --interface 'display_name=Immersive Web Design' --interface 'short_description=Reference-driven animated React websites' --interface 'default_prompt=Use $immersive-web-design to analyze this reference and build a responsive homepage.'
```

- [ ] **Step 3: Verify generated structure**

Run: `Get-ChildItem -Recurse 'C:\Users\hhajj\.codex\skills\immersive-web-design'`

Expected: `SKILL.md`, `agents/openai.yaml`, and `references` exist.

### Task 2: Author activation and end-to-end workflow

**Files:**
- Modify: `C:\Users\hhajj\.codex\skills\immersive-web-design\SKILL.md`

**Interfaces:**
- Consumes: the initialized package from Task 1.
- Produces: precise triggering behavior and a workflow that points to each detailed reference.

- [ ] **Step 1: Define trigger metadata**

Write a description that triggers for homepage, marketing site, landing page, reference URL, `DESIGN.md`, responsive React design, and purposeful motion requests.

- [ ] **Step 2: Define the core workflow**

Require project inspection, reference analysis, creation of project-local `DESIGN.md`, desktop/mobile design decisions, implementation, and verification. Instruct the agent to request approval only where platform policy requires it; otherwise make scoped design decisions autonomously.

- [ ] **Step 3: Link detailed references conditionally**

Link `design-analysis.md` for reference-derived design systems, `device-fidelity.md` for viewport work, and `motion-and-quality.md` for implementation and final verification.

### Task 3: Add reusable reference-analysis and device-fidelity templates

**Files:**
- Create: `C:\Users\hhajj\.codex\skills\immersive-web-design\references\design-analysis.md`
- Create: `C:\Users\hhajj\.codex\skills\immersive-web-design\references\device-fidelity.md`

**Interfaces:**
- Consumes: the workflow in `SKILL.md`.
- Produces: a project-local `DESIGN.md` outline and device-specific review matrix.

- [ ] **Step 1: Create the analysis template**

Include fields for design intent, visual hierarchy, palette roles, typography, spacing, layout rhythm, component patterns, imagery, interaction vocabulary, content strategy, and anti-patterns. Distinguish observed facts from implementation adaptations.

- [ ] **Step 2: Create the device-fidelity template**

Specify desktop focal point, wide-layout density, pointer affordances, laptop review, mobile information order, touch targets, navigation transition, image strategy, safe areas, and the five required viewport checks.

- [ ] **Step 3: Confirm references are linked from `SKILL.md`**

Run: `Select-String -Path 'C:\Users\hhajj\.codex\skills\immersive-web-design\SKILL.md' -Pattern 'design-analysis.md|device-fidelity.md'`

Expected: both reference filenames appear.

### Task 4: Add motion and quality guidance

**Files:**
- Create: `C:\Users\hhajj\.codex\skills\immersive-web-design\references\motion-and-quality.md`

**Interfaces:**
- Consumes: the design system and device requirements.
- Produces: implementation constraints for React/Tailwind/Framer Motion and a final verification checklist.

- [ ] **Step 1: Define the motion vocabulary**

Cover reveal, interaction, emphasis, and transition patterns, with duration/easing constraints and when not to animate.

- [ ] **Step 2: Define technical safeguards**

Require `prefers-reduced-motion`, stable image aspect ratios, no hover-only meaning, keyboard focus visibility, minimal client boundaries, and no layout-shifting animation.

- [ ] **Step 3: Define completion checks**

Require visual checks at all target viewports, no horizontal overflow or clipped CTA, keyboard/mobile-menu behavior, build/lint output, and an honest report of any unavailable test surface.

### Task 5: Validate and register the completed package

**Files:**
- Verify: `C:\Users\hhajj\.codex\skills\immersive-web-design\`

**Interfaces:**
- Consumes: all package files.
- Produces: an officially validated, auto-discoverable personal skill.

- [ ] **Step 1: Run the Skill Creator validator**

Run:

```powershell
python 'C:\Users\hhajj\.codex\skills\.system\skill-creator\scripts\quick_validate.py' 'C:\Users\hhajj\.codex\skills\immersive-web-design'
```

Expected: validation succeeds with no structural errors.

- [ ] **Step 2: Inspect the complete package**

Run: `Get-ChildItem -Recurse -File 'C:\Users\hhajj\.codex\skills\immersive-web-design' | Select-Object FullName,Length`

Expected: only `SKILL.md`, `agents/openai.yaml`, and the three required references are present.

- [ ] **Step 3: Check reference integrity**

Run: `Select-String -Path 'C:\Users\hhajj\.codex\skills\immersive-web-design\SKILL.md' -Pattern 'references/(design-analysis|device-fidelity|motion-and-quality)\.md'`

Expected: all three references are discoverable from the skill body.
