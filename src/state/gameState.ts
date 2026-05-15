import {
  CURRENT_SAVE_VERSION,
  defaultGameState,
  type GameState,
  type SavePayload,
} from "../data/saveSchema";

export type { GameState };
export type StateListener = (state: Readonly<GameState>) => void;
export type Unsubscribe = () => void;

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
  state = { ...payload.data };
  notify();
}

export function resetToDefault(): void {
  state = defaultGameState();
  notify();
}
