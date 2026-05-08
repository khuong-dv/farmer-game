<!--
SYNC IMPACT REPORT
==================
Version change: (uninitialized template) → 1.0.0
Bump rationale: Initial ratification — first concrete content replaces placeholder template (MAJOR per semver for 0→1 baseline).

Modified principles:
  - [PRINCIPLE_1_NAME] → I. Spec-Driven Development
  - [PRINCIPLE_2_NAME] → II. Iterative Playtesting
  - [PRINCIPLE_3_NAME] → III. Type Safety & Quality Gates
  - Principles 4 & 5 from template → REMOVED (project elected 3-principle minimal set)

Added sections:
  - Tech Stack & Browser Targets (replaces [SECTION_2_NAME])
  - Development Workflow (replaces [SECTION_3_NAME])

Removed sections:
  - Two trailing principle slots (template had 5; project uses 3)

Templates checked:
  - .specify/templates/plan-template.md       ✅ aligned (Constitution Check is parametric — gates derived from this file)
  - .specify/templates/spec-template.md       ✅ aligned (no hard-coded principle references)
  - .specify/templates/tasks-template.md      ✅ aligned (task categories are framework-driven, not principle-specific)
  - .specify/templates/checklist-template.md  ✅ aligned (generic)
  - CLAUDE.md                                 ✅ aligned (defers to current plan)

Follow-up TODOs: none
-->

# Farmer Game Constitution

## Core Principles

### I. Spec-Driven Development

Every non-trivial change MUST flow through the spec-kit pipeline:
`/specify → /clarify (if ambiguous) → /plan → /tasks → /implement`.
Direct coding without a spec is permitted ONLY for: typo fixes, dependency bumps,
or single-file refactors fully covered by `/speckit-tiny-specify` + `/speckit-tiny-implement`.

**Rules:**
- New features MUST start with a spec under `specs/<branch>/spec.md`.
- Plans MUST list a Constitution Check before generating tasks.
- If the implementation diverges from the spec, run `/speckit-spex-evolve` instead of editing code silently.

**Rationale:** Solo dev memory is a poor source of truth six months later. Specs make intent re-readable
and unblock future agents (human or AI) without requiring the original author.

### II. Iterative Playtesting

Every feature that touches gameplay, rendering, input, or audio MUST be playtested in a real browser
before the implementing task is marked complete. Automated unit tests cover pure logic
(state machines, economy, save/load, pathfinding); they do NOT replace the playtest gate.

**Rules:**
- A feature is not "done" until the user has run `npm run dev` and exercised the golden path in-browser.
- Pure-logic modules (no DOM/Phaser scene access) MUST have unit tests; gameplay scenes are exempt.
- TDD is encouraged but NOT mandatory — pre-writing tests for visual/feel-driven code is wasted effort
  and is explicitly rejected here.

**Rationale:** Browser games live or die by feel. Tests confirm code correctness; only playtesting
confirms feature correctness. Forcing TDD on Phaser scenes produces fragile tests that mock the engine
into meaninglessness.

### III. Type Safety & Quality Gates

TypeScript MUST run in `strict` mode. Builds MUST pass before any commit on `main` (or before opening a PR
on a feature branch). The toolchain — not human discipline — enforces this.

**Rules:**
- `tsconfig.json` MUST have `"strict": true`. No project-wide disabling of `noImplicitAny`,
  `strictNullChecks`, or `noUncheckedIndexedAccess`.
- `any` is permitted ONLY at framework adapter boundaries (e.g., raw Phaser callbacks) and MUST
  be narrowed within the same module.
- Run-time validation (e.g., `zod` or hand-rolled guards) MUST wrap any data crossing a system boundary:
  `localStorage` saves, JSON imports, network responses, URL params.
- Pre-commit / pre-PR gates: `tsc --noEmit` clean, `eslint` clean, `vite build` succeeds.
  A failing gate blocks commit; bypassing with `--no-verify` is forbidden without a recorded reason.

**Rationale:** Solo dev means no second pair of eyes. The compiler and linter are the second pair of eyes.
A gate that's "usually run" is a gate that's never run; automation makes the rule self-enforcing.

## Tech Stack & Browser Targets

**Fixed stack** (deviations require a constitution amendment, not a one-off override):
- **Language:** TypeScript (strict mode)
- **Engine:** Phaser 3 (latest stable major)
- **Build / Dev server:** Vite (latest stable major)
- **Package manager:** npm (lockfile committed)

**Supported browsers** (golden-path testing target):
- Latest 2 stable releases of Chrome, Firefox, Safari, Edge — desktop.
- Mobile browser support is best-effort and NOT a release blocker unless explicitly scoped in a feature spec.

**Repository conventions:**
- `src/` — game source (TypeScript only).
- `public/assets/` — static assets shipped as-is (sprites, audio, JSON).
- `specs/` — feature specifications (managed by spec-kit).
- `dist/` — build output, gitignored.

**Forbidden without amendment:** introducing a second framework (React, Vue), swapping engines (Pixi, Three),
or changing the build tool. Adding a typed library (e.g., `zod`, `nanoid`) does NOT require an amendment.

## Development Workflow

The end-to-end loop for any non-trivial change:

1. **Branch** — created automatically by `/speckit-specify` per the configured convention
   (`{type}/{seq}-{kebab}`, see `.specify/branch-convention.yml`).
2. **Specify → Plan → Tasks** — generated artifacts live under `specs/<branch>/`.
3. **Implement** — execute via `/speckit-implement` or task-by-task; commit on green gates only.
4. **Quality gates (local, before each commit):**
   - `tsc --noEmit` passes
   - `eslint` passes
   - `vite build` passes
   - Relevant unit tests pass (pure-logic modules)
5. **Playtest gate (before marking the feature task complete):**
   - `npm run dev` running
   - Golden path exercised in-browser
   - Edge cases the spec called out exercised
   - One short note in the spec or task list confirming what was tested
6. **Commit & merge** — small, focused commits; merge to `main` only after gates 4 + 5 pass.

**Spec drift:** If reality diverges from the spec mid-implementation, STOP and run `/speckit-spex-evolve`.
Do not let code and spec silently disagree — that defeats Principle I.

## Governance

This constitution is **guidance optimized for a single developer**, not a compliance instrument.

- The constitution supersedes ad-hoc preferences when they conflict.
- Amendments are made by editing this file and running `/speckit-constitution`, which auto-bumps the version
  per semver:
  - **MAJOR** — a principle is removed or fundamentally redefined (backward-incompatible).
  - **MINOR** — a new principle/section is added or an existing one is materially expanded.
  - **PATCH** — wording cleanups, typo fixes, non-semantic refinements.
- **Deviations are allowed** when justified in writing — in the relevant spec, plan, or commit message
  (a single sentence is enough). Repeated deviations from the same rule are a signal to amend the rule,
  not to keep deviating.
- **No second-party approval is required** (solo project). The author is the reviewer.
- Plans MUST run a Constitution Check before tasks are generated; violations either get justified
  (in the plan's Complexity Tracking section) or get fixed before proceeding.

**Version**: 1.0.0 | **Ratified**: 2026-05-08 | **Last Amended**: 2026-05-08
