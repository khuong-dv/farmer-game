# Contract: Save System (`src/systems/SaveSystem.ts`)

**Branch**: `001-project-skeleton` | **Phase**: 1 | **Date**: 2026-05-15

The save system owns the `localStorage` boundary. No other module reads or writes that boundary directly. Failures at this boundary MUST be non-fatal — the spec is explicit (edge cases: storage unavailable, quota exceeded, corrupt payload, future version).

## Constants

```ts
export const SAVE_STORAGE_KEY = "farmer-game:save";
```

## Exported functions

```ts
/**
 * Writes the current state (via gameState.serialize()) to localStorage under
 * SAVE_STORAGE_KEY. Returns true if the write succeeded, false if it was
 * skipped or failed (storage unavailable, quota exceeded, JSON.stringify threw).
 * MUST NOT throw under any documented failure mode.
 */
export function save(): boolean;

/**
 * Reads, parses, validates, and migrates the saved payload, then adopts it
 * via gameState.load(). On any failure path (no save, JSON parse error, zod
 * validation failure, unknown version that migration cannot handle),
 * the store is reset to default via gameState.resetToDefault() and the
 * function returns a discriminated result describing the outcome.
 * MUST NOT throw.
 */
export type LoadResult =
  | { status: "loaded"; version: number }
  | { status: "no-save" }
  | { status: "corrupt"; reason: "parse" | "schema" | "unknown-version" }
  | { status: "storage-unavailable" };

export function load(): LoadResult;

/** Removes the save key from localStorage. Useful for tests and "new game". */
export function clear(): void;

/**
 * Convenience: wire scene transitions to auto-save. Implementation reaches
 * into Phaser's scene events; safe to call once at boot.
 */
export function registerAutoSave(game: Phaser.Game): void;
```

## Failure handling

| Scenario | Behavior | Caller-visible result |
|---|---|---|
| `localStorage` undefined / blocked (private mode, SSR test env) | Skip the write; `load()` returns `storage-unavailable`. Game continues in-memory. | No crash, no surfaced error. |
| Quota exceeded on write | Catch, return `false`. | No crash. Future saves still attempted. |
| `JSON.parse` throws | Treat as corrupt; `resetToDefault()`; return `{ status: "corrupt", reason: "parse" }`. | Default state visible to player. |
| `zod.safeParse` fails | Same as parse error but `reason: "schema"`. | Default state visible. |
| `version` not in known set and migration cannot upgrade it | Reset; return `{ status: "corrupt", reason: "unknown-version" }`. | Default state visible (FR-008, US2-AS5). |
| `version` known but older than current | Run the migration path (stub in v1) and adopt. | `{ status: "loaded", version: <current after migrate> }`. |

## Invariants

1. **Exactly one storage key**: `SAVE_STORAGE_KEY` is the only key this module touches.
2. **Never throws into game code**: every public function in this contract handles its own failures.
3. **No global side effects on import**: `registerAutoSave(game)` is opt-in.
4. **Stateless module**: no internal mutable state; the store of truth is `localStorage` + the state store.

## Test coverage (seed)

A unit test in `tests/data/saveSchema.test.ts` (and/or a sibling `tests/systems/SaveSystem.test.ts` if time permits) MUST cover:

- A clean environment (`localStorage` empty) → `load()` returns `no-save`; store remains at default.
- A `save()` followed by `load()` round-trips the same `GameState`.
- Manually planting an invalid JSON string under `SAVE_STORAGE_KEY` → `load()` returns `corrupt: parse` and store is at default.
- Manually planting a structurally-valid JSON whose `data` violates the schema → `corrupt: schema`.
- Manually planting `{ version: 99, data: {...} }` → `corrupt: unknown-version`.
