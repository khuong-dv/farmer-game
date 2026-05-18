import { z } from "zod";

export enum PlotState {
  EMPTY = "empty",
  PLANTED = "planted",
  GROWING = "growing",
  READY = "ready",
}

export enum CropType {
  RICE = "rice",
}

export enum CropStage {
  SEEDED = "seeded",
  SPROUTING = "sprouting",
  GROWING = "growing",
  MATURE = "mature",
}

export interface Crop {
  type: CropType;
  plantedDay: number;
  growthDurationDays: number;
  sellValue: number;
}

export interface Plot {
  id: string;
  state: PlotState;
  crop: Crop | null;
  plantedDay: number | null;
}

// Zod schemas for validation
export const cropSchema = z.object({
  type: z.enum(["rice"]),
  plantedDay: z.number().int().positive().finite(),
  growthDurationDays: z.number().int().positive().finite(),
  sellValue: z.number().int().nonnegative().finite(),
});

export const plotSchema = z.object({
  id: z.string(),
  state: z.enum(["empty", "planted", "growing", "ready"]),
  crop: cropSchema.nullable(),
  plantedDay: z.number().int().positive().finite().nullable(),
});

export type CropTypeValue = z.infer<typeof cropSchema>["type"];
export type PlotStateValue = z.infer<typeof plotSchema>["state"];

// MVP crop configurations
export const CROP_CONFIG = {
  [CropType.RICE]: {
    growthDurationDays: 3,
    sellValue: 50,
  },
} as const;

export function getCropConfig(type: CropType): {
  growthDurationDays: number;
  sellValue: number;
} {
  return CROP_CONFIG[type];
}