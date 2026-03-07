import type { SpellId } from "./gameModels";

export type PlayerIntent =
  | { type: "DECLARE_SPELL"; spellId: SpellId }
  | { type: "CONTINUE_COMBO" }
  | { type: "END_TURN" }
  | { type: "REQUEST_RESYNC" };

export interface RuleValidationResult {
  ok: boolean;
  reason?: string;
}
