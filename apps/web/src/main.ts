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

let snapshot: GameSnapshot | null = null;
let roomId = "";
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
  surface.innerHTML = renderApp(snapshot, localPlayerId, notices);
}

function onMessage(message: ServerToClientMessage): void {
  if (message.type === "ROOM_CREATED" || message.type === "ROOM_JOINED") {
    roomId = message.payload.roomId;
    localPlayerId = message.payload.youAre;
    pushNotice(`${message.type === "ROOM_CREATED" ? "Created" : "Joined"} room ${roomId}`);
    refresh();
    return;
  }

  if (message.type === "GAME_SNAPSHOT") {
    snapshot = message.payload;
    roomId = message.payload.room.roomId;
    pushNotice(`Snapshot synced at ${new Date(message.payload.serverTs).toLocaleTimeString()}`);
    refresh();
    return;
  }

  if (message.type === "RULE_ERROR") {
    pushNotice(`Rule error: ${message.payload.message}`);
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
wsInput.value = "mock://local";
wsInput.placeholder = "ws://127.0.0.1:8080/ws";

const nameInput = document.createElement("input");
nameInput.placeholder = "Nickname";
nameInput.value = `mage-${Math.floor(Math.random() * 1000)}`;

const roomInput = document.createElement("input");
roomInput.placeholder = "Room ID";

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

controls.append(
  wsInput,
  nameInput,
  roomInput,
  makeButton("Connect", () => {
    client.connect(wsInput.value, onMessage, nameInput.value);
  }),
  makeButton("Create", () => {
    client.send({
      type: "CREATE_ROOM",
      payload: { nickname: nameInput.value, preferredRoomId: roomInput.value || undefined },
    });
  }),
  makeButton("Join", () => {
    client.send({
      type: "JOIN_ROOM",
      payload: { roomId: roomInput.value, nickname: nameInput.value },
    });
  }),
  makeButton("Ready", () => {
    if (!roomId) return;
    ready = !ready;
    client.send({ type: "TOGGLE_READY", payload: { roomId, ready } });
  }),
  makeButton("Start", () => {
    if (!roomId) return;
    client.send({ type: "START_GAME", payload: { roomId } });
  }),
  spellInput,
  makeButton("Declare", () => {
    if (!roomId) return;
    client.send({ type: "DECLARE_SPELL", payload: { roomId, spellId: toSpellId(Number(spellInput.value)) } });
  }),
  makeButton("End Turn", () => {
    if (!roomId) return;
    client.send({ type: "END_TURN", payload: { roomId } });
  }),
  makeButton("Leave", () => {
    if (!roomId) return;
    client.send({ type: "LEAVE_ROOM", payload: { roomId } });
    pushNotice(`Left room ${roomId}`);
    roomId = "";
    snapshot = null;
    refresh();
  }),
);

root.append(controls, surface);
refresh();
