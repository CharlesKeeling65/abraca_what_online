# Abraca What Online

跨端（手机端 + PC 端）与可自建服务器联机版《出包魔法师（Abraca... What?）》项目。

## 已实现（当前阶段）

- 共享规则核心：开局发牌、回合宣言、连击校验、咒语效果（1~8 基础逻辑）、回合结束与基础计分。
- 房间流程：创建房间、加入房间、准备/取消准备、房主开始游戏、离开房间。
- Web 真实交互模拟：支持 `mock://local` 一键本地模拟联机流程，完整体验从入房到出牌。
- 响应式 UI 与桌游场景占位：桌面/移动布局、自适应面板、牌面/桌面资源占位尺寸提示。
- CI/CD：GitHub Actions 提供 `typecheck + build`，并在 `v*` 标签自动打包发布。

## 本地运行

```bash
npm install
npm run typecheck
npm run build
npm run start:server
```

Web 端建议先使用 `mock://local` 进行无后端调试，再替换为真实 WS 地址。

## 文档

- 游戏规则开发参考：`RULES_ABRACA_WHAT_DEV_REFERENCE.md`
- 架构说明：`docs/ARCHITECTURE.md`
- UI 资源规格：`docs/UI_ASSET_SPECS.md`
