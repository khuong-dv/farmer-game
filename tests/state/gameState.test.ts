import { describe, it, expect, beforeEach } from "vitest";
import * as gameState from "../../src/state/gameState";
import { CURRENT_SAVE_VERSION } from "../../src/data/saveSchema";

describe("gameState", () => {
  beforeEach(() => {
    gameState.resetToDefault();
  });

  it("returns defaults on first getState", () => {
    const state = gameState.getState();
    expect(state.playerName).toBe("Farmer");
    expect(state.launchCount).toBe(0);
  });

  it("setState updates and getState reflects", () => {
    gameState.setState({ playerName: "Alice" });
    expect(gameState.getState().playerName).toBe("Alice");
  });

  it("subscribe fires once per setState and not after unsubscribe", () => {
    let count = 0;
    const unsubscribe = gameState.subscribe(() => {
      count++;
    });
    gameState.setState({ playerName: "Bob" });
    expect(count).toBe(1);
    unsubscribe();
    gameState.setState({ playerName: "Carol" });
    expect(count).toBe(1);
  });

  it("serialize returns { version: CURRENT, data: current state }", () => {
    gameState.setState({ playerName: "Dave", launchCount: 3 });
    const payload = gameState.serialize();
    expect(payload.version).toBe(CURRENT_SAVE_VERSION);
    expect(payload.data).toEqual({
      playerName: "Dave",
      launchCount: 3,
      currentDay: 1,
      money: 100,
      plot: { state: "empty", crop: null, plantedDay: null },
    });
  });

  it("load(serialize()) round-trips without loss", () => {
    gameState.setState({ playerName: "Eve", launchCount: 7 });
    const payload = gameState.serialize();
    gameState.resetToDefault();
    gameState.load(payload);
    expect(gameState.getState().playerName).toBe("Eve");
    expect(gameState.getState().launchCount).toBe(7);
  });
});
