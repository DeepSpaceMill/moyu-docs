---
title: Steam API
sidebar:
  order: 8
---

Steam API 通过 `executePluginCommand('steam', ...)` 调用，提供 Achievement、DLC、Overlay、Stats、Timeline、用户信息和 Workshop 查询能力。

Steam 插件只在 Windows、Linux 和 macOS 桌面端启用。Web、Android 和 iOS 不会注册该插件。

本文档中列出的大部分命令都对应 Steamworks SDK 的原生 API，少部分为基于原生 API 的轻量封装。命令的参数和返回值经过 JS wrapper 处理，可能与原生 API 略有差异。你可以与 Steamworks SDK 文档对照，了解原生 API 的更多细节。

## 启用 Steam

在项目的 `index.json` 中增加 `steam` 配置：

```json
{
  "steam": {
    "appId": 480,
    "required": true,
    "restartThroughClient": false
  }
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `appId` | `number` | `0` | Steam App ID。启用 Steam 时应填写有效的非零 App ID |
| `required` | `boolean` | `false` | 初始化失败时是否终止游戏。为 `false` 时游戏继续启动，但不会注册 `steam` 插件 |
| `restartThroughClient` | `boolean` | `false` | 启动时调用 Steam 的 restart gate；需要重启时，当前进程退出，由 Steam 客户端重新启动游戏 |

Steam API 动态库必须位于系统或可执行文件能够加载的位置，建议放置在可执行文件同目录下。

不同平台的动态库名称如下：

- Windows：`steam_api64.dll`
- Linux：`libsteam_api.so`
- macOS：`libsteam_api.dylib`

:::caution
当前打包流程不会自动复制 Steam API 动态库，需要在发布流程中自行准备。
:::

当 `required: false` 且 Steam 动态库或客户端不可用时，游戏仍会启动，但调用 `executePluginCommand('steam', ...)` 会因为插件不存在而失败。

Steam 离线模式下能否初始化、读取已有数据以及稍后同步，由 Steam 客户端和 Steamworks SDK 决定。引擎不维护另一份 Stats 或 Achievement 缓存，也不提供同步完成状态。

## 调用与返回值

```typescript
import { executePluginCommand } from '@momoyu-ink/kit';

const unlocked = executePluginCommand('steam', {
  subCommand: 'achievementGet',
  name: 'ACH_WIN_ONE_GAME',
});
```

Steam commands 当前都是同步命令。文档中的 `void` 表示没有返回值；查询命令可能返回普通值或 `null`。命令失败时通常会抛出 command error；`statsGetAchievement`、`statsGetFloatStat` 和 `statsGetIntStat` 会把 Steam 查询失败转换为 `null`。

以下 ID 使用不同的 JS 类型：

- App ID：`number`（32 位）
- Account ID：`number`（32 位）
- 完整 CSteamID：十进制 `string`（64 位）
- Workshop item ID：十进制 `string`（64 位）
- DLC 下载字节数：十进制 `string`（64 位）

64 位整数使用字符串，避免超过 JavaScript 的安全整数范围。

## Achievement

Achievement commands 是常用操作的高层封装。`achievementSet`、`achievementClear` 和 `achievementClearAll` 会在修改后立即调用 Steam `StoreStats`；Stats 分组中的对应命令则不会自动提交。

### achievementSet — 解锁 Achievement

```typescript
executePluginCommand('steam', {
  subCommand: 'achievementSet',
  name: 'ACH_WIN_ONE_GAME',
});
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | Steamworks 后台配置的 Achievement API Name |

返回 `void`。命令依次调用 `SetAchievement` 和 `StoreStats`。API Name 不存在、Stats 尚未就绪或任一 Steam 调用失败时返回错误。

### achievementClear — 清除解锁状态

```typescript
executePluginCommand('steam', {
  subCommand: 'achievementClear',
  name: 'ACH_WIN_ONE_GAME',
});
```

返回 `void`。命令依次调用 `ClearAchievement` 和 `StoreStats`。它只清除指定 Achievement 的解锁状态，不会重置与其关联的 Stat。

