import { test } from "node:test";
import * as assert from "node:assert/strict";

import { buildPlayGuide } from "../../apps/web/src/app/playGuide";

test("play guide warns that mock transport cannot be shared across pages", () => {
  const guide = buildPlayGuide("mock://local", "room-demo");

  assert.equal(guide.isMockMode, true);
  assert.match(guide.connectionTip, /不会让多个页面共享同一个房间/);
});

test("play guide explains the multi-window flow for real websocket rooms", () => {
  const guide = buildPlayGuide("ws://127.0.0.1:8080/ws", "room-demo");

  assert.equal(guide.isMockMode, false);
  assert.match(guide.connectionTip, /打开 2 个或更多浏览器窗口/);
  assert.match(guide.steps[1] ?? "", /输入相同房间号/);
});
