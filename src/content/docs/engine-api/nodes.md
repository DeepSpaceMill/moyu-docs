---
title: 节点操作
sidebar:
  order: 3
---

部分 JSX 元素（`<text>`、`<video>` 等）支持通过节点命令在运行时动态控制行为。推荐通过 React ref 调用 `executeCommand`：

```tsx
import { useRef } from 'react';
import type { Node } from '@momoyu-ink/kit';

function MyComponent() {
  const ref = useRef<Node>(null);

  return (
    <text
      ref={ref}
      text="正在打字中……"
      printMode="typewriter"
      printSpeed={30}
      onClick={() => ref.current?.executeCommand({ subCommand: 'finishPrinting' })}
    />
  );
}
```

## Text 节点命令

### setText — 设置文本内容

```typescript
textRef.current?.executeCommand({
  subCommand: 'setText',
  text: '新的文本内容',
  instant: false,  // true 则立即显示，不播放打字动画
});
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | `string` | — | 要设置的文本 |
| `instant` | `boolean` | `false` | 是否立即显示（跳过打印动画） |

### finishPrinting — 完成打印

立即完成当前的打字/打印动画，直接显示全部文本。

```typescript
textRef.current?.executeCommand({
  subCommand: 'finishPrinting',
});
```

这个命令在用户点击时常用——如果文本正在打字中，先完成打字；再次点击才推进剧情。

### getCursorPosition — 获取光标位置

获取文本最后一个字符之后的光标位置（以文本节点的本地坐标表示）。

```typescript
const pos = textRef.current?.executeCommand({
  subCommand: 'getCursorPosition',
}) as [number, number];

console.log('Cursor at:', pos[0], pos[1]);
```

| 返回值 | 类型 | 说明 |
|--------|------|------|
| `[x, y]` | `[number, number]` | 光标位置（节点本地坐标） |

标准框架中用此命令定位打字完成后的闪烁光标动画。

## Video 节点命令

### play / pause / resume / stop

```typescript
videoRef.current?.executeCommand({ subCommand: 'play' });
videoRef.current?.executeCommand({ subCommand: 'pause' });
videoRef.current?.executeCommand({ subCommand: 'resume' });
videoRef.current?.executeCommand({ subCommand: 'stop' });
```

### seek — 跳转

```typescript
videoRef.current?.executeCommand({ subCommand: 'seek', time: 10.5 });
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `time` | `number` | 目标时间点（秒） |

### setVolume — 设置音量

```typescript
videoRef.current?.executeCommand({ subCommand: 'setVolume', volume: 0.5 });
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `volume` | `number` | 音量（0~1） |

### setMuted — 静音

```typescript
videoRef.current?.executeCommand({ subCommand: 'setMuted', muted: true });
```

### setLoop — 设置循环

```typescript
videoRef.current?.executeCommand({ subCommand: 'setLoop', enabled: true });
```

### 事件回调

`<video>` 组件支持以下事件回调：

```tsx
<video
  src="video/opening.mp4"
  onEnded={() => console.log('播放完毕')}
  onStateChange={(state) => console.log('状态变化:', state)}
/>
```

| 事件 | 类型 | 说明 |
|------|------|------|
| `onEnded` | `() => void` | 视频播放完毕时触发（仅在非循环模式下） |
| `onStateChange` | `(state: string) => void` | 播放状态变化时触发 |

`onStateChange` 中 `state` 的可能值：

| 值 | 说明 |
|------|------|
| `"idle"` | 初始状态 |
| `"loading"` | 加载中 |
| `"playing"` | 播放中 |
| `"paused"` | 已暂停 |
| `"stopped"` | 已停止 |
| `"ended"` | 播放完毕 |
| `"error"` | 出错 |

## 底层 API

如果你需要直接通过节点 ID 调用（不通过 ref）：

```typescript
import { executeNodeCommand } from '@momoyu-ink/kit';

const result = executeNodeCommand(nodeId, {
  subCommand: 'finishPrinting',
});
```

大多数情况下，使用 ref 方式更方便，也更符合 React 的编程模式。
