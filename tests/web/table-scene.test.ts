import { test } from "node:test";
import * as assert from "node:assert/strict";

import type { GameSnapshot } from "../../packages/shared/src/index";
import {
  buildTableSceneModel,
  createPlaceholderSnapshot,
} from "../../apps/web/src/app/tableScene";

test("table scene model highlights current player and keeps board metrics", () => {
  const snapshot = createPlaceholderSnapshot();
  snapshot.room.round.currentPlayerId = "p2";
  snapshot.room.board.playedCountBySpell[4] = 2;

  const model = buildTableSceneModel(snapshot, "p1");

  assert.equal(model.roomId, "demo-room");
  assert.equal(model.currentPlayerId, "p2");
  assert.equal(model.you.playerId, "p1");
  assert.equal(model.opponents.length, 2);
  assert.equal(model.spellStats[3]?.playedCount, 2);
  assert.equal(
    model.opponents.find((player) => player.playerId === "p2")?.isCurrentTurn,
    true,
  );
});

test("table scene placeholder snapshot always yields a local player seat", () => {
  const snapshot: GameSnapshot = createPlaceholderSnapshot();

  const model = buildTableSceneModel(snapshot, "p1");

  assert.equal(model.you.seatLabel, "你");
  assert.ok(model.centerDeck.deckRemaining > 0);
});
