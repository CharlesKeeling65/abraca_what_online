import type { GameSnapshot } from "../../../../packages/shared/src";

export interface WebGameStore {
  snapshot: GameSnapshot | null;
}

export const initialStore: WebGameStore = {
  snapshot: null,
};
