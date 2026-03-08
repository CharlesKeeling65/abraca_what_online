import {
  applyDeclareSpell,
  endTurn,
  resolveRoundIfNeeded,
  type RoomRuntimeState,
  type SpellId,
} from "../../../../packages/shared/src/index";

export class GameService {
  handleDeclareSpell(runtime: RoomRuntimeState, playerId: string, spellId: SpellId): RoomRuntimeState {
    const result = applyDeclareSpell(runtime, playerId, spellId);
    return resolveRoundIfNeeded(result.runtime);
  }

  handleEndTurn(runtime: RoomRuntimeState, playerId: string): RoomRuntimeState {
    return endTurn(runtime, playerId);
  }
}
