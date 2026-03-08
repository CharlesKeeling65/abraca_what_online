import { SCORE_TO_WIN } from "../constants/gameConstants";
import type { RoomRuntimeState } from "../models/gameModels";

function scoreBySurvival(runtime: RoomRuntimeState): void {
  const alive = runtime.room.players.filter((p) => p.hp > 0);
  alive.forEach((p) => {
    const privateState = runtime.privateByPlayerId[p.playerId];
    const owlBonus = privateState?.owlSecretStones.length ?? 0;
    p.score += 1 + owlBonus;
  });
}

function scoreByHandEmpty(runtime: RoomRuntimeState, winnerId: string): void {
  runtime.room.players.forEach((p) => {
    if (p.playerId === winnerId) p.score += 3;
  });
}

function resetForNextRound(runtime: RoomRuntimeState): void {
  runtime.room.round.roundNo += 1;
  runtime.room.round.phase = runtime.room.players.some((p) => p.score >= SCORE_TO_WIN)
    ? "finished"
    : "waiting";
  runtime.room.round.lastSuccessfulSpellId = null;
  runtime.room.players.forEach((p) => {
    p.isReady = false;
  });
}

export function resolveRoundIfNeeded(runtime: RoomRuntimeState): RoomRuntimeState {
  const emptyHandPlayer = runtime.room.players.find((p) => p.handCount === 0);
  const deadPlayers = runtime.room.players.filter((p) => p.hp <= 0);

  if (!emptyHandPlayer && deadPlayers.length === 0) return runtime;

  runtime.room.round.phase = "scoring";

  if (emptyHandPlayer) {
    scoreByHandEmpty(runtime, emptyHandPlayer.playerId);
  } else {
    scoreBySurvival(runtime);
  }

  resetForNextRound(runtime);
  return runtime;
}
