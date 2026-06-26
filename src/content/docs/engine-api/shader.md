---
title: 着色器 API
sidebar:
  order: 4
---

`shader` 节点用于把多个输入通道交给一个 shader pass 统一处理。它既可以承载内建转场效果，也可以直接运行自定义 WGSL 片元着色器。`shader-slot` 则负责为它提供各个输入 channel。

## 基本结构

```tsx
<shader shader={{ type: 'builtin', name: 'crossfade' }} timeControl="transition" displayChannel={1}>
  <shader-slot channel={0}>
    <sprite src="bg/day.png" />
  </shader-slot>
  <shader-slot channel={1}>
    <sprite src="bg/night.png" />
  </shader-slot>
</shader>
```

当前固定支持 `0..3` 四个 channel。未占用的 channel 会自动填充 dummy texture。

## `<shader>` 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `shader` | `ShaderSource` | `{ type: 'builtin', name: 'crossfade' }` | 着色器来源，可以是内建效果，也可以是自定义 raw WGSL |
| `timeControl` | `"auto" \| "manual" \| "transition"` | `"auto"` | 时间推进方式 |
| `displayChannel` | `number \| null` | `null` | 稳定状态下直接显示的 channel；做转场时通常设为目标 channel |
| `onPrepared` | `() => void` | — | `transition` 模式下，`prepare` 完成捕获并进入可执行状态时触发 |
| `onFinished` | `() => void` | — | `transition` 模式完成时触发 |

`timeControl` 的含义如下：

- `auto`：节点挂载后自动推进时间，适合持续播放的普通 shader。
- `manual`：初始暂停，通过命令手动开始、停止和重置时间。
- `transition`：进入转场状态机，由 `prepare` / `perform` 驱动 `progress`，并在完成后触发 `finished` 事件。

## `<shader-slot>` 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `channel` | `number` | `0` | 输入 channel 编号，范围 `0..3` |
| `empty` | `boolean` | `false` | 是否声明为空输入；为空时不会渲染子节点 |
| `static` | `boolean` | `false` | 将输入视为静态内容，作为减少重复 render-to-texture 的优化手段 |
| `space` | `ShaderSlotSpace` | `'normal'` | 控制子内容使用普通舞台坐标还是 shader 局部坐标；设为 `shader` 时，slot 左上角为 `(0, 0)` |
| `width` | `number` | `0` | `empty={true}` 时的纹理宽度，必须为非零值 |
| `height` | `number` | `0` | `empty={true}` 时的纹理高度，必须为非零值 |

`shader-slot` 通常直接作为 `<shader>` 的子节点使用。对于 `mask` 这类需要额外规则图的效果，常见做法是把规则图放在 `channel={2}`，并配合 `space="shader"`。

## `ShaderSource`

### 内建效果

内建效果写法如下：

```tsx
<shader
  shader={{ type: 'builtin', name: 'wipe', direction: 'left', softness: 0.08 }}
  timeControl="transition"
  displayChannel={1}
/>
```

