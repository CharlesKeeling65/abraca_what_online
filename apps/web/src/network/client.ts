import type {
  ClientToServerMessage,
  ServerToClientMessage,
} from "../../../../packages/shared/src";

export class WebGameClient {
  private ws: WebSocket | null = null;

  connect(url: string, onMessage: (msg: ServerToClientMessage) => void): void {
    this.ws = new WebSocket(url);
    this.ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data) as ServerToClientMessage;
      onMessage(msg);
    };
  }

  send(msg: ClientToServerMessage): void {
    this.ws?.send(JSON.stringify(msg));
  }
}
