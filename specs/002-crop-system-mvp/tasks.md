# Tasks: Crop System MVP

**Input**: Design documents from `/specs/002-crop-system-mvp/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, quickstart.md

**Tests**: Unit tests for pure-logic modules (economy, gameTime, plot state machine) are REQUIRED per Constitution Principle II. Browser playtesting is REQUIRED for gameplay features.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Source code**: `src/` at repository root
- **Tests**: `tests/` at repository root
- **Assets**: `public/assets/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create new directories and basic structure for the feature

- [ ] T001 Create directories: src/entities/plot, src/ui/hud, tests/unit/state, tests/unit/entities, tests/unit/systems, tests/integration, public/assets/crops/rice

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 Extend saveSchema.ts with v2 schema including currentDay, money, plot fields in src/data/saveSchema.ts
- [ ] T003 [P] Create cropSchema.ts with PlotState, CropType, CropStage enums and interfaces in src/data/cropSchema.ts
- [ ] T004 Extend gameState.ts with currentDay, money, plot state fields and initial values in src/state/gameState.ts
- [ ] T005 Add save migration function for v1 → v2 schema in src/data/saveSchema.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Plant and Harvest Crop Cycle (Priority: P1) 🎯 MVP

**Goal**: Player can plant a crop seed in an empty plot, watch it grow over multiple game days, harvest it when ready, and earn money from selling the harvest.

**Independent Test**: Plant a single crop, sleep through the growth period, harvest it, and verify money is earned.

### Tests for User Story 1 (REQUIRED for pure-logic modules) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T006 [P] [US1] Unit test for Plot state machine in tests/unit/entities/plot.test.ts
- [ ] T007 [P] [US1] Unit test for cropSystem lifecycle in tests/unit/systems/cropSystem.test.ts
- [ ] T008 [US1] Integration test for save/load with crop state in tests/integration/saveLoad.test.ts

### Implementation for User Story 1

- [ ] T009 [P] [US1] Create plotTypes.ts with PlotState enum and Plot interface in src/entities/plot/plotTypes.ts
- [ ] T010 [US1] Implement Plot class with state machine in src/entities/plot/Plot.ts (depends on T009)
- [ ] T011 [P] [US1] Create cropSystem.ts with crop lifecycle management in src/systems/cropSystem.ts
- [ ] T012 [P] [US1] Create placeholder sprite assets in public/assets/crops/rice/ (empty.png, planted.png, growing.png, ready.png)
- [ ] T013 [US1] Create assetLoader.ts for loading crop sprites in src/utils/assetLoader.ts
- [ ] T014 [P] [US1] Create Buttons.ts with Plant/Harvest button components in src/ui/hud/Buttons.ts
- [ ] T015 [US1] Integrate Plot rendering and Plant/Harvest buttons in MainScene in src/scenes/MainScene.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Day Time Progression (Priority: P1)

**Goal**: Player can end the current game day and advance to the next day, which triggers crop growth and other daily state updates.

**Independent Test**: Click Sleep button, verify day counter increments and crop growth progresses.

### Tests for User Story 2 (REQUIRED for pure-logic modules) ⚠️

- [ ] T016 [P] [US2] Unit test for GameTime day progression in tests/unit/state/gameTime.test.ts

### Implementation for User Story 2

- [ ] T017 [US2] Implement gameTime.ts with GameTime class and day tracking in src/state/gameTime.ts
- [ ] T018 [P] [US2] Create timeSystem.ts with sleep action handler in src/systems/timeSystem.ts
- [ ] T019 [US2] Add Sleep button to Buttons.ts and integrate with MainScene in src/ui/hud/Buttons.ts and src/scenes/MainScene.ts
- [ ] T020 [US2] Connect day advancement to crop growth updates in MainScene in src/scenes/MainScene.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Money Display and Economy (Priority: P2)

**Goal**: Player can see their current money amount at all times via a persistent HUD display, and money increases when selling harvested crops.

**Independent Test**: Start with initial money, harvest a crop, verify money increases by expected amount, confirm HUD reflects change.

