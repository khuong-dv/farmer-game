# Feature Specification: Crop System MVP

**Feature Branch**: `002-crop-system-mvp`
**Created**: 2026-05-18
**Status**: Draft
**Input**: User description: "Based on brainstorm/02-crop-system-mvp.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Plant and Harvest Crop Cycle (Priority: P1)

Player can plant a crop seed in an empty plot, watch it grow over multiple game days, harvest it when ready, and earn money from selling the harvest.

**Why this priority**: This is the core gameplay loop that validates the farming game concept. Without this, there is no playable game.

**Independent Test**: Can be fully tested by planting a single crop, sleeping through the growth period, harvesting it, and verifying money is earned. Delivers the core farming experience.

**Acceptance Scenarios**:

1. **Given** player has an empty plot, **When** player clicks "Plant" button, **Then** plot state changes to "planted" and crop appears
2. **Given** crop is planted, **When** player sleeps (ends the day), **Then** day counter increments and crop growth progresses
3. **Given** crop is planted, **When** player sleeps enough days to reach maturity, **Then** crop state changes to "ready" and visual indicates harvestable
4. **Given** crop is ready for harvest, **When** player clicks "Harvest" button, **Then** crop is removed, plot becomes empty, and player money increases by sell value
5. **Given** crop is ready for harvest, **When** player harvests it, **Then** HUD displays updated money amount immediately

---

### User Story 2 - Day Time Progression (Priority: P1)

Player can end the current game day and advance to the next day, which triggers crop growth and other daily state updates.

**Why this priority**: Time progression is essential for crops to grow. Without the ability to advance days, the farming loop cannot complete.

**Independent Test**: Can be fully tested by clicking "Sleep" button, verifying day counter increments, and observing any time-based state changes (like crop growth). Enables the entire farming gameplay.

**Acceptance Scenarios**:

1. **Given** player is on day 1, **When** player clicks "Sleep" button, **Then** day counter increments to day 2
2. **Given** a crop was planted on day 1 with 3-day growth, **When** player sleeps to day 4, **Then** crop state changes to "ready"
3. **Given** player has multiple days remaining, **When** player sleeps repeatedly, **Then** each sleep action increments day counter by exactly 1
4. **Given** no crop is planted, **When** player sleeps, **Then** day still increments (sleep is always available)
5. **Given** player sleeps, **When** the action completes, **Then** HUD displays current day number

---

### User Story 3 - Money Display and Economy (Priority: P2)

Player can see their current money amount at all times via a persistent HUD display, and money increases when selling harvested crops.

**Why this priority**: Money provides immediate feedback and progression incentive. While the game can technically work without visible money, the feedback loop is essential for player satisfaction and long-term engagement.

**Independent Test**: Can be fully tested by starting with initial money, harvesting a crop, verifying money increases by the expected amount, and confirming the HUD reflects this change. Demonstrates the reward system.

**Acceptance Scenarios**:

1. **Given** player starts a new game, **When** the game loads, **Then** HUD displays initial money amount
2. **Given** player has 0 money, **When** player harvests a ready crop worth 50, **Then** money becomes 50 and HUD displays "50"
3. **Given** player has 100 money, **When** player harvests a crop worth 50, **Then** money becomes 150 and HUD displays "150"
4. **Given** player has money, **When** player saves and loads the game, **Then** money amount persists correctly

---

### Edge Cases

- What happens when player tries to plant in a plot that already has a growing crop?
- What happens when player tries to harvest a crop that is not yet ready?
- What happens when player has 0 money and harvests their first crop?
- What happens when player saves the game with a crop in the middle of growing, then loads later?
- What happens if the player repeatedly sleeps without planting anything?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a single plot that shows its current state (empty, planted, growing, ready)
- **FR-002**: System MUST provide a "Plant" button that is enabled only when the plot is empty
- **FR-003**: System MUST provide a "Harvest" button that is enabled only when the crop is ready
- **FR-004**: System MUST provide a "Sleep" button that is always available to end the current day
- **FR-005**: System MUST track the current day number starting from day 1
- **FR-006**: System MUST display the current day number in a persistent HUD
- **FR-007**: System MUST track crop lifecycle from planted (day planted) through growing days to ready (maturity)
- **FR-008**: System MUST complete crop growth after 3 days from planting (day planted + 3 = ready)
- **FR-009**: System MUST increment the day counter by exactly 1 each time player sleeps
- **FR-010**: System MUST track player money starting at an initial amount
- **FR-011**: System MUST display the current money amount in a persistent HUD
- **FR-012**: System MUST add money to player's total when harvesting a ready crop
- **FR-013**: System MUST reset the plot to empty state after harvesting a crop
- **FR-014**: System MUST persist game state (day, money, crop state) when saving
- **FR-015**: System MUST restore game state correctly when loading a saved game

### Key Entities *(include if feature involves data)*

- **Plot**: A single land area where crops can be planted. Has states: empty, planted, growing, ready. Tracks the day when a crop was planted.
- **Crop**: Represents a growing plant with lifecycle stages. Has type (e.g., Rice), planted day reference, and growth duration.
- **Player Economy**: Tracks the player's money balance. Money increases when harvesting crops.
- **Game Time**: Represents the current day number in the game world. Progresses by 1 each time player sleeps.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Player can complete a full plant-grow-harvest cycle in under 60 seconds
- **SC-002**: Day counter increments by exactly 1 each sleep action, with no skips or errors
- **SC-003**: Harvested crops immediately add the correct money amount, displayed within 1 second
- **SC-004**: Saved games restore all state (day, money, crop progress) accurately
- **SC-005**: Visual feedback for plot states (empty, planted, growing, ready) is clear and distinguishable

## Assumptions

- Single plot is sufficient for MVP (no multiple plots or land expansion)
- Auto-watering is acceptable for MVP (no watering mechanic needed)
- Single crop type (Rice/Lúa) is sufficient to demonstrate gameplay
- Selling crops is instantaneous (no shop UI needed for MVP)
- Time-of-day cycle is not needed (simple day counter is sufficient)
- Growth time of 3 days provides good pacing for gameplay testing
- Initial money amount should be set to allow for gameplay experimentation
- HUD for day and money displays persist across all game scenes