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

  it("migrate is identity for v1", () => {
    const payload: SavePayload = {
      version: 1,
      data: { playerName: "Farmer", launchCount: 5 },
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
