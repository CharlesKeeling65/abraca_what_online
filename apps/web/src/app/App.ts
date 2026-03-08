import {
  SHARED_ASSET_PREFIX,
  getBoardBackgroundAsset,
  getSpellStoneAssetName,
  type GameSnapshot,
  type RoomListItem,
  type SpellId,
} from "../../../../packages/shared/src/index";
import { buildPlayGuide } from "./playGuide";
import type { AppRoute } from "./routes";
import { buildTableSceneModel, createPlaceholderSnapshot } from "./tableScene";

export interface WebRenderState {
  route: AppRoute;
  connectionStatus: "idle" | "connecting" | "connected" | "error";
  connectionUrl: string;
  nickname: string;
  roomIdInput: string;
  spellInput: string;
  localPlayerId: string | null;
  snapshot: GameSnapshot | null;
  roomList: RoomListItem[];
  notices: string[];
  lastError: string | null;
}

function routeLabel(route: AppRoute): string {
  if (route === "connect") return "连接";
  if (route === "lobby") return "大厅";
  return "对局";
}

function phaseLabel(phase: string | null): string {
  switch (phase) {
    case "waiting":
      return "等待开始";
    case "in_round":
      return "进行中";
    case "scoring":
      return "计分中";
    case "finished":
      return "已结束";
    default:
      return "未进入房间";
  }
}

function connectionLabel(status: WebRenderState["connectionStatus"]): string {
  switch (status) {
    case "connecting":
      return "连接中";
    case "connected":
      return "已连接";
    case "error":
      return "连接异常";
    default:
      return "未连接";
  }
}

function roomListMarkup(rooms: RoomListItem[]): string {
  if (rooms.length === 0) {
    return `<div class="empty-card">当前还没有房间。连接后可以直接创建第一个房间。</div>`;
  }

  return rooms
    .map(
      (room) => `
        <article class="room-card">
          <div class="room-card__head">
            <strong>${room.roomId}</strong>
            <span>${phaseLabel(room.phase)}</span>
          </div>
          <p>房主：${room.hostNickname}</p>
          <p>人数：${room.playerCount} | 已准备：${room.readyCount}</p>
          <button data-action="use-room" data-room-id="${room.roomId}">使用这个房间号</button>
        </article>
      `,
    )
    .join("");
}

function playerRoster(snapshot: GameSnapshot | null): string {
  const players = snapshot?.room.players ?? [];
  if (players.length === 0) {
    return `<div class="empty-card">尚未加入房间，先创建房间或加入已有房间。</div>`;
  }

  return players
    .map(
      (player) => `
        <article class="status-card ${player.playerId === snapshot?.room.hostPlayerId ? "status-card--host" : ""}">
          <div class="status-card__title">
            <strong>${player.nickname}</strong>
            <span>${player.playerId === snapshot?.room.hostPlayerId ? "房主" : "成员"}</span>
          </div>
          <p>生命 ${player.hp} | 分数 ${player.score} | 手牌 ${player.handCount}</p>
          <p>${player.isReady ? "已准备" : "未准备"} | ${player.isAlive ? "存活" : "已出局"}</p>
        </article>
      `,
    )
    .join("");
}

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

