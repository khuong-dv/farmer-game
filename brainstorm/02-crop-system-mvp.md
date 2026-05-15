---
name: crop-system-mvp
description: Core crop planting/watering/harvesting gameplay with day-based time loop
type: brainstorm
---

# Brainstorm: Crop System MVP

**Date:** 2026-05-15
**Status:** active

## Problem Framing

The project skeleton is complete (engine alive, state store, save/load, quality gates). Now we need the first playable feature: a crop system that demonstrates the core gameplay loop of a day-based farming game.

Goal: Minimal but playable — player can plant a crop, water it, wait for it to grow over days, harvest, and sell for profit. This validates the gameplay concept before expanding scope.

## Approaches Considered

### A: Time System Foundation First
- Build day/night cycle, calendar UI, save schema v2 before any gameplay.
- **Pros:** Foundation for everything; clear separation of concerns.
- **Cons:** Nothing playable for a while; risk of over-engineering time mechanics before understanding gameplay needs.

### B: Land/Tile System First
- Grid system for land plots, tile rendering, unlocking mechanics.
- **Pros:** Structure for expansion; clear ownership model.
- **Cons:** Empty grid with nothing to do; need crops anyway to prove value.

### C: Crop System First (chosen)
- Single crop, single plot, simple day counter → immediate playable loop.
- **Pros:** Fast to "fun", validates core mechanic, provides revenue system from day one.
- **Cons:** Time system will need retrofit later (but day-based counter is trivial to add).

## Decision

**Chosen: C — Crop System First.**

The user explicitly opted for this approach. Getting a playable loop sooner provides better feedback on gameplay feel. The day-based time system for MVP can be as simple as a `dayNumber` field in GameState; a full calendar/time-of-day system can be added later when needed.

### Detailed Shape for MVP

**Crop model (minimal):**
- Single crop type: e.g., "Lúa" (Rice)
- Lifecycle stages: `planted` → `growing` → `ready`
- Days to grow: 3 days (plant → wait 3 days → harvest)
- Water requirement: must water each day (optional simplification: auto-water for MVP, remove water mechanic)

**Plot/Tile model:**
- Single fixed plot for MVP
- State: `empty` | `planted` | `growing (day N)` | `ready`
- Tracks: planted day number, crop type

**Player economy:**
- `money` field in GameState
- Sell action: harvest → add money to wallet
- No shop UI yet (sell instantly for now)

**Time model (MVP):**
- Simple `currentDay` counter in GameState
- Each time player sleeps/ends day → `currentDay++`
- Crop growth checks: `if currentDay - plantedDay >= growthDays → ready`

**UI elements:**
- Scene with visible plot
- Action buttons: Plant, Water (if included), Harvest, Sleep
- HUD showing: Day number, Money

## Key Requirements

1. **Plot system**: At least one plot that can hold a crop in various states.
2. **Crop lifecycle**: Plant → grow over N days → harvest.
3. **Day progression**: Player can end the day and advance time.
4. **Economy**: Harvesting gives money; money is displayed and persisted.
5. **Persistence**: Crop state survives save/load (already covered by existing GameState, just need to extend schema).
6. **Playable loop**: Complete cycle: plant → wait → harvest → sell → repeat.

## Out of Scope for MVP

- Multiple crop types
- Multiple plots/land expansion
- Water mechanic (unless it proves simple enough; can defer)
- Shop/buy UI (selling is instant)
- Animals
- Buildings
- Time-of-day cycle (just day counter)
- Weather effects
- Save/load schema migration (will be handled when needed)

## Open Questions

- **Water mechanic**: Include watering requirement for MVP, or simplify to auto-water?
  - *For spec phase*: Consider if watering adds meaningful gameplay or just busywork.
- **Growth time**: 3 days, 5 days, or configurable?
  - *For spec phase*: Balance testing will inform final numbers; pick a starting value.
- **Sleep action**: How does player end the day? Button? Dialog? Automatic?
  - *For spec phase*: Simple button is sufficient for MVP.
- **Save schema migration**: How to handle existing saves when adding crop fields?
  - *For spec phase*: Likely v2 schema; migration path from v1 (empty) to v2 (crop fields).

## Phase Roadmap (Beyond MVP)

**Phase 2: Expanded Crops & Economy**
- 3-5 crop types with different growth times/sell prices
- Shop UI to buy seeds
- Water mechanic (if not in MVP)

**Phase 3: Land Expansion**
- Multiple plots in a grid
- Unlock new land areas with money

**Phase 4: Animals**
- Buy/breed animals
- Collect products (eggs, milk, wool)

**Phase 5: Buildings & Crafting**
- Construct buildings
- Process raw materials into goods