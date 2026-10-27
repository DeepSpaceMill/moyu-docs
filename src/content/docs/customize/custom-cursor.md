---
title: 自定义鼠标指针
sidebar:
  order: 4.7
---

游戏默认使用操作系统的鼠标指针。如果你希望指针也带上游戏的风格，比如换成自绘的箭头、手形或准星，可以用图片替换掉它。

鼠标指针只改变外观。节点的 `cursor` 属性、鼠标事件的行为都按原有方式工作。

## 快速开始

准备一张图片放进 `assets/` 目录，然后在 `index.json` 中加上 `cursor` 字段：

```json title="index.json"
{
  "cursor": "ui/arrow.png"
}
```

这样所有指针状态都会显示这张图。

## 为不同状态分别指定图片

鼠标指针在不同场合有不同的形态：指向按钮时是手形，选中文本时是 I 形。你可以为每个状态各配一张图：

```json title="index.json"
{
  "cursor": {
    "default": "ui/arrow.png",
    "pointer": { "src": "ui/hand.png", "hotspot": [14, 3] },
    "text": "ui/ibeam.png"
  }
}
```

上例中 `pointer` 和 `text` 用了自己的图，其余状态（如 `move`、`wait`）没有配置，会使用 `default` 的图。

| 写法 | 说明 |
| --- | --- |
| `"cursor": "路径"` | 所有状态共用一张图 |
| `"cursor": { "default": "路径" }` | 同上，只是写成了对象形式 |
| `"cursor": { "状态名": "路径" }` | 为特定状态指定图片 |
| `"cursor": { "状态名": { "src": "路径", "hotspot": [x, y] } }` | 指定图片并设置热点 |

## 热点

热点（hotspot）是指针图片上**响应鼠标位置的那一点**。比如箭头图的热点应该在箭头尖端，手形图的热点应该在食指指肚。

热点以图片像素为单位，左上角为 `(0, 0)`。不写时默认为 `(0, 0)`，也就是图片左上角。

```json
{ "src": "ui/hand.png", "hotspot": [14, 3] }
```

:::tip
箭头类图片的尖端通常就在左上角附近，因此默认值 `(0, 0)` 对这类图往往已经够用。手形、I 形、准星等图片则需要手动指定热点，否则指针的响应点会偏到图片左上角。
:::

## 状态名

状态名就是节点 `cursor` 属性可用的值，配置里用下面的名称作为键，共 36 种。

`default` 比较特殊：它既是「普通箭头」这个状态，也是其他状态没有配置时使用的默认图。所以你只配一张 `default` 图，效果和用字符串写法一样。

配置里的状态名**区分大小写**，必须完全匹配下表的写法。写入不存在的名称时引擎会记录一条警告并忽略该项。

### 状态一览

将鼠标移到「查看」上即可看到系统对该状态的呈现效果。自定义图片会替换掉这里显示的样子。

| 状态名 | 适用场景 | 查看 |
| --- | --- | --- |
| `default` | 默认箭头，也是其他状态的默认图 | <span style="cursor: default">查看</span> |
| `context-menu` | 有上下文菜单可用 | <span style="cursor: context-menu">查看</span> |
| `help` | 有帮助信息可用 | <span style="cursor: help">查看</span> |
| `pointer` | 可点击的链接、按钮 | <span style="cursor: pointer">查看</span> |
| `progress` | 程序在后台忙碌，仍可操作 | <span style="cursor: progress">查看</span> |
| `wait` | 程序忙碌，暂时无法操作 | <span style="cursor: wait">查看</span> |
| `cell` | 可选择的表格单元格 | <span style="cursor: cell">查看</span> |
| `crosshair` | 精确取点，如绘图 | <span style="cursor: crosshair">查看</span> |
| `text` | 可选择、可编辑的文本 | <span style="cursor: text">查看</span> |
| `vertical-text` | 垂直排版的文本 | <span style="cursor: vertical-text">查看</span> |
| `alias` | 将指向创建快捷方式 | <span style="cursor: alias">查看</span> |
| `copy` | 将指向复制 | <span style="cursor: copy">查看</span> |
| `move` | 可向任意方向移动 | <span style="cursor: move">查看</span> |
| `no-drop` | 拖放目标不接受放下 | <span style="cursor: no-drop">查看</span> |
| `not-allowed` | 当前操作不被允许 | <span style="cursor: not-allowed">查看</span> |
| `grab` | 可被抓取拖动，尚未按下 | <span style="cursor: grab">查看</span> |
| `grabbing` | 已经抓取并正在拖动 | <span style="cursor: grabbing">查看</span> |
| `e-resize` | 向东（右）可调整大小 | <span style="cursor: e-resize">查看</span> |
| `n-resize` | 向北（上）可调整大小 | <span style="cursor: n-resize">查看</span> |
| `ne-resize` | 向东北可调整大小 | <span style="cursor: ne-resize">查看</span> |
| `nw-resize` | 向西北可调整大小 | <span style="cursor: nw-resize">查看</span> |
| `s-resize` | 向南（下）可调整大小 | <span style="cursor: s-resize">查看</span> |
| `se-resize` | 向东南可调整大小 | <span style="cursor: se-resize">查看</span> |
| `sw-resize` | 向西南可调整大小 | <span style="cursor: sw-resize">查看</span> |
| `w-resize` | 向西（左）可调整大小 | <span style="cursor: w-resize">查看</span> |
| `ew-resize` | 东西双向可调整大小 | <span style="cursor: ew-resize">查看</span> |
| `ns-resize` | 南北双向可调整大小 | <span style="cursor: ns-resize">查看</span> |
| `nesw-resize` | 东北至西南双向可调整大小 | <span style="cursor: nesw-resize">查看</span> |
| `nwse-resize` | 西北至东南双向可调整大小 | <span style="cursor: nwse-resize">查看</span> |
| `col-resize` | 列宽可调整 | <span style="cursor: col-resize">查看</span> |
| `row-resize` | 行高可调整 | <span style="cursor: row-resize">查看</span> |
| `all-scroll` | 可向任意方向滚动 | <span style="cursor: all-scroll">查看</span> |
| `zoom-in` | 可放大 | <span style="cursor: zoom-in">查看</span> |
| `zoom-out` | 可缩小 | <span style="cursor: zoom-out">查看</span> |
| `dnd-ask` \* | 拖放动作待用户选择 | <span style="cursor: dnd-ask">查看</span> |
| `all-resize` \* | 可双向调整大小 | <span style="cursor: all-resize">查看</span> |

