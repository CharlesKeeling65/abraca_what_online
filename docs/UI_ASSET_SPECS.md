# UI 资源占位与替换规范（Web / Desktop / Android）

> 当前代码已经固定了一套资源命名合同。后续接入正式美术时，优先保持文件名与相对路径不变，这样可以做到近似“一键替换”。

## 1. 资源根目录

前端统一资源根目录约定为：

```text
apps/web/public/assets/
```

共享前缀定义在：

- `packages/shared/src/assets/assetManifest.ts`

运行时访问前缀：

```text
/assets
```

## 2. 目录结构

建议保持以下目录结构：

```text
apps/web/public/assets/
  backgrounds/
  spellstones/
  ui/
  dice/
```

Desktop 与 Android 如需单独打包资源，也建议镜像这套目录结构。

## 3. 桌面背景

| 文件名 | 推荐尺寸 | 使用位置 | 备注 |
| --- | --- | --- | --- |
| `backgrounds/board_desktop_1920x1080.png` | 1920 x 1080 | Windows / macOS 主牌桌背景 | 16:9 主背景。 |
| `backgrounds/board_web_1600x900.png` | 1600 x 900 | 浏览器桌面端背景 | 浏览器窗口安全区版本。 |
| `backgrounds/board_mobile_portrait_1080x1920.png` | 1080 x 1920 | Android 竖屏背景 | 顶部状态栏安全区留白。 |
| `backgrounds/board_mobile_landscape_1920x1080.png` | 1920 x 1080 | Android 横屏/平板背景 | 用于横屏或大屏设备。 |

### 当前代码中的落位

- Web 主场景容器：牌桌整体背景
- 未来 Desktop：窗口主场景底图
- 未来 Android：竖屏/横屏根背景

## 4. 咒语石资源

### 正面

| 文件名 | 尺寸 | 使用位置 |
| --- | --- | --- |
| `spellstones/spell_01_front_512.png` | 512 x 512 | 1 号咒语石正面 |
| `spellstones/spell_02_front_512.png` | 512 x 512 | 2 号咒语石正面 |
| `spellstones/spell_03_front_512.png` | 512 x 512 | 3 号咒语石正面 |
| `spellstones/spell_04_front_512.png` | 512 x 512 | 4 号咒语石正面 |
| `spellstones/spell_05_front_512.png` | 512 x 512 | 5 号咒语石正面 |
| `spellstones/spell_06_front_512.png` | 512 x 512 | 6 号咒语石正面 |
| `spellstones/spell_07_front_512.png` | 512 x 512 | 7 号咒语石正面 |
| `spellstones/spell_08_front_512.png` | 512 x 512 | 8 号咒语石正面 |

### 背面

| 文件名 | 尺寸 | 使用位置 |
| --- | --- | --- |
| `spellstones/spell_back_common_512.png` | 512 x 512 | 玩家手牌背面 / 通用咒语石背面 |
| `spellstones/spell_back_secret_512.png` | 512 x 512 | 秘密咒语石背面 |

### 当前代码中的落位

- Web 手牌区：`spell_back_common_512.png`
- Web 中央法术轨道：`spell_XX_front_512.png`
- 后续 Android 手牌与桌面区：直接复用

## 5. 骰子资源

| 文件名 | 尺寸 | 使用位置 |
| --- | --- | --- |
| `dice/dice_01_256.png` | 256 x 256 | 骰子 1 点 |
| `dice/dice_02_256.png` | 256 x 256 | 骰子 2 点 |
| `dice/dice_03_256.png` | 256 x 256 | 骰子 3 点 |
| `dice/dice_04_256.png` | 256 x 256 | 骰子 4 点 |
| `dice/dice_05_256.png` | 256 x 256 | 骰子 5 点 |
| `dice/dice_06_256.png` | 256 x 256 | 骰子 6 点 |

## 6. UI 组件资源

| 文件名 | 推荐尺寸 | 使用位置 | 备注 |
| --- | --- | --- | --- |
| `ui/avatar_frame_256.png` | 256 x 256 | 玩家头像框 | Desktop/Web 主规格。 |
| `ui/avatar_frame_mobile_192.png` | 192 x 192 | Android 玩家头像框 | 竖屏压缩版。 |
| `ui/button_primary_320x96.png` | 320 x 96 | 主操作按钮 | 建房、开始、宣言等。 |
| `ui/button_primary_mobile_280x88.png` | 280 x 88 | Android 主按钮 | 移动端紧凑版。 |
| `ui/score_tower_1024x2048.png` | 1024 x 2048 | 分数塔 / 计分板 | 可拆层。 |
| `ui/token_life_128.png` | 128 x 128 | 生命指示物 | 透明背景。 |
| `ui/token_score_128.png` | 128 x 128 | 分数指示物 | 透明背景。 |

### 当前 Web UI 的锚点区域

- 牌桌中央占位块：
  - `ui/score_tower_1024x2048.png`
  - `ui/avatar_frame_256.png`
  - `ui/button_primary_320x96.png`
- 玩家区：
  - 后续替换头像框和状态饰条

## 7. 命名规范

推荐统一格式：

```text
{category}/{name}_{size}.{ext}
```

示例：

- `spellstones/spell_04_front_512.png`
- `backgrounds/board_mobile_portrait_1080x1920.png`
- `ui/button_primary_320x96.png`

如果需要多倍率资源：

```text
{category}/{name}_{size}@2x.{ext}
{category}/{name}_{size}@3x.{ext}
```

Android 建议提供：

- `@2x`
- `@3x`

## 8. 平台替换策略

### Web

1. 把正式资源放入 `apps/web/public/assets/`
2. 保持文件名不变
3. 重新执行 `npm run build:web`

### Desktop（Windows / macOS）

1. 先执行 `npm run build:web`
2. 将 `dist/web` 作为桌面壳静态资源
3. 如需单独桌面贴图，仍保持相同相对路径和文件名

### Android

1. 优先复用同名资源
2. 对移动端单独尺寸使用 `mobile` 版本命名
3. 若使用 Expo/React Native，建议建立同构映射表，路径名与本规范保持一致

## 9. 当前代码中已固化的命名来源

- 背景命名：`getBoardBackgroundAsset(...)`
- 咒语石命名：`getSpellStoneAssetName(...)`

对应文件：

- [assetManifest.ts](/Users/wyb/File/Programming/Git_Code/abraca_what_online/packages/shared/src/assets/assetManifest.ts)
- [App.ts](/Users/wyb/File/Programming/Git_Code/abraca_what_online/apps/web/src/app/App.ts)
