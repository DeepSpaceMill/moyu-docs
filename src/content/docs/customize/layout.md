---
title: 布局系统
sidebar:
  order: 4.5
---

末语有两种组织界面的方式：

- 用 `x` 和 `y` 手动放置元素；
- 用 `<vbox>` 和 `<hbox>` 自动排列元素。

它们可以混合使用。舞台构图、角色立绘和需要重叠的内容通常适合手动定位；菜单、设置项、按钮组等顺序明确的界面更适合自动排列。

## 手动定位

普通 `<container>` 不会替你排列子元素。每个子元素通过自己的 `x` 和 `y` 决定位置：

```tsx
<container x={100} y={80}>
  <text text="标题" x={0} y={0} fontSize={48} />
  <text text="正文" x={0} y={80} fontSize={28} />
</container>
```

这种方式适合需要自由摆放或互相重叠的内容。缺点也很直接：某个元素的尺寸变化后，后续元素的位置不会自动调整。

## 什么是 Flex 布局

Flex 布局是一种按顺序排列子元素的方法。你先指定排列方向，布局容器再根据每个子元素的尺寸计算位置。

可以把它想成往盒子里依次放东西：

- 纵向盒子从上到下放置；
- 横向盒子从左到右放置；
- `gap` 控制相邻元素之间的距离；
- `padding` 控制内容与盒子边缘的距离；
- 对齐属性控制整组内容靠前、居中或靠后。

末语目前支持最常用的单行排列能力，使用 `<vbox>` 和 `<hbox>` 两个独立节点。若你需要更复杂的布局能力，可以向我们反馈。

## VBox：从上到下排列

`<vbox>` 按照 JSX 中的顺序，从上到下排列直接子元素：

```tsx
<vbox x={120} y={100} gap={24}>
  <text text="开始游戏" fontSize={36} />
  <text text="读取存档" fontSize={36} />
  <text text="设置" fontSize={36} />
</vbox>
```

这里不需要为每段文字计算 `y`。第一项高度变化时，后面的项目会在同一帧重新排列。

## HBox：从左到右排列

`<hbox>` 从左到右排列直接子元素：

```tsx
<hbox x={120} y={100} gap={16} alignItems="center">
  <sprite src="ui/settings.png" />
  <text text="设置" fontSize={36} />
</hbox>
```

这个例子使用 `alignItems="center"`，让图标和文字在纵向居中对齐。

## 尺寸如何计算

### 自动尺寸

省略 `width` 或 `height` 时，布局容器会根据直接子元素计算该方向的尺寸。

VBox 的自动尺寸：

- 宽度取最宽的子元素；
- 高度是所有子元素高度、相邻 `gap` 和上下 `padding` 之和。

HBox 的自动尺寸：

- 宽度是所有子元素宽度、相邻 `gap` 和左右 `padding` 之和；
- 高度取最高的子元素。

例如：

```tsx
<vbox gap={10} padding={20}>
  <text text="第一行" fontSize={30} />
  <text text="第二行" fontSize={30} />
</vbox>
```

这个 VBox 会包住两行文字，并在四周留出 `20` 像素内边距。两行之间有 `10` 像素间距。

### 显式尺寸

设置 `width` 或 `height` 后，对应方向使用指定尺寸：

```tsx
<vbox
  width={600}
  height={400}
  padding={32}
  justifyContent="center"
  alignItems="center"
>
  <text text="居中的内容" fontSize={36} />
</vbox>
```

显式尺寸不会缩放子元素。内容放不下时会溢出，也不会自动裁剪。需要裁剪时，使用 `<clip>` 包住布局容器。

```tsx
<clip width={600} height={400}>
  <vbox width={600} gap={20}>
    {items}
  </vbox>
</clip>
```

## 间距与内边距

### gap

`gap` 只出现在相邻子元素之间：

```tsx
<hbox gap={12}>
  <sprite src="ui/a.png" />
  <sprite src="ui/b.png" />
  <sprite src="ui/c.png" />
</hbox>
```

三个子元素之间有两个 `12` 像素间隔。容器两端不会因为 `gap` 增加空白。

### padding

`padding` 设置四边内边距。`paddingX` 和 `paddingY` 可以分别覆盖水平和垂直方向：

```tsx
<vbox padding={20} paddingX={40} gap={16}>
  <text text="水平内边距为 40" fontSize={28} />
  <text text="垂直内边距为 20" fontSize={28} />
</vbox>
```

最终左右内边距是 `40`，上下内边距是 `20`。

## 两个方向的对齐

布局中有两个方向：

- 主轴是子元素的排列方向；VBox 的主轴是纵向，HBox 的主轴是横向；
- 交叉轴是另一个方向；VBox 的交叉轴是横向，HBox 的交叉轴是纵向。

`justifyContent` 控制主轴，`alignItems` 控制交叉轴。

### justifyContent

| 值 | 效果 |
|------|------|
| `"start"` | 从起点开始排列，默认值 |
| `"center"` | 整组内容在主轴居中 |
| `"end"` | 整组内容靠主轴末端排列 |
| `"space-between"` | 第一项和最后一项贴近两端，剩余空间平均加入项目间距 |

