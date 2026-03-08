import {
  SHARED_ASSET_PREFIX,
  getBoardBackgroundAsset,
  getSpellStoneAssetName,
  type GameSnapshot,
  type SpellId,
} from "../../../../packages/shared/src/index";
import { buildPlayGuide } from "./playGuide";
import { buildTableSceneModel, createPlaceholderSnapshot } from "./tableScene";

function spellTrack(snapshot: GameSnapshot): string {
  return ([1, 2, 3, 4, 5, 6, 7, 8] as SpellId[])
    .map((spellId) => {
      const assetName = `${SHARED_ASSET_PREFIX}/${getSpellStoneAssetName(spellId, "front")}`;
      return `
        <div class="spell-token" data-asset="${assetName}">
          <span class="spell-token__id">${spellId}</span>
          <span class="spell-token__count">已打出 ${snapshot.room.board.playedCountBySpell[spellId]} 枚</span>
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
      <div class="seat__stats">生命 ${player.hp} <span>分数 ${player.score}</span></div>
      <div class="seat__cards">手牌 ${player.handCount} 枚</div>
    </article>
  `;
}

function renderHandCards(): string {
  return new Array(5)
    .fill(null)
    .map(
      (_, index) => `
        <div class="hand-card" data-asset="${SHARED_ASSET_PREFIX}/${getSpellStoneAssetName(0 as SpellId, "back")}">
          <span>手牌 ${index + 1}</span>
        </div>
      `,
    )
    .join("");
}

export function renderApp(
  snapshot: GameSnapshot | null,
  localPlayerId: string | null,
  notices: string[],
  connectionUrl: string,
): string {
  const activeSnapshot = snapshot ?? createPlaceholderSnapshot();
  const model = buildTableSceneModel(activeSnapshot, localPlayerId ?? "p1");
  const backgroundAsset = `${SHARED_ASSET_PREFIX}/${getBoardBackgroundAsset("desktop")}`;
  const guide = buildPlayGuide(connectionUrl, model.roomId);

  return `
    <section class="tabletop" data-asset="${backgroundAsset}">
      <header class="tabletop__header">
        <div>
          <p class="eyebrow">出包魔法师线上牌桌</p>
          <h1>房间 ${model.roomId}</h1>
        </div>
        <div class="round-chip">
          <span>第 ${activeSnapshot.room.round.roundNo} 轮</span>
          <strong>${activeSnapshot.room.round.phase}</strong>
        </div>
      </header>

      <section class="tabletop__arena">
        <div class="opponent-rail">
          ${model.opponents.map((player) => seatCard(player, "opponent")).join("")}
        </div>

        <div class="board-core">
          <div class="board-core__tower">
            <p>魔法师之塔</p>
            <strong>牌堆余量 ${model.centerDeck.deckRemaining}</strong>
            <span>秘密石 ${model.centerDeck.secretStonesRemaining}</span>
          </div>
          <div class="board-core__spelltrack">
            ${spellTrack(activeSnapshot)}
          </div>
          <div class="board-core__placeholders">
            <div class="asset-tile" data-asset="${SHARED_ASSET_PREFIX}/ui/score_tower_1024x2048.png">
              计分塔贴图落位
            </div>
            <div class="asset-tile" data-asset="${SHARED_ASSET_PREFIX}/ui/avatar_frame_256.png">
              头像框贴图落位
            </div>
            <div class="asset-tile" data-asset="${SHARED_ASSET_PREFIX}/ui/button_primary_320x96.png">
              主按钮贴图落位
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
          <p>牌桌日志</p>
          <ul>
            ${notices.length > 0 ? notices.map((notice) => `<li>${notice}</li>`).join("") : "<li>当前显示的是可交互的牌桌预览。</li>"}
          </ul>
        </div>
        <div class="rules-hint ${guide.isMockMode ? "rules-hint--warn" : ""}">
          <p>试玩指引</p>
          <strong>${guide.connectionTip}</strong>
          <ol>
            ${guide.steps.map((step) => `<li>${step}</li>`).join("")}
          </ol>
        </div>
      </footer>
    </section>
  `;
}
