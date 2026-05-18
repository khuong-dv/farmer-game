export class PlayerEconomy {
  private _money: number;
  private _initialMoney: number;

  constructor(initialMoney: number = 100) {
    if (initialMoney < 0) {
      throw new Error("Initial money must be >= 0");
    }
    this._money = initialMoney;
    this._initialMoney = initialMoney;
  }

  getMoney(): number {
    return this._money;
  }

  addMoney(amount: number): void {
    if (amount < 0) {
      throw new Error("Cannot add negative money amount");
    }
    this._money += amount;
  }

  canAfford(cost: number): boolean {
    return this._money >= cost;
  }

  reset(): void {
    this._money = this._initialMoney;
  }

  toJSON(): { money: number; initialMoney: number } {
    return {
      money: this._money,
      initialMoney: this._initialMoney,
    };
  }

  static fromJSON(data: { money: number; initialMoney: number }): PlayerEconomy {
    const economy = new PlayerEconomy(data.initialMoney);
    economy._money = data.money;
    return economy;
  }
}

// Singleton instance for game
let economyInstance: PlayerEconomy | null = null;

export function getPlayerEconomy(): PlayerEconomy {
  if (!economyInstance) {
    economyInstance = new PlayerEconomy();
  }
  return economyInstance;
}

export function initPlayerEconomy(initialMoney: number = 100): void {
  economyInstance = new PlayerEconomy(initialMoney);
}

export function resetPlayerEconomy(): void {
  economyInstance = new PlayerEconomy();
}