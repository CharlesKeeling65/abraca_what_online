import { createInitialRuntimeRoom, type RoomState } from "../../../../packages/shared/src/index";
import type { Room } from "./Room";

export class RoomManager {
  private readonly rooms = new Map<string, Room>();

  createRoom(
    roomId: string,
    hostPlayerId: string,
    players: Array<{ playerId: string; nickname: string }>,
  ): Room {
    const runtime = createInitialRuntimeRoom(roomId, hostPlayerId, players);
    const room: Room = {
      runtime,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      clients: new Set<string>(),
    };
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getPublicState(roomId: string): RoomState | undefined {
    return this.rooms.get(roomId)?.runtime.room;
  }

  updateRoom(roomId: string, updater: (room: Room) => Room): Room | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;
    const next = updater(room);
    next.updatedAt = Date.now();
    this.rooms.set(roomId, next);
    return next;
  }

  attachClient(roomId: string, clientId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    room.clients.add(clientId);
    room.updatedAt = Date.now();
    return true;
  }

  detachClient(clientId: string): void {
    this.rooms.forEach((room) => room.clients.delete(clientId));
  }
}
