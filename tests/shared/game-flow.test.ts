import { test } from "node:test";
import * as assert from "node:assert/strict";

import { WsGateway } from "../../apps/server/src/net/WsGateway";

test("gateway supports create, join, ready, and start flow", () => {
  const gateway = new WsGateway();
  const alice = gateway.connectClient("Alice");
  const bob = gateway.connectClient("Bob");

  const createRes = gateway.handleMessage(alice.clientId, {
    type: "CREATE_ROOM",
    payload: { nickname: "Alice", preferredRoomId: "room-flow" },
  });
  assert.ok(createRes.some((message) => message.type === "ROOM_CREATED"));

  const joinRes = gateway.handleMessage(bob.clientId, {
    type: "JOIN_ROOM",
    payload: { roomId: "room-flow", nickname: "Bob" },
  });
  assert.ok(joinRes.some((message) => message.type === "ROOM_JOINED"));

  gateway.handleMessage(bob.clientId, {
    type: "TOGGLE_READY",
    payload: { roomId: "room-flow", ready: true },
  });

  const startRes = gateway.handleMessage(alice.clientId, {
    type: "START_GAME",
    payload: { roomId: "room-flow" },
  });
  const snapshot = startRes.find((message) => message.type === "GAME_SNAPSHOT");
  assert.ok(snapshot);
  if (snapshot?.type === "GAME_SNAPSHOT") {
    assert.equal(snapshot.payload.room.round.phase, "in_round");
  }
});
