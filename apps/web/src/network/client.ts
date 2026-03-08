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
        payload: { message: `Connected mock session as ${session.playerId}` },
      });
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    this.ws = new WebSocket(url);
    this.ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data) as ServerToClientMessage;
      onMessage(msg);
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
