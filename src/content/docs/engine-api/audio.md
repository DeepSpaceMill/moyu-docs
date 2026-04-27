---
title: 音频 API
sidebar:
  order: 4
---

音频系统通过 `executePluginCommand('audio', ...)` 进行控制。引擎提供了灵活的音频实例管理，每个音频由一个唯一的 `name` 标识。

除 `load` 之外，大多数命令的 `name` 都支持两种形式：

- 具体实例名：例如 `bgm`、`voice_alice`
- wildcard 模式：例如 `voice:*`

当 `name` 是 wildcard 模式时，命令会批量作用到所有匹配的实例；若一个也没匹配到，则会报错。`load` 是例外，它必须使用具体实例名，不能用 wildcard 创建实例。

当前 wildcard 语法只支持 `*`，不支持 `?`、`[]`、`{}` 等更复杂的 glob 语法。

## 基本用法

```typescript
import { executePluginCommand } from '@momoyu-ink/kit';

// 加载音频
executePluginCommand('audio', {
  subCommand: 'load',
  name: 'bgm',
  src: 'bgm/theme.opus',
  settings: { loopRegion: [0, -1], volume: 0.8 },
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

`load` 的 `name` 必须是具体实例名，不能是 wildcard 模式。

```typescript
executePluginCommand('audio', {
  subCommand: 'load',
  name: 'bgm',               // 实例名（唯一标识）
  src: 'bgm/theme.opus', // 文件路径
  settings: {                 // 可选：初始设置
    loopRegion: [0, -1],
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
| `volume` | `number` | `1` | 音量（通常为 0~1，允许大于 1 用于放大） |
| `loopRegion` | `[number, number]` | — | 循环区间（秒），`-1` 表示到末尾 |
| `playbackRate` | `number` | `1` | 播放速率 |
| `panning` | `number` | `0` | 声像（-1 左 ~ 0 中 ~ 1 右） |
| `startPosition` | `number` | `0` | 起始播放位置（秒） |
| `reverse` | `boolean` | `false` | 是否倒放 |
| `delayTime` | `number` | — | 延迟播放时长（秒） |
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
| `name` | `string` | 实例名称；支持具体实例名或 wildcard 模式 |
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

> `setVolume` 设置的是这个实例自己的局部音量。若该 `name` 还配置了
> `setGlobalVolume`，最终输出音量会是 `audio.volume × globalVolume(name)`。

### setGlobalVolume — 设置全局音量缩放

```typescript
executePluginCommand('audio', {
  subCommand: 'setGlobalVolume',
  name: 'bgm',
  volume: 0.5,
});
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 规则名称；支持具体实例名或 wildcard 模式 |
| `volume` | `number` | 全局缩放系数（0~1） |

说明：

- `name` 为具体实例名时，保存一条精确规则。
- `name` 为 wildcard 模式时，保存一条 wildcard 规则，并立即重算当前已命中的实例。
- 最终输出音量 = 该实例的局部音量 `audio.volume × globalVolume(name)`。
- 若当前没有匹配到实例，规则仍会保留，后续新创建的实例也会按最新规则解析全局音量。
- 精确规则优先于 wildcard 规则。
- 同时命中多个 wildcard 规则时，最后写入的规则优先。
- 未显式设置过的 `name` 默认按 `1.0` 计算。

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
| SFX | `'sfx'` | 单实例，由 SfxActor 用 `seq` 触发播放 |
| Voice | `'voice'` 或 `'voice:${name}'` | 按角色分通道，由 VoiceActor 管理 |
| Sound | `'sound:${channel}'` | 命名通道，由 SoundActor 管理 |

你可以根据需要使用任意命名策略来管理音频实例。

标准框架在启动和设置变更时，会把 `volume_bgm`、`volume_se`、`volume_voice`
同步到 framework 自己约定的音频 name 上：

- `volume_bgm -> 'bgm'`
- `volume_se -> 'sfx'` 与 `'sound:*'`
- `volume_voice -> 'voice'` 与 `'voice:*'`

因此，标准框架中的语音子通道和命名 sound 通道都会自动继承设置界面的全局音量。
