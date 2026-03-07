import { clampHp, hasDeclaredSpellInHand, validateComboOrder } from "./ruleEngine";
import type { RoomRuntimeState, SpellId } from "../models/gameModels";

export interface DeclareSpellResult {
  runtime: RoomRuntimeState;
  success: boolean;
  message: string;
}

function nextPlayerId(runtime: RoomRuntimeState, currentPlayerId: string): string {
  const players = runtime.room.players;
  const idx = players.findIndex((p) => p.playerId === currentPlayerId);
  if (idx < 0) return players[0]?.playerId ?? currentPlayerId;
  return players[(idx + 1) % players.length]?.playerId ?? currentPlayerId;
}

export function applyDeclareSpell(
  runtime: RoomRuntimeState,
  playerId: string,
  spellId: SpellId,
): DeclareSpellResult {
  if (runtime.room.round.currentPlayerId !== playerId) {
    throw new Error("Not your turn.");
  }

  const combo = validateComboOrder(runtime.room.round.lastSuccessfulSpellId, spellId);
  if (!combo.ok) {
    throw new Error(combo.reason);
  }

  const privateState = runtime.privateByPlayerId[playerId];
  if (!privateState) throw new Error("Player not found.");

  const hit = hasDeclaredSpellInHand(privateState, spellId);
  const players = runtime.room.players.map((p) => ({ ...p }));
  const current = players.find((p) => p.playerId === playerId);
  if (!current) throw new Error("Player state missing.");

  if (!hit) {
    current.hp = clampHp(current.hp - 1);
    current.isAlive = current.hp > 0;
    runtime.room.players = players;
    runtime.room.round.currentPlayerId = nextPlayerId(runtime, playerId);
    runtime.room.round.lastSuccessfulSpellId = null;
    return {
      runtime,
      success: false,
      message: `Missed spell ${spellId}, lose 1 HP`,
    };
  }

  const idx = privateState.handStones.findIndex((s) => s.spellId === spellId);
  privateState.handStones.splice(idx, 1);
  current.handCount = privateState.handStones.length;
  runtime.room.board.playedCountBySpell[spellId] += 1;
  runtime.room.round.lastSuccessfulSpellId = spellId;
  runtime.room.players = players;

  return {
    runtime,
    success: true,
    message: `Spell ${spellId} success`,
  };
}
