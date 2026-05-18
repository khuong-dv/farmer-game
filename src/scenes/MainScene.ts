import Phaser from "phaser";
import { CropAssetLoader } from "../utils/assetLoader";
import { FarmButtonManager } from "../ui/hud/Buttons";
import { subscribe } from "../state/gameState";
import * as cropSystem from "../systems/cropSystem";
import { PlotState } from "../entities/plot/plotTypes";
import { save } from "../systems/SaveSystem";

const PLOT_ID = "main-plot";

export default class MainScene extends Phaser.Scene {
  private fpsText!: Phaser.GameObjects.Text;
  private dayText!: Phaser.GameObjects.Text;
  private moneyText!: Phaser.GameObjects.Text;
  private cropLoader!: CropAssetLoader;
  private buttonManager!: FarmButtonManager;

  constructor() {
    super({ key: "Main" });
  }

  preload(): void {
    this.cropLoader = new CropAssetLoader(this);
    this.cropLoader.preload();
  }

  create(): void {
    // Title
    this.add.text(20, 20, "🌾 Farmer Game", {
      fontSize: "28px",
      fontStyle: "bold",
      color: "#ffffff",
    });

    // FPS counter
    this.fpsText = this.add.text(20, 60, "FPS: --", {
      fontSize: "16px",
      color: "#cccccc",
    });

    // Day display
    this.dayText = this.add.text(20, 85, "Day: 1", {
      fontSize: "20px",
      color: "#ffffff",
    });

    // Money display
    this.moneyText = this.add.text(20, 115, "Money: 100", {
      fontSize: "20px",
      color: "#FFD700",
    });

    // Plot sprites (center of screen)
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    this.cropLoader.createSprites(PLOT_ID, centerX, centerY);

    // Action buttons (bottom of screen)
    const buttonY = this.cameras.main.height - 60;
    const buttonX = centerX - 200;
    this.buttonManager = new FarmButtonManager(this);
    this.buttonManager.create(buttonX, buttonY);

    // Sync plot from saved state
    cropSystem.loadPlotFromState();

    // Initial sprite update
    const plot = cropSystem.getPlot();
    this.cropLoader.updateSprite(PLOT_ID, plot.getState());
    this.buttonManager.updateButtonStates();

    // Subscribe to game state changes
    subscribe((state) => {
      this.dayText.setText(`Day: ${state.currentDay}`);
      this.moneyText.setText(`Money: ${state.money}`);

      if (state.plot) {
        this.cropLoader.updateSprite(PLOT_ID, state.plot.state as PlotState);
        this.buttonManager.updateButtonStates();
      }
    });

    // Save on create
    save();
  }

  update(): void {
    this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
  }
}