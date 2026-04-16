---
title: 历史记录
sidebar:
  order: 11
---

标准框架提供了完整的历史记录（Backlog）功能，允许玩家回顾之前的对话并跳转到任意历史位置。该功能基于引擎 `scenario` 插件的快照机制实现。

## 工作原理

历史记录系统的数据流：

```
记录：命令处理 → gameState 写入引擎变量 → 引擎创建运行时快照 → backlog 记录池
跳转：选择记录 → 引擎恢复快照（执行栈+变量）→ 恢复 gameState → 关闭 overlay
```

引擎的 scenario 插件负责管理运行时快照的创建和恢复，最多保留 50 条记录。框架层通过 `useBacklog` Hook 封装了完整的历史记录交互。

## 打开历史记录

标准框架中有两种打开 backlog overlay 的方式：

1. **文本框按钮**：点击文本框上的 LOG 按钮
2. **鼠标滚轮**：在 Stage 页面向上滚动鼠标滚轮

```typescript
// Stage 中的滚轮触发（参考实现）
useEffect(() => {
  return addEventListener('wheel', (event: WheelEvent) => {
    if (event.deltaY <= 0) return;
    if (navigation.getCurrentPage() !== 'stage') return;
    if (navigation.getOverlayStack().length > 0) return;
    navigation.pushOverlay('backlog');
  });
}, [navigation]);
```

## 记录时机

标准框架在以下时机自动创建历史记录：

### 文本行

每次剧本引擎输出文本行时，自动记录说话人和对话内容：

```typescript
export const handleTextLine: TextLineHandler = (e, control) => {
  // ...处理文本显示...

  recordBacklog(control, {
    kind: 'text',
    speaker: e.leading || '',
    text: e.text || '',
  });

  control.hold();
};
```

### 选择项

选择项显示时，记录所有选项文本：

```typescript
export const handleOptionShow: CommandHandler = (cmd, control) => {
  // ...显示选择...

  recordBacklog(control, {
    kind: 'selection',
    options: gameState.selection.options.map((option) => option.text),
  });

  control.unskippable();
  control.hold();
};
```

### recordBacklog 辅助函数

`recordBacklog` 在记录前会先将当前 `gameState` 写入引擎变量，确保快照包含完整的前端状态：

```typescript
function recordBacklog(
  control: { record(meta: Record<string, any>): string },
  meta: Record<string, any>,
) {
  writeCurrentGameStateToScenario();
  control.record(meta);
}
```

:::tip
`control.record()` 是 `GameControl` 接口的一部分，内部调用引擎的 `scenario.record` 命令。你可以在任何命令处理器中使用它来记录自定义的历史条目。
:::

## useBacklog Hook

```typescript
import { useBacklog } from '../hooks/useBacklog';

function BacklogPage() {
  const {
    records,          // BacklogRecord[] — 历史记录列表（按时间正序）
    scrollOffset,     // SpringValue<number> — 当前滚动偏移的 spring 值
    maxScroll,        // number — 最大滚动距离
    showScrollbar,    // boolean — 当前是否需要显示滚动条
    scrollbarHeight,  // number — 滚动条高度
    scrollbarOffset,  // number | Interpolation<number, number> — 滚动条位置
    scrollToRatio,    // (ratio: number, immediate?: boolean) => void — 按滚动比例定位
    handleWheel,      // (event: WheelEvent) => void — 处理滚轮事件
    jumpToRecord,     // (recordId: string) => Promise<boolean> — 跳转到指定记录
    close,            // () => void — 关闭 backlog overlay
  } = useBacklog({
    itemHeight: 110,     // 每条记录的高度
    viewportHeight: 584, // 可视区域高度
  });
}
```

:::tip
标准实现会在首次加载 backlog 后自动滚动到底部，因此虽然 `records` 是按时间正序排列，玩家打开页面时默认看到的是最新记录。
:::

### API 参考

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `records` | `BacklogRecord[]` | 历史记录列表，按时间正序 |
| `scrollOffset` | `SpringValue<number>` | 当前滚动偏移量的 spring 值，可直接用于 `animated.*` |
| `maxScroll` | `number` | 最大可滚动距离 |
| `showScrollbar` | `boolean` | 当前是否需要显示滚动条 |
| `scrollbarHeight` | `number` | 当前滚动条的高度 |
| `scrollbarOffset` | `number \| Interpolation<number, number>` | 当前滚动条偏移 |
| `scrollToRatio(ratio, immediate?)` | `void` | 按滚动比例定位，拖拽滚动条时使用 |
| `handleWheel(event)` | `void` | 处理滚轮事件，自动计算滚动量 |
| `jumpToRecord(id)` | `Promise<boolean>` | 跳转到指定记录，成功返回 `true` |
| `close()` | `void` | 关闭 backlog overlay |

### 数据结构

```typescript
export type BacklogMeta =
  | {
      kind: 'text';
      speaker: string;  // 说话人名称
      text: string;      // 对话内容
    }
  | {
      kind: 'selection';
      options: string[]; // 选项列表
    };

export interface BacklogRecord {
  id: string;           // 唯一标识（格式：record-{timestamp}-{serial}）
  createdAt: number;     // 创建时间戳（毫秒）
  meta: BacklogMeta;     // 元数据
}
```

