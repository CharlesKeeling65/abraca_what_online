import type {
  ClientToServerMessage,
  ServerToClientMessage,
} from "../../../../packages/shared/src";

/**
 * WebSocket 网关骨架：
 * - 解析客户端消息
 * - 路由到 RoomManager/GameService
 * - 广播最新快照
 */
export class WsGateway {
  onMessage(raw: string): ServerToClientMessage | null {
    let msg: ClientToServerMessage;

    try {
      msg = JSON.parse(raw) as ClientToServerMessage;
    } catch {
      return {
        type: "RULE_ERROR",
        payload: {
          code: "BAD_JSON",
          message: "Invalid JSON message",
          recoverable: true,
        },
      };
    }

    // TODO: 按 msg.type 分发。
    return {
      type: "SYSTEM_NOTICE",
      payload: { message: `Received ${msg.type}` },
    };
  }
}
