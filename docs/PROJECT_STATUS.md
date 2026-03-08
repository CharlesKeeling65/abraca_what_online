# Project Status Audit

更新时间：2026-03-08

## 仓库目标

这个仓库的目标不是单纯做一个规则计算器，而是搭建《出包魔法师（Abraca... What?）》的跨端联机工程底座：

- `packages/shared` 负责共享规则、模型、协议。
- `apps/server` 负责权威服务端、房间状态、联机消息转发。
- `apps/web` 负责浏览器端体验。
- `apps/mobile` 与 `apps/desktop` 负责后续跨端落地。

## 当前已完成

### 1. 规则与房间最小闭环

- 已有基础咒语池、初始发牌、秘密石、生命值和计分模型。
- 已支持创建房间、加入房间、准备、开始游戏、回合宣言、结束回合。
- 已有基础连击顺序校验和部分咒语效果结算。

### 2. 服务端运行能力

- 新增真实 HTTP + WebSocket 入口。
- `GET /health` 可用于健康检查。
- `ws://<host>:<port>/ws` 可接入客户端并透传现有 `WsGateway` 逻辑。

### 3. 自动化验证

- 新增 Node 原生测试：
  - 网关房间流程测试
  - HTTP 健康检查测试
  - WebSocket 建房/快照返回测试
- `npm run test`、`npm run verify` 可直接用于本地和 CI。

### 4. 工程交付骨架

- 已有 Dockerfile 与 compose 模板。
- 已有 GitHub Actions 的 CI 与 Release 工作流。

## 仍未完善的部分

### P0: 还未形成真正可上线的完整游戏

- Web 客户端仍以源码骨架和本地 mock 调试为主，缺少正式 bundler/dev server 方案。
- Mobile 与 Desktop 仍是占位骨架，没有可运行应用壳。
- 规则结算尚未覆盖完整边界：
  - 低人数移除牌规则
  - 多人同时濒死/同时结算的次序
  - 平手规则核验
  - 轮结束后的完整下一轮重置

### P1: 服务端仍是 MVP

- 房间状态保存在内存，进程重启即丢失。
- 没有身份鉴权、重连恢复、心跳超时和观战。
- 没有持久化日志、埋点、限流、管理接口。

### P1: 前端体验仍不足

- 当前没有正式 UI 资源接入，仍大量使用占位内容。
- 没有可视化的手牌、自身私有信息显示与动画。
- 没有错误态、重连态、房间满员/断线等交互细节。

### P2: 研发配套仍可继续加强

- 暂无 ESLint / Prettier / commit conventions。
- 暂无分层单元测试覆盖率门槛。
- 暂无部署环境矩阵（dev/staging/prod）和 secrets 说明。

## 建议的下一阶段工作顺序

1. 给 `apps/web` 增加正式 Vite 构建与浏览器运行入口，替换当前仅源码级骨架。
2. 把 `packages/shared` 的规则测试补齐到回合结束、计分和边界规则。
3. 在服务端加入重连恢复、心跳和房间状态持久化。
4. 再推进 React Native / Tauri，避免在底层协议未稳定前同时扩展三端。

## 分支清理结论

截至本次检查，以下远端 `codex/` 分支都已经合并进 `origin/main`，可安全删除：

- `origin/codex/document-game-rules-and-card-details-in-markdown`
- `origin/codex/document-game-rules-and-card-details-in-markdown-hqduwz`
- `origin/codex/document-game-rules-and-card-details-in-markdown-lzf7h3`
- `origin/codex/document-game-rules-and-card-details-in-markdown-qmatke`
