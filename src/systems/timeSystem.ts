import { advanceDay } from "../state/gameState";
import * as cropSystem from "./cropSystem";

export function sleep(): void {
  advanceDay();
  cropSystem.advanceCropGrowth();
}

export function getDaysSincePlanting(plantedDay: number, currentDay: number): number {
  return currentDay - plantedDay;
}

export function isCropReady(plantedDay: number, growthDurationDays: number, currentDay: number): boolean {
  return getDaysSincePlanting(plantedDay, currentDay) >= growthDurationDays;
}