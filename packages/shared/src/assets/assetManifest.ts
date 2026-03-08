import type { SpellId } from "../models/gameModels";

export type BoardViewport = "desktop" | "web" | "mobile-portrait" | "mobile-landscape";
export type SpellStoneFace = "front" | "back";

export const SHARED_ASSET_PREFIX = "/assets";

const BOARD_BACKGROUND_BY_VIEWPORT: Record<BoardViewport, string> = {
  desktop: "backgrounds/board_desktop_1920x1080.png",
  web: "backgrounds/board_web_1600x900.png",
  "mobile-portrait": "backgrounds/board_mobile_portrait_1080x1920.png",
  "mobile-landscape": "backgrounds/board_mobile_landscape_1920x1080.png",
};

export function getBoardBackgroundAsset(viewport: BoardViewport): string {
  return BOARD_BACKGROUND_BY_VIEWPORT[viewport];
}

export function getSpellStoneAssetName(
  spellId: SpellId,
  face: SpellStoneFace,
): string {
  if (face === "back") {
    return "spellstones/spell_back_common_512.png";
  }

  return `spellstones/spell_${String(spellId).padStart(2, "0")}_front_512.png`;
}
