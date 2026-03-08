export type SpellId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type RoundPhase = "waiting" | "in_round" | "scoring" | "finished";

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
  isReady: boolean;
}

export interface PlayerPrivateState {
  playerId: string;
  handStones: SpellStone[];
  owlSecretStones: SpellStone[];
}

export interface RoundState {
  roundNo: number;
  phase: RoundPhase;
  currentPlayerId: string | null;
  lastSuccessfulSpellId: SpellId | null;
  deckRemaining: number;
  secretStonesRemaining: number;
}

export interface BoardState {
  playedCountBySpell: Record<SpellId, number>;
  removedFaceUpBySpell: Record<SpellId, number>;
}

export interface RoomState {
  roomId: string;
  hostPlayerId: string;
  players: PlayerPublicState[];
  round: RoundState;
  board: BoardState;
}

export interface RoomRuntimeState {
  room: RoomState;
  privateByPlayerId: Record<string, PlayerPrivateState>;
  drawPile: SpellStone[];
  secretStonesPool: SpellStone[];
}

export interface GameSnapshot {
  room: RoomState;
  serverTs: number;
  version: number;
}
