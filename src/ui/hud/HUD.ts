import Phaser from "phaser";

export class GameHUD {
  private scene: Phaser.Scene;
  private dayText!: Phaser.GameObjects.Text;
  private moneyText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(x: number, y: number): void {
    const textStyle = {
      fontSize: "20px",
      fontStyle: "bold" as const,
      color: "#ffffff",
    };

    // Day display
    this.dayText = this.scene.add
      .text(x, y, "Day: 1", textStyle)
      .setOrigin(0, 0);

    // Money display
    this.moneyText = this.scene.add
      .text(x, y + 30, "Money: 100", {
        ...textStyle,
        color: "#FFD700",
      })
      .setOrigin(0, 0);
  }

  updateDay(day: number): void {
    this.dayText.setText(`Day: ${day}`);
  }

  updateMoney(money: number): void {
    this.moneyText.setText(`Money: ${money}`);
  }

  update(day: number, money: number): void {
    this.updateDay(day);
    this.updateMoney(money);
  }

  destroy(): void {
    this.dayText.destroy();
    this.moneyText.destroy();
  }
}