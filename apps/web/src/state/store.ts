import type { GameSnapshot } from "../../../../packages/shared/src/index";

export interface WebGameStore {
  snapshot: GameSnapshot | null;
}

export const initialStore: WebGameStore = {
  snapshot: null,
};
