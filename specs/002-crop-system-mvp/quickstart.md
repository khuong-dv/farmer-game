# Quickstart: Crop System MVP

## Running the Game

```bash
# Install dependencies (first time only)
bun install

# Start dev server
bun run dev

# Open browser to http://localhost:5173
```

## Developer Workflow

### Quality Gates

Before any commit, run:

```bash
# Type checking (TypeScript strict mode)
bun run typecheck

# Linting
bun run lint

# Build verification
bun run build

# Unit tests (pure-logic modules only)
bun run test
```

### Testing This Feature

**Unit Tests** (pure-logic modules):

```bash
# Run all unit tests
bun run test

# Run specific test file
bun run test economy.test.ts

# Watch mode for TDD
bun run test --watch
```

**Browser Playtesting** (required per Constitution):

```bash
# Start dev server
bun run dev

# In browser, exercise:
# 1. Plant a rice seed (click Plant button)
# 2. Sleep 3 times (click Sleep button 3x)
# 3. Harvest the crop (click Harvest button)
# 4. Verify money increased from 100 to 150
# 5. Verify plot returned to empty state
# 6. Try planting again (verify Plant button enabled)
```

### Save/Load Testing

```bash
# In browser:
# 1. Plant a crop
# 2. Sleep once
# 3. Trigger save (F5 or manual save if implemented)
# 4. Refresh page (trigger load)
# 5. Verify day = 2, plot = growing, crop still present
```

## Project Structure (Relevant Files)

```
src/
├── data/
│   ├── saveSchema.ts          # Extended with crop fields (v2)
│   └── cropSchema.ts          # NEW: crop-related schemas
├── entities/
│   └── plot/
│       ├── Plot.ts            # NEW: Plot state machine
│       └── plotTypes.ts       # NEW: Plot types
├── scenes/
│   └── MainScene.ts           # MODIFIED: plot rendering, HUD, buttons
├── state/
│   ├── gameState.ts           # MODIFIED: day, money, plot state
│   ├── economy.ts             # NEW: money management
│   └── gameTime.ts            # NEW: day progression
├── systems/
│   └── cropSystem.ts          # NEW: crop lifecycle
│   └── timeSystem.ts          # NEW: sleep action
├── ui/
│   └── hud/
│       ├── HUD.ts             # NEW: persistent HUD (day + money)
│       └── Buttons.ts         # NEW: interactive buttons
└── utils/
    └── assetLoader.ts         # NEW: asset loading

tests/
├── unit/
│   ├── state/economy.test.ts          # NEW
│   ├── state/gameTime.test.ts         # NEW
│   ├── entities/plot.test.ts          # NEW
│   └── systems/cropSystem.test.ts     # NEW
└── integration/saveLoad.test.ts       # NEW
```

## Key Concepts

### State Management

The game uses a centralized state pattern (`src/state/gameState.ts`):

```typescript
// Get read-only state
const state = getState();

// Update state
setState({ currentDay: state.currentDay + 1 });

// Subscribe to changes
const unsubscribe = subscribe((newState) => {
  console.log("Day:", newState.currentDay);
});
```

### Phaser Scene Integration

`MainScene` subscribes to state changes and updates UI:

```typescript
create() {
  subscribe((state) => {
    this.hud.updateDay(state.currentDay);
    this.hud.updateMoney(state.money);
    this.plot.render(state.plot);
  });
}
```

### Save/Load Flow

```
user action → SaveSystem.save() → serialize() → Zod validate → localStorage
load → localStorage → Zod validate → load() → notify listeners → UI updates
```

## Common Issues

### TypeScript Errors

If you see "Property X does not exist on type GameState":
- Check `src/data/saveSchema.ts` — you may need to bump `CURRENT_SAVE_VERSION`
- Re-run `bun run typecheck` to verify

### Zod Validation Errors

If save/load fails with validation error:
- Check `src/data/saveSchema.ts` schema definition
- Ensure invariants are maintained (e.g., `crop: null` ↔ `state: "empty"`)

### Assets Missing

If sprites don't appear:
- Check `public/assets/crops/rice/` directory exists
- Verify `src/utils/assetLoader.ts` loads correct paths
- Open browser DevTools → Network tab to check asset loading

## Getting Help

- See [data-model.md](./data-model.md) for entity definitions
- See [contracts/](./contracts/) for interface contracts
- See [spec.md](./spec.md) for feature requirements
- See [plan.md](./plan.md) for architecture decisions