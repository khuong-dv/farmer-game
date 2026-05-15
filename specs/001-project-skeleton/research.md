# Phase 0 — Research: Project Skeleton Scaffold

**Branch**: `001-project-skeleton` | **Date**: 2026-05-15

The constitution and the brainstorm pre-decided most of the choices that would otherwise live here. This document consolidates the decisions, names the alternatives that were rejected, and locks the configuration shape used by Phase 1 contracts and Phase 2 tasks. Nothing on this list is a NEEDS CLARIFICATION — every item below is resolved.

---

## R1 — State management approach

**Decision**: Plain typed singleton module (`src/state/gameState.ts`) exposing `get`, `set`, `subscribe`, `serialize`, `load`. Internally an event emitter; zero external deps.

**Rationale**: Strict-TS solo project. Typed singleton is the simplest thing that satisfies FR-005, gives full type inference at call sites, and avoids pulling in a store library whose API surface dwarfs the requirement.

**Alternatives considered**:
- *Phaser registry* — string keys, loose typing, no compile-time guarantee that callers reference real fields. Rejected.
- *External store (Zustand, Redux Toolkit, nanostores)* — unjustified dependency for a single typed object with subscribe.
- *Mutable module-level object + manual events* — close to chosen, but `subscribe` is enough of an API to deserve a tiny dedicated module.

---

## R2 — Save/load architecture

**Decision**: Single-slot persistence to `localStorage` under key `farmer-game:save`. The `SaveSystem` module owns the boundary: serialize from `gameState`, write the JSON; on load, read, `zod`-parse, run a migration entry point, then adopt into the store. Auto-save trigger in v1 is scene transition.

**Rationale**: Matches FR-006 through FR-009 directly. Scene transition is the only natural save boundary that exists in v1 (no in-game time, no day-end yet). Migration entry point is a stub for v1 but locks the call-site contract so future versions are additive (FR-008).

**Alternatives considered**:
- *Multiple save slots + UI* — YAGNI for v1; the spec's Assumption explicitly limits scope to one slot.
- *Manual save only (button or hotkey)* — farmer games have natural transition points; relying on the player is fragile.
- *IndexedDB* — overkill at the size of the v1 `SavePayload`; `localStorage` is synchronous and trivial to validate.

---

## R3 — Runtime validation at boundaries

**Decision**: Use `zod` for the save schema. The load path: `JSON.parse → schema.safeParse → migrate(if needed) → adopt`. Any failure (parse, validate, unrecognized version) discards the saved payload and starts the game from default state, surfacing no error to the player (FR-015, edge cases in spec).

**Rationale**: Constitution Principle III mandates run-time validation at system boundaries; `localStorage` is a system boundary. `zod` is the standard typed-validator choice, infers TS types from the schema (single source of truth), and adding a typed library does NOT require a constitution amendment.

**Alternatives considered**:
- *Hand-rolled type guards* — works but duplicates the type definitions and is error-prone as the save shape grows.
- *`io-ts`, `valibot`, `superstruct`* — viable, but `zod` has the broadest community usage and the simplest inference story for a solo dev.

---

## R4 — Folder layout: layer-based vs. feature-based

**Decision**: Layer-based — `scenes/ systems/ entities/ ui/ state/ data/ types/ utils/`. Empty layer dirs ship a `.gitkeep` so a fresh clone preserves the structure (FR-013).

**Rationale**: In a farmer game, entities (crops, animals, inventory items) participate in many features. Feature-based layouts force the same entity to either live in one feature folder (and get imported across the codebase, defeating the layout) or get duplicated. Layer-based is the idiomatic Phaser layout and minimizes "where does this code live" overhead.

**Alternatives considered**:
- *Feature-based* (e.g. `src/features/farming/`, `src/features/inventory/`) — see above; rejected for cross-cutting entities.
- *Hybrid (features + shared)* — adds a third question ("is this shared or feature-specific?") to every new file. Cognitive overhead is wrong for a solo dev.

---

## R5 — Smoke scene shape

**Decision**: `BootScene` (loads nothing in v1, immediately transitions) → `MainScene` (renders `🌾 Farmer Game — engine alive` text + a live FPS counter from `game.loop.actualFps`). No external assets — text-only.

**Rationale**: The spec assumes "no external image, font, or audio asset" so the smoke scene isolates the toolchain check from the (out-of-scope-for-v1) asset pipeline. Two scenes are needed because FR-009's auto-save trigger is "scene transition" — `BootScene → MainScene` exercises that path on every launch.

---

## R6 — Tooling defaults

| Concern | Decision | Why this and not something else |
|---|---|---|
| Pre-commit | `husky` + `lint-staged` | Standard combo; husky owns the hook lifecycle, lint-staged scopes gates to staged files for speed. Alternatives (`simple-git-hooks`, raw `.git/hooks/`) are either less ergonomic or require manual install steps. |
| Lint | `eslint` + `@typescript-eslint/recommended` + `eslint-config-prettier` | Recommended preset matches the spec's Assumption ("standard recommended preset"). `eslint-config-prettier` disables conflicts with Prettier. Extra strictness rules (e.g., `no-floating-promises`) deferred per the brainstorm's open question. |
| Format | Prettier (default config) | Zero-bikeshed. Prettier defaults are fine for a solo dev. |
| Test runner | Vitest + `jsdom` environment | Vitest is Vite-native (shared config, fast watch mode). `jsdom` is needed because the save schema touches `localStorage`. Jest would also work but requires its own config and a separate transformer for TS. |
| CI | Single GitHub Actions job: `npm ci → tsc --noEmit → eslint → vitest run → vite build` | Linear pipeline mirrors the local gate sequence so failures are reproducible. Matrix builds across Node versions are out of scope for v1 (solo dev, single supported Node major). |
| Pre-commit gates | `tsc --noEmit` + `eslint` on staged files via `lint-staged` | Tests + full build are too slow for pre-commit. CI owns the full sequence. This matches FR-010 (typecheck + lint at minimum). |

---

## R7 — Open questions from the brainstorm

| Question | Resolution |
|---|---|
| Initial placeholder asset (logo PNG vs text-only) | **Text-only** — locked by spec Assumption #2 (isolates smoke check from asset pipeline). |
| ESLint strictness beyond `@typescript-eslint/recommended` | **Defer** — spec Assumption #3 explicitly scopes this skeleton to the recommended preset. |
| CI runs on `master` push vs PR-only | **Both** — locked by FR-011 ("every push to master and on every pull request"). |

No remaining NEEDS CLARIFICATION items. Phase 1 can proceed.
