import Phaser from "phaser";
import * as gameState from "../state/gameState";
import { savePayloadSchema, migrate } from "../data/saveSchema";

export const SAVE_STORAGE_KEY = "farmer-game:save";

export type LoadResult =
  | { status: "loaded"; version: number }
  | { status: "no-save" }
  | { status: "corrupt"; reason: "parse" | "schema" | "unknown-version" }
  | { status: "storage-unavailable" };

function getStorage(): Storage | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function save(): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    const payload = gameState.serialize();
    storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function load(): LoadResult {
  const storage = getStorage();
  if (!storage) return { status: "storage-unavailable" };

  let raw: string | null;
  try {
    raw = storage.getItem(SAVE_STORAGE_KEY);
  } catch {
    return { status: "storage-unavailable" };
  }
  if (raw === null) return { status: "no-save" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    gameState.resetToDefault();
    return { status: "corrupt", reason: "parse" };
  }

  const result = savePayloadSchema.safeParse(parsed);
  if (!result.success) {
    const isUnknownVersion = result.error.issues.some(
      (issue) => issue.code === "invalid_union_discriminator",
    );
    gameState.resetToDefault();
    return {
      status: "corrupt",
      reason: isUnknownVersion ? "unknown-version" : "schema",
    };
  }

  const migrated = migrate(result.data);
  if (migrated === null) {
    gameState.resetToDefault();
    return { status: "corrupt", reason: "unknown-version" };
  }

  gameState.load(migrated);
  return { status: "loaded", version: migrated.version };
}

export function clear(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(SAVE_STORAGE_KEY);
  } catch {
    // swallow: failure to clear is non-fatal
  }
}

export function registerAutoSave(game: Phaser.Game): void {
  const wire = (scene: Phaser.Scene): void => {
    scene.events.on(Phaser.Scenes.Events.CREATE, () => {
      save();
    });
  };
  for (const scene of game.scene.scenes) {
    wire(scene);
  }
}
