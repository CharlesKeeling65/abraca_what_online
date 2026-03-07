import type { GameSnapshot, ServerToClientMessage } from "../../../packages/shared/src/index";
import { WebGameClient } from "./network/client";
import { renderApp } from "./app/App";

const root = document.createElement("div");
const controls = document.createElement("div");
const statePanel = document.createElement("div");

let snapshot: GameSnapshot | null = null;
let roomId = "";

const client = new WebGameClient();

function toSpellId(v: number): 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 {
  if (v < 1 || v > 8 || Number.isNaN(v)) return 8;
  return v as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

function refresh(): void {
  statePanel.innerHTML = renderApp(snapshot);
}

function onMessage(msg: ServerToClientMessage): void {
  if (msg.type === "GAME_SNAPSHOT") {
    snapshot = msg.payload;
    roomId = msg.payload.room.roomId;
    refresh();
    return;
  }

  // eslint-disable-next-line no-alert
  alert(`${msg.type}: ${JSON.stringify(msg.payload)}`);
}

const wsInput = document.createElement("input");
wsInput.value = "ws://localhost:8080";

const nameInput = document.createElement("input");
nameInput.placeholder = "昵称";
nameInput.value = `player-${Math.floor(Math.random() * 1000)}`;

const roomInput = document.createElement("input");
roomInput.placeholder = "房间号（可空）";

const connectBtn = document.createElement("button");
connectBtn.innerText = "连接";
connectBtn.onclick = () => client.connect(wsInput.value, onMessage);

const createBtn = document.createElement("button");
createBtn.innerText = "建房";
createBtn.onclick = () => {
  client.send({ type: "CREATE_ROOM", payload: { nickname: nameInput.value, preferredRoomId: roomInput.value || undefined } });
};

const joinBtn = document.createElement("button");
joinBtn.innerText = "加入";
joinBtn.onclick = () => {
  client.send({ type: "JOIN_ROOM", payload: { roomId: roomInput.value, nickname: nameInput.value } });
};

const spellInput = document.createElement("input");
spellInput.type = "number";
spellInput.min = "1";
spellInput.max = "8";
spellInput.value = "8";

const declareBtn = document.createElement("button");
declareBtn.innerText = "宣言施法";
declareBtn.onclick = () => {
  if (!roomId) return;
  client.send({ type: "DECLARE_SPELL", payload: { roomId, spellId: toSpellId(Number(spellInput.value)) } });
};

const endTurnBtn = document.createElement("button");
endTurnBtn.innerText = "结束回合";
endTurnBtn.onclick = () => {
  if (!roomId) return;
  client.send({ type: "END_TURN", payload: { roomId } });
};

controls.append(wsInput, nameInput, roomInput, connectBtn, createBtn, joinBtn, spellInput, declareBtn, endTurnBtn);
root.append(controls, statePanel);
document.body.append(root);
refresh();
