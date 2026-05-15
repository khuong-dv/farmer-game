# Feature Specification: Project Skeleton Scaffold

**Feature Branch**: `001-project-skeleton`
**Created**: 2026-05-08
**Status**: Draft
**Input**: User description: "Set up the project skeleton per brainstorm/01-project-skeleton.md"

## User Scenarios & Testing *(mandatory)*

The "user" for this feature is the developer working in this repository. Each
story is an independently demonstrable slice of the skeleton: any one of them,
shipped alone, leaves the repo strictly better than it was the moment before.

### User Story 1 - Engine-alive smoke scene (Priority: P1)

A developer clones the repo, runs the dev server, and sees a running game scene
in the browser that proves every layer of the stack — language toolchain, build
server, engine bootstrap, asset path, state store, and save/load — wires together
end-to-end.

**Why this priority**: Without a runnable smoke scene, no other work in the
repo can be verified. This is the foundation every later feature depends on.

**Independent Test**: From a clean clone, run the dev command and load the
served URL; observe a scene rendering an "engine alive" indicator and a live
FPS counter. No other story needs to be present.

**Acceptance Scenarios**:

1. **Given** a clean clone with dependencies installed, **When** the developer starts the dev server, **Then** the browser shows a Phaser scene displaying an engine-alive indicator text and an updating FPS counter.
2. **Given** the dev server is running, **When** the developer edits the smoke-scene text and saves, **Then** the browser reflects the change without a manual rebuild (hot reload).
3. **Given** a clean clone, **When** the developer runs the production build command, **Then** a working bundle is produced in the build-output directory and serves the same smoke scene when opened.

---

### User Story 2 - Persistent game state via auto-save (Priority: P2)

A developer can read and write arbitrary game state through a typed store, and
that state is automatically persisted between sessions. On reload, the previously
saved state is validated and restored; if validation fails or no save exists,
the game starts from a clean default state.

**Why this priority**: Save/load and state shape are the two highest-cost things
to retrofit once features depend on them. Locking the contract before any feature
is written means no later feature has to migrate.

**Independent Test**: Mutate state through the store, trigger a save, reload the
page, and confirm the mutated value is restored. Separately, corrupt the saved
payload and confirm the game starts cleanly without crashing.

**Acceptance Scenarios**:

1. **Given** a fresh browser with no prior save, **When** the smoke scene loads, **Then** the game starts from a default initial state.
2. **Given** state has been mutated through the store, **When** an auto-save trigger fires (e.g., scene transition), **Then** the serialized state is persisted to local browser storage.
3. **Given** a previously persisted save with a recognized schema version, **When** the game loads, **Then** the saved state is validated and restored into the store.
4. **Given** a saved payload that fails schema validation (corrupted, malformed, or unknown shape), **When** the game loads, **Then** the corrupt save is discarded, the game starts from default state, and no uncaught error reaches the user.
5. **Given** a saved payload with a future, unrecognized schema version, **When** the game loads, **Then** the load is rejected through the migration path and the game starts from default state.

---

### User Story 3 - Automated quality gates (Priority: P3)

Lint, type-check, unit-test, and production-build commands all run cleanly on
the skeleton, and a failing gate blocks both local commits (via a pre-commit
hook) and remote pushes/PRs (via CI). The developer never has to remember to
run them — the toolchain enforces them.

**Why this priority**: This delivers no in-game value but establishes the
quality floor required by Constitution Principle III. It is independently
testable: gates either run and pass, or they don't.

**Independent Test**: Run each gate command individually and confirm clean
exit. Then introduce a deliberate type error or lint violation, attempt to
commit, and confirm the commit is blocked. Push the same broken state to a
branch (or simulate CI locally) and confirm CI fails.

**Acceptance Scenarios**:

1. **Given** the skeleton on `master`, **When** the developer runs the lint, type-check, test, and build commands in turn, **Then** each completes successfully with a zero exit code.
2. **Given** an unstaged change that introduces a lint or type error, **When** the developer attempts to commit it, **Then** the pre-commit hook runs the relevant gates, fails, and prevents the commit from being recorded.
3. **Given** a pull request opened against `master` (or a push to `master`), **When** CI runs, **Then** it executes the full gate sequence (install → type-check → lint → test → build) and reports failure if any step fails.
4. **Given** the skeleton is freshly installed, **When** the developer runs the test command, **Then** at least two seed unit tests pass — one covering the typed state store and one covering the save schema.

---

### Edge Cases