function handCards(): string {
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

function renderConnectView(state: WebRenderState): string {
  return `
    <section class="page page--connect">
      <div class="hero-card">
        <p class="eyebrow">连接服务器</p>
        <h1>先连接，再进入房间大厅</h1>
        <p>这里负责服务器地址、连接状态和房间总览。连接成功后会自动跳转到大厅页。</p>
      </div>
      <div class="split-grid">
        <section class="panel-card">
          <h2>连接设置</h2>
          <label class="field">
            <span>连接地址</span>
            <input data-model="connectionUrl" value="${state.connectionUrl}" placeholder="ws://127.0.0.1:8080/ws" />
          </label>
          <label class="field">
            <span>玩家昵称</span>
            <input data-model="nickname" value="${state.nickname}" placeholder="玩家昵称" />
          </label>
          <div class="button-row">
            <button data-action="connect">连接服务器</button>
          </div>
          <div class="status-strip">
            <strong>${connectionLabel(state.connectionStatus)}</strong>
            <span>${state.connectionUrl.startsWith("mock://") ? "当前为单页 mock 模式" : "当前为真实 WebSocket 模式"}</span>
          </div>
          ${
            state.lastError
              ? `<div class="alert-card alert-card--error">操作失败：${state.lastError}<br />引导：确认已连接服务器，并检查房间号、准备状态或当前是否轮到你。</div>`
              : ""
          }
        </section>

        <section class="panel-card">
          <h2>房间列表</h2>
          <p class="muted-copy">这里会实时更新当前所有房间，不需要手动刷新。</p>
          <div class="room-list">${roomListMarkup(state.roomList)}</div>
        </section>
      </div>
    </section>
  `;
}

function renderLobbyView(state: WebRenderState): string {
  const snapshot = state.snapshot;
  return `
    <section class="page page--lobby">
      <div class="hero-card hero-card--compact">
        <p class="eyebrow">房间大厅</p>
        <h1>${snapshot ? `当前房间 ${snapshot.room.roomId}` : "选择房间或创建房间"}</h1>
        <p>连接状态、房间列表、准备状态和错误提示都集中在这里。房间内任意玩家的状态变化都会实时同步。</p>
      </div>
      <div class="tri-grid">
        <section class="panel-card">
          <h2>进入房间</h2>
          <label class="field">
            <span>房间号</span>
            <input data-model="roomIdInput" value="${state.roomIdInput}" placeholder="如 room1" />
          </label>
          <div class="button-row">
            <button data-action="create-room">创建房间</button>
            <button data-action="join-room">加入房间</button>
          </div>
          <div class="button-row">
            <button data-action="open-player-window">打开新玩家窗口</button>
            <button data-action="leave-room">离开房间</button>
          </div>
          ${
            state.lastError
              ? `<div class="alert-card alert-card--error">错误提示：${state.lastError}</div>`
              : `<div class="alert-card">引导：多人体验时，所有窗口都必须连接同一个 ws 地址，并使用同一个房间号。</div>`
          }
        </section>

        <section class="panel-card">
          <h2>房间玩家状态</h2>
          <div class="status-grid">${playerRoster(snapshot)}</div>
          <div class="button-row">
            <button data-action="toggle-ready">准备 / 取消准备</button>
            <button data-action="start-game">开始游戏</button>
          </div>
        </section>

        <section class="panel-card">
          <h2>实时房间列表</h2>
          <div class="room-list">${roomListMarkup(state.roomList)}</div>
        </section>
      </div>
    </section>
  `;
}

function renderGameView(state: WebRenderState): string {
  const activeSnapshot = state.snapshot ?? createPlaceholderSnapshot();
  const model = buildTableSceneModel(activeSnapshot, state.localPlayerId ?? "p1");
  const backgroundAsset = `${SHARED_ASSET_PREFIX}/${getBoardBackgroundAsset("desktop")}`;
  const guide = buildPlayGuide(state.connectionUrl, model.roomId);

  return `
    <section class="page page--game">
      <div class="game-shell">
        <aside class="game-sidebar">
          <section class="panel-card">
            <h2>对局状态</h2>
            <p>连接：${connectionLabel(state.connectionStatus)}</p>
            <p>房间：${model.roomId}</p>
            <p>阶段：${phaseLabel(activeSnapshot.room.round.phase)}</p>
            <p>当前行动：${activeSnapshot.room.round.currentPlayerId ?? "无"}</p>
          </section>

          <section class="panel-card">
            <h2>操作面板</h2>
            <label class="field">
              <span>宣言法术编号</span>
              <input data-model="spellInput" value="${state.spellInput}" type="number" min="1" max="8" />
            </label>
            <div class="button-row">
              <button data-action="declare-spell">宣言施法</button>
              <button data-action="end-turn">结束回合</button>
            </div>
            <div class="button-row">
              <button data-action="leave-room">离开房间</button>
              <button data-action="open-player-window">新增玩家窗口</button>
            </div>
          </section>

          <section class="panel-card">
            <h2>房间玩家</h2>
            <div class="status-grid">${playerRoster(state.snapshot)}</div>
          </section>
        </aside>

        <section class="tabletop" data-asset="${backgroundAsset}">
          <header class="tabletop__header">
            <div>
              <p class="eyebrow">出包魔法师线上牌桌</p>
              <h1>房间 ${model.roomId}</h1>
            </div>
            <div class="round-chip">
              <span>第 ${activeSnapshot.room.round.roundNo} 轮</span>
              <strong>${phaseLabel(activeSnapshot.room.round.phase)}</strong>
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
                ${handCards()}
              </div>
            </div>
          </section>

          <footer class="tabletop__footer">
            <div class="notice-board">
              <p>实时日志</p>
              <ul>
                ${
                  state.notices.length > 0
                    ? state.notices.map((notice) => `<li>${notice}</li>`).join("")
                    : "<li>等待服务器广播最新状态。</li>"
                }
              </ul>
            </div>
            <div class="rules-hint ${guide.isMockMode ? "rules-hint--warn" : ""}">
              <p>错误提醒与引导</p>
              ${
                state.lastError
                  ? `<strong>最近错误：${state.lastError}</strong>`
                  : `<strong>${guide.connectionTip}</strong>`
              }
              <ol>
                ${guide.steps.map((step) => `<li>${step}</li>`).join("")}
              </ol>
            </div>
          </footer>
        </section>
      </div>
    </section>
  `;
}

export function renderApp(state: WebRenderState): string {
  const snapshot = state.snapshot;
  const phase = snapshot?.room.round.phase ?? null;

  return `
    <section class="app-shell">
      <header class="app-topbar">
        <div>
          <p class="eyebrow">实时联机桌游体验</p>
          <h1>出包魔法师 Online</h1>
        </div>
        <div class="topbar-meta">
          <span>页面：${routeLabel(state.route)}</span>
          <span>连接：${connectionLabel(state.connectionStatus)}</span>
          <span>阶段：${phaseLabel(phase)}</span>
        </div>
      </header>
      ${state.route === "connect" ? renderConnectView(state) : state.route === "lobby" ? renderLobbyView(state) : renderGameView(state)}
    </section>
  `;
}
