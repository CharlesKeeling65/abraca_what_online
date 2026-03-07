import type { RoomState } from "../models/gameModels";

/**
 * 轮结束判定与计分框架。
 * 这里只提供骨架，具体细节可逐步补齐：
 * - 清空手牌胜利
 * - 攻击击倒胜利
 * - 自残/意外出局
 * - 猫头鹰额外分
 */
export function resolveRoundIfNeeded(room: RoomState): RoomState {
  // TODO: 根据完整规则实现轮结束检测 + 计分。
  return room;
}
