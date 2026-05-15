---
description: "Task list for Project Skeleton Scaffold"
---

# Tasks: Project Skeleton Scaffold

**Input**: Design documents from `/specs/001-project-skeleton/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Required by FR-003 — at least two seed unit tests (state store + save schema) must pass on a clean checkout. Test tasks for US2 are therefore included.

**Organization**: Tasks are grouped by user story so each P1/P2/P3 slice can be implemented and validated independently.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story this task belongs to (US1, US2, US3). Setup / Foundational / Polish tasks have no story label.
- Every task description includes its target file path.

## Path Conventions

Single project layout (per plan.md). All paths are relative to the repo root `/home/khuongdv/Documents/farmer-game/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the bun project and install every dependency the rest of the phases need. After this phase, `bun install` on a clean clone succeeds and the dependency tree is locked (committed `bun.lock`).

- [X] T001 Initialize bun project at repo root — create `package.json` (name `farmer-game`, `"type": "module"`, `"private": true`)
- [X] T002 Install runtime dependencies: `bun add phaser zod`
- [X] T003 Install dev dependencies: `bun add -d typescript vite vitest jsdom @types/node eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier prettier husky lint-staged`
- [X] T004 [P] Extend `.gitignore` with Node + Vite patterns: `node_modules/`, `dist/`, `*.log`, `.env*`, `coverage/`, `.DS_Store`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Wiring every story depends on — strict TypeScript config, build/test tool configs, the layer-based `src/` tree (FR-013), and the package.json script surface listed in `quickstart.md` (invoked via `bun run …`).

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 [P] Create `tsconfig.json` with `strict: true`, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`, `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`, `types: ["vite/client"]`, `include: ["src", "tests"]` (FR-012)
- [X] T006 [P] Create `vite.config.ts` — minimal config exporting `defineConfig({})` (Vite picks up `index.html` at root)
- [X] T007 [P] Create `vitest.config.ts` — set `test.environment = "jsdom"`, `test.globals = true`, `test.include = ["tests/**/*.test.ts"]`
- [X] T008 [P] Create empty layer directories under `src/` with `.gitkeep` files (FR-013): `src/scenes/.gitkeep`, `src/systems/.gitkeep`, `src/entities/.gitkeep`, `src/ui/.gitkeep`, `src/state/.gitkeep`, `src/data/.gitkeep`, `src/types/.gitkeep`, `src/utils/.gitkeep`
- [X] T009 Add scripts to `package.json`: `"dev": "vite"`, `"build": "vite build"`, `"test": "vitest run"`, `"typecheck": "tsc --noEmit"`, `"lint": "eslint ."`, `"prepare": "husky"` (invoked as `bun run <name>`; the lint script will error until US3 ships the eslint config — expected)

**Checkpoint**: `bun install` succeeds, `bun run typecheck` exits 0 on the empty tree, and the layer dirs survive a fresh checkout.

---

## Phase 3: User Story 1 — Engine-alive smoke scene (Priority: P1) 🎯 MVP

**Goal**: A developer can run `bun run dev`, open the printed URL, and see a Phaser scene rendering an engine-alive indicator + live FPS counter; HMR works; `bun run build` produces a working bundle that renders the same scene.

**Independent Test**: From a clean clone, run `bun install && bun run dev`. The served URL renders the smoke scene. Edit `MainScene.ts`, save, and confirm HMR. Then `bun run build && bunx http-server dist` renders the same scene from the built bundle. *(spec.md US1 Acceptance Scenarios 1–3, SC-001, SC-007)*

### Implementation for User Story 1

- [X] T010 [P] [US1] Create `index.html` at repo root — Vite entry HTML with a `<div id="game">` mount point and `<script type="module" src="/src/main.ts">`
- [X] T011 [P] [US1] Create `src/scenes/BootScene.ts` — Phaser `Scene` with key `"Boot"` that immediately transitions to `MainScene` in `create()` (loads no assets in v1; the transition exists so US2's auto-save trigger has something to fire on — see research.md R5)
- [X] T012 [P] [US1] Create `src/scenes/MainScene.ts` — Phaser `Scene` with key `"Main"` that renders the text `"🌾 Farmer Game — engine alive"` plus a second text object updated each `update()` tick to show `game.loop.actualFps`
- [X] T013 [US1] Create `src/main.ts` — instantiate `new Phaser.Game({ type: AUTO, parent: "game", scene: [BootScene, MainScene], ... })` and export the `game` instance (depends on T011, T012)

**Checkpoint**: US1 is fully functional and independently demoable in a browser.

---

## Phase 4: User Story 2 — Persistent game state via auto-save (Priority: P2)

**Goal**: A typed `GameState` is mutated through a store, auto-saved on scene transition, validated on load, and either restored or safely falls back to defaults on any corruption/version mismatch.

**Independent Test**: Run the seed unit tests — they pass. In the browser, mutate state via the debug hook, transition scenes (auto-save fires), reload, confirm restoration. Plant corrupt JSON / unknown version in `localStorage`; confirm clean fallback to defaults with no console errors. *(spec.md US2 Acceptance Scenarios 1–5, SC-004, SC-005, edge cases)*

### Tests for User Story 2 (FR-003 requires these to pass on a clean checkout) ⚠️

> Write these first so failures drive the implementation. Both tests pass once T016/T017 are complete.

- [X] T014 [P] [US2] Seed test `tests/data/saveSchema.test.ts` covering every case in contracts/save-schema.md "Test coverage (seed)": valid v1 payload accepts; empty `playerName` rejects; negative `launchCount` rejects; `version: 99` rejects; `migrate()` is identity for v1; `defaultGameState()` passes the v1 schema
- [X] T015 [P] [US2] Seed test `tests/state/gameState.test.ts` covering every case in contracts/state-store.md "Test coverage (seed)": defaults on first `getState()`; `setState` updates and `getState` reflects; subscribe fires once per `setState` and not after `unsubscribe()`; `serialize()` returns `{ version: CURRENT_SAVE_VERSION, data: <current> }`; `load(serialize())` round-trips without loss

### Implementation for User Story 2

- [X] T016 [P] [US2] Implement `src/data/saveSchema.ts` per contracts/save-schema.md — exports `CURRENT_SAVE_VERSION`, `gameStateV1Schema`, `savePayloadV1Schema`, `savePayloadSchema` (discriminated union on `version`), inferred types `GameState` / `SavePayload`, pure `migrate(payload)` (identity for v1, `null` otherwise), and `defaultGameState()` returning a fresh `{ playerName: "Farmer", launchCount: 0 }`
- [X] T017 [P] [US2] Implement `src/state/gameState.ts` per contracts/state-store.md — module-local mutable state initialized from `defaultGameState()`; exported `getState` (returns frozen snapshot), `setState` (merge-patch + notify), `replaceState`, `subscribe` (returns idempotent unsubscribe), `serialize`, `load(payload)` (replaces from `payload.data`), `resetToDefault`
- [X] T018 [US2] Implement `src/systems/SaveSystem.ts` per contracts/save-system.md — exports `SAVE_STORAGE_KEY = "farmer-game:save"`, `save()` (boolean; swallows storage/quota/stringify errors), `load()` (returns the `LoadResult` discriminated union; on any failure calls `gameState.resetToDefault()` and never throws), `clear()`, `registerAutoSave(game)` (subscribes to Phaser scene-transition events and calls `save()` on each) (depends on T016, T017)
- [X] T019 [US2] Wire SaveSystem into `src/main.ts` — before constructing the Phaser game, call `SaveSystem.load()` (so launch begins from restored or default state); after constructing the game, call `SaveSystem.registerAutoSave(game)` (FR-009)
- [X] T020 [US2] In `src/main.ts`, increment `launchCount` exactly once per successful load before `registerAutoSave` runs — the field exists specifically so US2-AS3 / SC-004 have a non-static value to verify round-trip on

**Checkpoint**: Both seed tests pass via `bun run test`. Browser walkthrough in `quickstart.md` US2 succeeds end-to-end.

---

## Phase 5: User Story 3 — Automated quality gates (Priority: P3)

**Goal**: `lint`, `typecheck`, `test`, and `build` all run cleanly. A pre-commit hook blocks commits that fail typecheck or lint on staged files. CI runs the full sequence on every push to `master` and every PR.

**Independent Test**: Run each gate command — all four exit 0. Introduce a type error, `git commit`, confirm the commit is blocked. Push a broken branch and confirm GitHub Actions fails. *(spec.md US3 Acceptance Scenarios 1–4, SC-002, SC-003, SC-006)*

### Implementation for User Story 3

- [X] T021 [P] [US3] Create `.eslintrc.cjs` (or `eslint.config.js` flat config) extending `@typescript-eslint/recommended` and `prettier` (eslint-config-prettier); `parser: @typescript-eslint/parser`; `ignorePatterns: ["dist", "node_modules", ".husky"]`; root: true
- [X] T022 [P] [US3] Create `.prettierrc` with default Prettier config (empty `{}` or minimal preferences — the brainstorm says zero-bikeshed)
- [X] T023 [P] [US3] Create `.github/workflows/ci.yml` — single job on `push: master` and `pull_request`, steps: checkout → `oven-sh/setup-bun@v2` → `bun install --frozen-lockfile` → `bun run typecheck` → `bun run lint` → `bun run test` → `bun run build` (FR-011)
- [X] T024 [US3] Add `lint-staged` config to `package.json` — staged `*.ts` files run through `tsc --noEmit` and `eslint --fix`
- [X] T025 [US3] Create `.husky/pre-commit` hook — runs `bun run typecheck` (project-wide; TypeScript strict mode needs whole-program analysis) followed by `bunx lint-staged` (requires T024). Ensure the file is executable. The `prepare` script from T009 already runs `husky` on `bun install` so the hook installs on first checkout (FR-010)

**Checkpoint**: All four gate commands exit 0. Pre-commit hook blocks a deliberate type error. CI green on push to `master`.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify the full skeleton against `quickstart.md` and confirm SC-001/SC-002/SC-006/SC-007.

- [ ] T026 Run the full `quickstart.md` walkthrough top-to-bottom on a clean clone — `git clone` → `bun install` → `bun run dev` (US1 scenarios) → DevTools state mutation + reload (US2 scenarios) → gate sequence (US3 scenarios). Document any drift between the quickstart and the implementation in the spec.
- [X] T027 Time the local gate sequence: `time (bun run typecheck && bun run lint && bun run test && bun run build)` must be under 60 seconds (SC-002). If over, note the bottleneck.
- [X] T028 Verify SC-007: add a throwaway `src/scenes/SmokeTwoScene.ts` and a throwaway `src/systems/NoopSystem.ts`, run `bun run typecheck && bun run lint && bun run build`, confirm no config files (`tsconfig.json`, `vite.config.ts`, `.eslintrc.*`, `vitest.config.ts`) needed editing. Delete the throwaway files.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: starts immediately.
- **Phase 2 (Foundational)**: depends on Phase 1.
- **Phase 3 (US1)**, **Phase 4 (US2)**, **Phase 5 (US3)**: each depends only on Phase 2; can proceed in priority order or in parallel.
- **Phase 6 (Polish)**: depends on whichever stories are in scope. T026 (full walkthrough) requires all three.

### User Story Dependencies

- **US1 (P1)**: no dependencies on US2 or US3. Ships standalone.
- **US2 (P2)**: no logical dependency on US1 for unit tests. The browser-side walkthrough in `quickstart.md` US2 does require US1's scenes to demo against, but US2 itself can be unit-test-validated without US1.
- **US3 (P3)**: no dependency on US1 or US2. The gates run on whatever code is present.

### Within Each User Story

- Tests (US2 only) MUST be written first and observed to fail before implementation.
- `saveSchema.ts` and `gameState.ts` before `SaveSystem.ts` (SaveSystem composes both).
- `BootScene.ts` and `MainScene.ts` before `main.ts` (main.ts registers them).
- US2's `main.ts` wiring (T019/T020) depends on US1's `main.ts` (T013) existing.

### Parallel Opportunities

- T004 in Phase 1 runs in parallel with installs.
- All of T005–T008 in Phase 2 run in parallel (different files).
- T010–T012 in US1 run in parallel (different files); T013 sequential after.
- T014–T017 in US2 run in parallel (different files); T018 sequential after, then T019/T020 sequential.
- T021–T023 in US3 run in parallel (different files); T024 then T025 sequential.

---

## Parallel Example: User Story 2

```bash
# Tests first, in parallel (different files, no dependency on impl yet):
Task: "Seed test tests/data/saveSchema.test.ts"
Task: "Seed test tests/state/gameState.test.ts"

