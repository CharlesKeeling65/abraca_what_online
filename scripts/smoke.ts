import { WsGateway } from "../apps/server/src/net/WsGateway";

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

const gateway = new WsGateway();
const a = gateway.connectClient("Alice");
const b = gateway.connectClient("Bob");

let res = gateway.handleMessage(a.clientId, { type: "CREATE_ROOM", payload: { nickname: "Alice", preferredRoomId: "room1" } });
assert(res.some((m) => m.type === "ROOM_CREATED"), "room create failed");

res = gateway.handleMessage(b.clientId, { type: "JOIN_ROOM", payload: { roomId: "room1", nickname: "Bob" } });
assert(res.some((m) => m.type === "ROOM_JOINED"), "room join failed");

gateway.handleMessage(b.clientId, { type: "TOGGLE_READY", payload: { roomId: "room1", ready: true } });
res = gateway.handleMessage(a.clientId, { type: "START_GAME", payload: { roomId: "room1" } });
assert(res.some((m) => m.type === "GAME_SNAPSHOT"), "start game failed");

// eslint-disable-next-line no-console
console.log("smoke ok");
