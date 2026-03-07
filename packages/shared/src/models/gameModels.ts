export type SpellId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface SpellStone {
  id: string;
  spellId: SpellId;
}

export interface PlayerPublicState {
  playerId: string;
  nickname: string;
  hp: number;
  score: number;
  seatIndex: number;
  handCount: number;
  isAlive: boolean;
}

export interface PlayerPrivateState {
  playerId: string;
  /**
   * 玩家看不到自己石块内容（游戏机制），
   * 服务端存储真实值，客户端按权限渲染。
   */
  handStones: SpellStone[];
  owlSecretStones: SpellStone[];
}

export interface RoundState {
  roundNo: number;
  phase: "waiting" | "in_round" | "scoring" | "finished";
  currentPlayerId: string | null;
  lastSuccessfulSpellId: SpellId | null;
  deckRemaining: number;
  secretStonesRemaining: number;
}

export interface BoardState {
  /** 各咒语已打出数量 */
  playedCountBySpell: Record<SpellId, number>;
  /** 低人数模式开局移除并公开的数量 */
  removedFaceUpBySpell: Record<SpellId, number>;
}

export interface RoomState {
  roomId: string;
  hostPlayerId: string;
  players: PlayerPublicState[];
  round: RoundState;
  board: BoardState;
}

export interface GameSnapshot {
  room: RoomState;
  /** 服务端时间戳，客户端可用于动画/重放同步 */
  serverTs: number;
  /** 版本号用于客户端状态兼容校验 */
  version: number;
}
