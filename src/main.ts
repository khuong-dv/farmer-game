import Phaser from "phaser";
import BootScene from "./scenes/BootScene";
import MainScene from "./scenes/MainScene";
import * as SaveSystem from "./systems/SaveSystem";
import * as gameState from "./state/gameState";

SaveSystem.load();
gameState.setState({ launchCount: gameState.getState().launchCount + 1 });

export const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: 800,
  height: 600,
  backgroundColor: "#1a1a2e",
  scene: [BootScene, MainScene],
});

SaveSystem.registerAutoSave(game);

if (typeof window !== "undefined") {
  (window as unknown as { __state: typeof gameState }).__state = gameState;
}
