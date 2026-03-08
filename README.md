# Abraca What Online

《出包魔法师（Abraca... What?）》跨端联机工程仓库。这个仓库的目标是沉淀一套可复用的共享规则层、权威服务端和多端客户端骨架，而不是只做单机规则模拟。

当前状态可以概括为：`shared + server` 已经形成最小可验证闭环，`web` 仍偏原型，`mobile / desktop` 仍是后续扩展位。更完整的审计见 [docs/PROJECT_STATUS.md](/Users/wyb/File/Programming/Git_Code/abraca_what_online/docs/PROJECT_STATUS.md)。

## 仓库结构

- `packages/shared`
  共享游戏常量、模型、协议、开局/回合/计分引擎。
- `apps/server`
  权威服务端，当前提供 HTTP 健康检查和 WebSocket 房间消息入口。
- `apps/web`
  Web 端源码骨架，当前仍以本地 mock 调试和 UI 占位为主。
- `apps/mobile`
  移动端网络层和状态层骨架。
- `apps/desktop`
  桌面端方向说明，计划复用 Web 客户端并用 Tauri 封装。
- `infra/docker`
  Dockerfile 和 `docker-compose` 运行模板。
- `tests`
  Node 原生测试，覆盖房间流程与 HTTP/WebSocket 运行时。
- `docs`
  架构、状态审计、UI 资源规范和实现计划。

## 最终目标与当前差距

### 最终目标

- 共享规则层可以稳定支撑 Web / Mobile / Desktop。
- 服务端作为权威状态机，负责联机、校验、广播和后续重连恢复。
- 客户端只负责 UI、输入和渲染。
- 通过 Docker 和 GitHub Actions 完成构建、验证、发布和部署。

### 当前已完成

- 基础规则模型、房间流程、部分咒语结算。
- 内存态房间网关 `WsGateway`。
- 真实 HTTP + WebSocket 服务入口：
  - `GET /health`
  - `ws://<host>:<port>/ws`
- Node 原生自动化测试。
- GitHub Actions 的 CI 与基于 tag 的 Release。
- Docker 构建入口。

### 当前仍未完成

- Web 端还没有正式 bundler 和可交付浏览器构建产物。
- Mobile / Desktop 仍是骨架。
- 规则边界测试还不够完整。
- 服务端还没有持久化、鉴权、重连和观战。

## 本地环境要求

- Node.js 20+
- npm 10+
- Docker / Docker Compose（如果要测试容器部署）

## 安装依赖

```bash
npm install
```

## 如何测试

### 1. 类型检查

```bash
npm run typecheck
```

### 2. 自动化测试

```bash
npm test
```

这会执行两步：

1. `tsc -p tsconfig.json`
2. `node --test dist/tests/**/*.test.js`

当前测试覆盖：

- `tests/shared/game-flow.test.ts`
  验证建房、入房、准备、开始游戏的网关流程。
- `tests/server/http-ws.test.ts`
  验证真实 HTTP 健康检查和 WebSocket 建房快照返回。

### 3. 冒烟验证

```bash
npm run smoke
```

这个脚本会在无真实网络监听的情况下跑一遍内存网关流程，适合作为快速回归检查。

### 4. 一键校验

```bash
npm run verify
```

它会串行执行：

1. `npm run typecheck`
2. `npm run test`
3. `npm run smoke`

## 如何运行

### 1. 构建

```bash
npm run build
```

产物会输出到 `dist/`。

### 2. 启动服务端

```bash
npm run start:server
```

默认环境变量：

- `HOST=0.0.0.0`
- `PORT=8080`

启动后可用地址：

- 健康检查: `http://127.0.0.1:8080/health`
- WebSocket: `ws://127.0.0.1:8080/ws`

### 3. 自定义端口启动

```bash
HOST=127.0.0.1 PORT=9000 npm run start:server
```

### 4. Web 端现状说明

