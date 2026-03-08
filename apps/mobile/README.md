# Mobile Client Foundation

当前移动端的推荐方向是 React Native + Expo，优先支持主流 Android 设备。

## 设计原则

- 复用 `packages/shared` 的协议、规则和资源命名。
- 复用 Web 端的场景分区，而不是重新发明一套 UI 语义。
- 移动端优先竖屏，必要时再扩展平板横屏。

## 推荐结构

- `src/network`
  WebSocket、重连、心跳与离线恢复。
- `src/state`
  会话状态、房间快照和界面状态。
- `src/app`
  基于 Web 场景模型的移动视图层。

## Android 优先级

1. 大厅与房间流程
2. 对局桌面与手牌交互
3. 断线恢复与通知
4. 资源替换与性能调优

## 资源复用

后续接图时请优先遵循 [docs/UI_ASSET_SPECS.md](/Users/wyb/File/Programming/Git_Code/abraca_what_online/docs/UI_ASSET_SPECS.md) 中的路径和命名，这样 Android、Web、Desktop 可以共用一套资产索引。
