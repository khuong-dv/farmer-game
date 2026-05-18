import { z } from "zod";

export const CURRENT_SAVE_VERSION = 2 as const;

// V1 Schema
export const gameStateV1Schema = z.object({
  playerName: z.string().min(1).max(64),
  launchCount: z.number().int().nonnegative().finite(),
});

// V2 Schema - Extended with crop system fields
export const gameStateV2Schema = z.object({
  playerName: z.string().min(1).max(64),
  launchCount: z.number().int().nonnegative().finite(),
  currentDay: z.number().int().positive().finite(),
  money: z.number().int().nonnegative().finite(),
  plot: z.object({
    state: z.enum(["empty", "planted", "growing", "ready"]),
    crop: z.object({
      type: z.enum(["rice"]),
      plantedDay: z.number().int().positive().finite(),
      growthDurationDays: z.number().int().positive().finite(),
      sellValue: z.number().int().nonnegative().finite(),
    }).nullable(),
    plantedDay: z.number().int().positive().finite().nullable(),
  }),
});

export const savePayloadV1Schema = z.object({
  version: z.literal(1),
  data: gameStateV1Schema,
});

export const savePayloadV2Schema = z.object({
  version: z.literal(2),
  data: gameStateV2Schema,
});

export const savePayloadSchema = z.discriminatedUnion("version", [
  savePayloadV1Schema,
  savePayloadV2Schema,
]);

export type GameStateV1 = z.infer<typeof gameStateV1Schema>;
export type GameStateV2 = z.infer<typeof gameStateV2Schema>;
export type GameState = GameStateV2;
export type SavePayloadV1 = z.infer<typeof savePayloadV1Schema>;
export type SavePayloadV2 = z.infer<typeof savePayloadV2Schema>;
export type SavePayload = z.infer<typeof savePayloadSchema>;

export function migrate(payload: SavePayload): SavePayload | null {
  switch (payload.version) {
    case 1:
      return migrateV1ToV2(payload);
    case 2:
      return payload;
    default:
      return null;
  }
}

function migrateV1ToV2(payload: SavePayloadV1): SavePayloadV2 {
  return {
    version: 2,
    data: {
      playerName: payload.data.playerName,
      launchCount: payload.data.launchCount,
      currentDay: 1,
      money: 100,
      plot: {
        state: "empty",
        crop: null,
        plantedDay: null,
      },
    },
  };
}

export function defaultGameState(): GameState {
  return {
    playerName: "Farmer",
    launchCount: 0,
    currentDay: 1,
    money: 100,
    plot: {
      state: "empty",
      crop: null,
      plantedDay: null,
    },
  };
}
