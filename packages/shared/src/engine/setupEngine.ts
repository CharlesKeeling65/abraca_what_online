import {
  SECRET_STONES_COUNT,
  SPELL_IDS,
  SPELL_TOTAL_COUNT,
  STARTING_HAND_SIZE,
  STARTING_HP,
} from "../constants/gameConstants";
import type {
  BoardState,
  PlayerPrivateState,
  PlayerPublicState,
  RoomRuntimeState,
  RoomState,
  SpellId,
  SpellStone,
} from "../models/gameModels";

function createSpellStone(spellId: SpellId, index: number): SpellStone {
  return { id: `${spellId}-${index}`, spellId };
}

function shuffle<T>(arr: T[]): T[] {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function emptySpellCountRecord(): Record<SpellId, number> {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
}

export function buildFullSpellPool(): SpellStone[] {
  const out: SpellStone[] = [];
  SPELL_IDS.forEach((spellId) => {
    const count = SPELL_TOTAL_COUNT[spellId];
    for (let i = 1; i <= count; i += 1) out.push(createSpellStone(spellId, i));
  });
  return out;
}

export function createInitialRuntimeRoom(
  roomId: string,
  hostPlayerId: string,
  players: Array<{ playerId: string; nickname: string }>,
): RoomRuntimeState {
  if (players.length < 1) {
    throw new Error("Need at least 1 player");
  }

  let pool = shuffle(buildFullSpellPool());
  const privateByPlayerId: Record<string, PlayerPrivateState> = {};

  const publicPlayers: PlayerPublicState[] = players.map((p, idx) => {
    const handStones = pool.splice(0, STARTING_HAND_SIZE);
    privateByPlayerId[p.playerId] = {
      playerId: p.playerId,
      handStones,
      owlSecretStones: [],
    };

    return {
      playerId: p.playerId,
      nickname: p.nickname,
      hp: STARTING_HP,
      score: 0,
      seatIndex: idx,
      handCount: handStones.length,
      isAlive: true,
      isReady: false,
    };
  });

  const secretStonesPool = pool.splice(0, SECRET_STONES_COUNT);
  const board: BoardState = {
    playedCountBySpell: emptySpellCountRecord(),
    removedFaceUpBySpell: emptySpellCountRecord(),
  };

  const room: RoomState = {
    roomId,
    hostPlayerId,
    players: publicPlayers,
    round: {
      roundNo: 1,
      phase: "waiting",
      currentPlayerId: players[0]?.playerId ?? null,
      lastSuccessfulSpellId: null,
      deckRemaining: pool.length,
      secretStonesRemaining: secretStonesPool.length,
    },
    board,
  };

  return {
    room,
    privateByPlayerId,
    drawPile: pool,
    secretStonesPool,
  };
}