当前内建 `name` 包括 `crossfade`、`wipe`、`fade`、`push`、`slideaway`、`zoom`、`pixellate` 和 `mask`。它们的参数结构与 [`@transPerform`](/start/commands/#transperform)、[`@bgTransEffect`](/start/commands/#bgtranseffect) 和 [`@charTransEffect`](/start/commands/#chartranseffect) 完全一致。

当使用内建转场约定时，通常会使用以下 channel：

- `channel 0`：旧画面（from）
- `channel 1`：新画面（to）
- `channel 2`：`mask` 效果的规则图

### 自定义 raw WGSL

raw 模式要求传入**完整的片元 WGSL 模块**，而不是单个函数片段：

```tsx
<shader
  shader={{
    type: 'raw',
    content: fragmentWgsl,
    params: [
      { name: 'strength', type: 'float', value: 0.35 },
      { name: 'speed', type: 'float', value: 1.2 },
    ],
  }}
  timeControl="auto"
  displayChannel={0}
>
  <shader-slot channel={0}>
    <sprite src="bg/classroom.png" />
  </shader-slot>
</shader>
```

`params` 仅在 `type: 'raw'` 时可用。每一项都是一个 4 字节槽位，类型只支持 `float` 和 `int`。当前总共提供 `32` 个槽位，也就是 `128` 字节。

## Raw WGSL 约定

引擎会提供顶点着色器，因此你只需要编写片元模块，并导出 `fs_main`。raw shader 的运行时符号分为两部分：一部分由引擎自动注入，另一部分需要你自己声明。

### 引擎自动注入的内容

以下类型、全局变量和 helper 会在运行时自动注入到你的 WGSL 模块前面：

| 名称 | 等价声明 | 用途 |
|------|------|------|
| `RenderUniform` | `struct RenderUniform { position: vec2<f32>, size: vec2<f32> }` | 当前 shader rect 在舞台逻辑坐标中的位置和尺寸 |
| `BuiltinsUniform` | `struct BuiltinsUniform { time: f32, time_delta: f32, progress: f32, effect_id: i32, frame: u32, channel_count: u32, stage_size: vec2<f32> }` | 引擎内建时间、进度和舞台信息 |
| `HiddenUniform` | 内部辅助结构 | 引擎内部使用的采样修正信息，不建议依赖 |
| `render_uniform` | `@group(1) @binding(0) var<uniform> render_uniform: RenderUniform;` | 读取当前 shader rect 的逻辑坐标与尺寸 |
| `moyu_hidden_uniform_internal` | `@group(1) @binding(1) var<uniform> moyu_hidden_uniform_internal: HiddenUniform;` | 采样范围修正的内部 uniform，不属于稳定 API |
| `builtins` | `@group(1) @binding(2) var<uniform> builtins: BuiltinsUniform;` | 读取内建时间、`progress`、舞台尺寸等 |
| `texture_sampler` | `@group(1) @binding(4) var texture_sampler: sampler;` | 通用采样器 |
| `channel0..3` | `@group(1) @binding(5..8) var channelN: texture_2d<f32>;` | 四个输入通道纹理 |
| `sampleChannel0..3(uv)` | `fn sampleChannelN(uv: vec2<f32>) -> vec4<f32>` | 对对应通道进行带采样范围修正的常规采样 |

这意味着在 raw shader 中，你**不需要也不应该**重复声明 `render_uniform`、`builtins`、`texture_sampler`、`channel0..3` 以及 `sampleChannel0..3()`。重复声明会与引擎注入版本重名。

对于 `channel0..3` 的常规采样，应当优先使用 `sampleChannel0..3(uv)`，而不是直接写 `textureSample(channelN, texture_sampler, input.uv)`。helper 会自动处理 render-to-texture 带来的采样范围修正，同时保持 `input.uv` 继续表示当前 shader rect 内的逻辑归一化坐标 `0..1`。

可以把两者的职责简单理解为：

- `input.uv`：当前 shader rect 内的逻辑归一化坐标，始终是 `0..1`
- `sampleChannel0..3(uv)`：在保持 `uv` 语义不变的前提下，采样对应输入 channel 的正确内容区域

当你需要 `textureDimensions(channel0)`、`textureLoad(...)` 这类更底层的纹理操作时，仍然可以直接访问 `channel0..3` 和 `texture_sampler`。helper 只是统一提供这些符号，不会限制 raw shader 的能力。

:::note
这些 helper 是引擎在运行时注入的，不需要也不应该在你的 WGSL 源文件中重复定义。编辑器或静态分析工具可能无法识别这类运行时注入符号，但这不会影响 Shader 正常运行。
:::

### 你需要自己声明的内容

| 项目 | 是否必须 | 说明 |
|------|------|------|
| `VertexOutput` | 是 | 片元入口参数类型，需要与引擎顶点着色器输出匹配 |
| `fs_main` | 是 | 片元入口函数 |
| `ParamsUniform` | 仅在读取 `params` 时需要 | 由你自己定义内存布局 |
| `params` 变量 | 仅在读取 `params` 时需要 | 固定使用 `@group(1) @binding(3)` |

一个最小的 raw WGSL 模板通常如下：

```wgsl
struct ParamsUniform {
  slots: array<vec4<u32>, 8>,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
}

@group(1) @binding(3)
var<uniform> params: ParamsUniform;
```

`BuiltinsUniform` 中各字段的含义如下：

| 字段 | 说明 |
|------|------|
| `time` | 已播放时间（秒）。`auto` / `manual` 模式下来自普通时间轴；`transition` 模式下来自当前转场时间轴 |
| `time_delta` | 与上一帧的时间差（秒） |
| `progress` | 转场进度，范围 `0~1`；非 `transition` 模式下恒为 `0` |
| `effect_id` | 内建效果编号；raw shader 下固定为 `-1` |
| `frame` | 当前节点的局部帧计数 |
| `channel_count` | 当前已声明的 channel 数量 |
| `stage_size` | 逻辑舞台尺寸 |

关于 `params`，有两点需要注意：

- 引擎只是把 `32` 个 4 字节槽位原样写入这块 uniform 内存，不会按名字做查找或重排。
- `name` 仅用于用户侧语义和报错信息，真正的布局完全由数组顺序决定。

如果你不想自己处理 WGSL uniform 对齐，最稳妥的方式就是像内建 shader 一样使用 `slots: array<vec4<u32>, 8>`，然后在 shader 里自行解包：

```wgsl
fn read_param_u32(index: u32) -> u32 {
  let lane = params.slots[index / 4u];
  switch (index % 4u) {
    case 0u: { return lane.x; }
    case 1u: { return lane.y; }
    case 2u: { return lane.z; }
    default: { return lane.w; }
  }
}

fn read_param_f32(index: u32) -> f32 {
  return bitcast<f32>(read_param_u32(index));
}
```

## 节点命令

`shader` 节点通过 `ref.current?.executeCommand(...)` 接收命令。

:::note
`prepare` / `perform` 只在 `timeControl="transition"` 时可用；`start` / `stop` / `reset` 只在 `auto` / `manual` 时可用。不符合模式的调用会被忽略并打印警告。
:::

### prepare

为一次转场准备 from/to 输入，但不会立刻开始播放。

```tsx
shaderRef.current?.executeCommand({
  subCommand: 'prepare',
  fromChannel: 0,
  toChannel: 1,
  mode: 'static',
});
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `fromChannel` | `number` | — | 旧画面 channel，范围 `0..3` |
| `toChannel` | `number` | — | 新画面 channel，范围 `0..3` |
| `mode` | `"static" \| "live"` | 沿用当前保留模式 | 旧画面保留方式 |

`fromChannel` 和 `toChannel` 必须不同，且都必须是已声明、非空的 slot。

### perform

开始播放一次已准备好的转场。

```tsx
shaderRef.current?.executeCommand({
  subCommand: 'perform',
  duration: 800,
});
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `duration` | `number` | 转场时长（毫秒） |

### start / stop / reset

这三个命令用于控制 `auto` / `manual` 模式下的普通时间轴：

```tsx
shaderRef.current?.executeCommand({ subCommand: 'start' });
shaderRef.current?.executeCommand({ subCommand: 'stop' });
shaderRef.current?.executeCommand({ subCommand: 'reset' });
```

- `start`：开始或恢复时间推进。
- `stop`：暂停时间推进。
- `reset`：把时间轴重置到 `0`。

## 事件

当前 `shader` 节点暴露两个事件：

### prepared

仅在 `transition` 模式下触发，表示这次 `prepare` 已经完成，from 输入已经捕获完毕，可以安全执行 `perform`。React 层通常直接使用 `onPrepared`：

```tsx
<shader
  timeControl="transition"
  onPrepared={() => {
    console.log('prepared');
  }}
/>
```

### finished

仅在 `transition` 模式下触发，表示这次转场已经结束并回到稳定状态。React 层通常直接使用 `onFinished`：

```tsx
<shader
  timeControl="transition"
  onFinished={() => {
    console.log('transition done');
  }}
/>
```

## 示例

### 1. 内建 transition

下面的例子使用内建 `wipe` 效果，在两张背景图之间执行一次转场：

```tsx
import { useLayoutEffect, useRef } from 'react';
import type { Node } from '@momoyu-ink/kit';

function WipeTransition({ trigger }: { trigger: number }) {
  const shaderRef = useRef<Node>(null);

  useLayoutEffect(() => {
    shaderRef.current?.executeCommand({
      subCommand: 'prepare',
      fromChannel: 0,
      toChannel: 1,
      mode: 'static',
    });
    shaderRef.current?.executeCommand({
      subCommand: 'perform',
      duration: 900,
    });
  }, [trigger]);

  return (
    <shader
      ref={shaderRef}
      shader={{ type: 'builtin', name: 'wipe', direction: 'left', softness: 0.08 }}
      timeControl="transition"
      displayChannel={1}
      onFinished={() => console.log('finished')}
    >
      <shader-slot channel={0}>
        <sprite src="bg/day.png" />
      </shader-slot>
      <shader-slot channel={1}>
        <sprite src="bg/night.png" />
      </shader-slot>
    </shader>
  );
}
```

### 2. 普通 raw shader

下面的例子展示一个持续播放的波纹色偏效果。它使用 `channel0` 作为输入，并通过 `params` 传入两个浮点参数：

```tsx
const fragmentWgsl = `
struct ParamsUniform {
  slots: array<vec4<u32>, 8>,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
}

@group(1) @binding(3)
var<uniform> params: ParamsUniform;

fn read_param_u32(index: u32) -> u32 {
  let lane = params.slots[index / 4u];
  switch (index % 4u) {
    case 0u: { return lane.x; }
    case 1u: { return lane.y; }
    case 2u: { return lane.z; }
    default: { return lane.w; }
  }
}

fn read_param_f32(index: u32) -> f32 {
  return bitcast<f32>(read_param_u32(index));
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  let color = sampleChannel0(input.uv);
  let strength = read_param_f32(0u);
  let speed = read_param_f32(1u);
  let wave = 0.5 + 0.5 * sin((input.uv.y * 8.0 + builtins.time * speed) * 6.28318);
  let rgb = mix(color.rgb, color.rgb * wave, strength);
  return vec4<f32>(rgb, color.a);
}
`;

<shader
  shader={{
    type: 'raw',
    content: fragmentWgsl,
    params: [
      { name: 'strength', type: 'float', value: 0.35 },
      { name: 'speed', type: 'float', value: 1.2 },
    ],
  }}
  timeControl="auto"
  displayChannel={0}
>
  <shader-slot channel={0}>
    <sprite src="bg/classroom.png" />
  </shader-slot>
</shader>
```
