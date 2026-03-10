---
title: 剧情 API
sidebar:
  order: 5
---

剧情系统通过 `executePluginCommand('scenario', ...)` 进行控制，管理故事加载、流程控制、变量和存档。

## 故事管理

### addStory — 添加故事

将编译好的故事文件加载到引擎中。故事文件通常位于 `assets/scenario/` 目录下。

```typescript
executePluginCommand('scenario', {
  subCommand: 'addStory',
  name: 'main',                // 故事名
  src: 'scenario/main.json',   // 文件路径
});
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 故事名称（唯一标识） |
| `src` | `string` | 故事文件路径（相对于 `assets/`） |

### removeStory — 移除故事

```typescript
executePluginCommand('scenario', {
  subCommand: 'removeStory',
  name: 'main',
});
```

### hasStory — 检查故事是否已加载

```typescript
const exists = executePluginCommand('scenario', {
  subCommand: 'hasStory',
  name: 'main',
});
// 返回 boolean
```

### getStoryList — 获取已加载的故事列表

```typescript
const list = executePluginCommand('scenario', {
  subCommand: 'getStoryList',
});
// 返回 string[]
```

### startStory — 开始播放故事

```typescript
executePluginCommand('scenario', {
  subCommand: 'startStory',
  name: 'main',        // 故事名
  entry: 'chapter1',   // 可选：入口点名称
});
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 要开始的故事名称 |
| `entry` | `string` | 可选，入口点。未指定时从默认入口开始 |

### terminateStory — 终止当前故事

```typescript
executePluginCommand('scenario', {
  subCommand: 'terminateStory',
});
```

## 流程控制

### nextLine — 推进到下一行

```typescript
executePluginCommand('scenario', {
  subCommand: 'nextLine',
});
```

引擎执行下一行脚本后，会通过事件系统分发 `scenariocommandline`（命令行）或 `scenariotext`（文本行）事件。当故事结束时分发 `scenariofinished` 事件。

### setWaiting — 设置等待状态

通知引擎当前帧已处理完毕，进入等待状态。

```typescript
executePluginCommand('scenario', {
  subCommand: 'setWaiting',
});
```

引擎进入等待状态后，会分发 `scenariowaiting` 事件。如果等待被取消（如用户点击跳过），会分发 `scenariowaitingcancelled` 事件。

### 事件流

一个典型的剧情执行周期：

```
nextLine() → 引擎执行脚本
  → scenariocommandline / scenariotext 事件
  → 框架处理命令（动画、对话等）
  → setWaiting() 通知处理完毕
  → scenariowaiting 事件
  → 等待用户交互或自动计时
  → nextLine() ... 循环
```

## 变量系统

### 会话变量

会话变量仅在当前游戏会话有效，随存档保存和恢复。

```typescript
// 设置单个变量
executePluginCommand('scenario', {
  subCommand: 'setVariable',
  name: 'met_alice',
  value: true,
});

// 获取单个变量
const val = executePluginCommand('scenario', {
  subCommand: 'getVariable',
  name: 'met_alice',
});

// 批量设置
executePluginCommand('scenario', {
  subCommand: 'setVariables',
  variables: {
    route: 'alice',
    affection: 50,
    met_alice: true,
  },
});

// 批量获取
const vars = executePluginCommand('scenario', {
  subCommand: 'getVariables',
});
// 返回 Record<string, any>
```

### 永久变量

永久变量跨存档持久化，保存在 `global_data.json` 中。适合记录全局解锁成就、已通关路线等。

```typescript
// 设置
executePluginCommand('scenario', {
  subCommand: 'setPermanentVariable',
  name: 'route_alice_cleared',
  value: true,
});

// 获取
const cleared = executePluginCommand('scenario', {
  subCommand: 'getPermanentVariable',
  name: 'route_alice_cleared',
});

// 批量设置/获取
executePluginCommand('scenario', {
  subCommand: 'setPermanentVariables',
  variables: { route_alice_cleared: true, total_endings: 3 },
});

const all = executePluginCommand('scenario', {
  subCommand: 'getPermanentVariables',
});

// 清除所有永久变量
executePluginCommand('scenario', {
  subCommand: 'clearPermanentVariables',
});
```

## 存档系统

### saveGame — 保存游戏

```typescript
executePluginCommand('scenario', {
  subCommand: 'saveGame',
  name: 'slot_1',           // 存档名
  extra: {                   // 可选：附加数据
    title: '第一章·相遇',
    timestamp: Date.now(),
  },
});
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 存档名（文件名） |
| `extra` | `object` | 可选，附加的自定义数据 |

存档文件为 ZIP 格式（`.sav`），内含：
- `game_data.json` — 执行栈和会话变量
- `snapshot.webp` — 当前画面截图
- `metadata.json` — 存档元数据
- `extra.json` — 自定义附加数据

### loadGame — 读取存档

```typescript
executePluginCommand('scenario', {
  subCommand: 'loadGame',
  name: 'slot_1',
  overwrite: true,          // 可选：是否覆盖当前游戏状态
});
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 存档名 |
| `overwrite` | `boolean` | 可选，是否覆盖当前状态，默认 `true` |

### resetGame — 重置游戏

清除执行栈和会话变量，回到初始状态。

```typescript
executePluginCommand('scenario', {
  subCommand: 'resetGame',
});
```

### removeGame — 删除存档

```typescript
executePluginCommand('scenario', {
  subCommand: 'removeGame',
  name: 'slot_1',
});
```

### getGameList — 获取存档列表

```typescript
const saves = executePluginCommand('scenario', {
  subCommand: 'getGameList',
  pattern: 'slot_*',        // 可选：glob 匹配模式
});
// 返回存档信息数组
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `pattern` | `string` | 可选，glob 匹配模式，默认返回所有存档 |
