# StimeMC redesign completion and review — 2026-10-09

Application revision: `27c37a0134c7178e371f1e392cae40bd4af746da`. Validation revision: `a67912613afb35ce1c46c10eba22c8fd760248bb`.
Branch: `codex/stimemc-server-group`. Approved delivery leaves this branch and managed worktree intact; no push, merge or deployment.

All four implementation tasks completed with scoped task reviews. The most-capable broad review covered `a8cfac1..f9df372` and found one Important registry launch presentation defect and one Minor expected diagnostic. Exactly one final fix wave resolved both; exactly one scoped re-review of `f9df372..27c37a0` found both ADDRESSED and no new breakage.

- [Broad review](verification/stimemc-2026-10-09/final-review.md)
- [Final fix report](verification/stimemc-2026-10-09/final-fix-report.md)
- [Scoped re-review](verification/stimemc-2026-10-09/final-scoped-review.md)
- [Validation, screenshots and limits](stimemc-redesign-validation-2026-10-09.md)

Controller evidence after the scoped review: the replacement final browser artifact contains 60 samples across five affected routes at all 12 requested sizes. Every requested viewport was asserted equal to actual DOM dimensions before saving. Independent parsing confirms 60 records, 12 distinct sizes, zero invalid dimensions, document overflow, clipped headings, undersized sampled buttons, missing main h1 or unpublished Copy controls. Subpixel tolerance for bounds/control measurement is 0.5px. The initial attempt targeted an unselected tab and measured 1440×900 throughout; it was discarded before staging, and is not counted as responsive evidence. The original committed 168-sample matrix has all 12 correct actual dimensions and retains its provenance.

The scoped review accurately noted missing standalone type-check log files at its review time. The implementer then confirmed both explicit checks returned exit 0 and empty output; PowerShell Tee-Object created no file for empty output. The fix report removes the nonexistent log references. Independent build TypeScript success remains supported by final-fix-build.log. No suite or build was repeated for evidence-only documentation changes.

The final test/lint/build/smoke/current-render/preserved-content logs are retained alongside the review reports in docs/verification/stimemc-2026-10-09. Current rendering is byte-identical in 38 comparisons with the pre-fix application, and original registry/brand/history/rules equality is recorded. Backend credentials, operational submissions, real mobile devices and runtime reduced-motion preference emulation remain outside verified coverage, as documented.

## Rulings I made

Ruling: New-server policy selections retain the original policy as an explicitly labeled historical reference, with an unpublished-policy notice — preserves required policy bodies while avoiding invented new-server rules — if users expect the reference to disappear, the scope interaction needs a small display change.
Ruling: Accept unavailable device/reduced-motion/operational-service checks as explicitly recorded limits; rely on source, preserved contracts, isolated automated tests and controller measurements without claiming those runtime passes; retain the historical fixture as DOM text and original policy/history as contracted — these six declined-review behaviors have either evidence or disclosed limits — if these surfaces reveal issues, real-device/authenticated release QA or additional original-Markdown comparison is needed.

These are the exhaustive two controller rulings from the execution ledger, preserved in their original order with the rework cost if wrong.

Cleanup attempted only this completed plan's ignored scratch workspace, after preserving these records and validating the resolved path. Automatic approval review rejected the removal as “blocked by policy”; no more specific reason was supplied. The scratch directory is retained. Source, screenshots, committed measurements, dependency junction, other plans and the final preview build stay intact.
Trailing whitespace and final blank lines in copied build/lint transcripts were normalized for the repository whitespace check; diagnostic and result text is unchanged.
