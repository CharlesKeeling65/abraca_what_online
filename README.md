# Abraca What Online

跨端（手机端 + PC 端）与可自建服务器联机版《出包魔法师（Abraca... What?）》项目骨架。

## 目标

- 同一套规则引擎驱动：Web、桌面端、移动端。
- 服务端权威判定（authoritative server），支持房间联机。
- 支持自建服务器部署（Docker）。

## Monorepo 结构

- `packages/shared`：共享规则、状态机、协议类型。
- `apps/server`：联机服务器（房间管理、权威回合结算）。
- `apps/web`：浏览器客户端（PC 与手机浏览器可访问）。
- `apps/mobile`：移动端客户端骨架（可接 Expo/React Native）。
- `apps/desktop`：桌面端壳层骨架（可接 Tauri/Electron）。
- `infra/docker`：服务器容器化部署模板。
- `docs`：架构文档与开发路线。

## 快速开始（脚手架阶段）

当前仓库为**框架与数据结构阶段**，重点是可扩展目录、协议和核心状态模型，不包含完整可运行 UI。

建议下一步：
1. 选定客户端技术栈（React + React Native + Tauri）。
2. 实装 `packages/shared/src/engine` 中的规则细节。
3. 为 `apps/server` 接入 WebSocket 框架并打通房间同步。