:::note[关于演示效果]
上表的形状来自浏览器和操作系统的系统指针，某些系统主题下部分形状可能显示为默认箭头。带 \* 的两个状态没有对应的 CSS 关键字，浏览器一律显示为默认箭头，在游戏的 native 平台上可以正常呈现。

与上面这些系统指针无关，游戏里配置了自定义图片后显示的是你自己的图片。
:::

### 隐藏指针

`hidden` 可以写进节点的 `cursor` 属性来隐藏指针，但它不能出现在 `cursor` 配置里。配置中出现 `hidden` 时引擎会警告并忽略它，提示你改用节点的 `cursor="hidden"`。

## 运行时切换

游戏运行中也可以用 `setCustomCursors` 命令随时更换指针，比如进入某个特殊场景时换成主题指针，离开后恢复：

```typescript
import { executePluginCommand } from '@momoyu-ink/kit';

// 换成一套主题指针
await executePluginCommand('system', {
  subCommand: 'setCustomCursors',
  cursors: {
    default: 'ui/theme/arrow.png',
    pointer: { src: 'ui/theme/hand.png', hotspot: [14, 3] },
  },
});

// 恢复为系统指针
await executePluginCommand('system', {
  subCommand: 'setCustomCursors',
  cursors: {},
});
```

传入的配置与 `index.json` 中的 `cursor` 字段格式完全一致，`index.json` 里怎么写的，这里就怎么写。传入空对象 `{}` 会清空所有自定义指针，回到系统指针。

命令返回 `Promise`，`await` 之后新的指针图片已经交给引擎，之后的变化由引擎完成。

详见[系统 API](/engine-api/system/#setcustomcursors--设置自定义鼠标指针)。

## 注意事项

### 图片尺寸

指针图片不应超过 **2048×2048 像素**，这是平台的硬性上限。超过的图片会被拒绝加载，对应状态退回 `default`，再退回系统指针。

在 Web 上，浏览器还有更小的限制（常见 128×128），超出时浏览器会继续使用上一个指针。由于这个限制因浏览器而异，建议把指针控制在 **128×128 以内**，这也远大于实际需要的尺寸。

### 按原始像素显示

指针图片按原始像素尺寸显示，不随屏幕分辨率或舞台缩放变化。想让高分屏上更清晰，直接提供更大的图片。

指针也不参与[多倍图](/customize/settings/#多倍图资源)的变体选择，配置里写哪个文件就用哪个文件。

### 只支持静态图片

动图格式（如 APNG、动态 WebP）只取第一帧。需要指针有动画效果时，只能自己在舞台上绘制图片并隐藏系统指针。

### 单条配置失败

某个状态的图片路径不存在、格式无法识别或热点超出图片范围时，引擎会记录一条警告并跳过该状态，它退回 `default`（或系统指针），其他状态照常显示。

如果你配置了多张图但只有部分生效，查看日志中的警告可以定位是哪一条出了问题。

### 只在 `interactive` 节点上生效

节点的 `cursor` 属性只在节点同时设置了 `interactive` 时才起作用。这是引擎的既有行为，但配置指针时容易忽略。

### 子节点继承父节点的指针

与 CSS 的 `cursor` 一样，指针会从最近的、设置过 `cursor` 的祖先节点继承下来。所以给一个容器设置 `cursor`，它内部的所有内容（包括文字、图片等子节点）都会显示这个指针，不需要给每个子节点重复设置。

子节点自己设置了 `cursor` 时，以自己的为准。

```jsx
{/* 整个色块包括内部的文字都使用 pointer */}
<sprite interactive cursor="pointer">
  <text text="点击这里" />
</sprite>
```

### 移动端与无窗口环境

在 Android 和 iOS 上，系统不允许应用替换鼠标指针，配置会被读取但不会生效。无窗口（`--headless`）运行同样不会显示指针。
