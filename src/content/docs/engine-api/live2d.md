---
title: Live2D 模型
sidebar:
  order: 10
---

`<live2d>` 节点用来在场景中显示 Cubism 模型，支持播放动作与表情、调整参数、控制部件透明度，以及点击命中测试。

## 许可证与获取插件

:::tip[注意]

该功能需要一份**闭源插件**。插件不随引擎发布，需要**主动联系作者**获取。

:::

### 为什么插件单独提供

Live2D Cubism SDK 有自己的授权条款，它的派生产物不能按本引擎的 MPL-2.0 授权，因此插件作为独立二进制单独交付。Cubism Core 动态库同样需要你按 Live2D 官方条款自行取得。

本页面只描述接入方式，不构成 Live2D 授权。发布游戏时，请自行确认你的使用方式符合 Live2D 的许可条款，包括随游戏分发插件、商用发行等情形。示例模型（如 Hiyori）另有素材使用条款，不能直接用于发行。

参考：

- [Live2D Open Software License Agreement](https://www.live2d.com/eula/live2d-open-software-license-agreement_cn.html)
- [Native SDK 下载](https://www.live2d.com/zh-CHS/sdk/download/native/)
- [示例模型使用条款](https://www.live2d.com/zh-CHS/learn/sample/model-terms/)

### 获取方式

通过社区渠道（QQ群或Discord）联系作者获取插件：

见[社区](/more/community/)页面。

## 功能一览

| 能力 | 说明 |
| --- | --- |
| 渲染 | 模型绘制、遮罩裁剪、颜色校正 |
| 动作 | 播放、循环、淡入淡出、按优先级切换 |
| 表情 | 切换与停止 |
| 参数 | 修改单个或批量参数 |
| 部件 | 调整部件透明度 |
| 效果 | 物理、姿态、眨眼、呼吸、目光跟随、自动待机，均可单独开关 |
| 交互 | 按下命中区域回调、手动命中测试、动作事件 |

## 安装与放置

### 插件与 Core

把插件与 Core 动态库放到**引擎可执行文件同目录**：

| 平台 | 插件 | Core |
| --- | --- | --- |
| Windows | `moyu_live2d_plugin.dll` | `Live2DCubismCore.dll` |
| Linux | `libmoyu_live2d_plugin.so` | `libLive2DCubismCore.so` |
| macOS | `libmoyu_live2d_plugin.dylib` | `libLive2DCubismCore.dylib` |

也可以用环境变量 `MOYU_LIVE2D_PLUGIN` 指向插件文件。设置该变量后，插件只从这个路径加载。

### 获取 Core

从[官方 Native SDK 下载页](https://www.live2d.com/zh-CHS/sdk/download/native/)取得 SDK，提取对应平台与架构的 Core 动态库（位于 `Core/dll/<平台>/<架构>/`）。

- Core 需支持 MOC 5.3 格式，版本过低时插件无法初始化；
- 引擎、插件与 Core 的架构需保持一致（如都是 x86_64）；
- 用 `MOYU_LIVE2D_PLUGIN` 指定插件路径时，Core 可以放在插件同目录。

:::caution[补上文件后需要重启]

插件在引擎启动时加载一次。缺少插件或 Core 时补上文件，需要重启引擎才会生效。

:::

### 模型资产

把官方导出的模型整目录复制到项目 `assets/` 下：

```
assets/
└── live2d/
    └── Hiyori/
        ├── Hiyori.model3.json
        ├── Hiyori.moc3
        ├── Hiyori.physics3.json
        ├── Hiyori.pose3.json
        ├── Hiyori.cdi3.json
        ├── Hiyori.userdata3.json
        ├── motions/
        │   ├── Hiyori_m01.motion3.json
        │   └── ...
        └── Hiyori.2048/
            ├── texture_00.png
            └── texture_01.png
```

`src` 填相对 `assets/` 的入口文件路径，例如 `live2d/Hiyori/Hiyori.model3.json`。动作、表情、物理、贴图等文件由入口文件按相对路径引用，请连同目录一起复制。

:::caution[打包]

打包会带上 `assets/` 下的模型文件，但不会自动复制插件与 Core，发布时需要在发布流程中自行准备。发布前请确认模型与插件的授权允许随游戏分发。

:::

## 基本用法

```tsx
import { useRef } from 'react';
import type { Node } from '@momoyu-ink/kit';

function Character() {
  const ref = useRef<Node>(null);

  return (
    <live2d
      ref={ref}
      src="live2d/Hiyori/Hiyori.model3.json"
      x={960}
      y={540}
      scale={0.18}
      look
      onReady={(event) => {
        console.log(`画布 ${event.canvas.width}×${event.canvas.height}`);
      }}
    />
  );
}
```

节点的尺寸取自模型画布，通常比舞台大很多，用 `scale`（或 `scaleX` / `scaleY`）缩放到合适大小。

:::caution[缩放后的渲染问题]

你可能会注意到缩放后画面线条出现锯齿、虚影或摩尔纹，此时建议开启 Mipmap 功能解决。
详见[舞台与全局设置](/customize/settings/#舞台与全局设置)

:::

以下命令示例都基于上面这个 `ref`，并假定模型已就绪。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string \| null` | — | 模型入口文件路径，相对 `assets/`。设为空值即卸载模型 |
| `physics` | `boolean` | `true` | 物理演算 |
| `pose` | `boolean` | `true` | 姿态映射，控制部件的显示与隐藏 |
| `blink` | `boolean` | `true` | 自动眨眼 |
| `breath` | `boolean` | `true` | 自动呼吸 |
| `look` | `boolean` | `false` | 目光跟随指针，影响瞳孔、头部与身体朝向 |
| `idle` | `boolean` | `true` | 空闲时随机播放待机动作 |
| `hitTest` | `boolean` | `false` | 按下时自动做命中测试，命中即触发 `onHit` |

`physics` 控制物理模拟本身，动作、呼吸与参数调整仍会带动头发和衣物。

`look` 依赖指针事件：指针在节点范围内移动时更新目标，离开时回正。触屏设备不会产生这些事件，因此该开关在触屏上无效果。

`idle` 使用名为 `Idle` 的动作组。

切换 `src` 会重新加载模型，之前的动作、参数与部件调整都会重置，加载完成后重新触发 `ready`。

## 命令

通过节点 ref 的 `executeCommand` 调用：

```tsx
ref.current?.executeCommand({ subCommand: 'startMotion', group: 'Idle', index: 0 });
```

### 动作

```typescript
ref.current?.executeCommand({
  subCommand: 'startMotion',
  group: 'Idle',
  index: 0,
  priority: 2,      // 可选，默认 2（Normal）
  fadeIn: 0.5,      // 可选，负值表示使用模型自带设置
  fadeOut: 0.5,     // 可选，负值表示使用模型自带设置
  loop: false,      // 可选
});

ref.current?.executeCommand({ subCommand: 'stopAllMotions' });
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `group` | `string` | — | 动作组名 |
| `index` | `number` | — | 组内序号，从 0 开始 |
| `priority` | `number` | `2` | 见下表 |
| `fadeIn` | `number` | `-1` | 淡入秒数 |
| `fadeOut` | `number` | `-1` | 淡出秒数 |
| `loop` | `boolean` | `false` | 是否循环播放 |

`fadeIn` / `fadeOut` 传负值时，依次使用 `model3.json` 中该动作的配置、`motion3.json` 的 `Meta` 配置、1 秒。

`priority` 取值：

| 值 | 名称 | 行为 |
| --- | --- | --- |
| `0` | None | 最低优先级，总是被拒绝 |
| `1` | Idle | 待机动作，会被其它动作替换 |
| `2` | Normal | 默认优先级 |
| `3` | Force | 无条件抢占当前动作 |

播放新动作需要优先级高于正在播放的动作。用默认的 `Normal` 连续切换时，后一个动作会被忽略，此时请提高 `priority` 或先调用 `stopAllMotions`。

:::note[停止动作与待机]

`idle` 默认为 `true`，动作结束后会自动播放待机动作。要让模型静止，需要同时关闭 `idle` 并调用 `stopAllMotions`。

:::

### 表情

```typescript
ref.current?.executeCommand({ subCommand: 'setExpression', name: 'exp_01' });
ref.current?.executeCommand({ subCommand: 'stopExpression' });
```

表情名可在 `ready` 事件的 `expressions` 中查到。`stopExpression` 会立即回到中性表情。

### 参数

```typescript
// 单个参数
ref.current?.executeCommand({ subCommand: 'setParameter', id: 'ParamAngleX', value: 15 });

// 批量参数
ref.current?.executeCommand({
  subCommand: 'setParameters',
  values: { ParamAngleX: 15, ParamAngleY: -10 },
});

// 清除参数调整
ref.current?.executeCommand({ subCommand: 'resetParameters' });
```

参数调整会持续生效，与动作同时作用，直到调用 `resetParameters` 或切换模型。数值会被限制在参数自身的取值范围内。`setParameters` 只更新传入的 id，其余调整保持不变。传入空的 `values` 不会产生效果。

### 部件

```typescript
ref.current?.executeCommand({ subCommand: 'setPartOpacity', id: 'PartHairFront', value: 0.3 });
```

部件透明度同样持续生效。`resetParameters` 只清除参数调整，部件透明度会保持到模型重新加载。

### 命中测试

开启 `hitTest` 后，每次按下都会对模型做命中测试，碰到区域时触发 `onHit`：

```tsx
<live2d
  ref={ref}
  src="live2d/Hiyori/Hiyori.model3.json"
  hitTest
  onHit={(event) => {
    if (event.area === 'Body') {
      ref.current?.executeCommand({ subCommand: 'startMotion', group: 'TapBody', index: 0, priority: 3 });
    }
  }}
/>
```

`onHit` 只在命中时触发，未命中不回调。区域重叠时，每个命中的区域各触发一次。

需要主动判定的场景，可以直接调用命令：

```typescript
const hit = ref.current?.executeCommand({
  subCommand: 'hitTest',
  area: 'Body',
  x: 1488,
  y: 2087,
});
```

`x` / `y` 使用画布坐标，参见下方「坐标与尺寸」。返回点是否落在该区域内。

:::note[命中后做什么由项目决定]

模型的 `HitAreas` 与 `Motions` 在配置里彼此独立，不包含「点击某个区域就播放某个动作」的映射。上例里的 `TapBody` 是模型作者约定的组名，需要按实际动作组填写。

:::

## 事件

| 事件 | 载荷 | 触发时机 |
| --- | --- | --- |
| `onReady` | 模型元数据 | 模型与元数据加载完成 |
| `onMotionFinished` | `{ group, index }` | 动作播放结束 |
| `onMotionEvent` | `{ value }` | 动作内嵌事件触发 |
| `onBlendModeUnsupported` | `{ value }` | 模型包含无法完全还原的绘制效果 |
| `onHit` | `{ area, x, y }` | 按下时命中了某个区域（需开启 `hitTest`） |
| `onError` | `{ code, message }` | 插件不可用、模型或贴图加载失败 |

`onReady` 表示可以开始发送命令。贴图随后异步加载，加载失败时会触发 `onError`。

`onReady` 的元数据是读取模型信息的入口：

| 字段 | 内容 |
| --- | --- |
| `canvas` | 画布尺寸、原点与每单位像素 |
| `motions` | 动作清单：组名、序号、时长、淡入淡出、可选声音文件 |
| `expressions` | 表情清单：名称、淡入淡出 |
| `hitAreas` | 命中区域名称 |
| `parameters` | 参数清单：id、类型、最小值、最大值、默认值 |

参数类型 `kind`：`-1` 未知、`0` 普通参数、`1` 混合形状参数。

`onBlendModeUnsupported` 每个模型触发一次，表示模型用到了当前不支持的效果组合，绘制结果可能与官方工具有差异。

`executeCommand` 参数有误时会直接抛出错误（例如不存在的表情名），需要在调用处捕获。

## 坐标与尺寸

| 坐标 | 用途 | 约定 |
| --- | --- | --- |
| 画布坐标 | `hitTest` 的 `x` / `y`，`onClick` 的 `offsetX` / `offsetY` | 左上角原点，y 向下，范围是画布尺寸 |
| 舞台坐标 | 指针事件的 `clientX` / `clientY` | 整个舞台 |

把点击事件直接绑在 `<live2d>` 上时，`offsetX` / `offsetY` 就是画布坐标，可以直接使用：

```tsx
<live2d
  ref={ref}
  src="live2d/Hiyori/Hiyori.model3.json"
  onClick={(event) => {
    ref.current?.executeCommand({
      subCommand: 'hitTest',
      area: 'Body',
      x: event.offsetX,
      y: event.offsetY,
    });
  }}
/>
```

事件从子节点冒泡上来，或手上只有舞台坐标时，需要先换算。节点无旋转、无倾斜、祖先无额外变换时：

```typescript
const canvasX = (stageX - globalNodeX) / globalScale;
const canvasY = (stageY - globalNodeY) / globalScale;
```

节点带旋转或嵌套变换时，请按节点的全局变换求逆换算。

## 平台支持

| 平台 | 支持 |
| --- | --- |
| Windows | 支持 |
| Linux | 支持 |
| macOS | 支持 |
| Web | 暂不支持 |
| Android | 支持 |
| iOS | 支持 |

在不支持的平台上，节点保持空白并通过 `onError` 上报一次。

## 排错

| 现象 | 可能原因 | 处理 |
| --- | --- | --- |
| 节点空白，收到 `code: 3` | 插件或 Core 缺失，或版本、架构不匹配 | 检查动态库位置与 `MOYU_LIVE2D_PLUGIN`；补上文件后重启引擎 |
| 收到 `code: 4` | 模型或贴图文件读取失败 | 检查 `src` 路径与模型目录是否完整 |
| 收到 `code: 5` | 模型文件解析失败 | 确认模型由官方工具导出且未损坏 |
| 模型大小或位置不合适 | 节点尺寸取自画布，通常大于舞台 | 调整 `scale` |
| 点击命中测试总是未命中 | 传入了舞台坐标 | 按「坐标与尺寸」换算 |
| 设了 `hitTest` 但 `onHit` 不触发 | 按下处不在模型上，或区域名不对 | 确认在模型可见区域按下；区域名取自 `ready` 的 `hitAreas` |
| 切换动作没有反应 | 优先级不足 | 提高 `priority` 或先调用 `stopAllMotions` |
| 关闭 `idle` 后动作仍在播放 | 关闭 `idle` 只影响后续待机 | 同时调用 `stopAllMotions` |
| `stopAllMotions` 后又开始播放 | `idle` 仍为开启状态 | 先关闭 `idle` |

## 已知限制

当前部分功能尚未支持，请期待后续迭代。若你对某个功能有需求，可以联系我们。

- 支持 Normal、Add、Multiply 三种混合模式，使用其它模式或 5.3 offscreen 效果的模型会按近似方式绘制，并通过 `onBlendModeUnsupported` 提示；
- 命中测试按部件包围盒判定；
- 保存与读档不会保留模型的动作、表情与参数状态，读档后需要重新设置；
- 暂不提供口型同步；
- 自动待机使用名为 `Idle` 的动作组。
- 暂不支持 Web 环境。
