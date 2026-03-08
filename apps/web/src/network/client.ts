import type {
  ClientToServerMessage,
  ServerToClientMessage,
} from "../../../../packages/shared/src/index";
import { WsGateway } from "../../../server/src/net/WsGateway";

export class WebGameClient {
  private ws: WebSocket | null = null;
  private onMessage: ((msg: ServerToClientMessage) => void) | null = null;
  private mockGateway: WsGateway | null = null;
  private mockClientId: string | null = null;

  connect(url: string, onMessage: (msg: ServerToClientMessage) => void, nickname = "player"): void {
    this.onMessage = onMessage;

    if (url.startsWith("mock://")) {
      this.mockGateway = new WsGateway();
      const session = this.mockGateway.connectClient(nickname);
      this.mockClientId = session.clientId;
      onMessage({
        type: "SYSTEM_NOTICE",
        payload: { message: `已连接本地 mock 会话，玩家编号 ${session.playerId}` },
      });
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    this.ws = new WebSocket(url);
    this.ws.onopen = () => {
      onMessage({
        type: "SYSTEM_NOTICE",
        payload: { message: `已通过 WebSocket 连接，当前昵称 ${nickname}` },
      });
    };
    this.ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data) as ServerToClientMessage;
      onMessage(msg);
    };
    this.ws.onerror = () => {
      onMessage({
        type: "SYSTEM_NOTICE",
        payload: { message: "WebSocket 连接发生错误" },
      });
    };
    this.ws.onclose = () => {
      onMessage({
        type: "SYSTEM_NOTICE",
        payload: { message: "WebSocket 连接已断开" },
      });
    };
  }

  send(msg: ClientToServerMessage): void {
    if (this.mockGateway && this.mockClientId && this.onMessage) {
      const out = this.mockGateway.handleMessage(this.mockClientId, msg);
      out.forEach((m) => this.onMessage?.(m));
      return;
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(msg));
  }
}
