---
name: Project Skeleton Scaffold
description: Initial repo skeleton for a Phaser 3 + TypeScript + Vite farmer game — folder layout, state store, save/load, tooling, smoke scene
type: brainstorm
---

# Brainstorm: Project Skeleton Scaffold

**Date:** 2026-05-08
**Status:** active

## Problem Framing

The repo is freshly bootstrapped (only spec-kit, constitution, and dev instructions exist). Before writing any feature, we need a project skeleton: package.json, build config, folder layout, a runnable "engine alive" scene, plus the foundational systems that are painful to retrofit later (state management, save/load).

The constitution (v1.0.0) already locks the tech stack — TypeScript strict, Phaser 3, Vite, npm — and the top-level repo conventions (`src/`, `public/assets/`, `specs/`, `dist/`). What it does *not* specify is the internal `src/` organization, save schema, state pattern, or tooling setup. Those decisions are this brainstorm's job.

The user is a solo developer; "Simplicity First" and "Surgical Changes" are explicit AGENTS.md guidelines. The skeleton should stand up enough scaffolding to start features cleanly, without speculative abstractions.

## Approaches Considered

### A: Minimal — "hello Phaser" boots
- Pros: Fastest to first commit; nothing speculative.
- Cons: Save schema, state pattern, lint config all get retrofit later — exactly the painful cases.

### B: Standard — boot + folder layout + gates
- Pros: Clean folder skeleton + lint/test/hooks; ready for first feature without retrofit.
- Cons: Save/load and state store still missing — gets added under feature pressure later.

### C: Full — standard + save/load + state mgmt (chosen)
- Pros: Save schema versioning and state pattern locked in before any feature depends on them. Debug overlay + CI gate from day one.
- Cons: More upfront code. Some pieces (debug overlay, CI workflow) may sit unused for a while.

## Decision

**Chosen: C — Full skeleton.** The user explicitly opted for this scope. The two highest-risk retrofit items (save schema, state pattern) are addressed up front, which matches Constitution Principle II (system-boundary data must be zod-validated) and avoids future migration pain.

### Detailed shape

**State management:** Plain typed singleton store (`state/gameState.ts`).
- Zero deps; full TS types; idiomatic for a strict-TS solo project.
- Exposes `get`, `set`, `subscribe`, `serialize`, `load`. Internally uses an `EventEmitter`.
- Rejected: Phaser registry (loose typing); external store libs (unjustified dep).

**Save/load:** 1 slot, auto-save, schema-versioned, zod-validated.
- `data/saveSchema.ts` defines a versioned zod schema (`version: 1`).
- `systems/SaveSystem.ts` writes to `localStorage['farmer-game:save']`, validates on load, with a migration stub for future versions.
- Auto-save trigger: scene transition (and later: end-of-day in-game event).
- Rejected: multi-slot (YAGNI for v1); manual-only save (farmer games have natural day boundaries).

**Folder layout:** Layer-based (scenes / systems / entities / ui / state / data / types / utils).
- Familiar to Phaser devs; easy to locate code by kind.
- Rejected: feature-based (entities cross many features in a farmer game, would force duplication); hybrid (cognitive overhead about where code belongs).

**Smoke scene:** `BootScene` → `MainScene` showing "🌾 Farmer Game — engine alive" + FPS counter. Confirms TS compile, Phaser bootstrap, asset path, state store, and save/load all wire together end-to-end.

**Tooling defaults (filled in by Claude, accepted by user):**
- Pre-commit via husky + lint-staged.
- ESLint: `@typescript-eslint/recommended` + `eslint-config-prettier`.
- Prettier with default config.
- Vitest with `jsdom` environment.
- CI: single GitHub Actions job — `npm ci → tsc → eslint → vitest → vite build` on push + PR.
- Debug overlay: FPS counter only in v1; module structured for later extension.

## Key Requirements

1. `npm run dev` opens MainScene in browser showing engine-alive smoke text + FPS counter.
2. `npm run build` produces a working `dist/` bundle.
3. `npm run test` runs Vitest with at least 2 smoke tests (state store + save schema).
4. `npm run lint` and `npm run typecheck` pass cleanly.
5. Pre-commit hook blocks commit on lint / typecheck / test failure.
6. CI workflow runs the same gates on push and PR.
7. `gameState` module exposes typed get/set/subscribe/serialize/load.
8. `SaveSystem` round-trips state through localStorage with zod validation and a `version` field.
9. Folder layout matches the layer-based tree above; empty layer folders include `.gitkeep`.
10. `tsconfig.json` has `"strict": true` and the per-flag strictness from Constitution Principle III.
11. No game features beyond the smoke scene — no inventory, no time system, no NPCs.

## Out of Scope

- Real game art/sprites (placeholder text or a single logo only).
- HUD, inventory UI, dialog systems.
- Time-of-day mechanics beyond a stub auto-save trigger.
- Multi-slot saves and save-management UI.
- Sound, music, i18n, mobile-specific scaling.
- Any feature work — features come after this skeleton ships.

## Open Questions

- Initial placeholder asset: include a single logo PNG, or rely on text-only (no asset load) for the smoke scene? — defer to spec/implement.
- ESLint strictness level beyond the recommended preset (e.g., enable `@typescript-eslint/no-floating-promises`)? — defer to spec/implement.
- Whether the CI workflow file should also run on a `master` push vs. PR-only — defer to spec/implement.
