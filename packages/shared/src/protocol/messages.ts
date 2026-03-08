import type { GameSnapshot, SpellId } from "../models/gameModels";

export type ClientToServerMessage =
  | { type: "CREATE_ROOM"; payload: { nickname: string; preferredRoomId?: string } }
  | { type: "JOIN_ROOM"; payload: { roomId: string; nickname: string } }
  | { type: "LEAVE_ROOM"; payload: { roomId: string } }
  | { type: "TOGGLE_READY"; payload: { roomId: string; ready: boolean } }
  | { type: "START_GAME"; payload: { roomId: string } }
  | { type: "DECLARE_SPELL"; payload: { roomId: string; spellId: SpellId } }
  | { type: "END_TURN"; payload: { roomId: string } }
  | { type: "RESYNC"; payload: { roomId: string } };

export type ServerToClientMessage =
  | { type: "ROOM_CREATED"; payload: { roomId: string; youAre: string } }
  | { type: "ROOM_JOINED"; payload: { roomId: string; youAre: string } }
  | { type: "ROOM_LEFT"; payload: { roomId: string; youAre: string } }
  | { type: "GAME_SNAPSHOT"; payload: GameSnapshot }
  | { type: "RULE_ERROR"; payload: { code: string; message: string; recoverable: boolean } }
  | { type: "SYSTEM_NOTICE"; payload: { message: string } };
