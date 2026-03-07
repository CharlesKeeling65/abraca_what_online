import type { SpellId } from "../models/gameModels";

export const MAX_PLAYERS = 5;
export const MIN_PLAYERS = 2;

export const MAX_HP = 6;
export const STARTING_HP = 6;
export const STARTING_HAND_SIZE = 5;
export const SCORE_TO_WIN = 8;

export const SPELL_MIN = 1;
export const SPELL_MAX = 8;

export const SPELL_IDS: SpellId[] = [1, 2, 3, 4, 5, 6, 7, 8];

/** 编号即总数量：1号1个，2号2个 ... 8号8个。 */
export const SPELL_TOTAL_COUNT: Record<SpellId, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
};

export const SECRET_STONES_COUNT = 4;
