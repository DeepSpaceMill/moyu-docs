---
title: 节点操作
sidebar:
  order: 3
---

`executeNodeCommand` 用于向特定的渲染节点发送命令。目前主要用于控制文本（`<text>`）节点。

## 使用方式

通过 React ref 获取节点引用，然后调用 `executeCommand`：

```tsx
import { useRef } from 'react';
import type { Node } from '@momoyu-ink/kit';

function MyComponent() {
  const textRef = useRef<Node>(null);

  const finishPrinting = () => {
    textRef.current?.executeCommand({ subCommand: 'finishPrinting' });
  };

  return (
    <text
      ref={textRef}
      text="正在打字中……"
      printMode="typewriter"
      printSpeed={30}
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

## 底层 API

如果你需要直接通过节点 ID 调用（不通过 ref）：

```typescript
import { executeNodeCommand } from '@momoyu-ink/kit';

const result = executeNodeCommand(nodeId, {
  subCommand: 'finishPrinting',
});
```

大多数情况下，使用 ref 方式更方便，也更符合 React 的编程模式。
