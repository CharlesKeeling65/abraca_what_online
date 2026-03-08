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

  addPlayer(roomId: string, playerId: string, nickname: string): Room | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    const existing = room.runtime.room.players.map((p) => ({ playerId: p.playerId, nickname: p.nickname }));
    const host = room.runtime.room.hostPlayerId;
    const next = this.createRoom(roomId, host, [...existing, { playerId, nickname }]);
    next.clients = new Set(room.clients);
    return next;
  }

  setReady(roomId: string, playerId: string, ready: boolean): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    const p = room.runtime.room.players.find((x) => x.playerId === playerId);
    if (!p) return false;
    p.isReady = ready;
    room.updatedAt = Date.now();
    return true;
  }

  removePlayer(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.runtime.room.players = room.runtime.room.players.filter((p) => p.playerId !== playerId);
    delete room.runtime.privateByPlayerId[playerId];
    if (room.runtime.room.hostPlayerId === playerId) {
      room.runtime.room.hostPlayerId = room.runtime.room.players[0]?.playerId ?? "";
    }
    if (room.runtime.room.players.length === 0) {
      this.rooms.delete(roomId);
      return;
    }
    room.runtime.room.round.currentPlayerId = room.runtime.room.players[0]?.playerId ?? null;
    room.updatedAt = Date.now();
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
