import Phaser from "phaser";

export default class MainScene extends Phaser.Scene {
  private fpsText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "Main" });
  }

  create(): void {
    this.add.text(20, 20, "🌾 Farmer Game — engine alive", {
      fontSize: "24px",
      color: "#ffffff",
    });
    this.fpsText = this.add.text(20, 60, "FPS: --", {
      fontSize: "18px",
      color: "#ffffff",
    });
  }

  update(): void {
    this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
  }
}
