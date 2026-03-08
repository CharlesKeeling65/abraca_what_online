import type { GameSnapshot, ServerToClientMessage } from "../../../packages/shared/src/index";
import { WebGameClient } from "./network/client";
import { renderApp } from "./app/App";
import "./styles.css";

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) {
  throw new Error("Missing #app root");
}

const controls = document.createElement("section");
controls.className = "command-deck";

const surface = document.createElement("section");
surface.className = "scene-surface";

const params = new URLSearchParams(window.location.search);
let snapshot: GameSnapshot | null = null;
let roomId = params.get("roomId") ?? "";
let ready = false;
let localPlayerId: string | null = null;
const notices: string[] = [];

const client = new WebGameClient();

function toSpellId(v: number): 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 {
  if (v < 1 || v > 8 || Number.isNaN(v)) return 8;
  return v as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

function pushNotice(text: string): void {
  notices.unshift(text);
  if (notices.length > 6) {
    notices.length = 6;
  }
}

function refresh(): void {
  surface.innerHTML = renderApp(snapshot, localPlayerId, notices, wsInput.value);
}

function onMessage(message: ServerToClientMessage): void {
  if (message.type === "ROOM_CREATED" || message.type === "ROOM_JOINED") {
    roomId = message.payload.roomId;
    localPlayerId = message.payload.youAre;
    roomInput.value = roomId;
    pushNotice(`${message.type === "ROOM_CREATED" ? "已创建" : "已加入"}房间 ${roomId}`);
    refresh();
    return;
  }

  if (message.type === "GAME_SNAPSHOT") {
    snapshot = message.payload;
    roomId = message.payload.room.roomId;
    roomInput.value = roomId;
    pushNotice(`牌桌已同步，时间 ${new Date(message.payload.serverTs).toLocaleTimeString()}`);
    refresh();
    return;
  }

  if (message.type === "RULE_ERROR") {
    pushNotice(`规则错误：${message.payload.message}`);
    refresh();
    return;
  }

  if (message.type === "SYSTEM_NOTICE") {
    pushNotice(message.payload.message);
    refresh();
    return;
  }

  pushNotice(`${message.type} received`);
  refresh();
}

const wsInput = document.createElement("input");
wsInput.value = params.get("ws") ?? "mock://local";
wsInput.placeholder = "ws://127.0.0.1:8080/ws";

const nameInput = document.createElement("input");
nameInput.placeholder = "玩家昵称";
nameInput.value = params.get("nickname") ?? `玩家-${Math.floor(Math.random() * 1000)}`;

const roomInput = document.createElement("input");
roomInput.placeholder = "房间号";
roomInput.value = roomId;

const spellInput = document.createElement("input");
spellInput.type = "number";
spellInput.min = "1";
spellInput.max = "8";
spellInput.value = "8";

function makeButton(text: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.innerText = text;
  button.onclick = onClick;
  return button;
}

function openPlayerWindow(): void {
  const baseName = nameInput.value.trim() || "玩家";
  const suffixMatch = baseName.match(/(\d+)$/);
  const nextName = suffixMatch
    ? baseName.replace(/(\d+)$/, String(Number(suffixMatch[1]) + 1))
    : `${baseName}-2`;
  const url = new URL(window.location.href);
  url.searchParams.set("ws", wsInput.value.startsWith("mock://") ? "ws://127.0.0.1:8080/ws" : wsInput.value);
  if (roomInput.value.trim()) url.searchParams.set("roomId", roomInput.value.trim());
  url.searchParams.set("nickname", nextName);
  window.open(url.toString(), "_blank", "noopener,noreferrer");
}

controls.append(
  wsInput,
  nameInput,
  roomInput,
  makeButton("连接", () => {
    client.connect(wsInput.value, onMessage, nameInput.value);
  }),
  makeButton("建房", () => {
    client.send({
      type: "CREATE_ROOM",
      payload: { nickname: nameInput.value, preferredRoomId: roomInput.value || undefined },
    });
  }),
  makeButton("加入房间", () => {
    client.send({
      type: "JOIN_ROOM",
      payload: { roomId: roomInput.value, nickname: nameInput.value },
    });
  }),
  makeButton("准备 / 取消准备", () => {
    if (!roomId) return;
    ready = !ready;
    client.send({ type: "TOGGLE_READY", payload: { roomId, ready } });
  }),
  makeButton("开始游戏", () => {
    if (!roomId) return;
    client.send({ type: "START_GAME", payload: { roomId } });
  }),
  spellInput,
  makeButton("宣言施法", () => {
    if (!roomId) return;
    client.send({ type: "DECLARE_SPELL", payload: { roomId, spellId: toSpellId(Number(spellInput.value)) } });
  }),
  makeButton("结束回合", () => {
    if (!roomId) return;
    client.send({ type: "END_TURN", payload: { roomId } });
  }),
  makeButton("离开房间", () => {
    if (!roomId) return;
    client.send({ type: "LEAVE_ROOM", payload: { roomId } });
    pushNotice(`已离开房间 ${roomId}`);
    roomId = "";
    snapshot = null;
    roomInput.value = "";
    refresh();
  }),
  makeButton("打开新玩家窗口", () => {
    openPlayerWindow();
    pushNotice("已尝试打开新的玩家窗口。多人联机请确认连接地址为真实 ws。");
  }),
);

root.append(controls, surface);
refresh();
