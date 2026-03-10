---
title: 命令与剧本引擎
sidebar:
  order: 7
---

命令系统是连接剧本（`.sixu` 脚本）和游戏表现的核心桥梁。当剧本中执行一条 `@changebg` 或 `@addchar` 命令时，框架需要解析它、更新对应的游戏状态，最终由 Actor 组件渲染出来。

## 数据流

```
剧本 @changebg src="bg/classroom.png"
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

const ChangeBgCommandSchema = z.object({
  command: z.literal('changebg'),
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
  ChangeBgCommandSchema,
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
export const handleChangeBg: CommandHandler<{
  command: 'changebg';
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
export const handleWaitClick: CommandHandler<{ command: 'waitclick' }> = (_cmd, control) => {
  control.hold();  // 阻塞，直到用户点击
};

// 示例：自动推进（不调用 control）
export const handleSetTitle: CommandHandler<{ command: 'setTitle'; text: string }> = (cmd) => {
  gameState.story.title = cmd.text;
  // 没有调用 control → 自动推进
};
```

### 快进模式下的行为

当用户按住 Ctrl 进入快进模式时：

- `control.setWaiting()` — 跳过等待，立刻推进
- `control.hold()` — 如果未标记 `unskippable()`，自动推进；如果标记了，则停止快进
- 音效播放会被跳过（避免重叠）

## 在 Stage 中注册命令

命令的注册在 `src/pages/stage.tsx` 中完成：

```typescript title="src/pages/stage.tsx"
import { createStage, StageContextProvider } from '@momoyu-ink/kit';
import { ScenarioCommandSchema } from '../commands/commands';
import { handleChangeBg, handleAddChar, handleText } from '../commands/handlers';

// 创建模块级单例
const stage = createStage();

// 注册 Schema
stage.registerCommandSchema(ScenarioCommandSchema);

// 注册命令处理函数
stage.registerCommand('changebg', handleChangeBg);
stage.registerCommand('addchar', handleAddChar);
stage.registerCommand(['charchange', 'charremove', 'charclear'], handleCharChange);

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

## Skip 和 Interrupt 机制

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

### Skip Blocker（跳过阻止器）

某些场景不应允许快进（如重要演出、选择分支）。使用 `useSkipBlocker` 注册阻止器：

```typescript
import { useSkipBlocker } from '@momoyu-ink/kit';

function ImportantScene() {
  const blockSkip = useCallback(() => true, []); // 永远阻止快进
  useSkipBlocker(blockSkip);
  // ...
}
```

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
