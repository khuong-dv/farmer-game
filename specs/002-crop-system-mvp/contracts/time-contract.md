# Game Time Contract

## Overview

GameTime manages day progression and provides a day counter for crop growth calculations.

## Public Interface

```typescript
class GameTime {
  // Get current day number
  getCurrentDay(): number;

  // Advance to next day
  // Increments day counter by exactly 1
  advanceDay(): void;

  // Reset to day 1
  reset(): void;
}
```

## Behavior

- `advanceDay()` always increments by exactly 1
- Day counter starts at 1
- No upper bound on day number (game continues indefinitely)

## Integration

GameTime is part of `GameState` and persisted via `SaveSystem`:

```typescript
interface GameState {
  currentDay: number;  // Managed by GameTime
  // ... other fields
}
```

## Events

No pub/sub events — day changes are pushed via `gameState.ts` listener system.