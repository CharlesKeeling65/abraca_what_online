import { test } from "node:test";
import * as assert from "node:assert/strict";

import { resolveRoute, type AppRoute } from "../../apps/web/src/app/routes";

test("router stays on connect view before transport is connected", () => {
  const route = resolveRoute({
    current: "connect",
    connectionStatus: "idle",
    roomId: "",
    roundPhase: null,
  });

  assert.equal(route, "connect");
});

test("router moves to lobby after connection and room join while waiting", () => {
  const route = resolveRoute({
    current: "connect",
    connectionStatus: "connected",
    roomId: "room-1",
    roundPhase: "waiting",
  });

  assert.equal(route, "lobby");
});

test("router moves to lobby right after transport connects even before joining a room", () => {
  const route = resolveRoute({
    current: "connect",
    connectionStatus: "connected",
    roomId: "",
    roundPhase: null,
  });

  assert.equal(route, "lobby");
});

test("router moves to game after round starts", () => {
  const route: AppRoute = resolveRoute({
    current: "lobby",
    connectionStatus: "connected",
    roomId: "room-1",
    roundPhase: "in_round",
  });

  assert.equal(route, "game");
});