当前 `apps/web` 仍是源码骨架，没有正式 Vite/webpack 构建链，因此它更适合作为前端实现参考，而不是直接发布产物。现阶段推荐开发顺序是：

1. 先完善 `packages/shared` 和 `apps/server`
2. 再为 `apps/web` 补正式 bundler
3. 最后推进 Mobile / Desktop

## Docker 运行

### 1. 构建镜像

```bash
docker build -f infra/docker/Dockerfile.server -t abraca-what-online-server .
```

### 2. 启动容器

```bash
docker run --rm -p 8080:8080 abraca-what-online-server
```

### 3. 使用 Compose

```bash
docker compose -f infra/docker/docker-compose.yml up --build
```

## GitHub Actions CI/CD

### CI

工作流文件：[`ci.yml`](/Users/wyb/File/Programming/Git_Code/abraca_what_online/.github/workflows/ci.yml)

触发条件：

- 任意分支 push
- pull request

执行内容：

1. `npm ci`
2. `npm run verify`

这意味着每次提交都会至少经过类型检查、HTTP/WebSocket 测试和冒烟回归。

### Release

工作流文件：[`release.yml`](/Users/wyb/File/Programming/Git_Code/abraca_what_online/.github/workflows/release.yml)

触发条件：

- 推送 `v*` 标签，例如 `v0.3.0`

执行内容：

1. `npm ci`
2. `npm run verify`
3. 打包 `dist + docs + infra + package*.json + README`
4. 创建 GitHub Release
5. 构建并推送 GHCR 镜像 `ghcr.io/<owner>/abraca-what-online-server`

### 建议的发布步骤

```bash
npm run verify
git tag v0.3.0
git push origin v0.3.0
```

触发后 GitHub Actions 会自动完成 release artifact 和容器镜像发布。

## 软件构建与发布建议

### 当前建议

- 把服务端作为首个正式交付目标。
- 客户端先以协议兼容和界面原型为目标，不要过早承诺三端同步上线。
- 版本发布优先用 Git tag 驱动，避免手工打包。

### 下一步推荐增强

- 为 `apps/web` 增加 Vite，提供真实浏览器开发和生产打包。
- 将 Release 拆成 `staging` 与 `production` 两套环境。
- 为 Docker 镜像增加镜像扫描和 SBOM。
- 增加规则覆盖率统计与 lint 流水线。

## 后续开发建议

### 推荐的开发顺序

1. 先补 `packages/shared` 的完整规则测试，覆盖结算、边界和低人数规则。
2. 再补 `apps/server` 的重连、心跳和持久化。
3. 再补 `apps/web` 的正式构建链和真实 UI。
4. 最后再推进 `apps/mobile` 与 `apps/desktop`。

### 推荐工作方式

1. 任何规则变更优先改 `packages/shared`
2. 先写测试，再补实现
3. 用 `npm run verify` 作为提交前最小门槛
4. 功能分支合并前至少保证 CI 全绿

## 相关文档

- 规则整理：[RULES_ABRACA_WHAT_DEV_REFERENCE.md](/Users/wyb/File/Programming/Git_Code/abraca_what_online/RULES_ABRACA_WHAT_DEV_REFERENCE.md)
- 架构说明：[docs/ARCHITECTURE.md](/Users/wyb/File/Programming/Git_Code/abraca_what_online/docs/ARCHITECTURE.md)
- 项目状态审计：[docs/PROJECT_STATUS.md](/Users/wyb/File/Programming/Git_Code/abraca_what_online/docs/PROJECT_STATUS.md)
- UI 资源规格：[docs/UI_ASSET_SPECS.md](/Users/wyb/File/Programming/Git_Code/abraca_what_online/docs/UI_ASSET_SPECS.md)
- 本次实施计划：[docs/plans/2026-03-08-repo-hardening.md](/Users/wyb/File/Programming/Git_Code/abraca_what_online/docs/plans/2026-03-08-repo-hardening.md)
