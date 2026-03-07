import {
  applyDeclareSpell,
  resolveRoundIfNeeded,
  type RoomRuntimeState,
  type SpellId,
} from "../../../../packages/shared/src/index";

export class GameService {
  handleDeclareSpell(runtime: RoomRuntimeState, playerId: string, spellId: SpellId): RoomRuntimeState {
    const result = applyDeclareSpell(runtime, playerId, spellId);
    const nextRoom = resolveRoundIfNeeded(result.runtime.room);
    result.runtime.room = nextRoom;
    return result.runtime;
  }
}
