import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  type ClientToServerMessage,
  type ServerToClientMessage,
  type SpellId,
} from "../../../../packages/shared/src/index";
import { GameService } from "../core/GameService";
import { RoomManager } from "../room/RoomManager";

interface ClientSession {
  clientId: string;
  playerId: string;
  nickname: string;
  roomId?: string;
}

export class WsGateway {
  private readonly rooms = new RoomManager();
  private readonly gameService = new GameService();
  private readonly clients = new Map<string, ClientSession>();
  private idSeq = 1;

  connectClient(nickname: string): { clientId: string; playerId: string } {
    const clientId = `c_${this.idSeq++}`;
    const playerId = `p_${this.idSeq++}`;
    this.clients.set(clientId, { clientId, playerId, nickname });
    return { clientId, playerId };
  }

  disconnectClient(clientId: string): void {
    const session = this.clients.get(clientId);
    if (session?.roomId) {
      this.rooms.removePlayer(session.roomId, session.playerId);
    }
    this.rooms.detachClient(clientId);
    this.clients.delete(clientId);
  }

  getClientRoomId(clientId: string): string | undefined {
    return this.clients.get(clientId)?.roomId;
  }

  getRoomClientIds(roomId: string): string[] {
    return this.rooms.getClientIds(roomId);
  }

  getAllClientIds(): string[] {
    return [...this.clients.keys()];
  }

  publicSnapshot(roomId: string): ServerToClientMessage {
    return this.snapshot(roomId);
  }

  roomListUpdate(): ServerToClientMessage {
    return {
      type: "ROOM_LIST_UPDATED",
      payload: {
        rooms: this.rooms.listRooms(),
      },
    };
  }

  handleMessage(clientId: string, msg: ClientToServerMessage): ServerToClientMessage[] {
    const session = this.clients.get(clientId);
    if (!session) return [this.ruleError("NO_SESSION", "Client session missing", false)];

    switch (msg.type) {
      case "CREATE_ROOM": {
        const roomId = msg.payload.preferredRoomId || `room_${this.idSeq++}`;
        session.nickname = msg.payload.nickname;
        this.rooms.createRoom(roomId, session.playerId, [{ playerId: session.playerId, nickname: session.nickname }]);
        session.roomId = roomId;
        this.rooms.attachClient(roomId, clientId);
        return [
          { type: "ROOM_CREATED", payload: { roomId, youAre: session.playerId } },
          this.snapshot(roomId),
        ];
      }

      case "JOIN_ROOM": {
        const room = this.rooms.getRoom(msg.payload.roomId);
        if (!room) return [this.ruleError("ROOM_NOT_FOUND", "Room not found")];
        if (room.runtime.room.players.length >= MAX_PLAYERS) {
          return [this.ruleError("ROOM_FULL", "Room is full")];
        }

        session.nickname = msg.payload.nickname;
        session.roomId = msg.payload.roomId;
        const next = this.rooms.addPlayer(msg.payload.roomId, session.playerId, session.nickname);
        if (!next) return [this.ruleError("JOIN_FAILED", "Cannot join room")];
        next.clients.add(clientId);
        this.rooms.attachClient(msg.payload.roomId, clientId);

        return [
          { type: "ROOM_JOINED", payload: { roomId: msg.payload.roomId, youAre: session.playerId } },
          this.snapshot(msg.payload.roomId),
        ];
      }

      case "LEAVE_ROOM": {
        this.rooms.removePlayer(msg.payload.roomId, session.playerId);
        session.roomId = undefined;
        return [{ type: "ROOM_LEFT", payload: { roomId: msg.payload.roomId, youAre: session.playerId } }];
      }

      case "TOGGLE_READY": {
        const room = this.rooms.getRoom(msg.payload.roomId);
        if (!room) return [this.ruleError("ROOM_NOT_FOUND", "Room not found")];
        if (room.runtime.room.round.phase !== "waiting") {
          return [this.ruleError("ALREADY_STARTED", "Round already started")];
        }
        const ok = this.rooms.setReady(msg.payload.roomId, session.playerId, msg.payload.ready);
        if (!ok) return [this.ruleError("NO_PLAYER", "Player not in room")];
        return [this.snapshot(msg.payload.roomId)];
      }

      case "START_GAME": {
        const room = this.rooms.getRoom(msg.payload.roomId);
        if (!room) return [this.ruleError("ROOM_NOT_FOUND", "Room not found")];
        if (room.runtime.room.hostPlayerId !== session.playerId) {
          return [this.ruleError("NOT_HOST", "Only host can start")];
        }
        if (room.runtime.room.players.length < MIN_PLAYERS) {
          return [this.ruleError("NOT_ENOUGH_PLAYERS", `Need at least ${MIN_PLAYERS} players`)];
        }
        if (!room.runtime.room.players.every((p) => p.isReady || p.playerId === session.playerId)) {
          return [this.ruleError("NOT_ALL_READY", "All non-host players must be ready")];
        }
        room.runtime.room.round.phase = "in_round";
        room.runtime.room.round.currentPlayerId = room.runtime.room.players[0]?.playerId ?? null;
        return [this.snapshot(msg.payload.roomId)];
      }

      case "DECLARE_SPELL": {
        const room = this.rooms.getRoom(msg.payload.roomId);
        if (!room) return [this.ruleError("ROOM_NOT_FOUND", "Room not found")];
        try {
          room.runtime = this.gameService.handleDeclareSpell(
            room.runtime,
            session.playerId,
            msg.payload.spellId as SpellId,
          );
          return [this.snapshot(msg.payload.roomId)];
        } catch (err) {
          return [this.ruleError("INVALID_ACTION", err instanceof Error ? err.message : "Invalid action")];
        }
      }

      case "END_TURN": {
        const room = this.rooms.getRoom(msg.payload.roomId);
        if (!room) return [this.ruleError("ROOM_NOT_FOUND", "Room not found")];
        try {
          room.runtime = this.gameService.handleEndTurn(room.runtime, session.playerId);
          return [this.snapshot(msg.payload.roomId)];
        } catch (err) {
          return [this.ruleError("INVALID_ACTION", err instanceof Error ? err.message : "Invalid action")];
        }
      }

      case "RESYNC":
        return [this.snapshot(msg.payload.roomId)];

      default:
        return [this.ruleError("UNKNOWN_MESSAGE", "Unknown message type")];
    }
  }

  private snapshot(roomId: string): ServerToClientMessage {
    const room = this.rooms.getRoom(roomId);
    if (!room) return this.ruleError("ROOM_NOT_FOUND", "Room not found");
    return {
      type: "GAME_SNAPSHOT",
      payload: {
        room: room.runtime.room,
        serverTs: Date.now(),
        version: 2,
      },
    };
  }

  private ruleError(code: string, message: string, recoverable = true): ServerToClientMessage {
    return {
      type: "RULE_ERROR",
      payload: { code, message, recoverable },
    };
  }
}
