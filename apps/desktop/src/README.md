# Desktop Client Foundation

建议优先使用 Tauri，为 Windows / macOS 提供统一桌面壳。

## 原则

- 直接复用 `dist/web` 作为前端界面基础。
- 与服务器通信时完全复用 `packages/shared/src/protocol`。
- 桌面端只额外补充系统通知、本地缓存、窗口管理和日志采集。

## 目录建议

- `src-tauri`
  Tauri 原生层，负责打包、系统能力和安装产物。
- `src`
  如需桌面特有前端逻辑，可在这里补充，但应尽量保持与 `apps/web` 同构。

## 打包策略

1. 先执行 `npm run build:web`
2. 将 `dist/web` 作为桌面壳静态资源
3. 再执行 Tauri 的平台打包

## 资源替换

所有桌面端图片命名和落位应与 [docs/UI_ASSET_SPECS.md](/Users/wyb/File/Programming/Git_Code/abraca_what_online/docs/UI_ASSET_SPECS.md) 保持一致，避免 Windows / macOS 分别维护两套资产。
