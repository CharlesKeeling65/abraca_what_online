import { test } from "node:test";
import * as assert from "node:assert/strict";

import {
  getBoardBackgroundAsset,
  getSpellStoneAssetName,
  SHARED_ASSET_PREFIX,
} from "../../packages/shared/src/assets/assetManifest";

test("spell stone asset names follow the shared naming contract", () => {
  assert.equal(getSpellStoneAssetName(1, "front"), "spellstones/spell_01_front_512.png");
  assert.equal(getSpellStoneAssetName(8, "front"), "spellstones/spell_08_front_512.png");
  assert.equal(getSpellStoneAssetName(0 as 1, "back"), "spellstones/spell_back_common_512.png");
});

test("board background asset paths are generated per platform viewport", () => {
  assert.equal(SHARED_ASSET_PREFIX, "/assets");
  assert.equal(
    getBoardBackgroundAsset("desktop"),
    "backgrounds/board_desktop_1920x1080.png",
  );
  assert.equal(
    getBoardBackgroundAsset("mobile-portrait"),
    "backgrounds/board_mobile_portrait_1080x1920.png",
  );
});
