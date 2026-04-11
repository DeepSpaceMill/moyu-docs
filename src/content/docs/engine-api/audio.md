---
title: 音频 API
sidebar:
  order: 4
---

音频系统通过 `executePluginCommand('audio', ...)` 进行控制。引擎提供了灵活的音频实例管理，每个音频由一个唯一的 `name` 标识。

## 基本用法

```typescript
import { executePluginCommand } from '@momoyu-ink/kit';

// 加载音频
executePluginCommand('audio', {
  subCommand: 'load',
  name: 'bgm',
  src: 'audio/bgm/theme.opus',
  settings: { loop: true, volume: 0.8 },
});

// 播放
executePluginCommand('audio', {
  subCommand: 'play',
  name: 'bgm',
  fadeTime: 600,
});

// 停止并释放
executePluginCommand('audio', {
  subCommand: 'release',
  name: 'bgm',
  fadeTime: 1000,
});
```

## 命令参考

### load — 加载音频

加载音频文件并创建一个音频实例。如果同名实例已存在，会先释放旧实例。

```typescript
executePluginCommand('audio', {
  subCommand: 'load',
  name: 'bgm',               // 实例名（唯一标识）
  src: 'audio/bgm/theme.opus', // 文件路径
  settings: {                 // 可选：初始设置
    loop: true,
    volume: 0.8,
  },
});
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 音频实例名称 |
| `src` | `string` | 音频文件路径（相对于 `assets/`） |
| `settings` | `AudioSettings` | 可选，初始设置 |

#### AudioSettings

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `volume` | `number` | `1` | 音量（0~1） |
| `loop` | `boolean` | `false` | 是否循环 |
| `loopRegion` | `[number, number]` | — | 循环区间（秒），`-1` 表示到末尾 |
| `playbackRate` | `number` | `1` | 播放速率 |
| `panning` | `number` | `0` | 声像（-1 左 ~ 0 中 ~ 1 右） |
| `startPosition` | `number` | `0` | 起始播放位置（秒） |
| `reverse` | `boolean` | `false` | 是否倒放 |
| `delayTime` | `number` | — | 延迟播放时长（毫秒） |
| `fadeTime` | `number` | — | 渐入时长（毫秒） |
| `autoPlay` | `boolean` | `false` | 加载后自动播放 |

### play — 播放

```typescript
executePluginCommand('audio', {
  subCommand: 'play',
  name: 'bgm',
  fadeTime: 600,        // 可选：渐入时长（毫秒）
});
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 实例名称 |
| `fadeTime` | `number` | 可选，渐入时长（毫秒） |
| `waitForEnd` | `boolean` | 可选。为 `true` 时，命令会返回一个在自然播放结束后 resolve 的 Promise |

#### 等待播放结束

如果传入 `waitForEnd: true`，`play` 不只是“开始播放”，还可以被 `await`：

```typescript
await executePluginCommand('audio', {
  subCommand: 'play',
  name: 'voice_alice',
  waitForEnd: true,
});

// 这里说明音频已经自然播放完毕
```

这对自动播放、语音同步，或任何“播完再继续”的逻辑都很有用。标准框架当前就使用这个能力让 `VoiceActor` 在 auto 模式下等待语音自然结束后再结算 auto ticket。

### stop — 停止

停止播放但保留实例，可以再次 `play`。

```typescript
executePluginCommand('audio', {
  subCommand: 'stop',
  name: 'bgm',
  fadeTime: 600,
});
```

### pause — 暂停

暂停播放，保留播放位置。

```typescript
executePluginCommand('audio', {
  subCommand: 'pause',
  name: 'bgm',
  fadeTime: 300,
});
```

### resume — 恢复

从暂停位置恢复播放。

```typescript
executePluginCommand('audio', {
  subCommand: 'resume',
  name: 'bgm',
  fadeTime: 300,
});
```

### release — 释放

停止播放并释放音频实例及其占用的资源。

```typescript
executePluginCommand('audio', {
  subCommand: 'release',
  name: 'bgm',
  fadeTime: 1000,       // 可选：渐出时长
});
```

### setVolume — 设置音量

```typescript
executePluginCommand('audio', {
  subCommand: 'setVolume',
  name: 'bgm',
  volume: 0.5,          // 0~1
  fadeTime: 300,         // 可选：渐变时长
});
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 实例名称 |
| `volume` | `number` | 目标音量（0~1） |
| `fadeTime` | `number` | 可选，渐变时长 |

### seekTo — 跳转到指定时间

```typescript
executePluginCommand('audio', {
  subCommand: 'seekTo',
  name: 'bgm',
  time: 30.0,           // 秒
});
```

### seekBy — 相对跳转

```typescript
executePluginCommand('audio', {
  subCommand: 'seekBy',
  name: 'bgm',
  time: -5.0,           // 后退 5 秒
});
```

### setPlaybackRate — 设置播放速率

```typescript
executePluginCommand('audio', {
  subCommand: 'setPlaybackRate',
  name: 'bgm',
  rate: 1.5,            // 1.5 倍速
});
```

### setLoopRegion — 设置循环区间

设置音频的循环起止点（单位：秒），音乐播放到 `end` 时会跳回 `start`。

```typescript
executePluginCommand('audio', {
  subCommand: 'setLoopRegion',
  name: 'bgm',
  start: 10.0,          // 循环起点（秒）
  end: 120.0,           // 循环终点（秒）
});
```

### setPanning — 设置声像

控制音频的左右声道平衡。

```typescript
executePluginCommand('audio', {
  subCommand: 'setPanning',
  name: 'bgm',
  panning: -0.5,        // -1（全左）~ 0（居中）~ 1（全右）
});
```

## 标准框架中的音频管理

标准框架将音频用途抽象为四个通道，但底层都是同一套 API：

| 通道 | 实例命名规则 | 说明 |
|------|-------------|------|
| BGM | `'bgm'` | 单实例，循环播放，由 BGMActor 管理 |
| SFX | 生成唯一名称 | 多实例，一次性播放 |
| Voice | `'voice'` 或 `'voice_{name}'` | 按角色分通道，由 VoiceActor 管理 |
| Sound | `'sound-${channel}'` | 自定义命名通道 |

你可以根据需要使用任意命名策略来管理音频实例。