这些值在主轴有剩余空间时才会产生明显区别。自动尺寸容器通常刚好包住内容，因此需要设置对应的 `width` 或 `height`：

```tsx
<hbox width={900} justifyContent="space-between">
  <text text="上一页" fontSize={30} />
  <text text="下一页" fontSize={30} />
</hbox>
```

基础 `gap` 不会被 `space-between` 替代。若同时设置，两者会相加。

### alignItems

| 值 | 效果 |
|------|------|
| `"start"` | 靠交叉轴起点，默认值 |
| `"center"` | 在交叉轴居中 |
| `"end"` | 靠交叉轴末端 |

例如，让 VBox 中不同宽度的项目右对齐：

```tsx
<vbox width={500} alignItems="end" gap={12}>
  <text text="短文本" fontSize={28} />
  <text text="更长的一段文本" fontSize={28} />
</vbox>
```

## 子元素上的 x 和 y

VBox/HBox 决定子元素的基础位置。子元素自己的 `x` 和 `y` 会在这个位置上增加视觉偏移：

```tsx
<vbox gap={20}>
  <text text="第一项" fontSize={30} />
  <text text="向右偏移" x={40} fontSize={30} />
  <text text="第三项" fontSize={30} />
</vbox>
```

第二项会向右移动 `40` 像素，但第三项的位置不会跟着改变。也就是说，`x/y` 可以微调显示位置，不会改变布局为该元素保留的空间。

布局容器的直接子元素不使用 `anchor` 决定布局位置。`pivot`、scale、rotation 和 skew 仍然可以改变视觉效果，但不会推动相邻元素。

## 嵌套布局

VBox 和 HBox 可以互相嵌套。常见做法是用 VBox 组织多行，再用 HBox 组织每一行：

```tsx
<vbox x={120} y={100} gap={20}>
  <hbox gap={16} alignItems="center">
    <sprite src="ui/volume.png" />
    <text text="音量" fontSize={30} />
  </hbox>

  <hbox gap={16} alignItems="center">
    <sprite src="ui/text-speed.png" />
    <text text="文字速度" fontSize={30} />
  </hbox>
</vbox>
```

内层布局先根据自己的内容得到尺寸，外层布局再把它当作一个完整项目排列。嵌套层级没有固定限制。

## 在布局中使用 Container

普通 Container 可以作为 VBox/HBox 的直接子元素。它适合把需要重叠或自由定位的内容组合成一个整体：

```tsx
<vbox gap={24}>
  <container>
    <sprite src="ui/button.png" />
    <text text="开始游戏" x={32} y={18} fontSize={30} />
  </container>

  <container>
    <sprite src="ui/button.png" />
    <text text="读取存档" x={32} y={18} fontSize={30} />
  </container>
</vbox>
```

Container 会根据直接子元素的位置、尺寸和 pivot 计算自己的布局尺寸。scale、rotation 和 skew 造成的视觉扩展不会改变这个尺寸。

负坐标内容可以向 Container 左侧或上方溢出，但不会移动 Container 的局部原点。设计可复用组件时，最好让内容从 `(0, 0)` 附近开始，减少难以察觉的溢出。

## 动态内容与 onLayout

图片加载、文本重新排版或子元素增删时，布局尺寸会在同一帧重新计算。需要读取 VBox/HBox 的最终尺寸时，可以使用 `onLayout`：

```tsx
<vbox
  gap={16}
  onLayout={(event) => {
    console.log(event.width, event.height);
  }}
>
  {items}
</vbox>
```

`onLayout` 只在布局尺寸变化时触发。它适合更新滚动范围、滚动条比例或其他依赖内容尺寸的状态。

:::note
不要在 `onLayout` 中无条件修改会影响同一个布局尺寸的状态，否则可能造成反复布局。先比较新旧值，只在确实变化时更新。
:::

## 可见性与溢出

`visible={false}` 只隐藏渲染结果，不会把元素从布局中移除。隐藏的直接子元素仍然占据空间，也仍然计入 `gap`。若你需要移除某个元素，可以在 JSX 中使用条件渲染。

VBox/HBox 不会自动裁剪溢出内容。需要固定视口时使用 `<clip>`；需要滚动视图时可以使用 `@momoyu-ink/kit` 提供的 `ScrollView`。

## 属性速查

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `width` | `number` | 自动 | 显式宽度 |
| `height` | `number` | 自动 | 显式高度 |
| `gap` | `number` | `0` | 相邻有效子元素的间距 |
| `padding` | `number` | `0` | 四边内边距 |
| `paddingX` | `number` | — | 左右内边距，覆盖 `padding` |
| `paddingY` | `number` | — | 上下内边距，覆盖 `padding` |
| `justifyContent` | `"start" \| "center" \| "end" \| "space-between"` | `"start"` | 主轴对齐 |
| `alignItems` | `"start" \| "center" \| "end"` | `"start"` | 交叉轴对齐 |
| `onLayout` | `(event: LayoutEvent) => void` | — | 尺寸变化时触发 |

尺寸、gap 和 padding 应使用有限的非负数。无效值会被当作 `0`。
