---
title: 图层（Actor）系统
sidebar:
  order: 8
---

**图层（Actor）** 是舞台上的视觉表现单元。每个图层（Actor）是一个 React 组件，它监听游戏状态的变化，并将其渲染为 UI。

## 设计模式

图层（Actor）遵循一个固定的模式：

```
命令处理函数修改 gameState → 图层（Actor）监听状态变化 → 渲染对应的视觉效果
```

这是一个纯粹的**数据驱动**模式——命令处理函数只负责更新数据，图层（Actor）只负责根据数据渲染。两者之间通过 Valtio 状态自动连接。

## 内置图层（Actor）

标准框架提供了四个内置图层（Actor）：

### BackgroundActor — 背景

监听 `gameState.background`，使用 react-spring 的 `useTransition` 实现背景切换的淡入淡出动画。

```typescript title="src/actors/background.tsx"
export function BackgroundActor() {
  const backgroundState = useSnapshot(gameState.background);

  const transitions = useTransition(
    backgroundState.src ? [backgroundState.src] : [],
    {
      keys: (src) => src,
      from: { opacity: 0 },
      enter: { opacity: 1 },
      leave: { opacity: 1 },
      config: { duration: backgroundState.fadeTime },
    },
  );

  return (
    <container label="背景容器">
      {transitions((style, src) => (
        <animated.sprite src={src} opacity={style.opacity} tint={tintSpring.tint} />
      ))}
    </container>
  );
}
```

**关键特性**：
- 使用 `useTransition` 管理新旧背景的切换
- 支持背景着色（tint）的平滑过渡
- 注册了 `useSkipCallback` 以支持快进时立即完成渐变

### CharacterActor — 角色

监听 `gameState.character`，渲染所有可见的角色立绘。

```typescript title="src/actors/character.tsx"
export function CharacterActor() {
  const characterState = useSnapshot(gameState.character);

  const transitions = useTransition(
    characterState.characters.filter((char) => char.visible),
    {
      keys: (char) => char.src,
      from: { opacity: 0 },
      enter: { opacity: 1 },
      leave: { opacity: 0 },
      config: (char) => ({ duration: char.fadeTime }),
    },
  );

  return (
    <container label="立绘容器">
      {transitions((style, character) => (
        <CharacterSprite
          character={character}
          isCurrentSpeaker={character.name === textboxState.name}
          opacity={style.opacity}
        />
      ))}
    </container>
  );
}
```

**关键特性**：
- 角色的位移、缩放通过 `useSpring` 平滑过渡
- 当前说话者的立绘保持正常颜色，其他角色变暗（tint 设为 `#333`）
- 支持位置预设（left/center/right）

### TextBoxActor — 文本框

监听 `gameState.textbox`，渲染对话框、姓名框和文本内容。

**关键特性**：
- 使用 `<text>` 元素的 `printMode` 实现打字机效果
- 注册 `useInterruptCallback` 支持点击完成打字
- 注册 `useBeforeHandleCommandCallback` 在新命令前清除文本
- 悬停时显示工具栏按钮（快存、快读、设置等）
- 打印完成后显示闪烁光标

### BGMActor — 背景音乐

一个无视觉渲染的"无头"图层（Actor），监听 `gameState.bgm` 的变化并调用音频 API。

```typescript title="src/actors/bgm.tsx"
export function BGMActor() {
  const bgmState = useSnapshot(gameState.bgm);

  useEffect(() => {
    if (bgmState.src) {
      executePluginCommand('audio', {
        subCommand: 'load',
        name: 'bgm',
        src: bgmState.src,
        settings: {
          loop: bgmState.loop,
          volume: bgmState.volume ?? 1,
        },
      });
      executePluginCommand('audio', {
        subCommand: 'play',
        name: 'bgm',
        fadeTime: bgmState.fadeTime ?? 600,
      });
    }
  }, [bgmState.src]);

  return null; // 无视觉输出
}
```

## 在 Stage 中组装

图层（Actor）组件在 `src/pages/stage.tsx` 中组装：

```typescript title="src/pages/stage.tsx"
export function Stage() {
  return (
    <StageContextProvider stage={stage}>
      <BackgroundActor />
      <CharacterActor />
      <TextBoxActor onButtonClick={handleButtonClick} />
      <BGMActor />
    </StageContextProvider>
  );
}
```

:::tip[渲染顺序]
组件的渲染顺序决定了视觉层次——后面的组件渲染在上层。因此背景在最底层，文本框在最上层。
:::

## 创建自定义图层（Actor）

假设你想添加一个"屏幕震动"效果：

### 1. 定义状态

```typescript title="src/state/game.ts"
export interface ShakeState {
  active: boolean;
  intensity: number;
}

// 添加到 gameState
export const gameState = proxy<GameState>({
  // ...existing...
  shake: { active: false, intensity: 0 },
});
```

### 2. 创建图层（Actor）组件

```typescript title="src/actors/shake.tsx"
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { gameState } from '../state/game';
import { useSkipCallback } from '@momoyu-ink/kit';

export function ShakeActor({ children }: { children: React.ReactNode }) {
  const shakeState = useSnapshot(gameState.shake);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!shakeState.active) {
      setOffset({ x: 0, y: 0 });
      return;
    }

    const interval = setInterval(() => {
      const intensity = shakeState.intensity;
      setOffset({
        x: (Math.random() - 0.5) * intensity * 2,
        y: (Math.random() - 0.5) * intensity * 2,
      });
    }, 16);

    return () => clearInterval(interval);
  }, [shakeState.active, shakeState.intensity]);

  // Support skip: immediately stop shaking
  useSkipCallback(() => {
    gameState.shake.active = false;
  });

  return (
    <container x={offset.x} y={offset.y}>
      {children}
    </container>
  );
}
```

### 3. 组装到 Stage

```typescript title="src/pages/stage.tsx"
export function Stage() {
  return (
    <StageContextProvider stage={stage}>
      <ShakeActor>
        <BackgroundActor />
        <CharacterActor />
      </ShakeActor>
      <TextBoxActor onButtonClick={handleButtonClick} />
      <BGMActor />
    </StageContextProvider>
  );
}
```

现在 `ShakeActor` 包裹了背景和角色——震动时，这两个层会一起移动，而文本框保持不动。
