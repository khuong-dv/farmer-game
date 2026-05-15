# Contract: Save Schema (`src/data/saveSchema.ts`)

**Branch**: `001-project-skeleton` | **Phase**: 1 | **Date**: 2026-05-15

The save schema is the single source of truth for the `SavePayload` shape and the migration path. `GameState`'s TypeScript type is **inferred from** the schema — defining it twice would let them drift.

## Exports

```ts
import { z } from "zod";

export const CURRENT_SAVE_VERSION = 1 as const;

/**
 * v1 GameState schema. Fields are intentionally minimal — adding fields
 * for future features requires bumping CURRENT_SAVE_VERSION and adding
 * a migration step (see below).
 */
export const gameStateV1Schema = z.object({
  playerName: z.string().min(1).max(64),
  launchCount: z.number().int().nonnegative().finite(),
});

export const savePayloadV1Schema = z.object({
  version: z.literal(1),
  data: gameStateV1Schema,
});

/**
 * Discriminated union over all known schema versions. v1 ships with one
 * member; later versions add to this union and the migrate() dispatch.
 */
export const savePayloadSchema = z.discriminatedUnion("version", [
  savePayloadV1Schema,
  // future: savePayloadV2Schema, ...
]);

export type GameStateV1 = z.infer<typeof gameStateV1Schema>;
export type GameState = GameStateV1;          // alias to "current"
export type SavePayloadV1 = z.infer<typeof savePayloadV1Schema>;
export type SavePayload = z.infer<typeof savePayloadSchema>;

/**
 * Migration entry point. Accepts any parsed-and-validated SavePayload
 * (i.e., it has already cleared savePayloadSchema). Returns the payload
 * upgraded to the current version, OR null if it cannot be upgraded
 * (e.g. version is too new to be known here).
 *
 * v1 implementation: identity for v1; null for anything else. The point
 * is to lock the *call-site contract* so future versions are additive.
 */
export function migrate(payload: SavePayload): SavePayload | null;

/**
 * Produces the default GameState used on first launch and after any
 * corrupt-save reset.
 */
export function defaultGameState(): GameState;
```

## Invariants

1. **TypeScript types derive from the schema, not the other way around.** A future field added to the zod schema flows into `GameState` automatically.
2. **`version` is a literal, not a `number`.** Each version of the payload uses `z.literal(N)` so the discriminated union narrows correctly.
3. **`CURRENT_SAVE_VERSION` is a `const`** so it's usable in literal positions.
4. **`migrate()` is pure** — no I/O, no global state. Tests can call it directly with planted payloads.
5. **`defaultGameState()` returns a fresh object each call** so callers cannot mutate a shared default.

## Test coverage (seed)

A unit test in `tests/data/saveSchema.test.ts` MUST cover:

- `savePayloadSchema.safeParse({ version: 1, data: { playerName: "Farmer", launchCount: 0 } })` succeeds.
- `safeParse` with `playerName: ""` fails (`min(1)`).
- `safeParse` with `launchCount: -1` fails.
- `safeParse` with `version: 99` fails (not in the union).
- `migrate(<valid v1 payload>)` returns the same payload (identity in v1).
- `defaultGameState()` returns a payload that itself passes the v1 schema.
