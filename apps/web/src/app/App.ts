import {
  SHARED_ASSET_PREFIX,
  getBoardBackgroundAsset,
  getSpellStoneAssetName,
  type GameSnapshot,
  type SpellId,
} from "../../../../packages/shared/src/index";
import { buildTableSceneModel, createPlaceholderSnapshot } from "./tableScene";

function spellTrack(snapshot: GameSnapshot): string {
  return ([1, 2, 3, 4, 5, 6, 7, 8] as SpellId[])
    .map((spellId) => {
      const assetName = `${SHARED_ASSET_PREFIX}/${getSpellStoneAssetName(spellId, "front")}`;
      return `
        <div class="spell-token" data-asset="${assetName}">
          <span class="spell-token__id">${spellId}</span>
          <span class="spell-token__count">${snapshot.room.board.playedCountBySpell[spellId]} played</span>
        </div>
      `;
    })
    .join("");
}

function seatCard(
  player: ReturnType<typeof buildTableSceneModel>["you"],
  variant: "you" | "opponent",
): string {
  return `
    <article class="seat seat--${variant} ${player.isCurrentTurn ? "seat--active" : ""}">
      <div class="seat__label">${player.seatLabel}</div>
      <div class="seat__name">${player.nickname}</div>
      <div class="seat__stats">HP ${player.hp} <span>Score ${player.score}</span></div>
      <div class="seat__cards">${player.handCount} hidden stones</div>
    </article>
  `;
}

function renderHandCards(): string {
  return new Array(5)
    .fill(null)
    .map(
      (_, index) => `
        <div class="hand-card" data-asset="${SHARED_ASSET_PREFIX}/${getSpellStoneAssetName(0 as SpellId, "back")}">
          <span>Stone ${index + 1}</span>
        </div>
      `,
    )
    .join("");
}

export function renderApp(
  snapshot: GameSnapshot | null,
  localPlayerId: string | null,
  notices: string[],
): string {
  const activeSnapshot = snapshot ?? createPlaceholderSnapshot();
  const model = buildTableSceneModel(activeSnapshot, localPlayerId ?? "p1");
  const backgroundAsset = `${SHARED_ASSET_PREFIX}/${getBoardBackgroundAsset("desktop")}`;

  return `
    <section class="tabletop" data-asset="${backgroundAsset}">
      <header class="tabletop__header">
        <div>
          <p class="eyebrow">Abraca... What? Online</p>
          <h1>Room ${model.roomId}</h1>
        </div>
        <div class="round-chip">
          <span>Round ${activeSnapshot.room.round.roundNo}</span>
          <strong>${activeSnapshot.room.round.phase}</strong>
        </div>
      </header>

      <section class="tabletop__arena">
        <div class="opponent-rail">
          ${model.opponents.map((player) => seatCard(player, "opponent")).join("")}
        </div>

        <div class="board-core">
          <div class="board-core__tower">
            <p>Wizard Tower</p>
            <strong>Deck ${model.centerDeck.deckRemaining}</strong>
            <span>Secrets ${model.centerDeck.secretStonesRemaining}</span>
          </div>
          <div class="board-core__spelltrack">
            ${spellTrack(activeSnapshot)}
          </div>
          <div class="board-core__placeholders">
            <div class="asset-tile" data-asset="${SHARED_ASSET_PREFIX}/ui/score_tower_1024x2048.png">
              Score tower anchor
            </div>
            <div class="asset-tile" data-asset="${SHARED_ASSET_PREFIX}/ui/avatar_frame_256.png">
              Avatar frame anchor
            </div>
            <div class="asset-tile" data-asset="${SHARED_ASSET_PREFIX}/ui/button_primary_320x96.png">
              Action button anchor
            </div>
          </div>
        </div>

        <div class="player-zone">
          ${seatCard(model.you, "you")}
          <div class="hand-row">
            ${renderHandCards()}
          </div>
        </div>
      </section>

      <footer class="tabletop__footer">
        <div class="notice-board">
          <p>Table Log</p>
          <ul>
            ${notices.length > 0 ? notices.map((notice) => `<li>${notice}</li>`).join("") : "<li>Connected scene preview ready.</li>"}
          </ul>
        </div>
        <div class="rules-hint">
          <p>Combo rule</p>
          <span>Declared spells must be non-decreasing within a turn.</span>
        </div>
      </footer>
    </section>
  `;
}
