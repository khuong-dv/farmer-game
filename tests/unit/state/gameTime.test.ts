import { describe, it, expect } from "vitest";
import { GameTime, getGameTime } from "../../../src/state/gameTime";

describe("GameTime", () => {
  describe("initialization", () => {
    it("should start at day 1 by default", () => {
      const gameTime = new GameTime();
      expect(gameTime.getCurrentDay()).toBe(1);
    });

    it("should start at specified day", () => {
      const gameTime = new GameTime(5);
      expect(gameTime.getCurrentDay()).toBe(5);
    });

    it("should throw error for initial day < 1", () => {
      expect(() => new GameTime(0)).toThrow("Initial day must be >= 1");
      expect(() => new GameTime(-1)).toThrow("Initial day must be >= 1");
    });
  });

  describe("getCurrentDay", () => {
    it("should return current day", () => {
      const gameTime = new GameTime(10);
      expect(gameTime.getCurrentDay()).toBe(10);
    });
  });

  describe("advanceDay", () => {
    it("should increment day by 1", () => {
      const gameTime = new GameTime();
      gameTime.advanceDay();
      expect(gameTime.getCurrentDay()).toBe(2);
    });

    it("should increment correctly from initial day", () => {
      const gameTime = new GameTime(5);
      gameTime.advanceDay();
      expect(gameTime.getCurrentDay()).toBe(6);
    });

    it("should increment correctly multiple times", () => {
      const gameTime = new GameTime();
      gameTime.advanceDay();
      gameTime.advanceDay();
      gameTime.advanceDay();
      expect(gameTime.getCurrentDay()).toBe(4);
    });
  });

  describe("reset", () => {
    it("should reset to day 1", () => {
      const gameTime = new GameTime();
      gameTime.advanceDay();
      gameTime.advanceDay();
      gameTime.advanceDay();
      expect(gameTime.getCurrentDay()).toBe(4);

      gameTime.reset();
      expect(gameTime.getCurrentDay()).toBe(1);
    });

    it("should work when already at day 1", () => {
      const gameTime = new GameTime();
      expect(gameTime.getCurrentDay()).toBe(1);

      gameTime.reset();
      expect(gameTime.getCurrentDay()).toBe(1);
    });
  });

  describe("toJSON and fromJSON", () => {
    it("should serialize and deserialize correctly", () => {
      const gameTime = new GameTime(7);
      const json = gameTime.toJSON();
      expect(json.currentDay).toBe(7);

      const restored = GameTime.fromJSON(json);
      expect(restored.getCurrentDay()).toBe(7);
    });

    it("should handle day 1", () => {
      const gameTime = new GameTime();
      const json = gameTime.toJSON();
      const restored = GameTime.fromJSON(json);
      expect(restored.getCurrentDay()).toBe(1);
    });
  });
});

describe("Singleton GameTime", () => {
  it("should return same instance from getGameTime", () => {
    const instance1 = getGameTime();
    const instance2 = getGameTime();
    expect(instance1).toBe(instance2);
  });
});