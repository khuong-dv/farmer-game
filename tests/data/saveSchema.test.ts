import { describe, it, expect } from "vitest";
import {
  savePayloadSchema,
  migrate,
  defaultGameState,
  CURRENT_SAVE_VERSION,
  type SavePayload,
} from "../../src/data/saveSchema";

describe("saveSchema", () => {
  it("accepts a valid v1 payload", () => {
    const result = savePayloadSchema.safeParse({
      version: 1,
      data: { playerName: "Farmer", launchCount: 0 },
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty playerName", () => {
    const result = savePayloadSchema.safeParse({
      version: 1,
      data: { playerName: "", launchCount: 0 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative launchCount", () => {
    const result = savePayloadSchema.safeParse({
      version: 1,
      data: { playerName: "Farmer", launchCount: -1 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown version", () => {
    const result = savePayloadSchema.safeParse({
      version: 99,
      data: {},
    });
    expect(result.success).toBe(false);
  });

  it("migrate upgrades v1 to v2 with crop-system defaults", () => {
    const payload: SavePayload = {
      version: 1,
      data: { playerName: "Farmer", launchCount: 5 },
    };
    expect(migrate(payload)).toEqual({
      version: 2,
      data: {
        playerName: "Farmer",
        launchCount: 5,
        currentDay: 1,
        money: 100,
        plot: { state: "empty", crop: null, plantedDay: null },
      },
    });
  });

  it("migrate is identity for v2", () => {
    const payload: SavePayload = {
      version: 2,
      data: {
        playerName: "Farmer",
        launchCount: 5,
        currentDay: 3,
        money: 250,
        plot: { state: "empty", crop: null, plantedDay: null },
      },
    };
    expect(migrate(payload)).toEqual(payload);
  });

  it("defaultGameState passes the v1 schema", () => {
    const result = savePayloadSchema.safeParse({
      version: CURRENT_SAVE_VERSION,
      data: defaultGameState(),
    });
    expect(result.success).toBe(true);
  });
});
