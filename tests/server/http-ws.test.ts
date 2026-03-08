import { test } from "node:test";
import * as assert from "node:assert/strict";

import { WebSocket } from "ws";

import { createServerApp } from "../../apps/server/src/net/createServerApp";

test("server app exposes health endpoint", async () => {
  const app = await createServerApp({ host: "127.0.0.1", port: 0 });
  await app.listen();

  try {
    const response = await fetch(`http://127.0.0.1:${app.port}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, transport: "http+ws" });
  } finally {
    await app.close();
  }
});

test("server app serves built web client from root", async () => {
  const app = await createServerApp({ host: "127.0.0.1", port: 0 });
  await app.listen();

  try {
    const response = await fetch(`http://127.0.0.1:${app.port}/`);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /text\/html/);
    assert.match(html, /<div id="app"><\/div>/);
  } finally {
    await app.close();
  }
});

test("server app supports HEAD on the web root", async () => {
  const app = await createServerApp({ host: "127.0.0.1", port: 0 });
  await app.listen();

  try {
    const response = await fetch(`http://127.0.0.1:${app.port}/`, { method: "HEAD" });
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /text\/html/);
  } finally {
    await app.close();
  }
});

test("server app accepts websocket clients and returns room snapshot", async () => {
  const app = await createServerApp({ host: "127.0.0.1", port: 0 });
  await app.listen();

  const messages: Array<{ type: string; payload: Record<string, unknown> }> = [];

  try {
    await new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(`ws://127.0.0.1:${app.port}/ws?nickname=Alice`);

      socket.once("error", reject);
      socket.once("open", () => {
        socket.send(
          JSON.stringify({
            type: "CREATE_ROOM",
            payload: { nickname: "Alice", preferredRoomId: "room-ws" },
          }),
        );
      });
      socket.on("message", (raw) => {
        const parsed = JSON.parse(raw.toString()) as { type: string; payload: Record<string, unknown> };
        messages.push(parsed);
        if (parsed.type === "GAME_SNAPSHOT") {
          socket.close();
        }
      });
      socket.once("close", () => resolve());
    });

    assert.ok(messages.some((message) => message.type === "ROOM_CREATED"));
    assert.ok(messages.some((message) => message.type === "GAME_SNAPSHOT"));
  } finally {
    await app.close();
  }
});
