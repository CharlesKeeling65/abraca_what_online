import type { GameSnapshot } from "../../../../packages/shared/src/index";

function spellStatRow(snapshot: GameSnapshot): string {
  return [1, 2, 3, 4, 5, 6, 7, 8]
    .map((id) => `<div class="chip">${id}: ${snapshot.room.board.playedCountBySpell[id as 1]}</div>`)
    .join("");
}

function playerRow(snapshot: GameSnapshot): string {
  return snapshot.room.players
    .map(
      (p) => `
      <div class="player-card ${snapshot.room.round.currentPlayerId === p.playerId ? "active" : ""}">
        <div class="name">${p.nickname}${p.playerId === snapshot.room.hostPlayerId ? " (Host)" : ""}</div>
        <div>HP ${p.hp} / Score ${p.score}</div>
        <div>Hand ${p.handCount} | ${p.isReady ? "✅ Ready" : "⏳ Not Ready"}</div>
      </div>`,
    )
    .join("");
}

export function renderApp(snapshot: GameSnapshot | null): string {
  if (!snapshot) {
    return `<section class="panel"><h3>欢迎来到《出包魔法师》线上版</h3><p>请先连接并创建/加入房间。</p></section>`;
  }

  return `
  <section class="layout">
    <div class="panel lobby">
      <h3>房间 ${snapshot.room.roomId}</h3>
      <p>阶段：<b>${snapshot.room.round.phase}</b></p>
      <p>回合：#${snapshot.room.round.roundNo} / 当前行动：${snapshot.room.round.currentPlayerId ?? "-"}</p>
      <p>牌库剩余：${snapshot.room.round.deckRemaining} | 秘密石：${snapshot.room.round.secretStonesRemaining}</p>
      <div class="spell-stats">${spellStatRow(snapshot)}</div>
    </div>

    <div class="panel table">
      <h3>桌面区域（占位）</h3>
      <div class="table-placeholder">桌面贴图占位（Desktop 1920×1080 / Mobile 1080×1920）</div>
      <div class="cards-row">
        <div class="card-placeholder">咒语石正面占位 512×512</div>
        <div class="card-placeholder">咒语石背面占位 512×512</div>
        <div class="card-placeholder">玩家头像框占位 256×256</div>
      </div>
    </div>

    <div class="panel players">
      <h3>玩家状态</h3>
      <div class="player-grid">${playerRow(snapshot)}</div>
    </div>
  </section>
  `;
}

export const APP_STYLE = `
  :root { color-scheme: dark; }
  body { margin:0; font-family: Inter, system-ui, sans-serif; background:#18122B; color:#F6F6F6; }
  .root { padding: 16px; max-width: 1200px; margin: 0 auto; }
  .controls { display:grid; grid-template-columns: repeat(12, 1fr); gap:8px; margin-bottom:16px; }
  .controls input, .controls button { padding:10px; border-radius:10px; border:1px solid #7A5AF8; background:#241B3B; color:#F6F6F6; }
  .controls button { cursor:pointer; background:#7A5AF8; border:none; font-weight:600; }
  .layout { display:grid; grid-template-columns: 1fr 1.4fr 1fr; gap:12px; }
  .panel { background:#241B3B; border-radius:16px; padding:12px; border:1px solid #3C2D63; }
  .spell-stats { display:flex; flex-wrap:wrap; gap:6px; }
  .chip { background:#3C2D63; padding:6px 8px; border-radius:999px; font-size:12px; }
  .table-placeholder { border:1px dashed #7A5AF8; border-radius:12px; padding:20px; text-align:center; margin:10px 0; }
  .cards-row { display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; }
  .card-placeholder { min-height:90px; border:1px dashed #9D8DFF; border-radius:10px; display:flex; align-items:center; justify-content:center; text-align:center; padding:8px; font-size:12px; }
  .player-grid { display:grid; gap:8px; }
  .player-card { background:#2E2450; border-radius:10px; padding:8px; border:1px solid transparent; }
  .player-card.active { border-color:#C4B5FD; box-shadow:0 0 0 1px #C4B5FD inset; }
  .name { font-weight:700; margin-bottom:4px; }
  @media (max-width: 900px) {
    .layout { grid-template-columns: 1fr; }
    .controls { grid-template-columns: 1fr 1fr; }
  }
`;
