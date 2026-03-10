---
title: 内置 JSX 元素
sidebar:
  order: 4
---

在末语中，所有的 UI 都使用引擎提供的自定义 JSX 元素构建。这些元素**不是** HTML 元素——它们直接对应引擎底层的渲染节点。

## 通用属性

所有元素都支持以下属性：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `label` | `string` | — | 节点标签（调试用，在开发工具中显示） |
| `x` | `number` | `0` | X 坐标 |
| `y` | `number` | `0` | Y 坐标 |
| `anchor` | `[number, number]` | `[0, 0]` | 锚点位置（0~1 范围，决定坐标对齐点） |
| `pivot` | `[number, number]` | `[0, 0]` | 旋转/缩放中心（0~1 范围） |
| `scale` | `number` | `1` | 整体缩放 |
| `scaleX` | `number` | `1` | 水平缩放 |
| `scaleY` | `number` | `1` | 垂直缩放 |
| `rotation` | `number` | `0` | 旋转角度（角度制） |
| `skew` | `number` | `0` | 整体斜切 |
| `skewX` | `number` | `0` | 水平斜切 |
| `skewY` | `number` | `0` | 垂直斜切 |
| `visible` | `boolean` | `true` | 是否可见 |
| `tint` | `string` | `"#FFFFFF"` | 着色（CSS 颜色值） |
| `opacity` | `number` | `1` | 透明度（0~1） |
| `interactive` | `boolean` | `false` | 是否响应交互事件 |
| `cursor` | `MoyuCursor` | — | 鼠标悬停时的光标样式 |

### 事件处理

设置 `interactive={true}` 后，元素可以响应以下事件：

```typescript
// 鼠标事件
onClick={(e: MouseEvent) => { ... }}
onMouseDown={(e: MouseEvent) => { ... }}
onMouseUp={(e: MouseEvent) => { ... }}
onMouseMove={(e: MouseEvent) => { ... }}
onMouseEnter={(e: MouseEvent) => { ... }}
onMouseLeave={(e: MouseEvent) => { ... }}

// 键盘事件
onKeyDown={(e: KeyboardEvent) => { ... }}
onKeyUp={(e: KeyboardEvent) => { ... }}

// 触摸事件
onTouchStart={(e: TouchEvent) => { ... }}
onTouchMove={(e: TouchEvent) => { ... }}
onTouchEnd={(e: TouchEvent) => { ... }}
onTouchCancel={(e: TouchEvent) => { ... }}
```

:::tip
设置了 `onClick` 等事件处理函数后，`interactive` 会被自动设置为 `true`。
:::

### 坐标系

末语使用左上角为原点的坐标系，X 轴向右，Y 轴向下。坐标以舞台尺寸为基准（通常为 1920×1080），引擎会自动处理到不同窗口大小的缩放。

---

## `<container>` — 容器

容器是最基础的布局元素，本身不渲染任何内容，用于组织和分组子元素。

```tsx
<container label="角色层" x={0} y={0}>
  <sprite src="characters/alice.png" />
  <sprite src="characters/bob.png" />
</container>
```

容器支持所有通用属性。对容器设置的变换（位移、缩放、旋转等）会影响所有子元素。

---

## `<sprite>` — 图片精灵

用于显示图片。这是最常用的元素之一。

```tsx
<sprite src="bg/classroom.png" />
<sprite src="ui/button.png" x={100} y={200} />
```

### 专有属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` | — | 图片路径（相对于 `assets/`） |
| `mode` | `"normal" \| "nineslice"` | `"normal"` | 渲染模式 |
| `area` | `[number, number, number, number]` | — | 裁剪区域（归一化坐标 0~1：`[x0, y0, x1, y1]`） |

### 九宫格模式

九宫格模式用于制作可拉伸的 UI 元素（如按钮、面板背景），保持四个角不变形：

```tsx
<sprite
  src="ui/panel_bg.png"
  mode="nineslice"
  bounds={[20, 20, 20, 20]}
  targetWidth={400}
  targetHeight={300}
/>
```

| 属性 | 类型 | 说明 |
|------|------|------|
| `bounds` | `[left, top, right, bottom]` | 九宫格边距（像素） |
| `nineSliceMode` | `"stretch" \| "repeat" \| "mirror" \| "blank"` | 中间区域的填充方式 |
| `targetWidth` | `number` | 目标宽度 |
| `targetHeight` | `number` | 目标高度 |

---

## `<text>` — 文本

用于渲染文本内容。支持多种打印效果。

```tsx
<text
  text="你好，世界！"
  fontSize={32}
  fillColor="#FFFFFF"
  x={100}
  y={100}
/>
```

