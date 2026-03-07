import type { GameSnapshot } from "../../../../packages/shared/src/index";

export function renderApp(snapshot: GameSnapshot | null): string {
  if (!snapshot) {
    return `<p>尚未收到游戏快照，先创建或加入房间。</p>`;
  }

  const players = snapshot.room.players
    .map((p) => `<li>${p.nickname} | HP: ${p.hp} | Score: ${p.score} | Hand: ${p.handCount}</li>`)
    .join("");

  return `
  <p>房间：${snapshot.room.roomId}</p>
  <p>阶段：${snapshot.room.round.phase}</p>
  <p>当前玩家：${snapshot.room.round.currentPlayerId ?? "-"}</p>
  <ul>${players}</ul>
  `;
}
