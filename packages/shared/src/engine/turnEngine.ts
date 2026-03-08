import { MAX_HP, STARTING_HAND_SIZE } from "../constants/gameConstants";
import { clampHp, hasDeclaredSpellInHand, validateComboOrder } from "./ruleEngine";
import type { PlayerPublicState, RoomRuntimeState, SpellId } from "../models/gameModels";

export interface DeclareSpellResult {
  runtime: RoomRuntimeState;
  success: boolean;
  message: string;
  rolledDice?: number;
}

function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function findPlayerIndex(players: PlayerPublicState[], playerId: string): number {
  return players.findIndex((p) => p.playerId === playerId);
}

function neighborIndexes(players: PlayerPublicState[], idx: number): [number, number] {
  const left = (idx - 1 + players.length) % players.length;
  const right = (idx + 1) % players.length;
  return [left, right];
}

function applyDamage(player: PlayerPublicState, amount: number): void {
  player.hp = clampHp(player.hp - amount);
  player.isAlive = player.hp > 0;
}

function applyHeal(player: PlayerPublicState, amount: number): void {
  player.hp = clampHp(Math.min(MAX_HP, player.hp + amount));
}

function nextPlayerId(runtime: RoomRuntimeState, currentPlayerId: string): string {
  const players = runtime.room.players;
  const idx = findPlayerIndex(players, currentPlayerId);
  if (idx < 0) return players[0]?.playerId ?? currentPlayerId;
  return players[(idx + 1) % players.length]?.playerId ?? currentPlayerId;
}

function refillToFive(runtime: RoomRuntimeState, playerId: string): void {
  const privateState = runtime.privateByPlayerId[playerId];
  const player = runtime.room.players.find((p) => p.playerId === playerId);
  if (!privateState || !player) return;

  while (privateState.handStones.length < STARTING_HAND_SIZE && runtime.drawPile.length > 0) {
    privateState.handStones.push(runtime.drawPile.shift()!);
  }
  player.handCount = privateState.handStones.length;
  runtime.room.round.deckRemaining = runtime.drawPile.length;
}

export function endTurn(runtime: RoomRuntimeState, playerId: string): RoomRuntimeState {
  refillToFive(runtime, playerId);
  runtime.room.round.currentPlayerId = nextPlayerId(runtime, playerId);
  runtime.room.round.lastSuccessfulSpellId = null;
  return runtime;
}

export function applyDeclareSpell(
  runtime: RoomRuntimeState,
  playerId: string,
  spellId: SpellId,
): DeclareSpellResult {
  if (runtime.room.round.phase !== "in_round") throw new Error("Round not started.");
  if (runtime.room.round.currentPlayerId !== playerId) throw new Error("Not your turn.");

  const combo = validateComboOrder(runtime.room.round.lastSuccessfulSpellId, spellId);
  if (!combo.ok) throw new Error(combo.reason);

  const privateState = runtime.privateByPlayerId[playerId];
  if (!privateState) throw new Error("Player not found.");

  const players = runtime.room.players.map((p) => ({ ...p }));
  const currentIndex = findPlayerIndex(players, playerId);
  const current = players[currentIndex];
  if (!current) throw new Error("Player state missing.");

  const hit = hasDeclaredSpellInHand(privateState, spellId);

  if (!hit) {
    const dice = spellId === 1 ? rollDice() : undefined;
    applyDamage(current, dice ?? 1);
    runtime.room.players = players;
    runtime.room.round.currentPlayerId = nextPlayerId(runtime, playerId);
    runtime.room.round.lastSuccessfulSpellId = null;
    return {
      runtime,
      success: false,
      message: `Missed spell ${spellId}`,
      rolledDice: dice,
    };
  }

  const handIdx = privateState.handStones.findIndex((s) => s.spellId === spellId);
  privateState.handStones.splice(handIdx, 1);
  current.handCount = privateState.handStones.length;
  runtime.room.board.playedCountBySpell[spellId] += 1;

  let rolledDice: number | undefined;
  const [leftIdx, rightIdx] = neighborIndexes(players, currentIndex);
  const left = players[leftIdx];
  const right = players[rightIdx];

  switch (spellId) {
    case 1:
      rolledDice = rollDice();
      players.forEach((p, idx) => {
        if (idx !== currentIndex) applyDamage(p, rolledDice!);
      });
      break;
    case 2:
      players.forEach((p, idx) => {
        if (idx !== currentIndex) applyDamage(p, 1);
      });
      applyHeal(current, 1);
      break;
    case 3:
      rolledDice = rollDice();
      applyHeal(current, rolledDice);
      break;
    case 4:
      if (runtime.secretStonesPool.length > 0) {
        privateState.owlSecretStones.push(runtime.secretStonesPool.shift()!);
        runtime.room.round.secretStonesRemaining = runtime.secretStonesPool.length;
      }
      break;
    case 5:
      applyDamage(left, 1);
      applyDamage(right, 1);
      break;
    case 6:
      applyDamage(left, 1);
      break;
    case 7:
      applyDamage(right, 1);
      break;
    case 8:
      applyHeal(current, 1);
      break;
    default:
      throw new Error("Unknown spell");
  }

  runtime.room.players = players;
  runtime.room.round.lastSuccessfulSpellId = spellId;

  return {
    runtime,
    success: true,
    message: `Spell ${spellId} success`,
    rolledDice,
  };
}
