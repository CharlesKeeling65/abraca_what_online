import type { GameSnapshot, PlayerPublicState, SpellId } from "../../../../packages/shared/src/index";

export interface TableSeatModel {
  playerId: string;
  nickname: string;
  hp: number;
  score: number;
  handCount: number;
  isCurrentTurn: boolean;
  seatLabel: string;
}

export interface TableSpellStatModel {
  spellId: SpellId;
  playedCount: number;
}

export interface TableSceneModel {
  roomId: string;
  currentPlayerId: string | null;
  you: TableSeatModel;
  opponents: TableSeatModel[];
  spellStats: TableSpellStatModel[];
  centerDeck: {
    deckRemaining: number;
    secretStonesRemaining: number;
  };
}

function toSeatModel(
  player: PlayerPublicState,
  currentPlayerId: string | null,
  seatLabel: string,
): TableSeatModel {
  return {
    playerId: player.playerId,
    nickname: player.nickname,
    hp: player.hp,
    score: player.score,
    handCount: player.handCount,
    isCurrentTurn: player.playerId === currentPlayerId,
    seatLabel,
  };
}

export function buildTableSceneModel(
  snapshot: GameSnapshot,
  localPlayerId: string,
): TableSceneModel {
  const players = snapshot.room.players;
  const localPlayer = players.find((player) => player.playerId === localPlayerId) ?? players[0];
  if (!localPlayer) {
    throw new Error("Room has no players.");
  }

  const opponents = players.filter((player) => player.playerId !== localPlayer.playerId);
  const spellStats = ([1, 2, 3, 4, 5, 6, 7, 8] as SpellId[]).map((spellId) => ({
    spellId,
    playedCount: snapshot.room.board.playedCountBySpell[spellId],
  }));

  return {
    roomId: snapshot.room.roomId,
    currentPlayerId: snapshot.room.round.currentPlayerId,
    you: toSeatModel(localPlayer, snapshot.room.round.currentPlayerId, "You"),
    opponents: opponents.map((player, index) =>
      toSeatModel(player, snapshot.room.round.currentPlayerId, `Seat ${index + 2}`),
    ),
    spellStats,
    centerDeck: {
      deckRemaining: snapshot.room.round.deckRemaining,
      secretStonesRemaining: snapshot.room.round.secretStonesRemaining,
    },
  };
}

export function createPlaceholderSnapshot(): GameSnapshot {
  return {
    room: {
      roomId: "demo-room",
      hostPlayerId: "p1",
      players: [
        {
          playerId: "p1",
          nickname: "You",
          hp: 6,
          score: 2,
          seatIndex: 0,
          handCount: 5,
          isAlive: true,
          isReady: true,
        },
        {
          playerId: "p2",
          nickname: "Mira",
          hp: 4,
          score: 3,
          seatIndex: 1,
          handCount: 4,
          isAlive: true,
          isReady: true,
        },
        {
          playerId: "p3",
          nickname: "Sol",
          hp: 5,
          score: 1,
          seatIndex: 2,
          handCount: 5,
          isAlive: true,
          isReady: true,
        },
      ],
      round: {
        roundNo: 3,
        phase: "in_round",
        currentPlayerId: "p1",
        lastSuccessfulSpellId: 4,
        deckRemaining: 9,
        secretStonesRemaining: 2,
      },
      board: {
        playedCountBySpell: {
          1: 0,
          2: 1,
          3: 0,
          4: 1,
          5: 2,
          6: 1,
          7: 0,
          8: 3,
        },
        removedFaceUpBySpell: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
          6: 0,
          7: 0,
          8: 0,
        },
      },
    },
    serverTs: Date.now(),
    version: 2,
  };
}
