# Phase 1 — Data Model: Project Skeleton Scaffold

**Branch**: `001-project-skeleton` | **Date**: 2026-05-15

The skeleton has two and only two entities. Both are intentionally minimal — the goal is to prove the round-trip and lock the *shape* of the contract, not to model gameplay. Real gameplay state lands in later features and extends `GameState` additively.

---

## Entity: `GameState`

**Purpose**: The in-memory, typed representation of everything the game needs to remember between frames. Owned by `src/state/gameState.ts`.

**Fields** (v1 minimum — proves the round-trip; gameplay features will extend):

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `playerName` | `string` | yes | `"Farmer"` | Placeholder identity; exercised by the state-store test that proves write-then-read survives a serialize/load round-trip. |
| `launchCount` | `number` (non-negative integer) | yes | `0` | Incremented on each successful load. Provides a non-static field for "state mutated, reloaded, restored" tests (Acceptance Scenario US2-3 and SC-004). |

**Operations** (exposed by the state module — see [`contracts/state-store.md`](./contracts/state-store.md)):

- `getState(): Readonly<GameState>` — current snapshot
- `setState(patch: Partial<GameState>): void` — merge-patch, emits change event
- `subscribe(listener: (s: Readonly<GameState>) => void): () => void` — returns unsubscribe
- `serialize(): SavePayload` — produces a write-ready payload
- `load(payload: SavePayload): void` — replaces current state with payload's `data`

**Validation rules**:

- `playerName` MUST be a non-empty string ≤ 64 chars.
- `launchCount` MUST be a finite non-negative integer.

**State transitions**: none in v1 — `GameState` is a plain record. (Day-cycle / mode transitions arrive with later features.)

---

## Entity: `SavePayload`

**Purpose**: The serialized, persisted form of `GameState` plus a schema-version field. Lives in `localStorage` under key `farmer-game:save`. Read and written exclusively through `SaveSystem`.

**Fields**:

| Field | Type | Required | Notes |
|---|---|---|---|
| `version` | `number` (integer, ≥ 1) | yes | Schema version. v1 ships `version: 1`. The load path's migration entry point dispatches on this. |
| `data` | `GameState` | yes | The full, current `GameState` shape under the current `version`. |

**Validation rules** (enforced by the `zod` schema in `src/data/saveSchema.ts`):

- `version` MUST equal a known version number. Unknown versions (including future ones) MUST be rejected through the migration path and result in a default-state load (FR-008, US2 Acceptance Scenario 5).
- `data` MUST validate against the `GameState` schema for the current `version`.
- A `SavePayload` whose `version` is known but whose `data` fails validation MUST be discarded and a default-state load performed (US2 Acceptance Scenario 4, FR-015).

**Storage shape**:

- Stored as `JSON.stringify(payload)` in `localStorage`.
- Single key: `farmer-game:save`.
- Single slot (no array, no rotation).

**Lifecycle**:

1. **Save**: `SaveSystem.save()` → `gameState.serialize()` → `JSON.stringify` → `localStorage.setItem`.
2. **Load** (on game start): `localStorage.getItem` → `JSON.parse` → `schema.safeParse` → `migrate(payload)` → `gameState.load(payload)`. Any failure short-circuits to "leave default state in place".
3. **Auto-save trigger**: scene transitions emit a save call.

**Future extensibility**: When `GameState` gains fields, bump `version` to `2`, add a `migrate1to2` step, and route old payloads through it. Call sites of `SaveSystem.load()` do not change.