### achievementClearAll — 清除全部 Achievement

```typescript
executePluginCommand('steam', {
  subCommand: 'achievementClearAll',
});
```

返回 `void`。命令从 Steam 枚举当前 App 的 Achievement，逐个调用 `ClearAchievement`，最后调用一次 `StoreStats`。它不会重置游戏 Stats。

### achievementGet — 查询解锁状态

```typescript
const unlocked = executePluginCommand('steam', {
  subCommand: 'achievementGet',
  name: 'ACH_WIN_ONE_GAME',
});
// boolean
```

返回 `boolean`。API Name 不存在或 Steam 查询失败时返回 command error，不返回 `null`。

### achievementIndicateProgress — 显示进度通知

```typescript
executePluginCommand('steam', {
  subCommand: 'achievementIndicateProgress',
  name: 'ACH_WIN_100_GAMES',
  current: 40,
  max: 100,
});
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | Achievement API Name |
| `current` | `number` | 32 位无符号整数，必须小于 `max` |
| `max` | `number` | 大于 0 的 32 位无符号整数 |

返回 `void`。该命令调用 `IndicateAchievementProgress`，只在 Steam Overlay 中显示一次进度通知，不保存进度，也不会自动解锁 Achievement。

## Apps 与 DLC

### appsDlcInstalled — 查询 DLC 是否已安装

```typescript
const installed = executePluginCommand('steam', {
  subCommand: 'appsDlcInstalled',
  appId: 123456,
});
// boolean
```

返回 `boolean`。只有用户拥有指定 DLC 且 DLC 已安装时才返回 `true`。

### appsDlcProgress — 查询 DLC 下载进度

```typescript
const progress = executePluginCommand('steam', {
  subCommand: 'appsDlcProgress',
  appId: 123456,
});
// { downloadedBytes: string; totalBytes: string } | null
```

返回值：

```typescript
type DlcProgress = {
  downloadedBytes: string;
  totalBytes: string;
};
```

没有正在进行的下载时返回 `null`。两个字节数字段均为十进制字符串。

### appsGetAppBuildId — 获取 Build ID

```typescript
const buildId = executePluginCommand('steam', {
  subCommand: 'appsGetAppBuildId',
});
// number
```

返回当前 App 的 Steam Build ID。

### appsGetCurrentBetaName — 获取 Beta 分支名

```typescript
const beta = executePluginCommand('steam', {
  subCommand: 'appsGetCurrentBetaName',
});
// string | null
```

当前不在 Beta 分支时返回 `null`。

### appsGetCurrentGameLanguage — 获取游戏语言

```typescript
const language = executePluginCommand('steam', {
  subCommand: 'appsGetCurrentGameLanguage',
});
// string
```

返回用户为当前游戏选择的语言；未单独设置时，Steam 会使用客户端 UI 语言。

### appsGetSteamUiLanguage — 获取 Steam UI 语言

```typescript
const language = executePluginCommand('steam', {
  subCommand: 'appsGetSteamUiLanguage',
});
// string
```

返回 Steam 客户端当前使用的语言。

### appsInstallDlc — 请求安装 DLC

```typescript
executePluginCommand('steam', {
  subCommand: 'appsInstallDlc',
  appId: 123456,
});
```

返回 `void`。命令向 Steam 发起安装请求，不等待下载开始或完成，也不能通过返回值确认安装结果。可使用 `appsDlcProgress` 查询下载进度。

### appsIsSubscribedApp — 查询 App 所有权

```typescript
const subscribed = executePluginCommand('steam', {
  subCommand: 'appsIsSubscribedApp',
  appId: 123456,
});
// boolean
```

返回当前用户是否订阅指定 App。该接口适合检查与当前游戏关联的 App，例如 Demo。

### appsUninstallDlc — 请求卸载 DLC

```typescript
executePluginCommand('steam', {
  subCommand: 'appsUninstallDlc',
  appId: 123456,
});
```

返回 `void`。命令向 Steam 发起卸载请求，不等待卸载完成，也不能通过返回值确认最终结果。

## Overlay

Overlay 是否实际显示还取决于 Steam 客户端状态、游戏启动方式和用户设置。激活类命令只负责发起请求，不会等待 Overlay 打开。

### overlayActivate — 打开 Overlay 页面

```typescript
executePluginCommand('steam', {
  subCommand: 'overlayActivate',
  dialog: 'achievements',
});
```

`dialog` 支持：

```typescript
type OverlayDialog =
  | 'friends'
  | 'community'
  | 'players'
  | 'settings'
  | 'officialGameGroup'
  | 'stats'
  | 'achievements';
