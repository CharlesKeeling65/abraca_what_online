import type { RoomState } from "../../../../packages/shared/src";

export interface Room {
  state: RoomState;
  createdAt: number;
  updatedAt: number;
}
