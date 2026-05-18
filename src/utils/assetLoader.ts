import Phaser from "phaser";
import { PlotState } from "../entities/plot/plotTypes";

export interface CropSprites {
  empty: Phaser.GameObjects.Sprite;
  planted: Phaser.GameObjects.Sprite;
  growing: Phaser.GameObjects.Sprite;
  ready: Phaser.GameObjects.Sprite;
}

export class CropAssetLoader {
  private scene: Phaser.Scene;
  private sprites: Map<string, CropSprites> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  preload(): void {
    this.scene.load.image("plot-empty", "/assets/crops/rice/empty.svg");
    this.scene.load.image("plot-planted", "/assets/crops/rice/planted.svg");
    this.scene.load.image("plot-growing", "/assets/crops/rice/growing.svg");
    this.scene.load.image("plot-ready", "/assets/crops/rice/ready.svg");
  }

  createSprites(
    plotId: string,
    x: number,
    y: number
  ): CropSprites {
    if (this.sprites.has(plotId)) {
      return this.sprites.get(plotId)!;
    }

    const sprites: CropSprites = {
      empty: this.scene.add.sprite(x, y, "plot-empty").setVisible(false),
      planted: this.scene.add.sprite(x, y, "plot-planted").setVisible(false),
      growing: this.scene.add.sprite(x, y, "plot-growing").setVisible(false),
      ready: this.scene.add.sprite(x, y, "plot-ready").setVisible(false),
    };

    this.sprites.set(plotId, sprites);
    return sprites;
  }

  updateSprite(plotId: string, state: PlotState): void {
    const sprites = this.sprites.get(plotId);
    if (!sprites) {
      console.warn(`No sprites found for plot: ${plotId}`);
      return;
    }

    Object.values(sprites).forEach((sprite) => sprite.setVisible(false));

    switch (state) {
      case PlotState.EMPTY:
        sprites.empty.setVisible(true);
        break;
      case PlotState.PLANTED:
        sprites.planted.setVisible(true);
        break;
      case PlotState.GROWING:
        sprites.growing.setVisible(true);
        break;
      case PlotState.READY:
        sprites.ready.setVisible(true);
        break;
    }
  }

  removeSprites(plotId: string): void {
    const sprites = this.sprites.get(plotId);
    if (sprites) {
      Object.values(sprites).forEach((sprite) => sprite.destroy());
      this.sprites.delete(plotId);
    }
  }
}