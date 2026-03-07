import type { RoomState } from "../../../../packages/shared/src";
import type { Room } from "./Room";

export class RoomManager {
  private readonly rooms = new Map<string, Room>();

  createRoom(roomState: RoomState): Room {
    const room: Room = {
      state: roomState,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.rooms.set(roomState.roomId, room);
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  updateRoom(roomId: string, nextState: RoomState): void {
    const current = this.rooms.get(roomId);
    if (!current) return;
    current.state = nextState;
    current.updatedAt = Date.now();
  }

  listRoomIds(): string[] {
    return [...this.rooms.keys()];
  }
}
