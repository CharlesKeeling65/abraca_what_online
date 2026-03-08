import type {
  ClientToServerMessage,
  GameSnapshot,
  RoomListItem,
  ServerToClientMessage,
} from "../../../packages/shared/src/index";
import { renderApp, type WebRenderState } from "./app/App";
import { resolveRoute, type AppRoute } from "./app/routes";
import { WebGameClient } from "./network/client";
import "./styles.css";

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) {
  throw new Error("Missing #app root");
}
const appRoot = root;

const params = new URLSearchParams(window.location.search);
const client = new WebGameClient();

const state: WebRenderState = {
  route: "connect",
  connectionStatus: "idle",
  connectionUrl: params.get("ws") ?? "mock://local",
  nickname: params.get("nickname") ?? `玩家-${Math.floor(Math.random() * 1000)}`,
  roomIdInput: params.get("roomId") ?? "",
  spellInput: "8",
  localPlayerId: null,
  snapshot: null,
  roomList: [],
  notices: [],
  lastError: null,
};

function pushNotice(text: string): void {
  state.notices.unshift(text);
  if (state.notices.length > 8) {
    state.notices.length = 8;
  }
}

function requestedRoute(): AppRoute {
  const route = window.location.hash.replace(/^#/, "");
  return route === "lobby" || route === "game" ? route : "connect";
}

function syncRoute(): void {
  const nextRoute = resolveRoute({
    current: requestedRoute(),
    connectionStatus: state.connectionStatus,
    roomId: state.snapshot?.room.roomId ?? "",
    roundPhase: state.snapshot?.room.round.phase ?? null,
  });
  state.route = nextRoute;
  if (window.location.hash !== `#${nextRoute}`) {
    window.location.hash = nextRoute;
  }
}

function refresh(): void {
  syncRoute();
  appRoot.innerHTML = renderApp(state);
}

function currentRoomId(): string {
  return state.snapshot?.room.roomId ?? state.roomIdInput.trim();
}

function send(message: ClientToServerMessage): void {
  state.lastError = null;
  client.send(message);
}

function onMessage(message: ServerToClientMessage): void {
  if (message.type === "ROOM_CREATED" || message.type === "ROOM_JOINED") {
    state.localPlayerId = message.payload.youAre;
    state.roomIdInput = message.payload.roomId;
    pushNotice(`${message.type === "ROOM_CREATED" ? "已创建" : "已加入"}房间 ${message.payload.roomId}`);
    refresh();
    return;
  }

  if (message.type === "ROOM_LIST_UPDATED") {
    state.connectionStatus = "connected";
    state.roomList = message.payload.rooms as RoomListItem[];
    pushNotice(`房间列表已更新，共 ${state.roomList.length} 个房间`);
    refresh();
    return;
  }

  if (message.type === "GAME_SNAPSHOT") {
    state.connectionStatus = "connected";
    state.snapshot = message.payload as GameSnapshot;
    state.roomIdInput = message.payload.room.roomId;
    pushNotice(`牌桌状态已同步：${new Date(message.payload.serverTs).toLocaleTimeString()}`);
    refresh();
    return;
  }

  if (message.type === "ROOM_LEFT") {
    state.snapshot = null;
    state.roomIdInput = "";
    pushNotice(`已离开房间 ${message.payload.roomId}`);
    refresh();
    return;
  }

  if (message.type === "RULE_ERROR") {
    state.lastError = message.payload.message;
    pushNotice(`规则错误：${message.payload.message}`);
    refresh();
    return;
  }

  if (message.type === "SYSTEM_NOTICE") {
    if (message.payload.message.includes("断开") || message.payload.message.includes("错误")) {
      state.connectionStatus = "error";
    } else {
      state.connectionStatus = "connected";
    }
    pushNotice(message.payload.message);
    refresh();
  }
}

function connect(): void {
  state.connectionStatus = "connecting";
  state.lastError = null;
  client.connect(state.connectionUrl, onMessage, state.nickname);
  pushNotice(`正在连接 ${state.connectionUrl}`);
  refresh();
}

function openPlayerWindow(): void {
  const baseName = state.nickname.trim() || "玩家";
  const suffixMatch = baseName.match(/(\d+)$/);
  const nextName = suffixMatch
    ? baseName.replace(/(\d+)$/, String(Number(suffixMatch[1]) + 1))
    : `${baseName}-2`;
  const url = new URL(window.location.href);
  url.searchParams.set(
    "ws",
    state.connectionUrl.startsWith("mock://") ? "ws://127.0.0.1:8080/ws" : state.connectionUrl,
  );
  if (currentRoomId()) url.searchParams.set("roomId", currentRoomId());
  url.searchParams.set("nickname", nextName);
  window.open(url.toString(), "_blank", "noopener,noreferrer");
}

appRoot.addEventListener("input", (event) => {
  const target = event.target as HTMLInputElement | null;
  if (!target?.dataset.model) return;

  if (target.dataset.model === "connectionUrl") state.connectionUrl = target.value;
  if (target.dataset.model === "nickname") state.nickname = target.value;
  if (target.dataset.model === "roomIdInput") state.roomIdInput = target.value;
  if (target.dataset.model === "spellInput") state.spellInput = target.value;
});

appRoot.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-action]");
  if (!target) return;

  const action = target.dataset.action;
  if (action === "connect") {
    connect();
    return;
  }
  if (action === "use-room") {
    state.roomIdInput = target.dataset.roomId ?? state.roomIdInput;
    refresh();
    return;
  }
  if (action === "create-room") {
    send({
      type: "CREATE_ROOM",
      payload: { nickname: state.nickname, preferredRoomId: state.roomIdInput || undefined },
    });
    return;
  }
  if (action === "join-room") {
    send({
      type: "JOIN_ROOM",
      payload: { roomId: state.roomIdInput, nickname: state.nickname },
    });
    return;
  }
  if (action === "toggle-ready") {
    const roomId = currentRoomId();
    if (!roomId) {
      state.lastError = "还没有进入房间，无法准备。";
      refresh();
      return;
    }
    const me = state.snapshot?.room.players.find((player) => player.playerId === state.localPlayerId);
    send({ type: "TOGGLE_READY", payload: { roomId, ready: !(me?.isReady ?? false) } });
    return;
  }
  if (action === "start-game") {
    const roomId = currentRoomId();
    if (!roomId) {
      state.lastError = "还没有房间，无法开始游戏。";
      refresh();
      return;
    }
    send({ type: "START_GAME", payload: { roomId } });
    return;
  }
  if (action === "leave-room") {
    const roomId = currentRoomId();
    if (!roomId) {
      state.lastError = "当前不在任何房间中。";
      refresh();
      return;
    }
    send({ type: "LEAVE_ROOM", payload: { roomId } });
    return;
  }
  if (action === "declare-spell") {
    const roomId = currentRoomId();
    if (!roomId) {
      state.lastError = "未进入房间，无法宣言施法。";
      refresh();
      return;
    }
    send({
      type: "DECLARE_SPELL",
      payload: {
        roomId,
        spellId: Math.max(1, Math.min(8, Number(state.spellInput || "8"))) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
      },
    });
    return;
  }
  if (action === "end-turn") {
    const roomId = currentRoomId();
    if (!roomId) {
      state.lastError = "未进入房间，无法结束回合。";
      refresh();
      return;
    }
    send({ type: "END_TURN", payload: { roomId } });
    return;
  }
  if (action === "open-player-window") {
    openPlayerWindow();
    pushNotice("已尝试打开新的玩家窗口。多人体验请使用真实 ws 地址。");
    refresh();
  }
});

window.addEventListener("hashchange", () => {
  refresh();
});

refresh();
