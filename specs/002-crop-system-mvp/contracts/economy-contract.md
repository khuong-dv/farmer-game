# Player Economy Contract

## Overview

PlayerEconomy manages the player's money balance and provides money-related operations.

## Public Interface

```typescript
class PlayerEconomy {
  // Get current money amount
  getMoney(): number;

  // Add money to balance
  // Throws if amount is negative
  addMoney(amount: number): void;

  // Check if player can afford a cost
  canAfford(cost: number): boolean;

  // Reset to initial money
  reset(): void;
}
```

## Behavior

- `getMoney()` returns current balance (>= 0)
- `addMoney(amount)` throws if `amount < 0`
- `canAfford(cost)` returns `getMoney() >= cost`
- Initial money is 100 for MVP

## Integration

PlayerEconomy is part of `GameState` and persisted via `SaveSystem`:

```typescript
interface GameState {
  money: number;  // Managed by PlayerEconomy
  // ... other fields
}
```

## Events

No pub/sub events — money changes are pushed via `gameState.ts` listener system.