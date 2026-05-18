# Implementation Plan: Crop System MVP

**Branch**: `002-crop-system-mvp` | **Date**: 2026-05-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-crop-system-mvp/spec.md`

## Summary

Implement the core farming gameplay loop: planting crops in a single plot, progressing time through day advancement (sleep), and harvesting mature crops to earn money. The system tracks game state (day, money, crop progress) with Zod-validated persistence. Single crop type (Rice) with 3-day growth cycle; minimal UI with HUD for day/money display and actionable buttons for Plant/Harvest/Sleep.

## Technical Context

**Language/Version**: TypeScript 5.5.0 (strict mode)
**Primary Dependencies**: Phaser 3.85.0 (game engine), Zod 3.23.0 (runtime validation), Vite 5.4.0 (build/dev), Vitest 1.6.0 (testing)
**Storage**: localStorage with Zod-validated save/load schema
**Testing**: Vitest for unit tests (pure-logic modules); browser playtesting for gameplay
**Target Platform**: Browser (latest 2 stable releases of Chrome, Firefox, Safari, Edge - desktop)
**Project Type**: Web application (Phaser-based game)
**Performance Goals**: 60fps rendering, <60s for complete plant-grow-harvest cycle
**Constraints**: Single plot, single crop type (Rice), 3-day growth duration, instant sell mechanic
**Scale/Scope**: MVP scale - minimal viable farming loop, one plot, one crop type

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | ✅ PASS | Following speckit workflow; spec exists under `specs/002-crop-system-mvp/` |
| II. Iterative Playtesting | ✅ PASS | Feature touches gameplay/rendering/input; playtest gate will be included in tasks |
| III. Type Safety & Quality Gates | ✅ PASS | TypeScript strict mode, Zod validation at save/load boundary, pre-commit gates defined |

**Quality Gates (before commit):**
- `bun run typecheck` (tsc --noEmit) clean
- `bun run lint` (eslint) clean
- `bun run build` succeeds
- Relevant unit tests pass (gameState, economy, time systems)

**Playtest Gate (before feature complete):**
- `bun run dev` running
- Complete plant-grow-harvest cycle exercised
- HUD displays day/money correctly
- Edge cases exercised (plant on growing plot, harvest early, etc.)

## Project Structure

### Documentation (this feature)

```text
specs/002-crop-system-mvp/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output - no research needed, spec is clear
├── data-model.md        # Phase 1 output - detailed entity definitions
├── quickstart.md        # Phase 1 output - developer quickstart for this feature
├── contracts/           # Phase 1 output - internal Phaser contracts (no external API)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── data/
│   ├── saveSchema.ts          # Existing: save/load schema (will be extended)
│   └── cropSchema.ts          # NEW: crop-related schemas
├── entities/
│   └── plot/                  # NEW: Plot entity
│       ├── Plot.ts            # Plot state machine and logic
│       └── plotTypes.ts       # Plot-related type definitions
├── scenes/
│   ├── BootScene.ts           # Existing: game boot
│   └── MainScene.ts           # MODIFIED: add plot rendering, HUD, buttons
├── state/
│   ├── gameState.ts           # MODIFIED: extend with day, money, plot state
│   ├── economy.ts             # NEW: money management
│   └── gameTime.ts            # NEW: day/time progression
├── systems/
│   ├── SaveSystem.ts          # Existing: save/load persistence
│   ├── cropSystem.ts          # NEW: crop lifecycle management
│   └── timeSystem.ts          # NEW: sleep action and day progression
├── ui/
│   └── hud/
│       ├── HUD.ts             # NEW: persistent HUD component (day + money)
│       └── Buttons.ts         # NEW: interactive buttons (Plant, Harvest, Sleep)
└── utils/
    └── assetLoader.ts         # NEW: asset loading utilities (sprites)

tests/
├── unit/
│   ├── state/
│   │   ├── economy.test.ts    # NEW: money management tests
│   │   └── gameTime.test.ts   # NEW: day progression tests
│   ├── entities/
│   │   └── plot.test.ts       # NEW: plot state machine tests
│   └── systems/
│       └── cropSystem.test.ts # NEW: crop lifecycle tests
└── integration/
    └── saveLoad.test.ts       # NEW: save/load with crop state tests

public/assets/
└── crops/
    └── rice/                  # NEW: rice sprite assets (empty, planted, growing, ready)
        ├── empty.png
        ├── planted.png
        ├── growing.png
        └── ready.png
```

**Structure Decision**: Extending existing Phaser 3 + Vite + TypeScript structure. New modules follow existing patterns (data/, state/, systems/, scenes/). Pure-logic modules (economy, gameTime, plot state machine) get unit tests. Phaser scene logic relies on browser playtesting per Constitution Principle II.

## Complexity Tracking

> No Constitution violations; this table remains empty.

## Phase 0: Research

### Clarification Status

All requirements from the spec are clear. No external research needed.

### Research Findings

**No research required** — the feature specification is self-contained with clear requirements for:
- Single plot with defined states
- Day progression via sleep action
- Money tracking and updates
- Crop lifecycle (3-day growth)
- Save/load persistence

Technical approach follows established patterns:
- Phaser 3 scene-based architecture (existing)
- Zod schema validation (existing pattern)
- Pub/sub state management (existing pattern)
- Vitest unit tests for pure logic (existing pattern)

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for detailed entity definitions, relationships, and validation rules.

### Contracts

See [contracts/](./contracts/) directory for interface definitions:
- `plot-contract.md` — Plot state machine interface
- `time-contract.md` — Game time progression contract
- `economy-contract.md` — Money management contract

### Quickstart

See [quickstart.md](./quickstart.md) for developer onboarding and testing this feature.