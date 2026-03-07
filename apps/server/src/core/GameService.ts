import {
  resolveRoundIfNeeded,
  validateComboOrder,
  validateSpellRange,
  type RoomState,
  type SpellId,
} from "../../../../packages/shared/src";

export class GameService {
  handleDeclareSpell(room: RoomState, spellId: SpellId): RoomState {
    const rangeResult = validateSpellRange(spellId);
    if (!rangeResult.ok) {
      throw new Error(rangeResult.reason);
    }

    const comboResult = validateComboOrder(room.round.lastSuccessfulSpellId, spellId);
    if (!comboResult.ok) {
      throw new Error(comboResult.reason);
    }

    // TODO: 命中判定、移除咒语石、施法效果结算、补牌逻辑。

    const nextRoom = {
      ...room,
      round: {
        ...room.round,
        lastSuccessfulSpellId: spellId,
      },
    };

    return resolveRoundIfNeeded(nextRoom);
  }
}
