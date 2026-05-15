# Implementation Plan: Project Skeleton Scaffold

**Branch**: `001-project-skeleton` | **Date**: 2026-05-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-project-skeleton/spec.md`

## Summary

Stand up the initial repository skeleton for a Phaser 3 + TypeScript + Vite browser game so that every later feature can be built against a stable foundation. Three independently-shippable slices: (1) an engine-alive smoke scene proving the toolchain end-to-end, (2) a typed game-state store with auto-saved, schema-versioned, zod-validated persistence in `localStorage`, and (3) automated quality gates (lint, type-check, test, build) enforced via a pre-commit hook locally and GitHub Actions in CI. No game-feature code beyond the smoke scene — the skeleton's job is to make future feature work cheap, not to ship gameplay.

Technical approach (from brainstorm + constitution): plain typed singleton state module (no external store dep), single-slot localStorage save with a `version` field and a stub migration entry point, layer-based `src/` tree (scenes/systems/entities/ui/state/data/types/utils), Vitest + jsdom for unit tests, husky + lint-staged for pre-commit, single-job GitHub Actions workflow for CI.

## Technical Context

**Language/Version**: TypeScript 5.x in `strict` mode (per Constitution III)
**Primary Dependencies**: Phaser 3 (latest stable major), Vite (latest stable major), zod (runtime validation at system boundaries), Vitest + jsdom (unit tests), ESLint + `@typescript-eslint/recommended` + `eslint-config-prettier`, Prettier, husky + lint-staged
**Storage**: Browser `localStorage` — single key `farmer-game:save` (single-slot)
**Testing**: Vitest with `jsdom` environment; seed unit tests cover the typed state store and the save schema
**Target Platform**: Modern desktop browsers — latest 2 stable Chrome / Firefox / Safari / Edge (per Constitution Tech Stack section). Mobile is best-effort, not a release gate.
**Project Type**: Single browser game application (no backend, no second framework)
**Performance Goals**: Smoke scene renders at 60 fps; full local gate sequence (lint + typecheck + test + build) completes in <60s on a developer laptop (SC-002); CI completes in <5min per run (SC-006)
**Constraints**: <5 min from `git clone` to engine-alive scene in browser (SC-001); strict TS with no project-wide relaxations of `noImplicitAny` / `strictNullChecks` / `noUncheckedIndexedAccess`; no second framework (React/Vue) and no engine swap (Pixi/Three) — would require a constitution amendment
**Scale/Scope**: Skeleton only — ~minimal LOC, layer-based folder tree designed so adding new scenes/systems requires zero build-config changes (SC-007)

## Constitution Check

Gates derived from `.specify/memory/constitution.md` v1.0.0.

| Principle | Gate | Status |
|---|---|---|
| I. Spec-Driven Development | This change flows through `/specify → /plan → /tasks → /implement`; spec exists at `specs/001-project-skeleton/spec.md`. | ✅ Pass |
| II. Iterative Playtesting | User Story 1 is a browser-visible smoke scene; its acceptance scenarios require running `npm run dev` and observing the scene + FPS counter. Pure-logic modules (state store, save schema) are covered by unit tests. | ✅ Pass |
| III. Type Safety & Quality Gates | Plan adopts strict TS (FR-012), `zod` runtime validation at the `localStorage` boundary (FR-015), and pre-commit + CI gates running typecheck/lint/test/build (FR-010, FR-011). | ✅ Pass |
| Tech Stack lock | Stack is exactly Phaser 3 + Vite + TS + npm — no deviations. Adding `zod` is permitted (typed library, no amendment required per Constitution Tech Stack section). | ✅ Pass |
| Repository conventions | `src/`, `public/assets/`, `specs/`, `dist/` (gitignored) all respected. | ✅ Pass |

**Result**: All gates pass. No Complexity Tracking entries required.

## Project Structure

### Documentation (this feature)

```text
specs/001-project-skeleton/
├── plan.md              # This file
├── spec.md              # Feature spec (pre-existing)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (module-level TS contracts)
│   ├── state-store.md
│   ├── save-system.md
│   └── save-schema.md
└── tasks.md             # Phase 2 (produced by /speckit-tasks — NOT this command)
```

### Source Code (repository root)

The layer-based layout from FR-013. Empty layer directories are kept under version control via `.gitkeep` so the layout survives a fresh clone (SC-007).

```text
farmer-game/
├── public/
│   └── assets/                  # Static assets shipped as-is (none in v1)
├── src/
│   ├── main.ts                  # Entry point — boots Phaser, registers scenes
│   ├── scenes/
│   │   ├── BootScene.ts         # Loads (nothing in v1), then starts MainScene
│   │   └── MainScene.ts         # Engine-alive smoke scene + FPS counter
│   ├── systems/
│   │   ├── SaveSystem.ts        # localStorage write/read + zod validate + migrate
│   │   └── .gitkeep
│   ├── entities/.gitkeep
│   ├── ui/.gitkeep
│   ├── state/
│   │   └── gameState.ts         # Typed singleton store (get/set/subscribe/serialize/load)
│   ├── data/
│   │   └── saveSchema.ts        # zod schema for SavePayload + version constant + migrate stub
│   ├── types/.gitkeep
│   └── utils/.gitkeep
├── tests/
│   ├── state/gameState.test.ts
│   └── data/saveSchema.test.ts
├── .github/workflows/ci.yml
├── .husky/pre-commit
├── index.html                   # Vite entry HTML
├── vite.config.ts
├── tsconfig.json
├── vitest.config.ts             # (or merged into vite.config.ts)
├── .eslintrc.cjs                # (or .eslintrc.json)
├── .prettierrc
├── .gitignore                   # already exists; extend with dist/, node_modules/, etc.
├── package.json
└── package-lock.json
```

**Structure Decision**: Single-project layout (Option 1 from the template) with the layer-based `src/` tree mandated by FR-013. The brainstorm rejected feature-based and hybrid layouts because farmer-game entities cross many features. `tests/` mirrors only the layers that have pure-logic code in v1 (`state/`, `data/`); scene tests are intentionally absent per Constitution Principle II.

## Phase 0 — Research

See [`research.md`](./research.md). All open questions from the brainstorm are resolved by the spec's `Assumptions` block, so research is consolidation rather than discovery: tool selection, configuration shape, gate ordering.

## Phase 1 — Design & Contracts

See [`data-model.md`](./data-model.md) for `GameState` and `SavePayload` shapes (intentionally minimal), [`contracts/`](./contracts/) for the three module-level contracts the skeleton exposes (state store API, save system API, save schema), and [`quickstart.md`](./quickstart.md) for the developer onboarding loop that maps directly to acceptance scenarios in the spec.

**Post-design Constitution re-check**: No new dependencies or structural choices were introduced beyond what Phase 0 captured. Gates remain green.

## Complexity Tracking

> No violations. Section intentionally empty.
