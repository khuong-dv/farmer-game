# Plot Contract

## Overview

The Plot entity manages a single land area's state transitions and crop lifecycle.

## Public Interface

```typescript
class Plot {
  // Get current plot state
  getState(): PlotState;

  // Get current crop, or null if empty
  getCrop(): Crop | null;

  // Plant a crop in the plot
  // Throws if plot is not empty
  plant(cropType: CropType, plantedDay: number): void;

  // Harvest the crop
  // Throws if plot is empty or crop not ready
  harvest(): { cropType: CropType; sellValue: number };

  // Update plot state based on current day
  // Called after game time advances
  updateForDay(currentDay: number): void;

  // Reset plot to empty state
  reset(): void;
}
```

## State Machine

```
     +-------+
     | EMPTY |
     +-------+
         |
         | plant(cropType, day)
         v
    +---------+      sleep/day advance      +-------+
    | PLANTED | -------------------------> | READY |
    +---------+                           +-------+
         |                                      |
         | harvest() (ERROR)                    | harvest()
         v                                      v
    (throws error)                         +-------+
                                          | EMPTY |
                                          +-------+
```

## Invariants

1. `state === EMPTY` ↔ `crop === null` ↔ `plantedDay === null`
2. `state !== EMPTY` ↔ `crop !== null` ↔ `plantedDay !== null`
3. `plantedDay <= currentDay` always (no future planting)
4. `plant()` throws when `state !== EMPTY`
5. `harvest()` throws when `state !== READY`

## Events

No pub/sub events — plot state changes are pushed via `gameState.ts` listener system.