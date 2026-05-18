import Phaser from "phaser";
import * as cropSystem from "../../systems/cropSystem";
import { advanceDay } from "../../state/gameState";
import { PlotState } from "../../entities/plot/plotTypes";

export interface FarmButtons {
  plant: Phaser.GameObjects.Text;
  harvest: Phaser.GameObjects.Text;
  sleep: Phaser.GameObjects.Text;
}

export class FarmButtonManager {
  private scene: Phaser.Scene;
  private buttons: FarmButtons | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(x: number, y: number): FarmButtons {
    const buttonStyle = {
      fontSize: "18px",
      fontStyle: "bold",
      color: "#FFFFFF",
      backgroundColor: "#4CAF50",
      padding: { x: 16, y: 8 },
      fixedWidth: 120,
      align: "center" as const,
    };

    this.buttons = {
      plant: this.scene.add
        .text(x, y, "Plant Rice", buttonStyle)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", this.handlePlant.bind(this))
        .on("pointerover", () => this.buttons!.plant.setStyle({ backgroundColor: "#66BB6A" }))
        .on("pointerout", () => this.buttons!.plant.setStyle({ backgroundColor: "#4CAF50" })),

      harvest: this.scene.add
        .text(x + 130, y, "Harvest", buttonStyle)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", this.handleHarvest.bind(this))
        .on("pointerover", () =>
          this.buttons!.harvest.setStyle({ backgroundColor: "#66BB6A" })
        )
        .on("pointerout", () =>
          this.buttons!.harvest.setStyle({ backgroundColor: "#4CAF50" })
        ),

      sleep: this.scene.add
        .text(x + 260, y, "Sleep", buttonStyle)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", this.handleSleep.bind(this))
        .on("pointerover", () => this.buttons!.sleep.setStyle({ backgroundColor: "#66BB6A" }))
        .on("pointerout", () => this.buttons!.sleep.setStyle({ backgroundColor: "#4CAF50" })),
    };

    this.updateButtonStates();
    return this.buttons;
  }

  private handlePlant(): void {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cropSystem.plotCrop("rice" as any);
      this.updateButtonStates();
    } catch (error) {
      console.error("Failed to plant:", error);
    }
  }

  private handleHarvest(): void {
    try {
      cropSystem.harvestCrop();
      this.updateButtonStates();
    } catch (error) {
      console.error("Failed to harvest:", error);
    }
  }

  private handleSleep(): void {
    try {
      advanceDay();
      cropSystem.advanceCropGrowth();
      this.updateButtonStates();
    } catch (error) {
      console.error("Failed to sleep:", error);
    }
  }

  updateButtonStates(): void {
    if (!this.buttons) return;

    const plot = cropSystem.getPlot();
    const state = plot.getState();

    const disabledStyle = { backgroundColor: "#9E9E9E", color: "#BDBDBD" };
    const enabledStyle = { backgroundColor: "#4CAF50", color: "#FFFFFF" };

    // Plant button: enabled only when EMPTY
    if (state === PlotState.EMPTY) {
      this.buttons.plant.setStyle(enabledStyle).setInteractive();
    } else {
      this.buttons.plant.setStyle(disabledStyle).disableInteractive();
    }

    // Harvest button: enabled only when READY
    if (state === PlotState.READY) {
      this.buttons.harvest.setStyle(enabledStyle).setInteractive();
    } else {
      this.buttons.harvest.setStyle(disabledStyle).disableInteractive();
    }

    // Sleep button: always enabled
    this.buttons.sleep.setStyle(enabledStyle).setInteractive();
  }

  destroy(): void {
    if (this.buttons) {
      Object.values(this.buttons).forEach((btn) => btn.destroy());
      this.buttons = null;
    }
  }
}