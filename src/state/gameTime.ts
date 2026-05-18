export class GameTime {
  private _currentDay: number;

  constructor(initialDay: number = 1) {
    if (initialDay < 1) {
      throw new Error("Initial day must be >= 1");
    }
    this._currentDay = initialDay;
  }

  getCurrentDay(): number {
    return this._currentDay;
  }

  advanceDay(): void {
    this._currentDay += 1;
  }

  reset(): void {
    this._currentDay = 1;
  }

  toJSON(): { currentDay: number } {
    return { currentDay: this._currentDay };
  }

  static fromJSON(data: { currentDay: number }): GameTime {
    const gameTime = new GameTime(data.currentDay);
    gameTime._currentDay = data.currentDay;
    return gameTime;
  }
}

// Singleton instance for the game
let gameTimeInstance: GameTime | null = null;

export function getGameTime(): GameTime {
  if (!gameTimeInstance) {
    gameTimeInstance = new GameTime();
  }
  return gameTimeInstance;
}

export function initGameTime(initialDay: number = 1): void {
  gameTimeInstance = new GameTime(initialDay);
}

export function resetGameTime(): void {
  gameTimeInstance = new GameTime();
}