# Abraca What Online

跨端（手机端 + PC 端）与可自建服务器联机版《出包魔法师（Abraca... What?）》项目。

## 已实现（当前阶段）

- 共享规则核心数据结构（`packages/shared`）。
- 基础回合动作执行（宣言施法命中/失误与连击约束）。
- 可运行 WebSocket 服务器（建房、入房、回合同步、重同步）。
- 最小 Web 客户端页面（连接、建房、入房、宣言施法、结束回合）。
- Docker 自建部署模板。
- GitHub Actions：CI 类型检查 + Release 构建打包。

## Monorepo 结构

- `packages/shared`：共享规则、状态机、协议类型。
- `apps/server`：联机服务器（房间管理、权威回合结算）。
- `apps/web`：浏览器客户端。
- `apps/mobile`：移动端客户端骨架（可接 Expo/React Native）。
- `apps/desktop`：桌面端壳层骨架（可接 Tauri/Electron）。
- `infra/docker`：服务器容器化部署模板。
- `.github/workflows`：CI/CD。

## 本地开发

```bash
npm install
npm run typecheck
npm run build
npm run start:server
```

然后打开 `apps/web/src/main.ts` 所在前端工程（目前是最小 TS 页面骨架，可接入 Vite）。

## 下一步建议

1. 完成所有咒语效果（1~8）与回合结算规则。
2. 增加持久化（Redis/Postgres）与断线重连恢复。
3. 为 web/mobile 增加统一 UI 与状态管理（React + RN）。
4. 对接桌面打包（Tauri）和移动端构建发布流水线。