### 专有属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | `string` | `""` | 文本内容 |
| `fontSize` | `number` | — | 字号 |
| `fillColor` | `string` | — | 文本颜色（CSS 颜色值） |
| `printMode` | `"instant" \| "typewriter" \| "printer"` | `"instant"` | 打印模式 |
| `printSpeed` | `number` | — | 打印速度（typewriter: 字/秒，printer: 行/秒） |
| `boxWidth` | `number` | — | 文本框宽度 |
| `boxHeight` | `number` | — | 文本框高度 |
| `lineHeight` | `number` | — | 行高倍数 |
| `indent` | `number` | — | 段首缩进（像素） |
| `direction` | `"horizontal" \| "vertical"` | `"horizontal"` | 排版方向 |
| `glyphGridSize` | `number` | — | 字形网格大小 |

### 文本效果

```tsx
// 描边效果
<text
  text="带描边的文字"
  stroke={true}
  strokeColor="#000000"
  strokeWidth={2}
/>

// 阴影效果
<text
  text="带阴影的文字"
  shadow={true}
  shadowColor="#000000"
  shadowOffsetX={2}
  shadowOffsetY={2}
  shadowBlur={4}
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `stroke` | `boolean` | `false` | 启用描边 |
| `strokeColor` | `string` | `"#000000"` | 描边颜色 |
| `strokeWidth` | `number` | `2` | 描边宽度 |
| `shadow` | `boolean` | `false` | 启用阴影 |
| `shadowColor` | `string` | `"#000000"` | 阴影颜色 |
| `shadowOffsetX` | `number` | `0` | 阴影 X 偏移 |
| `shadowOffsetY` | `number` | `0` | 阴影 Y 偏移 |
| `shadowBlur` | `number` | `0` | 阴影模糊半径 |
| `shadowWidth` | `number` | `0` | 阴影宽度 |

### 打印事件

`<text>` 元素在打印过程中会触发事件：

```tsx
<text
  text="正在打字……"
  printMode="typewriter"
  printSpeed={30}
  onStart={() => console.log('开始打印')}
  onProgress={(progress) => console.log(`进度: ${progress}`)}
  onFinish={() => console.log('打印完成')}
/>
```

| 事件 | 类型 | 说明 |
|------|------|------|
| `onStart` | `() => void` | 开始打印时触发 |
| `onProgress` | `(progress: number) => void` | 打印进度（0~1） |
| `onFinish` | `() => void` | 打印完成时触发 |

### 富文本标签

`<text>` 元素的文本内容支持内联富文本标签：

```tsx
<text text="这是<fillColor=#E7931C>橙色文字</fillColor>，<bold>加粗</bold>，<underline>下划线</underline>。" />
```

---

## `<clip>` — 裁剪

裁剪容器，子元素只在指定范围内可见。

```tsx
<clip x={100} y={100} clipWidth={400} clipHeight={300}>
  <sprite src="large_image.png" />
</clip>
```

| 属性 | 类型 | 说明 |
|------|------|------|
| `clipWidth` | `number` | 裁剪区域宽度 |
| `clipHeight` | `number` | 裁剪区域高度 |

---

## `<filter>` — 滤镜

对子元素应用视觉滤镜效果。

```tsx
<filter blur={4}>
  <sprite src="bg/photo.png" />
</filter>
```

| 属性 | 类型 | 说明 |
|------|------|------|
| `blur` | `number` | 高斯模糊半径 |

---

## `<backdrop>` — 背景滤镜

对元素**后方的**已有画面内容应用滤镜，类似 CSS 的 `backdrop-filter`。

```tsx
<backdrop
  blur={8}
  targetWidth={1920}
  targetHeight={1080}
/>
```

| 属性 | 类型 | 说明 |
|------|------|------|
| `blur` | `number` | 高斯模糊半径 |
| `targetWidth` | `number` | 区域宽度 |
| `targetHeight` | `number` | 区域高度 |

---

## `<animation>` — 动画

播放序列帧动画（APNG 或 WebP 动画格式）。

```tsx
<animation src="effects/fire.apng" />
```

| 属性 | 类型 | 说明 |
|------|------|------|
| `src` | `string` | 动画文件路径（APNG 或 WebP） |
| `area` | `[number, number, number, number]` | 裁剪区域（归一化坐标） |
| `format` | `"APNG" \| "WEBP"` | 动画格式（通常自动识别） |

---

## 组合示例

以下是一个实际的 UI 组合示例，展示如何用这些元素构建界面：

```tsx
function SimpleDialog() {
  return (
    <container label="对话框">
      {/* 模糊背景 */}
      <backdrop blur={6} targetWidth={1920} targetHeight={1080} />

      {/* 对话框面板 */}
      <sprite
        src="ui/dialog_bg.png"
        mode="nineslice"
        bounds={[24, 24, 24, 24]}
        targetWidth={800}
        targetHeight={400}
        x={560}
        y={340}
      >
        {/* 标题文字 */}
        <text
          text="提示"
          fontSize={36}
          fillColor="#FFFFFF"
          x={40}
          y={30}
        />

        {/* 内容文字 */}
        <text
          text="确定要退出游戏吗？"
          fontSize={28}
          fillColor="#CCCCCC"
          x={40}
          y={120}
        />
      </sprite>
    </container>
  );
}
```