```

返回 `void`。

### overlayActivateToStore — 打开商店页面

```typescript
executePluginCommand('steam', {
  subCommand: 'overlayActivateToStore',
  appId: 123456,
  flag: 'none',
});
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `appId` | `number` | — | 要打开的 App ID |
| `flag` | `'none' \| 'addToCart' \| 'addToCartAndShow'` | `'none'` | 商店页面的购物车行为 |

返回 `void`。

### overlayActivateToWebPage — 打开网页

```typescript
executePluginCommand('steam', {
  subCommand: 'overlayActivateToWebPage',
  url: 'https://example.com',
});
```

返回 `void`。URL 会在 Steam Overlay 的网页视图中打开。

### overlayIsEnabled — 查询 Overlay 是否启用

```typescript
const enabled = executePluginCommand('steam', {
  subCommand: 'overlayIsEnabled',
});
// boolean
```

返回 Steam Overlay 当前是否启用。

### overlayNeedsPresent — 查询 Overlay 是否需要 Present

```typescript
const needsPresent = executePluginCommand('steam', {
  subCommand: 'overlayNeedsPresent',
});
// boolean
```

返回 Steam Overlay 当前是否要求游戏继续提交画面帧。

### overlaySetNotificationPosition — 设置通知位置

```typescript
executePluginCommand('steam', {
  subCommand: 'overlaySetNotificationPosition',
  position: 'topRight',
});
```

`position` 支持：

```typescript
type OverlayNotificationPosition =
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight';
```

返回 `void`。该设置影响 Achievement 等 Steam Overlay 通知的位置。

## Stats

Stats commands 直接对应 Steam User Stats API。所有 set/clear 操作只修改 Steam 客户端内存中的状态，调用后需要执行 `statsStoreStats` 才会请求持久化。

### statsClearAchievement — 清除 Achievement

```typescript
executePluginCommand('steam', {
  subCommand: 'statsClearAchievement',
  name: 'ACH_WIN_ONE_GAME',
});
```

返回 `void`。只修改内存状态，不自动调用 `StoreStats`。

### statsGetAchievement — 查询 Achievement

```typescript
const unlocked = executePluginCommand('steam', {
  subCommand: 'statsGetAchievement',
  name: 'ACH_WIN_ONE_GAME',
});
// boolean | null
```

返回 `boolean | null`。API Name 不存在、Stats 尚未就绪或 Steam 查询失败时返回 `null`。

### statsGetFloatStat — 读取 Float Stat

```typescript
const distance = executePluginCommand('steam', {
  subCommand: 'statsGetFloatStat',
  name: 'FeetTraveled',
});
// number | null
```

返回 `number | null`。Stat 不存在、类型不匹配或 Steam 查询失败时返回 `null`。

### statsGetIntStat — 读取 Int Stat

```typescript
const wins = executePluginCommand('steam', {
  subCommand: 'statsGetIntStat',
  name: 'NumWins',
});
// number | null
```

返回 `number | null`。Stat 不存在、类型不匹配或 Steam 查询失败时返回 `null`。

### statsSetAchievement — 设置 Achievement

```typescript
executePluginCommand('steam', {
  subCommand: 'statsSetAchievement',
  name: 'ACH_WIN_ONE_GAME',
});
```

