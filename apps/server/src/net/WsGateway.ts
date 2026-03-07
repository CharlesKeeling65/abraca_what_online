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
    this.clients.set(clientId, {
      clientId,
      playerId,
      nickname,
    });
    return { clientId, playerId };
  }

  disconnectClient(clientId: string): void {
    this.rooms.detachClient(clientId);
    this.clients.delete(clientId);
  }

  handleMessage(clientId: string, msg: ClientToServerMessage): ServerToClientMessage[] {
    const session = this.clients.get(clientId);
    if (!session) {
      return [
        {
          type: "RULE_ERROR",
          payload: { code: "NO_SESSION", message: "Client session missing", recoverable: false },
        },
      ];
    }

    switch (msg.type) {
      case "CREATE_ROOM": {
        const roomId = msg.payload.preferredRoomId || `room_${this.idSeq++}`;
        session.nickname = msg.payload.nickname;
        this.rooms.createRoom(roomId, session.playerId, [
          { playerId: session.playerId, nickname: session.nickname },
        ]);
        session.roomId = roomId;
        this.rooms.attachClient(roomId, clientId);
        return [
          { type: "ROOM_CREATED", payload: { roomId, youAre: session.playerId } },
          this.snapshot(roomId),
        ];
      }

      case "JOIN_ROOM": {
        const room = this.rooms.getRoom(msg.payload.roomId);
        if (!room) {
          return [
            {
              type: "RULE_ERROR",
              payload: { code: "ROOM_NOT_FOUND", message: "Room not found", recoverable: true },
            },
          ];
        }
        if (room.runtime.room.players.length >= MAX_PLAYERS) {
          return [
            {
              type: "RULE_ERROR",
              payload: { code: "ROOM_FULL", message: "Room is full", recoverable: true },
            },
          ];
        }

        session.nickname = msg.payload.nickname;
        session.roomId = msg.payload.roomId;
        const existing = room.runtime.room.players.map((p) => ({ playerId: p.playerId, nickname: p.nickname }));
        const merged = [...existing, { playerId: session.playerId, nickname: session.nickname }];
        const host = room.runtime.room.hostPlayerId;
        const next = this.rooms.createRoom(msg.payload.roomId, host, merged);
        next.clients = new Set([...room.clients, clientId]);
        this.rooms.attachClient(msg.payload.roomId, clientId);
        return [
          { type: "ROOM_JOINED", payload: { roomId: msg.payload.roomId, youAre: session.playerId } },
          this.snapshot(msg.payload.roomId),
        ];
      }

      case "START_GAME": {
        const room = this.rooms.getRoom(msg.payload.roomId);
        if (!room) return [this.ruleError("ROOM_NOT_FOUND", "Room not found")];
        if (room.runtime.room.players.length < MIN_PLAYERS) {
          return [this.ruleError("NOT_ENOUGH_PLAYERS", `Need at least ${MIN_PLAYERS} players`)];
        }
        room.runtime.room.round.phase = "in_round";
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
        const players = room.runtime.room.players;
        const idx = players.findIndex((p) => p.playerId === session.playerId);
        if (idx < 0) return [this.ruleError("NO_PLAYER", "Player not in room")];
        room.runtime.room.round.currentPlayerId = players[(idx + 1) % players.length].playerId;
        room.runtime.room.round.lastSuccessfulSpellId = null;
        return [this.snapshot(msg.payload.roomId)];
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
        version: 1,
      },
    };
  }

  private ruleError(code: string, message: string): ServerToClientMessage {
    return {
      type: "RULE_ERROR",
      payload: { code, message, recoverable: true },
    };
  }
}
