import { MAX_HP, SPELL_MAX, SPELL_MIN } from "../constants/gameConstants";
import type { RuleValidationResult } from "../models/actions";
import type { PlayerPrivateState, SpellId } from "../models/gameModels";

export function validateSpellRange(spellId: number): RuleValidationResult {
  if (spellId < SPELL_MIN || spellId > SPELL_MAX) {
    return { ok: false, reason: `spellId must be between ${SPELL_MIN}-${SPELL_MAX}` };
  }
  return { ok: true };
}

export function validateComboOrder(
  lastSuccessfulSpellId: SpellId | null,
  nextSpellId: SpellId,
): RuleValidationResult {
  if (lastSuccessfulSpellId === null) return { ok: true };
  if (nextSpellId < lastSuccessfulSpellId) {
    return { ok: false, reason: "Combo spell must be >= last successful spell." };
  }
  return { ok: true };
}

export function hasDeclaredSpellInHand(
  player: PlayerPrivateState,
  spellId: SpellId,
): boolean {
  return player.handStones.some((s) => s.spellId === spellId);
}

export function clampHp(nextHp: number): number {
  if (nextHp < 0) return 0;
  if (nextHp > MAX_HP) return MAX_HP;
  return nextHp;
}