- **Local browser storage unavailable or quota-exceeded**: the save attempt MUST fail safely (no crash, no swallowed exception trail in production), and the game MUST continue running using in-memory state for the rest of the session.
- **Save payload corrupted or shape-invalid**: discarded; default state used; no surfaced error blocks gameplay.
- **Future, unknown save schema version**: rejected via the migration code path (even though no real migration exists yet) so adding migrations later is purely additive.
- **Empty repository on first install**: `bun install` followed by the dev command MUST succeed without any manual setup steps beyond what is documented in the project README, if any.
- **Developer attempts to bypass pre-commit hook**: bypass is technically possible (e.g., `--no-verify`) but the constitution forbids it; the hook itself does not need to be unbypassable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The repository MUST provide a `dev` script that starts a development server and renders a single scene displaying an engine-alive indicator and a live FPS counter.
- **FR-002**: The repository MUST provide a `build` script that produces a working static bundle in the build-output directory.
- **FR-003**: The repository MUST provide a `test` script that runs unit tests in a browser-like test environment, with at least two seed tests passing on a clean checkout (state store + save schema).
- **FR-004**: The repository MUST provide a `lint` script and a `typecheck` script, both of which exit zero on a clean checkout of the skeleton.
- **FR-005**: A typed game-state module MUST expose, at minimum, the operations: read current state, write/replace state, subscribe to changes, serialize to a save payload, and load from a save payload.
- **FR-006**: A save system MUST persist game state to the browser's local storage under a single, well-known key, and MUST round-trip state without loss.
- **FR-007**: Every save payload MUST carry an explicit numeric schema version field; the load path MUST validate the payload's shape against the current schema before adopting it.
- **FR-008**: The save load path MUST include a migration entry point (even if the v1 implementation is a stub) so that future schema changes can be added without altering call sites.
- **FR-009**: A scene transition MUST trigger an auto-save of current state to local storage.
- **FR-010**: A pre-commit hook MUST run, at minimum, the type-check and lint gates against staged changes and block the commit when either fails.
- **FR-011**: A CI workflow MUST run on every push to `master` and on every pull request, executing install → type-check → lint → test → build in that order, and MUST fail the run on any step's failure.
- **FR-012**: The repository MUST adopt strict TypeScript configuration consistent with Constitution Principle III; no project-wide disabling of `noImplicitAny`, `strictNullChecks`, or `noUncheckedIndexedAccess`.
- **FR-013**: The `src/` tree MUST follow a layer-based folder layout with directories for: scenes, systems, entities, ui, state, data, types, utils. Empty layer directories MUST be tracked (e.g., via `.gitkeep`) so the layout is preserved on clone.
- **FR-014**: The skeleton MUST NOT include any game-feature code beyond what is required by FR-001 (smoke scene). No inventory, no time-of-day mechanics, no NPCs, no HUD.
- **FR-015**: All data crossing a system boundary in the skeleton (i.e., the save payload read from local storage) MUST be runtime-validated before being adopted into typed code.

### Key Entities

- **GameState**: The in-memory, typed representation of everything the game needs to remember between frames. For the skeleton, its shape is intentionally minimal (a small handful of fields are sufficient to prove the round-trip). Owned by the typed state module.
- **SavePayload**: The serialized, persisted form of `GameState` plus a schema-version field. Lives in local browser storage under a single key. Read and written exclusively through the save system.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From a clean clone, a developer can go from `git clone` to "engine-alive smoke scene visible in the browser" in under 5 minutes on a typical broadband connection.
- **SC-002**: The full local quality-gate sequence (lint + type-check + tests + build) completes in under 60 seconds on a developer-class laptop.
- **SC-003**: A change that violates lint or type-check rules is blocked at commit time 100% of the time when staged through the standard commit flow.
- **SC-004**: Game state mutated through the typed store survives a full page reload with zero field loss across at least two simulated sessions.
- **SC-005**: A save payload with a corrupted or unrecognized shape never crashes the loading scene; the user observes the game starting from default state instead.
- **SC-006**: CI completes the full gate sequence in under 5 minutes per run on the standard runner.
- **SC-007**: Adding a new feature folder under `src/scenes/` or `src/systems/` requires zero changes to build, lint, type-check, or test configuration — the skeleton's wiring covers it.

## Assumptions

- The developer is running a current-generation desktop browser matching the constitution's supported browser list (latest 2 stable Chrome / Firefox / Safari / Edge).
- The smoke scene uses placeholder text only and does not load any external image, font, or audio asset; this isolates the smoke check from the asset-pipeline question, which is out of scope for v1.
- The lint configuration starts from the standard recommended preset for the chosen language; additional strictness rules are an out-of-scope follow-up that may be added later without breaking this skeleton's contract.
- CI runs on both pushes to `master` and on pull requests; this is the conservative default and matches Constitution Principle III's "automation enforces the gate" intent.
- A single save slot is sufficient for v1; multi-slot save management is explicitly out of scope.
- The auto-save trigger for v1 is scene transition; in-game time events (e.g., end-of-day) will be added when the corresponding feature lands.
- `bun` is the package manager (per constitution v1.1.0); the lockfile (`bun.lock`) is committed.
- The repository targets a solo-developer workflow; no review, branch protection, or code-owners configuration is part of this skeleton.
