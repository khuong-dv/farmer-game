import { describe, it, expect } from "vitest";
import { PlayerEconomy, getPlayerEconomy } from "../../../src/state/economy";

describe("PlayerEconomy", () => {
  describe("initialization", () => {
    it("should start with 100 money by default", () => {
      const economy = new PlayerEconomy();
      expect(economy.getMoney()).toBe(100);
    });

    it("should start with specified initial money", () => {
      const economy = new PlayerEconomy(250);
      expect(economy.getMoney()).toBe(250);
    });

    it("should throw error for negative initial money", () => {
      expect(() => new PlayerEconomy(-1)).toThrow("Initial money must be >= 0");
    });

    it("should allow zero initial money", () => {
      const economy = new PlayerEconomy(0);
      expect(economy.getMoney()).toBe(0);
    });
  });

  describe("getMoney", () => {
    it("should return current money amount", () => {
      const economy = new PlayerEconomy(500);
      expect(economy.getMoney()).toBe(500);
    });
  });

  describe("addMoney", () => {
    it("should increase money by amount", () => {
      const economy = new PlayerEconomy();
      economy.addMoney(50);
      expect(economy.getMoney()).toBe(150);
    });

    it("should handle multiple additions", () => {
      const economy = new PlayerEconomy();
      economy.addMoney(25);
      economy.addMoney(25);
      economy.addMoney(25);
      expect(economy.getMoney()).toBe(175);
    });

    it("should allow adding zero", () => {
      const economy = new PlayerEconomy(100);
      economy.addMoney(0);
      expect(economy.getMoney()).toBe(100);
    });

    it("should throw error for negative amount", () => {
      const economy = new PlayerEconomy();

      expect(() => economy.addMoney(-1)).toThrow("Cannot add negative money amount");
      expect(() => economy.addMoney(-50)).toThrow("Cannot add negative money amount");
    });
  });

  describe("canAfford", () => {
    it("should return true when money >= cost", () => {
      const economy = new PlayerEconomy(100);

      expect(economy.canAfford(0)).toBe(true);
      expect(economy.canAfford(50)).toBe(true);
      expect(economy.canAfford(100)).toBe(true);
    });

    it("should return false when money < cost", () => {
      const economy = new PlayerEconomy(50);

      expect(economy.canAfford(51)).toBe(false);
      expect(economy.canAfford(100)).toBe(false);
    });
  });

  describe("reset", () => {
    it("should reset to initial money", () => {
      const economy = new PlayerEconomy(200);
      economy.addMoney(50);
      expect(economy.getMoney()).toBe(250);

      economy.reset();
      expect(economy.getMoney()).toBe(200);
    });

    it("should work after no changes", () => {
      const economy = new PlayerEconomy(150);
      expect(economy.getMoney()).toBe(150);

      economy.reset();
      expect(economy.getMoney()).toBe(150);
    });
  });

  describe("toJSON and fromJSON", () => {
    it("should serialize and deserialize correctly", () => {
      const economy = new PlayerEconomy(100);
      economy.addMoney(50);

      const json = economy.toJSON();
      expect(json.money).toBe(150);
      expect(json.initialMoney).toBe(100);

      const restored = PlayerEconomy.fromJSON(json);
      expect(restored.getMoney()).toBe(150);
    });

    it("should handle initial money", () => {
      const economy = new PlayerEconomy(250);
      const json = economy.toJSON();
      const restored = PlayerEconomy.fromJSON(json);
      expect(restored.getMoney()).toBe(250);
    });
  });

  describe("harvest scenario", () => {
    it("should correctly add harvest earnings", () => {
      const economy = new PlayerEconomy(100);

      // Harvest rice (value: 50)
      economy.addMoney(50);
      expect(economy.getMoney()).toBe(150);

      // Harvest another rice
      economy.addMoney(50);
      expect(economy.getMoney()).toBe(200);
    });
  });
});

describe("Singleton PlayerEconomy", () => {
  it("should return same instance from getPlayerEconomy", () => {
    const instance1 = getPlayerEconomy();
    const instance2 = getPlayerEconomy();
    expect(instance1).toBe(instance2);
  });
});