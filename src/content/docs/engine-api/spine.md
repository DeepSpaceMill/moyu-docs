---
title: Spine 骨骼动画
sidebar:
  order: 11
---

`<spine>` 节点用来在场景中显示 Spine 骨骼动画模型，支持多轨动画、混合过渡、皮肤与附件切换、暂停与时间缩放，以及点击命中测试。

## 许可证与获取插件

:::tip[注意]

该功能需要一份**闭源插件**。插件不随引擎发布，需要**主动联系作者**获取。

:::

### 为什么插件单独提供

Spine Runtimes 有自己的授权条款，它的派生产物不能按本引擎的 MPL-2.0 授权，因此插件作为独立二进制单独交付。

本页面只描述接入方式，不构成 Spine 授权。发布游戏时，请自行确认你的使用方式符合 Spine 的许可条款，包括随游戏分发插件、商用发行等情形。示例模型（如 Spineboy）另有素材使用条款，不能直接用于发行。

参考：

- [Spine Runtimes License](https://esotericsoftware.com/spine-runtimes-license)
- [Spine Editor License](https://esotericsoftware.com/spine-editor-license)

### 获取方式

通过社区渠道（QQ群或 Discord）联系作者获取插件：

见[社区](/more/community/)页面。

## 功能一览

| 能力 | 说明 |
| --- | --- |
| 渲染 | 多页图集、网格变形、遮罩裁剪、四种混合模式、双色染色 |
| 动画 | 多轨播放、替换与排队、循环、过渡混合、从中间位置开始 |
| 状态 | 皮肤切换、附件切换、回到初始姿势 |
| 播放 | 暂停、时间缩放、物理重置 |
| 交互 | 按下自动命中、手动命中查询 |
| 事件 | 播放状态、动画内嵌事件、加载与错误 |

## 安装与放置

### 插件

把插件动态库放到**引擎可执行文件同目录**：

| 平台 | 文件名 |
| --- | --- |
| Windows | `moyu_spine_plugin.dll` |
| Linux | `libmoyu_spine_plugin.so` |
| macOS | `libmoyu_spine_plugin.dylib` |
| Android | `libmoyu_spine_plugin.so` |

也可以用环境变量 `MOYU_SPINE_PLUGIN` 指向插件文件。设置该变量后，插件只从这个路径加载。

:::caution[补上文件后需要重启]

插件在引擎启动时加载一次。缺少插件时补上文件，需要重启引擎才会生效。

:::

### 模型资产

Spine 模型由**骨架文件**与**图集文件**两部分组成，图集再引用页图：

```
assets/
└── spine/
    └── hero/
        ├── hero.json          # 或 hero.skel
        ├── hero.atlas
        ├── hero.png           # 页图，文件名由 .atlas 指定
        └── hero2.png          # 多页时更多
```

`src` 填骨架文件相对 `assets/` 的路径，`atlas` 填图集文件路径。

不填 `atlas` 时，引擎按「骨架同目录、同主名、扩展名换成 `.atlas`」推断。很多模型的导出不符合这个规律（骨架叫 `hero-pro.json`，图集却叫 `hero.atlas`），建议显式填写。

`.json` 与 `.skel` 两种骨架格式都支持，画面一致。`.skel` 体积更小、加载更快，推荐用于发行。

图集里每个页都必须声明有效的 `size`，缺少时会加载失败。

:::caution[打包]

打包会带上 `assets/` 下的模型文件，但不会自动复制插件，发布时需要在发布流程中自行准备。发布前请确认模型素材与插件的授权允许随游戏分发。

:::

## 基本用法

```tsx
import { useRef } from 'react';
import type { Node } from '@momoyu-ink/kit';

function Character() {
  const ref = useRef<Node>(null);

  return (
    <spine
      ref={ref}
      src="spine/hero/hero.json"
      atlas="spine/hero/hero.atlas"
      x={960}
      y={540}
      scale={0.8}
      onReady={(event) => {
        console.log(`${event.animations.length} 个动画，${event.skins.length} 个皮肤`);
      }}
    />
  );
}
```

节点的尺寸取自模型的原始几何范围，通常远大于舞台，需要用 `scale` 缩放。这个尺寸不会随动画或换装变化。

:::tip[模型缩小后发虚]

缩放幅度较大时可能出现锯齿与摩尔纹。开启引擎的 Mipmap 功能可以明显改善，详见[舞台与全局设置](/customize/settings/#舞台与全局设置)。

:::

:::caution[加载失败后不会自动重试]

模型加载失败后，只要 `src` 不变就不会重新尝试。补齐文件或改对 `atlas` 后，需要先把 `src` 设为 `null`（或换成别的值），再设回目标路径。

:::

以下命令示例都基于上面这个 `ref`，并假定模型已经加载完成。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string \| null` | — | 骨架文件路径，相对 `assets/`。设为 `null` 卸载模型 |
| `atlas` | `string` | — | 图集文件路径；留空时按骨架路径推断 |
| `skin` | `string` | 空 | 皮肤名；留空使用模型的默认皮肤 |
| `timeScale` | `number` | `1` | 时间缩放，`0.5` 为半速 |
| `paused` | `boolean` | `false` | 暂停推进时间 |
| `physics` | `'none' \| 'pose' \| 'update'` | `'update'` | 物理模式 |
| `hitArea` | `boolean` | `false` | 按下时自动做命中测试并触发 `onHit` |

### 暂停与时间缩放

`paused` 停止推进时间，但不会冻结画面：暂停期间换皮肤、换附件、换姿势都会立即生效，命中测试也照常工作。

`timeScale` 与 `paused` 互相独立，只改变播放速度。

### 物理模式

| 值 | 含义 |
| --- | --- |
| `'none'` | 既不更新也不应用，保持当前状态 |
| `'pose'` | 应用当前状态，但不按时间推进 |
| `'update'` | 按时间推进并应用（默认） |

:::note[三种模式目前表现相同]

三种取值都可以传，但当前版本都按 `'update'` 运行。需要用代码让物理立即回到稳定状态时，请用 `resetPhysics` 命令。

:::

### 切换模型

改变 `src` 会卸载旧模型并加载新的，动画、皮肤、附件等状态全部重置，加载完成后重新触发 `onReady`。

旧模型上正在播放的动画会各收到一次 `onTrackDispose`。

## 命令

通过节点 ref 的 `executeCommand` 调用：

```tsx
ref.current?.executeCommand({ subCommand: 'setAnimation', track: 0, animation: 'idle' });
```

### 播放动画

```typescript
// 替换轨道上的动画
ref.current?.executeCommand({
  subCommand: 'setAnimation',
  track: 0,
  animation: 'walk',
  loop: true,
  mix: 0.2,
  time: 0,
});

// 排队：当前动画结束后接着播
ref.current?.executeCommand({
  subCommand: 'addAnimation',
  track: 0,
  animation: 'jump',
  loop: false,
  mix: 0.15,
});

// 清空轨道；mix > 0 时淡出
ref.current?.executeCommand({ subCommand: 'clearTrack', track: 0, mix: 0.3 });

// 清空全部轨道
ref.current?.executeCommand({ subCommand: 'clearTracks' });
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `track` | `number` | 必填 | 轨道序号，从 0 开始 |
| `animation` | `string` | — | 动画名，取自 `onReady` 的 `animations` |
| `loop` | `boolean` | `false` | 是否循环 |
| `mix` | `number` | `-1` | 过渡时长（秒）；负值使用默认值 |
| `delay` | `number` | `0` | 延迟（秒） |
| `time` | `number` | `0` | 起始播放位置（秒），仅 `setAnimation` 有效 |

`setAnimation` 替换轨道上原有的动画，`addAnimation` 则在后面排队。

`track` 是必填的。第二条动画要用 `track: 1`，否则会和第一条落在同一个轨道上互相替换。

:::note[排队动画的 `delay` 不是「等前一个播完」]

`addAnimation` 默认的 `delay: 0` 按「前一个动画结束时刻减去过渡时长」安排交接，通常**提前**开始混合。要严格等前一个播完，请监听 `onTrackComplete` 后再发命令。

:::

:::note[空轨上叠加动画]

在空轨道上用 `setAnimation` 并指定 `mix` 时，会从下层姿势平滑淡入。`addAnimation` 没有这个效果。

:::

:::note[`time` 只改变播放位置]

被跳过的用户事件不会补发，物理状态也不会重置。

:::

`setAnimation` 返回 `{ entry, epoch }`，标识这一次播放，可用于识别对应的事件：

```typescript
const id = ref.current?.executeCommand({
  subCommand: 'setAnimation',
  track: 0,
  animation: 'jump',
});
// 之后在事件里比对
event.id.entry === id.entry && event.id.epoch === id.epoch
```

两个字段都是 `bigint`。

### 过渡配置

```typescript
// 所有动画切换的默认过渡时长
ref.current?.executeCommand({ subCommand: 'setDefaultMix', duration: 0.2 });

// 指定某一对动画之间的过渡时长，优先于默认值
ref.current?.executeCommand({ subCommand: 'setMix', from: 'idle', to: 'walk', duration: 0.3 });
```

这两个命令只改配置，不影响已经在播放的过渡。

### 皮肤与附件

皮肤用 `skin` 属性切换：

```tsx
<spine src="spine/hero/hero.json" skin="damaged" />
```

换皮肤时，各槽位恢复到该皮肤默认的附件组合，之后当前动画继续生效。皮肤名可在 `onReady` 的 `skins` 中查到。

附件用命令切换：

```typescript
// 换成另一个附件；空名表示移除
ref.current?.executeCommand({ subCommand: 'setAttachment', slot: 'weapon', name: 'sword' });
```

:::note[动画可能会覆盖你换的附件]

如果当前动画的附件时间线包含该槽位，下一帧就会被动画改回去。

:::

### 复位

```typescript
// 清空所有轨道并回到初始姿势
ref.current?.executeCommand({ subCommand: 'resetToSetupPose' });

// 让物理立即回到稳定状态
ref.current?.executeCommand({ subCommand: 'resetPhysics' });
```

`resetToSetupPose` 会同时清空所有轨道。

### 命中测试

```typescript
const name = ref.current?.executeCommand({
  subCommand: 'hitTest',
  x: 200,
  y: 300,
});
// 返回命中的区域名称，未命中返回 null
```

`x` / `y` 使用节点局部坐标，与指针事件的 `offsetX` / `offsetY` 一致。

## 事件

| 事件 | 载荷 | 触发时机 |
| --- | --- | --- |
| `onReady` | 模型信息 | 模型解析完成 |
| `onTrackStart` | `{ track, id, animation }` | 动画开始播放 |
| `onTrackComplete` | `{ track, id, animation }` | 这一轮播放到终点 |
| `onTrackEnd` | `{ track, id, animation }` | 动画停止应用 |
| `onTrackDispose` | `{ track, id, animation }` | 播放被回收 |
| `onTrackEvent` | `{ track, id, animation, name, intValue, floatValue, stringValue, audioPath, volume, balance }` | 动画内嵌事件 |
| `onHit` | `{ epoch, name, x, y }` | 按下时命中区域（需开启 `hitArea`） |
| `onError` | `{ code, message }` | 插件不可用、加载失败或运行出错 |

### 该等哪个事件

| 你想知道 | 用哪个事件 |
| --- | --- |
| 这一轮播完了 | `onTrackComplete` |
| 这次播放彻底结束了 | `onTrackDispose` |

`onTrackComplete` 在每轮到达终点时触发，循环动画每轮都会触发一次。

`onTrackDispose` 在播放被回收时触发：被新动画替换、被 `clearTrack` 清掉、或模型被卸载时。

:::caution[非循环动画播完不会触发 onTrackDispose]

非循环动画播到终点后会停在最后一帧，这次播放并没有结束。要等它被替换或清掉，`onTrackDispose` 才会来。

等非循环动画播完，请用 `onTrackComplete`。

:::

:::note[内部动画也会产生这些事件]

淡出和空轨淡入会用到一段内部动画，它同样会产生轨道事件，动画名为 `<empty>`。事件里的 `animation` 因此不保证都来自 `onReady` 的清单，按名字匹配时请忽略它：

```tsx
onTrackDispose={(event) => {
  if (event.animation === '<empty>') return;
  // ...
}}
```

:::

### 动画内嵌事件

Spine 工程里可以给动画插入事件，播放到对应时间点时通过 `onTrackEvent` 上报：

```tsx
<spine
  src="spine/hero/hero.json"
  onTrackEvent={(event) => {
    if (event.name === 'footstep') playSound('step.opus');
    if (event.audioPath) playSound(event.audioPath, { volume: event.volume });
  }}
/>
```

`name` 是事件名。`intValue` / `floatValue` / `stringValue` / `audioPath` / `volume` / `balance` 对应工程里该事件的字段，未填写的会沿用事件定义中的值，`volume` 默认为 `1`。

### ready 信息

| 字段 | 内容 |
| --- | --- |
| `dataVersion` | 骨架导出的版本字符串 |
| `bounds` | 模型的原始几何范围 `{ x, y, width, height }` |
| `animations` | 动画清单：名称与时长（秒） |
| `skins` | 皮肤名清单，可直接用于 `skin` 属性 |
| `pages` | 图集页清单：路径、尺寸、是否已预乘 |
| `boundingBoxes` | 命中区域名称清单 |

`onReady` 表示模型已经解析完成，可以开始发命令，但贴图可能还在加载，此时节点不绘制任何内容。贴图加载失败会另外触发 `onError`。

`executeCommand` 参数有误时（例如动画名不存在）会直接抛出错误，需要在调用处捕获。

## 坐标与命中

命中测试与命中事件使用**节点局部坐标**，原点在节点左上角、y 向下。

把指针事件直接绑在 `<spine>` 上时，`offsetX` / `offsetY` 就是节点局部坐标：

```tsx
<spine
  ref={ref}
  src="spine/hero/hero.json"
  atlas="spine/hero/hero.atlas"
  hitArea
  onClick={(event) => {
    ref.current?.executeCommand({
      subCommand: 'hitTest',
      x: event.offsetX,
      y: event.offsetY,
    });
  }}
/>
```

事件从子节点冒泡上来、或手上只有舞台坐标时，需要先换算。节点没有旋转、祖先没有额外变换时：

```typescript
const localX = (stageX - globalNodeX) / globalScale;
const localY = (stageY - globalNodeY) / globalScale;
```

节点带旋转或嵌套变换时，请按全局变换求逆换算。

### 命中测试可能什么都点不到

命中测试只认**当前启用**的区域。很多模型的命中区槽位在初始状态下是空的（没有挂附件），这时模型里就没有这个判定区，`hitTest` 会返回空。

这一般是有意设计的：动画常用附件时间线来控制判定区何时开启，比如只有抬手时才允许点中手部。

如果需要在默认状态下就能点中，用 `setAttachment` 把判定区挂上去：

```typescript
ref.current?.executeCommand({ subCommand: 'setAttachment', slot: 'head-bb', name: 'head' });
```

槽位名与附件名来自模型工程，需要向美术确认。

模型的命中区与动画彼此独立，不存在「点这个区域就播那个动画」的配置。拿到区域名后播哪个动画，由你的代码决定。

## 排错

| 现象 | 可能原因 | 处理 |
| --- | --- | --- |
| 节点空白，收到 `code: 5` | 插件缺失，或版本不匹配 | 检查动态库位置与 `MOYU_SPINE_PLUGIN`；补上文件后重启引擎 |
| 收到 `code: 3` | 骨架或图集读取失败 | 检查 `src` / `atlas` 路径，确认 `assets/` 下文件齐全 |
| 收到 `code: 4` | 骨架或图集解析失败 | 确认模型由 4.3 版编辑器导出、文件未损坏 |
| 提示找不到图集 | 没填 `atlas`，推断出的路径不对 | 显式填写 `atlas` |
| 收到 `code: 4` 且提示页缺少尺寸 | 图集里有页没声明 `size` | 用官方工具重新导出 |
| 模型太大或位置不对 | 节点尺寸取自模型原始范围 | 调整 `scale` 与 `x` / `y` |
| 切换动画没有反应 | 动画名不对，或报错被吞掉了 | 用 `onReady` 的 `animations` 校对名称；在调用处 `try` / `catch` |
| 叠加的第二条动画顶掉了第一条 | 两次用了同一个 `track` | 第二条改用 `track: 1` |
| 等动画播完一直没有反应 | 用 `onTrackDispose` 等非循环动画 | 改用 `onTrackComplete` |
| 改对了 `atlas` 仍提示文件不存在 | 加载失败后不会自动重试 | 先把 `src` 设成 `null`，再设回原值 |
| 命中测试总是返回空 | 模型当前没有启用任何命中区 | 见上方「命中测试可能什么都点不到」 |
| 换皮肤后附件不对 | 换皮肤会恢复该皮肤的默认附件 | 换肤后重新调用 `setAttachment` |

常见错误码：

| 码 | 含义 |
| --- | --- |
| `1` | 参数无效，如动画名或皮肤名不存在 |
| `2` | 插件与引擎版本不匹配 |
| `3` | 文件读取失败 |
| `4` | 解析失败 |
| `5` | 插件不可用，或模型超出支持范围 |

## 平台支持

| 平台 | 支持 |
| --- | --- |
| Windows | 支持 |
| Linux | 支持 |
| macOS | 支持 |
| Android | 支持 |
| iOS | 未验证 |
| Web | 不支持 |

Web 平台没有动态库可加载，节点会保持空白并通过 `onError` 上报一次。iOS 尚未验证。

## 已知限制

- 仅支持 **Spine 4.3** 导出的模型；
- 无 Web 实现，iOS 未验证；
- 物理的三种模式目前表现相同；
- 图集页需为 RGBA8888，且每页必须声明 `size`；
- 不提供骨骼级编辑（如运行时调整单根骨骼），也不支持混合皮肤组合、运行时重新打包图集；
- 命中测试按包围盒判定，不是像素级精确命中。

### 尺寸与裁剪

模型的原始几何范围在加载时按默认皮肤的初始姿势测量一次，之后不再变化：

1. 动画把角色移出这个范围很远时，可能被引擎判定为不可见；
2. 放进 `<filter>` 时，伸出范围的部分（比如抬手的手、飘动的头发）会被裁掉；
3. 换成几何范围更大的皮肤，布局尺寸也不会跟着变。

需要完整保留时，把 `<filter>` 移到不含裁剪的层级，或让美术放宽模型的包围范围。
