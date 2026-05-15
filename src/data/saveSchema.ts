import { z } from "zod";

export const CURRENT_SAVE_VERSION = 1 as const;

export const gameStateV1Schema = z.object({
  playerName: z.string().min(1).max(64),
  launchCount: z.number().int().nonnegative().finite(),
});

export const savePayloadV1Schema = z.object({
  version: z.literal(1),
  data: gameStateV1Schema,
});

export const savePayloadSchema = z.discriminatedUnion("version", [
  savePayloadV1Schema,
]);

export type GameStateV1 = z.infer<typeof gameStateV1Schema>;
export type GameState = GameStateV1;
export type SavePayloadV1 = z.infer<typeof savePayloadV1Schema>;
export type SavePayload = z.infer<typeof savePayloadSchema>;

export function migrate(payload: SavePayload): SavePayload | null {
  switch (payload.version) {
    case 1:
      return payload;
    default:
      return null;
  }
}

export function defaultGameState(): GameState {
  return {
    playerName: "Farmer",
    launchCount: 0,
  };
}