## 跳转流程详解

`jumpToRecord` 内部执行以下步骤：

1. 调用引擎的 `jumpToRecord` 命令，恢复运行时快照（执行栈、变量）
2. 目标记录之后的历史记录被截断
3. 调用 `restoreGameStateFromScenario()` 从引擎变量恢复前端的 `gameState`
4. 关闭 backlog overlay，游戏从该位置继续

```typescript
const jumpToRecord = async (recordId: string) => {
  // Restore runtime snapshot (execution stack + variables)
  const success = await executePluginCommand('scenario', {
    subCommand: 'jumpToRecord',
    recordId,
  });

  if (!success) {
    uiActions.notify('跳转失败');
    return false;
  }

  // Restore frontend game state (background, characters, etc.)
  await restoreGameStateFromScenario();
  navigation.popOverlay();
  return true;
};
```

:::caution
跳转后，目标记录之后的所有历史会被丢弃。玩家无法再回到跳转前的位置。这与存档/读档行为一致。
:::

## 自定义记录元数据

你可以扩展 `BacklogMeta` 类型来记录额外的信息。例如，添加语音记录：

```tsx
// 1. 扩展元数据类型
export type BacklogMeta =
  | { kind: 'text'; speaker: string; text: string; voice?: string }
  | { kind: 'selection'; options: string[] };

// 2. 在命令处理器中传入额外数据
export const handleTextLine: TextLineHandler = (e, control) => {
  // ...

  recordBacklog(control, {
    kind: 'text',
    speaker: e.leading || '',
    text: e.text || '',
    voice: currentVoice, // 自定义字段
  });

  control.hold();
};

// 3. 在 BacklogRow 中展示
function BacklogRow({ record }: { record: BacklogRecord }) {
  return (
    <container>
      <text text={record.meta.text} />
      {record.meta.kind === 'text' && record.meta.voice && (
        <Button text="🔊" onClick={() => playVoice(record.meta.voice)} />
      )}
    </container>
  );
}
```

## 自定义 Backlog 页面

Backlog 页面在 `src/pages/backlog.tsx` 中实现，注册为 overlay 类型。你可以自由调整布局和样式。

当前标准实现的关键点：

1. `records` 在 Hook 内部已经转为按时间正序展示，但页面首次打开时默认滚动到底部。
2. 列表滚动由 `react-spring` 驱动，因此 `scrollOffset` 是 spring 值，需要通过 `animated.container` 和 `.to(...)` 使用。
3. 右侧滚动条使用 `ui/backlog_scrollbar.png`，仅在 `showScrollbar` 为 `true` 时显示，并支持拖拽。
4. 点击历史条目时，标准页面会先通过 `uiActions.confirm(...)` 做二次确认，再调用 `jumpToRecord()`。

参考实现：

```tsx
export function Backlog() {
  const {
    records,
    scrollOffset,
    maxScroll,
    showScrollbar,
    scrollbarHeight,
    scrollbarOffset,
    handleWheel,
    scrollToRatio,
    jumpToRecord,
    close,
  } = useBacklog({
    itemHeight: ROW_HEIGHT,
    viewportHeight: VIEWPORT_HEIGHT - VIEWPORT_PADDING_Y * 2,
  });

  const handleJumpRequest = (record: BacklogRecord) => {
    uiActions.confirm('确定要跳转到这个位置吗？', () => {
      void jumpToRecord(record.id);
    });
  };

  useEffect(() => {
    const cleanups = [
      addEventListener('wheel', handleWheel),
      addEventListener('mousemove', handleScrollbarDragMove),
      addEventListener('touchmove', handleScrollbarDragMove),
      addEventListener('mouseup', handleScrollbarDragEnd),
      addEventListener('touchend', handleScrollbarDragEnd),
      addEventListener('touchcancel', handleScrollbarDragEnd),
    ];

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, [handleScrollbarDragEnd, handleScrollbarDragMove, handleWheel]);

  return (
    <container>
      <clip width={VIEWPORT_WIDTH} height={VIEWPORT_HEIGHT}>
        <animated.container y={scrollOffset.to((value) => VIEWPORT_PADDING_Y - value)}>
          {records.map((record, index) => (
            <BacklogRow
              key={record.id}
              record={record}
              y={index * ROW_HEIGHT}
              onJump={() => handleJumpRequest(record)}
            />
          ))}
        </animated.container>
      </clip>

      {showScrollbar && (
        <animated.sprite
          src="ui/backlog_scrollbar.png"
          mode="nineslice"
          bounds={SCROLLBAR_BOUNDS}
          targetWidth={SCROLLBAR_WIDTH}
          targetHeight={scrollbarHeight}
          y={
            typeof scrollbarOffset === 'number'
              ? SCROLLBAR_Y + scrollbarOffset
              : scrollbarOffset.to((value) => SCROLLBAR_Y + value)
          }
          onMouseDown={handleScrollbarDragStart}
          onTouchStart={handleScrollbarDragStart}
        />
      )}
    </container>
  );
}
```
