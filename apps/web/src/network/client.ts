import type {
  ClientToServerMessage,
  ServerToClientMessage,
} from "../../../../packages/shared/src/index";

export class WebGameClient {
  private ws: WebSocket | null = null;

  connect(url: string, onMessage: (msg: ServerToClientMessage) => void): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    this.ws = new WebSocket(url);
    this.ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data) as ServerToClientMessage;
      onMessage(msg);
    };
  }

  send(msg: ClientToServerMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(msg));
  }
}
