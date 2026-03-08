import type { ClientToServerMessage } from "../../../../packages/shared/src/index";

/**
 * 移动端网络层骨架（React Native / Expo 可复用）。
 */
export class MobileGameClient {
  send(_msg: ClientToServerMessage): void {
    // TODO: 接入 WebSocket + 重连策略 + 心跳。
  }
}
