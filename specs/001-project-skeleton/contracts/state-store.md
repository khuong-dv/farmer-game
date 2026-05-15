# Contract: State Store (`src/state/gameState.ts`)

**Branch**: `001-project-skeleton` | **Phase**: 1 | **Date**: 2026-05-15

The state store is the only module in the skeleton that hands out references to `GameState`. Every read and every mutation MUST flow through this contract — direct module-level mutation is forbidden.

## Exported types

```ts
export interface GameState {
  playerName: string;
  launchCount: number;
}

export type StateListener = (state: Readonly<GameState>) => void;
export type Unsubscribe = () => void;
```

## Exported functions

```ts
/** Returns a frozen snapshot of the current state. Cheap; safe to call per-frame. */
export function getState(): Readonly<GameState>;

/**
 * Merge-patches the current state and notifies subscribers exactly once per call,
 * even if multiple fields are patched. Patches that contain no actual change MUST
 * still notify (callers can short-circuit if they care).
 */
export function setState(patch: Partial<GameState>): void;

/**
 * Replaces the current state wholesale. Used by SaveSystem.load() and tests.
 * Notifies subscribers exactly once.
 */
export function replaceState(next: GameState): void;

/**
 * Subscribes to state changes. The listener is invoked AFTER the change is
 * committed, with the new state. Returns an unsubscribe function. Calling
 * unsubscribe more than once is a no-op.
 */
export function subscribe(listener: StateListener): Unsubscribe;

/** Produces a SavePayload at the current schema version. Pure — no I/O. */
export function serialize(): SavePayload;

/** Replaces current state from a validated SavePayload's `data` field. */
export function load(payload: SavePayload): void;

/** Resets to the default initial state. Notifies subscribers. */
export function resetToDefault(): void;
```

## Invariants

1. **Single source of truth**: only `gameState.ts` owns mutable `GameState`. Other modules MUST go through `setState` / `replaceState` / `load` / `resetToDefault`.
2. **Frozen reads**: `getState()` returns an `Object.freeze`d snapshot (or equivalent) so accidental mutation throws in strict mode.
3. **Notification ordering**: subscribers are called synchronously, in registration order, after the change is committed.
4. **No async**: the store is fully synchronous. Persistence is the SaveSystem's job.

## Test coverage (seed)

A unit test in `tests/state/gameState.test.ts` MUST cover, at minimum:

- `getState()` returns defaults on first access.
- `setState({ playerName: "X" })` updates the field; a subsequent `getState()` reflects it.
- A subscribed listener fires once per `setState` call and not after `unsubscribe()`.
- `serialize()` returns `{ version: <CURRENT>, data: <current state> }`.
- `load(serialized())` round-trips state without loss.