返回 `void`。只修改内存状态，不自动调用 `StoreStats`。

### statsIndicateAchievementProgress — 显示进度通知

```typescript
executePluginCommand('steam', {
  subCommand: 'statsIndicateAchievementProgress',
  name: 'ACH_WIN_100_GAMES',
  current: 40,
  max: 100,
});
```

返回 `void`。`max` 必须大于 0，`current` 必须小于 `max`。该命令只显示 Overlay 通知，不保存 Stat，也不自动解锁 Achievement。

### statsListAchievements — 枚举 Achievement

```typescript
const names = executePluginCommand('steam', {
  subCommand: 'statsListAchievements',
});
// string[]
```

返回当前 App 在 Steamworks 后台配置的 Achievement API Name 数组。Steam 枚举失败时返回 command error；当前 wrapper 也会把 Achievement 数量为 `0` 视为枚举失败。

### statsSetFloatStat — 写入 Float Stat

```typescript
executePluginCommand('steam', {
  subCommand: 'statsSetFloatStat',
  name: 'FeetTraveled',
  value: 2640,
});
```

返回 `void`。值在 Rust 侧转换为 Steam 使用的 32 位浮点数。命令只修改内存状态，需要随后调用 `statsStoreStats`。

Stat 的更新规则由 Steamworks 后台配置决定。例如累计 Stat 可能拒绝降低数值，此时命令返回 `Steam SetStat failed`。

### statsSetIntStat — 写入 Int Stat

```typescript
executePluginCommand('steam', {
  subCommand: 'statsSetIntStat',
  name: 'NumWins',
  value: 10,
});
```

返回 `void`。`value` 是 32 位有符号整数。命令只修改内存状态，需要随后调用 `statsStoreStats`。

### statsStoreStats — 提交 Stats 与 Achievement

```typescript
executePluginCommand('steam', {
  subCommand: 'statsStoreStats',
});
```

返回 `void`。命令调用 Steam `StoreStats`，提交此前在内存中修改的 Stats 和 Achievement。返回成功表示 Steam 接受了这次同步调用；最终存储结果由 Steam callback 报告，当前 JS API 不单独暴露该 callback。

## Achievement 进度与 Stat

Steam Achievement 本身保存的是解锁状态。Steam 页面上显示的持久化数值进度通常来自后台关联的 Stat，而 `achievementIndicateProgress` / `statsIndicateAchievementProgress` 只负责显示一次 Overlay 通知。

以 Spacewar 的累计距离 Achievement 为例：

```typescript
// 1. 写入关联的 Float Stat
executePluginCommand('steam', {
  subCommand: 'statsSetFloatStat',
  name: 'FeetTraveled',
  value: 2640,
});

// 2. 提交到 Steam
executePluginCommand('steam', {
  subCommand: 'statsStoreStats',
});

// 3. 需要通知时，单独显示 Overlay 进度
executePluginCommand('steam', {
  subCommand: 'achievementIndicateProgress',
  name: 'ACH_TRAVEL_FAR_ACCUM',
  current: 2640,
  max: 5280,
});
```

Achievement 与 Stat 的 API Name 由游戏自己的 Steamworks 后台配置决定，引擎不推导两者的对应关系，也不会根据 Stat 数值自动解锁 Achievement。需要解锁时，由游戏逻辑显式调用 `achievementSet` 或 `statsSetAchievement`。

## Timeline

Timeline commands 需要当前 Steam 客户端提供 Timeline interface。接口不可用时命令返回错误。

### timelineAddEvent — 添加 Timeline 事件

