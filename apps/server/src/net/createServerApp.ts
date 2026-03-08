import { existsSync, readFileSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, normalize } from "node:path";
import { URL } from "node:url";
import { WebSocket, WebSocketServer } from "ws";

import type { ClientToServerMessage } from "../../../../packages/shared/src/index";
import { loadEnv, type ServerEnv } from "../config/env";
import { WsGateway } from "./WsGateway";

export interface ServerApp {
  host: string;
  port: number;
  listen(): Promise<void>;
  close(): Promise<void>;
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function contentTypeFor(pathname: string): string {
  switch (extname(pathname)) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".json":
      return "application/json; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

function webDistRoot(): string {
  return join(__dirname, "../../../../web");
}

function tryServeBuiltWeb(method: string | undefined, pathname: string, res: ServerResponse): boolean {
  const root = webDistRoot();
  const candidate = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = normalize(join(root, candidate));

  if (!filePath.startsWith(root) || !existsSync(filePath)) {
    return false;
  }

  res.statusCode = 200;
  res.setHeader("content-type", contentTypeFor(filePath));
  if (method === "HEAD") {
    res.end();
    return true;
  }
  res.end(readFileSync(filePath));
  return true;
}

function handleHttpRequest(req: IncomingMessage, res: ServerResponse): void {
  if (!req.url) {
    sendJson(res, 400, { ok: false, error: "Missing URL" });
    return;
  }

  const url = new URL(req.url, "http://local.server");
  if ((req.method === "GET" || req.method === "HEAD") && url.pathname === "/health") {
    sendJson(res, 200, { ok: true, transport: "http+ws" });
    return;
  }

  if ((req.method === "GET" || req.method === "HEAD") && tryServeBuiltWeb(req.method, url.pathname, res)) {
    return;
  }

  if ((req.method === "GET" || req.method === "HEAD") && url.pathname === "/") {
    sendJson(res, 200, {
      ok: true,
      name: "abraca-what-online",
      websocket: "/ws",
      health: "/health",
    });
    return;
  }

  sendJson(res, 404, { ok: false, error: "Not found" });
}

function sendMessage(socket: WebSocket | undefined, message: unknown): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }
  socket.send(JSON.stringify(message));
}

function registerSocketHandlers(
  socket: WebSocket,
  gateway: WsGateway,
  request: IncomingMessage,
  socketsByClientId: Map<string, WebSocket>,
): void {
  const url = new URL(request.url ?? "/ws", "http://local.server");
  const nickname = url.searchParams.get("nickname")?.trim() || "player";
  const session = gateway.connectClient(nickname);
  socketsByClientId.set(session.clientId, socket);
  sendMessage(socket, gateway.roomListUpdate());

  function broadcastRoom(roomId: string): void {
    const snapshot = gateway.publicSnapshot(roomId);
    gateway.getRoomClientIds(roomId).forEach((clientId) => {
      sendMessage(socketsByClientId.get(clientId), snapshot);
    });
  }

  function broadcastRoomList(): void {
    const update = gateway.roomListUpdate();
    gateway.getAllClientIds().forEach((clientId) => {
      sendMessage(socketsByClientId.get(clientId), update);
    });
  }

  socket.on("message", (raw) => {
    try {
      const message = JSON.parse(raw.toString()) as ClientToServerMessage;
      const responses = gateway.handleMessage(session.clientId, message);
      responses.forEach((response) => sendMessage(socket, response));

      const roomId = "roomId" in message.payload ? message.payload.roomId : undefined;
      if (roomId && responseNeedsRoomSync(message.type)) {
        broadcastRoom(roomId);
      }
      if (responseNeedsRoomListSync(message.type)) {
        broadcastRoomList();
      }
    } catch (error) {
      sendMessage(socket, {
          type: "RULE_ERROR",
          payload: {
            code: "BAD_MESSAGE",
            message: error instanceof Error ? error.message : "Invalid message",
            recoverable: true,
          },
        });
    }
  });

  socket.on("close", () => {
    const roomId = gateway.getClientRoomId(session.clientId);
    gateway.disconnectClient(session.clientId);
    socketsByClientId.delete(session.clientId);
    if (roomId) {
      broadcastRoom(roomId);
    }
    broadcastRoomList();
  });
}

function responseNeedsRoomSync(messageType: ClientToServerMessage["type"]): boolean {
  return (
    messageType === "JOIN_ROOM" ||
    messageType === "TOGGLE_READY" ||
    messageType === "START_GAME" ||
    messageType === "DECLARE_SPELL" ||
    messageType === "END_TURN" ||
    messageType === "RESYNC" ||
    messageType === "LEAVE_ROOM"
  );
}

function responseNeedsRoomListSync(messageType: ClientToServerMessage["type"]): boolean {
  return messageType === "CREATE_ROOM" || messageType === "JOIN_ROOM" || messageType === "LEAVE_ROOM";
}

export async function createServerApp(env: ServerEnv = loadEnv()): Promise<ServerApp> {
  const gateway = new WsGateway();
  const httpServer = createServer(handleHttpRequest);
  const wsServer = new WebSocketServer({ noServer: true });
  const socketsByClientId = new Map<string, WebSocket>();

  httpServer.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url ?? "/", "http://local.server");
    if (url.pathname !== "/ws") {
      socket.destroy();
      return;
    }

    wsServer.handleUpgrade(request, socket, head, (webSocket) => {
      registerSocketHandlers(webSocket, gateway, request, socketsByClientId);
    });
  });

  const app: ServerApp = {
    host: env.host,
    port: env.port,
    listen: () =>
      new Promise<void>((resolve, reject) => {
        const onError = (error: Error): void => {
          httpServer.off("error", onError);
          reject(error);
        };

        httpServer.once("error", onError);
        httpServer.listen(env.port, env.host, () => {
          httpServer.off("error", onError);
          const address = httpServer.address();
          if (address && typeof address === "object") {
            app.port = address.port;
          }
          resolve();
        });
      }),
    close: () =>
      new Promise<void>((resolve, reject) => {
        wsServer.close();
        httpServer.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }),
  };

  return app;
}
