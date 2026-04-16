---
title: 命令与剧本引擎
sidebar:
  order: 7
---

命令系统是连接剧本（`.sixu` 脚本）和游戏表现的核心桥梁。当剧本中执行一条 `@bg` 或 `@charEnter` 命令时，框架需要解析它、更新对应的游戏状态，最终由 Actor 组件渲染出来。

## 数据流

```
剧本 @bg src="bg/classroom.png"
         ↓
   引擎解析并发出事件
         ↓
   Stage 接收 scenariocommandline 事件
         ↓
   Zod Schema 验证和转换
         ↓
   CommandHandler 处理命令
         ↓
   修改 gameState.background
         ↓
   BackgroundActor 响应状态变化并渲染
```

## 命令定义（Schema）

所有命令在 `src/commands/commands.ts` 中使用 [Zod](https://zod.dev/) 定义。Zod 负责类型验证和默认值填充。

```typescript title="src/commands/commands.ts"
import z from 'zod';

const BgCommandSchema = z.object({
  command: z.literal('bg'),
  src: z.string(),
  fadeTime: z.number().optional().default(1000),
  skippable: z.boolean().optional().default(false),
});

const WaitCommandSchema = z.object({
  command: z.literal('wait'),
  time: z.number(),
  skippable: z.boolean().optional(),
});

// ... 更多命令定义 ...

// 所有命令的联合类型
export const ScenarioCommandSchema = z.discriminatedUnion('command', [
  BgCommandSchema,
  WaitCommandSchema,
  // ... 所有命令 Schema ...
]);

export type ScenarioCommandSchemaType = z.infer<typeof ScenarioCommandSchema>;
```

## 命令处理函数

每个命令对应一个处理函数，定义在 `src/commands/handlers.ts` 中。处理函数接收解析后的命令数据和一个流程控制对象。

```typescript title="src/commands/handlers.ts"
import type { CommandHandler } from '@momoyu-ink/kit';
import { gameState } from '../state/game';

// 切换背景
export const handleBg: CommandHandler<{
  command: 'bg';
  src: string;
  fadeTime: number;
  skippable: boolean;
}> = (cmd, control) => {
  gameState.background.src = cmd.src;
  gameState.background.fadeTime = cmd.fadeTime;
  gameState.background.skippable = cmd.skippable;

  // 等待渐变完成
  control.setWaiting(cmd.fadeTime, cmd.skippable);
};
```

### GameControl — 流程控制

每个处理函数的第二个参数 `control` 提供了流程控制能力：

| 方法 | 说明 | 使用场景 |
|------|------|---------|
| `control.setWaiting(time, skippable)` | 定时等待，到时后自动推进 | 背景渐变、等待命令 |
| `control.hold()` | 无限期等待，直到用户操作 | 文本显示完毕后等待点击 |
| `control.nextLine()` | 立即推进到下一条命令 | 通常不需要手动调用 |
| `control.unskippable()` | 标记当前命令不可跳过 | 不允许快进跳过的重要演出 |

**默认行为**：如果处理函数不调用任何 `control` 方法，命令会**自动推进**到下一条。

```typescript
// 示例：等待用户点击
export const handleWaitClick: CommandHandler<{ command: 'waitClick' }> = (_cmd, control) => {
  control.hold();  // 阻塞，直到用户点击
};

// 示例：自动推进（不调用 control）
export const handleTitle: CommandHandler<{ command: 'title'; text: string }> = (cmd) => {
  gameState.story.title = cmd.text;
  // 没有调用 control → 自动推进
};
```

### 快进模式下的行为

当用户按住 Ctrl 进入快进模式时：

- `control.setWaiting()` — 跳过等待，立刻推进
- `control.hold()` — 如果未标记 `unskippable()`，自动推进；如果标记了，则停止快进
- 音效（SFX）和命名通道音频（Sound）会被跳过

### 自动播放模式下的行为

当用户开启自动播放（Auto）时，框架通过"屏障 + 票据"机制决定何时推进：

- `control.setWaiting(time)` — 打开一个 `wait` 屏障，至少等待 `time` 毫秒后再推进。如果有 Actor 注册了票据，则以两者中较晚的为准
- `control.hold()` — 打开一个 `hold` 屏障。如果没有 Actor 注册票据，则立即推进（例如 `waitClick` 会被自动跳过）；如果有票据，则等待票据完成
- 命令处理函数**不需要**为 auto 额外编写逻辑，auto 语义完全由 Stage 内部和 Actor 的票据决定

## 在 Stage 中注册命令

命令的注册在 `src/pages/stage.tsx` 中完成：

```typescript title="src/pages/stage.tsx"
import { createStage, StageContextProvider } from '@momoyu-ink/kit';
import { ScenarioCommandSchema } from '../commands/commands';
import { handleBg, handleCharEnter, handleText } from '../commands/handlers';

// 创建模块级单例
const stage = createStage();

// 注册 Schema
stage.registerCommandSchema(ScenarioCommandSchema);

// 注册命令处理函数
stage.registerCommand('bg', handleBg);
stage.registerCommand('charEnter', handleCharEnter);
stage.registerCommand(['charAction', 'charLeave', 'charClear'], handleCharAction);

// 注册文本行处理
stage.registerTextLine(handleTextLine);

export function Stage() {
  return (
    <StageContextProvider stage={stage}>
      {/*  Actor 组件 */}
    </StageContextProvider>
  );
}
```

### 文本行处理

剧本中的普通文本（非 `@` 命令）作为"文本行"事件处理：

```typescript
const handleTextLine: TextLineHandler = (text, control) => {
  // text.content — 文本内容
  // text.name    — 说话者名字（可能为空）
  // text.clear   — 是否清除之前的文本
  // text.newline — 是否换行

  gameState.textbox.name = text.name ?? '';

  if (text.clear) {
    gameState.textbox.shouldClear = true;
  }

  if (text.newline && gameState.textbox.text.length > 0) {
    gameState.textbox.text += '\n';
  }

  gameState.textbox.text += text.content;
  gameState.textbox.visible = true;
  gameState.character.currentSpeaker = text.name;

  // 等待用户点击
  control.hold();
};
```

## 添加自定义命令

要添加新命令，需要三个步骤：

### 1. 定义 Schema

```typescript title="src/commands/commands.ts"
const ShakeCommandSchema = z.object({
  command: z.literal('shake'),
  intensity: z.number().optional().default(10),
  duration: z.number().optional().default(500),
});

// 添加到联合类型
export const ScenarioCommandSchema = z.discriminatedUnion('command', [
  // ...existing schemas...
  ShakeCommandSchema,
]);
```

### 2. 编写处理函数

```typescript title="src/commands/handlers.ts"
export const handleShake: CommandHandler<{
  command: 'shake';
  intensity: number;
  duration: number;
}> = (cmd, control) => {
  // 修改你的自定义状态来触发震动效果
  shakeState.active = true;
  shakeState.intensity = cmd.intensity;

  // 等待震动结束
  control.setWaiting(cmd.duration, true);
};
```

### 3. 注册到 Stage

```typescript title="src/pages/stage.tsx"
stage.registerCommand('shake', handleShake);
```

### 4. 在剧本中使用

```sixu
@shake intensity=20 duration=800
[Alice] "好大的地震！"
```

## Skip、Interrupt 和 Auto 机制

### Skip（快进）

当用户按住 Ctrl 时，框架进入快进模式，快速跳过文本和等待。各 Actor 可以通过 `useSkipCallback` 注册快进回调，在快进时完成未完成的动画：

```typescript
import { useSkipCallback } from '@momoyu-ink/kit';

function BackgroundActor() {
  const tryFinish = useCallback(() => {
    // 立即完成渐变动画
    transRef.set({ opacity: 1 });
  }, []);

  useSkipCallback(tryFinish);
}
```

### Interrupt（中断）

当用户在等待期间点击时，框架会调用已注册的中断回调。回调返回 `true` 表示已处理（如完成打字动画），`false` 则传递给下一个回调：

```typescript
import { useInterruptCallback } from '@momoyu-ink/kit';

function TextBoxActor() {
  const tryFinishPrinting = useCallback(() => {
    if (progress.current < 1) {
      textRef.current.executeCommand({ subCommand: 'finishPrinting' });
      return true;  // 已消费，不传递
    }
    return false;   // 文本已打完，传递给后续处理
  }, []);

  useInterruptCallback(tryFinishPrinting);
}
```

### Auto（自动播放）

自动播放模式让游戏按节奏自动推进。与快进不同，auto 不会跳过动画，而是等待当前内容播放完成后，再经过一段尾延时自动推进。

Auto 的核心抽象是 **屏障 + 票据**：

1. 当命令执行到暂停点（`hold()` 或 `setWaiting()`）时，Stage 内部自动创建一个屏障（`AutoBarrier`）
2. Actor 在屏障的收集窗口内注册票据（`AutoTicket`），声明自己需要时间来完成某个异步过程
3. 所有票据完成后，再等待尾延时（`tailMs`），然后自动推进
4. 最终推进时间以后完成的那一项为准


#### 使用 `useAutoTicket` 参与自动播放

Actor 通过 `useAutoTicket` 告知 Stage 自己需要多长时间完成：

```typescript
import { useAutoTicket, useIsAutoing, type AutoTicketHandle } from '@momoyu-ink/kit';
import { useRef, useLayoutEffect } from 'react';

function TextBoxActor() {
  const autoing = useIsAutoing();
  const issueAutoTicket = useAutoTicket();
  const autoTicketRef = useRef<AutoTicketHandle | null>(null);

  // 在确认本次有内容需要打印时，发一张票据
  useLayoutEffect(() => {
    if (!autoing || printMode === 'instant') return;

    autoTicketRef.current?.cancel();
    autoTicketRef.current = issueAutoTicket({ label: 'textbox-printing' });
  }, [autoing, printMode, issueAutoTicket, text]);

  // 打印完成时，标记票据完成
  const onFinish = () => {
    autoTicketRef.current?.done();
    autoTicketRef.current = null;
  };
}
```

**关键规则**：

- 票据通常在屏障的收集窗口内注册（同一轮 render/effect 中），过晚注册会被忽略
- 如果注册时尚无屏障（即发起票据的命令自动推进），票据会暂存为**待认领票据（Pending Ticket）**，在下一个屏障打开时自动被认领；若在收集窗口结束前仍未被认领，则自动过期
- `done()` 表示基础工作已完成，Stage 会额外等待 `tailMs` 再推进
- `cancel()` 用于中止，被取消的票据不再阻塞屏障
- 不注册票据的 Actor（如 BGM、音效）不会影响自动播放的时序

#### 跨命令票据（Pending Ticket）

某些命令（如 `@voice`）会自动推进——它不调用 `hold()` 或 `setWaiting()`，因此执行时不会打开屏障。但紧随其后的文本行会调用 `hold()` 创建屏障。

这种情况下，Actor 在 `useLayoutEffect` 中调用 `issueAutoTicket()` 时屏障尚未创建，票据会被暂存为 Pending Ticket。当后续的 `hold()` 打开屏障时，所有 Pending Ticket 会被自动认领到新屏障中。

```sixu
// 典型的剧本模式：语音命令紧跟文本行
@voice src="voice/ch01_001.opus"
[Alice] "你好，欢迎来到这里。"
```

```typescript
// VoiceActor 在 @voice 的 effect 中发出票据 —— 此时尚无屏障
const ticket = issueAutoTicket({ label: `voice:${channelName}` });

// 随后引擎处理文本行，textHandler 调用 control.hold()，打开屏障
// → Stage 自动将上面的 pending ticket 认领到新屏障
// → 屏障等待文本打印票据和语音票据都完成后再推进
```

这一机制对 Actor 是透明的——无论票据注册时屏障是否已存在，`issueAutoTicket()` 的调用方式完全相同。

#### 完整示例：语音 Actor

以下是 VoiceActor 的简化实现。它展示了如何在异步音频播放完成时标记票据完成：

```typescript title="src/actors/voice.tsx"
import { executePluginCommand, useAutoTicket, type AutoTicketHandle } from '@momoyu-ink/kit';
import { useLayoutEffect, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { gameState } from '../state/game';

export function VoiceActor() {
  const voiceState = useSnapshot(gameState.voice);
  const issueAutoTicket = useAutoTicket();
  const autoTicketRef = useRef<AutoTicketHandle | null>(null);

  useLayoutEffect(() => {
    const { src, channelName } = gameState.voice;

    autoTicketRef.current?.cancel();
    autoTicketRef.current = null;

    if (!src) return;

    // Issue a ticket before starting async work — may become a pending ticket.
    const ticket = issueAutoTicket({ label: `voice:${channelName}` });
    autoTicketRef.current = ticket;

    void (async () => {
      try {
        await executePluginCommand('audio', {
          subCommand: 'load', name: channelName, src,
          settings: { autoPlay: false },
        });
        await executePluginCommand('audio', {
          subCommand: 'play', name: channelName,
          fadeTime: 0, waitForEnd: true,
        });
        ticket?.done();
      } catch {
        ticket?.cancel();
      }
      autoTicketRef.current = null;
    })();

    return () => {
      autoTicketRef.current?.cancel();
      autoTicketRef.current = null;
    };
  }, [voiceState.src, voiceState.channelName]);

  return null; // Headless actor
}
```

这样，当自动播放模式中同时存在文本打印和语音播放时，屏障会等到**两者都完成**后再推进，确保语音不会被截断。

#### AutoTicket 选项

| 选项 | 类型 | 说明 |
|------|------|------|
| `label` | `string` | 调试用标签 |
| `tailMs` | `number` | 票据完成后的额外等待（毫秒）。省略时继承全局默认值 `setDefaultAutoTailMs()` 设定的值；传 `0` 可绕过默认尾延时 |

#### 配置默认尾延时

`setDefaultAutoTailMs` 是非 React 的顶层函数，用于设置自动播放的全局推进间隔：

```typescript
import { setDefaultAutoTailMs } from '@momoyu-ink/kit';
import { subscribeKey } from 'valtio/utils';
import { settingsState } from './state/settings';

// 初始同步
setDefaultAutoTailMs(settingsState.auto_interval * 1000);

// 响应用户修改
subscribeKey(settingsState, 'auto_interval', (value) => {
  setDefaultAutoTailMs(value * 1000);
});
```

### Skip Blocker / Auto Blocker（阻止器）

某些场景不应允许快进或自动播放（如选择分支）。使用 `useSkipBlocker` 和 `useAutoBlocker` 注册阻止器：

```typescript
import { useSkipBlocker, useAutoBlocker } from '@momoyu-ink/kit';

function SelectionActor() {
  const blockDuringSelection = useCallback(() => gameState.selection.visible, []);
  useSkipBlocker(blockDuringSelection);
  useAutoBlocker(blockDuringSelection);
}
```

当阻止器激活时，正在进行的快进或自动播放会被立即停止。

### BeforeHandleCommand（命令前回调）

在每个命令执行前触发，用于执行清理操作（如清除上一条文本）：

```typescript
import { useBeforeHandleCommandCallback } from '@momoyu-ink/kit';

function TextBoxActor() {
  useBeforeHandleCommandCallback(() => {
    if (gameState.textbox.shouldClear) {
      gameState.textbox.text = '';
    }
  });
}
```
