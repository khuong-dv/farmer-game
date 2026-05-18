# Data Model: Crop System MVP

## Overview

The crop system MVP introduces four core entities: `Plot`, `Crop`, `PlayerEconomy`, and `GameTime`. These entities work together to support the plant-grow-harvest gameplay loop with day-based time progression.

## Entities

### Plot

Represents a single land area where crops can be planted and harvested.

```typescript
enum PlotState {
  EMPTY = "empty",       // No crop planted
  PLANTED = "planted",   // Crop just planted
  GROWING = "growing",   // Crop in growth progress
  READY = "ready"        // Crop mature, ready for harvest
}

interface Plot {
  id: string;                    // Unique plot identifier
  state: PlotState;              // Current plot state
  crop: Crop | null;             // Active crop, or null if empty
  plantedDay: number | null;     // Day number when crop was planted
}
```

**State Transitions:**

```
EMPTY ──[plant()]──> PLANTED ──[sleep()]──> GROWING ──[sleep()]──> READY
       <───────────────────────────────────────────────────────────────[harvest()]
                                   │
                                   └──────> EMPTY ──[harvest() on ready crop]──> EMPTY
```

**Validation Rules:**
- `plant()` is only valid when `state === EMPTY`
- `harvest()` is only valid when `state === READY`
- `crop` is `null` only when `state === EMPTY`
- `plantedDay` is `null` only when `state === EMPTY`

---

### Crop

Represents a growing plant with lifecycle stages.

```typescript
enum CropType {
  RICE = "rice"
}

enum CropStage {
  SEEDED = "seeded",   // Just planted
  SPROUTING = "sprouting",  // First visible growth
  GROWING = "growing",  // Mid-growth
  MATURE = "mature"    // Ready for harvest
}

interface Crop {
  type: CropType;              // Crop type (Rice for MVP)
  plantedDay: number;          // Day number when planted
  growthDurationDays: number;  // Days to reach maturity (3 for MVP)
  sellValue: number;           // Money earned when harvested (50 for MVP)
}
```

**Growth Calculation:**

```
currentDay - plantedDay < growthDurationDays → not ready
currentDay - plantedDay >= growthDurationDays → ready
```

**For MVP:**
- `CropType.RICE` has `growthDurationDays: 3`, `sellValue: 50`
- Crop stage can be derived from progress ratio: `(currentDay - plantedDay) / growthDurationDays`

**Validation Rules:**
- `plantedDay` must be a positive integer (>= 1)
- `growthDurationDays` must be positive (> 0)
- `sellValue` must be non-negative (>= 0)

---

### PlayerEconomy

Tracks the player's money balance.

```typescript
interface PlayerEconomy {
  money: number;               // Current money amount
  initialMoney: number;       // Starting money amount (100 for MVP)
}
```

**Operations:**

```typescript
addMoney(amount: number): void;    // Increases money by amount
canAfford(cost: number): boolean;  // Checks if money >= cost
reset(): void;                     // Resets to initialMoney
```

**Validation Rules:**
- `money` is always >= 0
- `addMoney()` with negative amount throws error
- `initialMoney` >= 0

---

### GameTime

Represents the current day number in the game world.

```typescript
interface GameTime {
  currentDay: number;        // Current day number (starts at 1)
}
```

**Operations:**

```typescript
advanceDay(): void;          // Increments currentDay by 1
reset(): void;               // Resets to day 1
}
```

**Validation Rules:**
- `currentDay` is always >= 1
- `advanceDay()` increments by exactly 1

---

## Relationships

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    Plot     │───────│     Crop     │       │  GameTime   │
│ (1 plot)    │  0..1 │ (1 per plot) │       │ (singleton) │
└─────────────┘       └──────────────┘       └─────────────┘
       │                     │                       │
       │                     │                       │
       └─────────────────────┴───────────┬───────────┘
                                       │
                               ┌───────▼────────┐
                               │ PlayerEconomy  │
                               │   (singleton)  │
                               └────────────────┘
```

**Key Relationships:**
- A `Plot` optionally contains a `Crop` (null if empty)
- `Crop.plantedDay` references `GameTime.currentDay`
- Harvesting a crop adds to `PlayerEconomy.money`

---

## Game State Integration

These entities integrate into the existing `GameState` via `saveSchema.ts`:

```typescript
// Extended schema (CURRENT_SAVE_VERSION will be bumped to 2)
export const gameStateV2Schema = z.object({
  playerName: z.string().min(1).max(64),
  launchCount: z.number().int().nonnegative().finite(),
  // NEW FIELDS
  currentDay: z.number().int().positive().finite(),
  money: z.number().int().nonnegative().finite(),
  plot: z.object({
    state: z.enum(["empty", "planted", "growing", "ready"]),
    crop: z.object({
      type: z.enum(["rice"]),
      plantedDay: z.number().int().positive().finite(),
      growthDurationDays: z.number().int().positive().finite(),
      sellValue: z.number().int().nonnegative().finite(),
    }).nullable(),
    plantedDay: z.number().int().positive().finite().nullable(),
  }),
});
```

---

## Persistence

All entities are persisted via `SaveSystem.ts` with Zod validation:

1. **Save**: `gameState.ts` serializes to `SavePayload`
2. **Validate**: `saveSchema.ts` validates structure and types
3. **Load**: `SaveSystem.ts` deserializes and applies to `gameState`

**Edge Cases Handled:**
- Loading a save with `crop: null` and `state: "growing"` → error, invalid state
- Loading a save with `currentDay < plantedDay` → error, time paradox
- Loading old saves (version 1) → `cropSystem.ts` initializes empty plot