```typescript
executePluginCommand('steam', {
  subCommand: 'timelineAddEvent',
  icon: 'boss',
  title: 'Boss defeated',
  description: 'Defeated the chapter boss',
  priority: 100,
  startOffsetSeconds: 0,
  durationSeconds: 5,
  possibleClip: 'featured',
});
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `icon` | `string` | — | Steamworks 后台配置的 Timeline icon 名称 |
| `title` | `string` | — | 事件标题 |
| `description` | `string` | — | 事件描述 |
| `priority` | `number` | `0` | 事件优先级，必须为 `0` 到 `1000` 的整数 |
| `startOffsetSeconds` | `number` | `0` | 相对当前时刻的起始偏移秒数，直接转换为 32 位浮点数传给 Steam |
| `durationSeconds` | `number` | `0` | 持续时间，必须是非负有限数 |
| `possibleClip` | `'none' \| 'standard' \| 'featured'` | `'none'` | 该事件是否适合作为 Steam Game Recording clip |

返回 `void`。

### timelineClearStateDescription — 清除状态描述

```typescript
executePluginCommand('steam', {
  subCommand: 'timelineClearStateDescription',
  timeDeltaSeconds: 0,
});
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `timeDeltaSeconds` | `number` | `0` | 传给 Steam Timeline 的时间差，必须是非负有限数 |

返回 `void`。

### timelineSetStateDescription — 设置状态描述

```typescript
executePluginCommand('steam', {
  subCommand: 'timelineSetStateDescription',
  description: 'Exploring chapter 2',
  timeDeltaSeconds: 0,
});
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `description` | `string` | — | 当前游戏状态描述；新值会替换之前的描述 |
| `timeDeltaSeconds` | `number` | `0` | 传给 Steam Timeline 的时间差，必须是非负有限数 |

返回 `void`。

## User

### userGetAccountId — 获取 Account ID

```typescript
const accountId = executePluginCommand('steam', {
  subCommand: 'userGetAccountId',
});
// number
```

返回当前用户 CSteamID 中的 32 位 Account ID。

### userGetCSteamId — 获取完整 CSteamID

```typescript
const steamId = executePluginCommand('steam', {
  subCommand: 'userGetCSteamId',
});
// string
```

返回当前用户完整 64 位 CSteamID 的十进制字符串。

### userGetGameBadgeLevel — 获取游戏徽章等级

```typescript
const level = executePluginCommand('steam', {
  subCommand: 'userGetGameBadgeLevel',
  series: 1,
  foil: false,
});
// number
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `series` | `number` | 徽章系列编号，作为 32 位有符号整数传给 Steam |
| `foil` | `boolean` | 是否查询闪亮徽章 |

返回当前 App 对应徽章的等级。

### userGetPersonaName — 获取用户显示名

```typescript
const name = executePluginCommand('steam', {
  subCommand: 'userGetPersonaName',
});
// string
```

返回当前 Steam 用户的 Persona Name。

## Workshop / 创意工坊

### workshopGetSubscribedItemPath — 获取订阅项安装目录

```typescript
const path = executePluginCommand('steam', {
  subCommand: 'workshopGetSubscribedItemPath',
  itemId: '1234567890123456789',
});
// string | null
```

`itemId` 必须是可解析为 64 位无符号整数的十进制字符串。存在安装信息时返回该 Workshop item 的安装目录；未安装、无安装信息或 Steam 查询不到时返回 `null`。

### workshopGetSubscribedItems — 获取订阅项

```typescript
const items = executePluginCommand('steam', {
  subCommand: 'workshopGetSubscribedItems',
  includeDisabled: false,
});
// string[]
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `includeDisabled` | `boolean` | `false` | 是否包含用户在本地禁用的订阅项 |

返回 Workshop Published File ID 的十进制字符串数组。

## 错误与注意事项

- Achievement 和 Stat 名称必须与 Steamworks 后台的 API Name 及类型完全一致。
- Achievement/Stat 尚未就绪、名称不存在、类型不匹配或 Steam 拒绝操作时，命令可能失败或按各查询命令的约定返回 `null`。
- `achievementGet` 查询失败时抛出错误；`statsGetAchievement` 查询失败时返回 `null`。
- 高层 Achievement set/clear 命令自动提交；Stats 分组中的 set/clear 命令需要显式调用 `statsStoreStats`。
- Overlay 激活、DLC 安装和 DLC 卸载命令只发起请求，不确认 UI 是否打开或操作是否完成。
