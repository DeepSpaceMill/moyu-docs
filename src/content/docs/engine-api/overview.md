---
title: 概述
sidebar:
  order: 1
---

前面的章节介绍了如何在 React 框架层定制游戏。本章将深入一层，介绍引擎通过 `@momoyu-ink/kit` SDK 暴露给 JavaScript 层的核心 API。

## 什么时候需要直接使用引擎 API？

当你需要的功能**超出了标准框架的封装范围**时——例如：

- 直接控制音频播放（循环区间、播放速率、声像等高级特性）
- 管理窗口状态（大小、全屏、标题）
- 操作节点命令（如控制文本打印）
- 监听底层事件（窗口调整大小、关闭前确认等）
- 直接读写引擎变量

## 两种 API 风格

末语提供两种交互方式：

### 声明式 API（React 组件）

通过 JSX 元素和 props 对引擎进行声明式控制。这是大多数情况下的推荐方式：

```tsx
// 渲染一张图片
<sprite src="bg/classroom.png" opacity={0.5} />

// 文本打字机效果
<text text="你好" printMode="typewriter" printSpeed={30} onFinish={() => { ... }} />
```

### 命令式 API（直接调用）

通过函数调用直接向引擎发送指令。适合需要精确控制的场景：

```typescript
import { executePluginCommand, executeNodeCommand } from '@momoyu-ink/kit';

// 播放音频
executePluginCommand('audio', { subCommand: 'play', name: 'bgm', fadeTime: 600 });

// 控制文本节点完成打印
executeNodeCommand(textNodeId, { subCommand: 'finishPrinting' });

// 设置窗口大小
executePluginCommand('system', { subCommand: 'setWindowSize', width: 1920, height: 1080 });
```

## 核心函数

### `executePluginCommand(pluginName, payload)`

向引擎插件发送命令。

```typescript
import { executePluginCommand } from '@momoyu-ink/kit';

const result = executePluginCommand('audio', {
  subCommand: 'load',
  name: 'bgm',
  src: 'audio/bgm/theme.opus',
});
```

- `pluginName` — 插件名称（`'audio'` | `'scenario'` | `'system'` | `'gamepad'`）
- `payload` — 命令数据，必须包含 `subCommand` 字段
- 返回值取决于具体命令，可能是同步值或 Promise

### `executeNodeCommand(nodeId, payload)`

向特定渲染节点发送命令。通常通过节点 ref 调用：

```typescript
<text ref={textRef} text="..." />

// 通过 ref
textRef.current?.executeCommand({ subCommand: 'finishPrinting' });
```

### `addEventListener(eventName, callback)`

注册全局事件监听器，返回清理函数：

```typescript
import { addEventListener } from '@momoyu-ink/kit';

const cleanup = addEventListener('keydown', (e) => {
  console.log('Key pressed:', e.key);
});

// 取消监听
cleanup();
```

### `getStageSize()`

获取舞台尺寸和缩放因子：

```typescript
import { getStageSize } from '@momoyu-ink/kit';

const { width, height, scaleFactor } = getStageSize();
```

## 后续章节

- [事件系统](/engine-api/events) — 完整的事件类型和监听方式
- [节点操作](/engine-api/nodes) — `executeNodeCommand` 详解
- [音频 API](/engine-api/audio) — 音频插件完整参考
- [剧本引擎 API](/engine-api/scenario) — 剧本和变量管理
- [系统 API](/engine-api/system) — 窗口和系统控制
- [其他 API](/engine-api/misc) — Gamepad、运行时环境等