# Then implementation modules in parallel (different files):
Task: "Implement src/data/saveSchema.ts per contracts/save-schema.md"
Task: "Implement src/state/gameState.ts per contracts/state-store.md"

# Then SaveSystem (depends on both):
Task: "Implement src/systems/SaveSystem.ts per contracts/save-system.md"

# Then main.ts wiring (depends on US1 main.ts + SaveSystem):
Task: "Wire SaveSystem.load() and registerAutoSave(game) into src/main.ts"
```

---

## Implementation Strategy

### MVP first (US1 only)

1. Phase 1 → 2 → 3.
2. Demo: `bun run dev` → engine-alive scene visible in the browser. Ship.

### Incremental delivery

1. MVP (US1) → demo.
2. Add US2 → seed tests pass + browser save/load walkthrough → demo.
3. Add US3 → gates green locally + green in CI → demo.
4. Phase 6 polish → confirm SC-001/SC-002/SC-006/SC-007.

### Solo dev (this project)

Per the spec's Assumption block, this skeleton targets a solo workflow. Stories ship in priority order: US1 → US2 → US3 → Polish. No parallel teams required.

---

## Notes

- [P] = different files, no incomplete-task dependency.
- [US#] = traces task to the user story in spec.md.
- Tests for US2 are mandated by FR-003; they are not optional in this feature.
- US1 has no unit tests by design — per Constitution Principle II, scenes are validated by browser observation.
- The `prepare: husky` script in T009 is what makes the pre-commit hook install on a fresh clone (`bun install` triggers it) — without it, FR-010 silently doesn't bind.
- Auto-save trigger in v1 is scene transition only (Boot → Main fires on every launch). Future features can add additional trigger points without changing SaveSystem's contract.
