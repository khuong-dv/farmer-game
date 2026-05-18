import {
  CURRENT_SAVE_VERSION,
  defaultGameState,
  type GameState,
  type SavePayload,
} from "../data/saveSchema";

export type { GameState };
export type StateListener = (state: Readonly<GameState>) => void;
export type Unsubscribe = () => void;

// Crop system convenience accessors
export function getCurrentDay(): number {
  return state.currentDay;
}

export function getMoney(): number {
  return state.money;
}

export function getPlotState(): GameState["plot"] {
  return { ...state.plot };
}

export function addMoney(amount: number): void {
  if (amount < 0) {
    throw new Error("Cannot add negative money");
  }
  setState({ money: state.money + amount });
}

export function advanceDay(): void {
  setState({ currentDay: state.currentDay + 1 });
}

let state: GameState = defaultGameState();
const listeners = new Set<StateListener>();

function notify(): void {
  const snapshot = Object.freeze({ ...state });
  for (const listener of listeners) {
    listener(snapshot);
  }
}

export function getState(): Readonly<GameState> {
  return Object.freeze({ ...state });
}

export function setState(patch: Partial<GameState>): void {
  state = { ...state, ...patch };
  notify();
}

export function replaceState(next: GameState): void {
  state = { ...next };
  notify();
}

export function subscribe(listener: StateListener): Unsubscribe {
  listeners.add(listener);
  let unsubscribed = false;
  return () => {
    if (unsubscribed) return;
    unsubscribed = true;
    listeners.delete(listener);
  };
}

export function serialize(): SavePayload {
  return {
    version: CURRENT_SAVE_VERSION,
    data: { ...state },
  };
}

export function load(payload: SavePayload): void {
  // After migration, payload is always V2
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = payload.data as any;
  state = { ...data };
  notify();
}

export function resetToDefault(): void {
  state = defaultGameState();
  notify();
}
