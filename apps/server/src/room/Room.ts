import type { RoomRuntimeState } from "../../../../packages/shared/src/index";

export interface Room {
  runtime: RoomRuntimeState;
  createdAt: number;
  updatedAt: number;
  clients: Set<string>;
}