### Tests for User Story 3 (REQUIRED for pure-logic modules) ⚠️

- [ ] T021 [P] [US3] Unit test for economy money management in tests/unit/state/economy.test.ts

### Implementation for User Story 3

- [ ] T022 [US3] Implement economy.ts with PlayerEconomy class in src/state/economy.ts
- [ ] T023 [P] [US3] Create HUD.ts with persistent day + money display in src/ui/hud/HUD.ts
- [ ] T024 [US3] Connect harvest to money updates and HUD in MainScene in src/scenes/MainScene.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Browser playtesting, validation, and documentation

- [ ] T025 Run browser playtest: plant → sleep 3x → harvest → verify money → plant again
- [ ] T026 Test edge cases: plant on growing plot (should error), harvest early (should error), sleep without planting
- [ ] T027 Test save/load with crop in growing state
- [ ] T028 Verify quality gates: `bun run typecheck`, `bun run lint`, `bun run build`, `bun run test`
- [ ] T029 Update CLAUDE.md agent context reference if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US1 (Phase 3) and US2 (Phase 4) are both P1, can proceed in parallel if desired
  - US3 (Phase 5) is P2, should be implemented after US1 and US2
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 for crop updates but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for harvest trigger, US2 for HUD day display

### Within Each User Story

- Unit tests MUST be written and FAIL before implementation (TDD for pure-logic modules)
- Types/classes before systems/integration
- Core implementation before UI integration
- Story complete before moving to next priority

### Parallel Opportunities

- T003 (cropSchema.ts) can run in parallel with T002 (saveSchema.ts extension)
- T006, T007, T008 (tests for US1) can run in parallel
- T009, T011, T012, T014 (US1 models/systems) can run in parallel
- T016 (US2 test) can run in parallel with any US2 implementation tasks
- T021 (US3 test) can run in parallel with any US3 implementation tasks
- Different user stories can be worked on in parallel by different developers

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (TDD - write tests first):
Task: "Unit test for Plot state machine in tests/unit/entities/plot.test.ts"
Task: "Unit test for cropSystem lifecycle in tests/unit/systems/cropSystem.test.ts"

# Launch models/systems for User Story 1 together (after tests written):
Task: "Create plotTypes.ts with PlotState enum in src/entities/plot/plotTypes.ts"
Task: "Create cropSystem.ts with crop lifecycle management in src/systems/cropSystem.ts"
Task: "Create placeholder sprite assets in public/assets/crops/rice/"
Task: "Create Buttons.ts with Plant/Harvest buttons in src/ui/hud/Buttons.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Plant/Harvest)
4. Complete Phase 4: User Story 2 (Day Progression)
5. **STOP and VALIDATE**: Test full plant-grow-harvest cycle in browser
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Plant/Harvest works (partial loop)
3. Add User Story 2 → Test independently → Full plant-grow-harvest loop (MVP!)
4. Add User Story 3 → Test independently → Money feedback (full MVP + polish)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Plot/Crop/Harvest)
   - Developer B: User Story 2 (Day Progression)
3. Once US1 + US2 complete:
   - Developer A or B: User Story 3 (Economy/HUD)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify unit tests fail before implementing (TDD for pure-logic modules)
- Browser playtesting is REQUIRED per Constitution Principle II
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Format Validation

**All tasks follow the required checklist format:**
- ✅ Start with `- [ ]` (markdown checkbox)
- ✅ Sequential task ID (T001, T002, T003...)
- ✅ [P] marker for parallelizable tasks
- ✅ [Story] label for user story tasks (US1, US2, US3)
- ✅ Exact file paths in descriptions

**Total Task Count:** 29 tasks
- Phase 1 (Setup): 1 task
- Phase 2 (Foundational): 4 tasks
- Phase 3 (US1): 10 tasks (3 tests + 7 implementation)
- Phase 4 (US2): 4 tasks (1 test + 3 implementation)
- Phase 5 (US3): 4 tasks (1 test + 3 implementation)
- Phase 6 (Polish): 5 tasks
- Parallel opportunities: 11 tasks marked [P]