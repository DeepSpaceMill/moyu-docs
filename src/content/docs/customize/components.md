---
title: 内置组件
sidebar:
  order: 9
---

标准框架在 `src/components/` 中提供了一系列可复用的 UI 组件。你可以直接使用它们来构建界面，也可以参考其实现来创建自己的组件。

## Button — 按钮

三态图片按钮，支持普通模式和九宫格模式。

```tsx
import { Button } from '../components/button';

<Button
  fileNames={['btn_idle.png', 'btn_hover.png', 'btn_press.png']}
  x={100}
  y={200}
  onClick={() => console.log('clicked')}
/>
```

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `fileNames` | `[string, string, string]` | — | 三态图片路径：`[idle, hover, pressed]` |
| `onClick` | `() => void` | — | 点击回调 |
| `text` | `string` | — | 按钮文字 |
| `fontSize` | `number` | — | 字号 |
| `color` | `string \| [string, string, string]` | — | 文字颜色，可为三态分别设置 |
| `textAlign` | `"left" \| "center" \| "right"` | `"center"` | 文字对齐 |
| `nineSlice` | `boolean` | `false` | 启用九宫格模式 |
| `bounds` | `[number, number, number, number]` | — | 九宫格边距 |
| `targetWidth` | `number` | — | 九宫格目标宽度 |
| `targetHeight` | `number` | — | 九宫格目标高度 |

其他通用属性（`x`, `y`, `visible` 等）也支持。

### 带文字的按钮

```tsx
<Button
  fileNames={['btn_bg.png', 'btn_bg_hover.png', 'btn_bg_press.png']}
  text="开始游戏"
  fontSize={28}
  color={['#CCCCCC', '#FFFFFF', '#AAAAAA']}
  shadow={{ color: '#000000', offsetX: 1, offsetY: 1, blur: 2 }}
/>
```

### 九宫格按钮

```tsx
<Button
  fileNames={['btn_9s.png', 'btn_9s.png', 'btn_9s.png']}
  nineSlice={true}
  bounds={[12, 12, 12, 12]}
  targetWidth={200}
  targetHeight={60}
  text="确认"
/>
```

---

## Slider — 滑动条

水平滑动条，返回 0~1 范围的值。

```tsx
import { Slider } from '../components/slider';

<Slider
  x={100}
  y={200}
  value={0.5}
  onChange={(val) => console.log(val)}
  trackImage="ui/slider_track.png"
  fillImage="ui/slider_fill.png"
  thumbImage="ui/slider_thumb.png"
/>
```

### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `value` | `number` | 当前值（0~1） |
| `onChange` | `(value: number) => void` | 值变化回调 |
| `trackImage` | `string` | 轨道背景图 |
| `fillImage` | `string` | 已填充部分的图片 |
| `thumbImage` | `string` | 滑块图片 |
| `trackWidth` | `number` | 轨道宽度 |

支持鼠标拖动和轨道点击两种交互方式。

---

## Select — 下拉选择

```tsx
import { Select } from '../components/select';

<Select
  x={100}
  y={200}
  options={[
    { label: '720p', value: '720' },
    { label: '1080p', value: '1080' },
    { label: '全屏', value: 'fullscreen' },
  ]}
  value="720"
  onChange={(val) => console.log(val)}
/>
```

### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `options` | `{ label: string, value: string }[]` | 选项列表 |
| `value` | `string` | 当前选中值 |
| `onChange` | `(value: string) => void` | 选择变化回调 |

---

## Checkbox — 复选框

基于 Button 组件实现的复选框。

```tsx
import { Checkbox } from '../components/checkbox';

<Checkbox
  checked={true}
  onChange={(checked) => console.log(checked)}
  fileNames={['checkbox_off.png', 'checkbox_on.png']}
/>
```

---

## Dialog — 对话框

模态对话框，支持 alert 和 confirm 两种模式。通常不直接使用，而是通过 `uiActions.confirm()` 调用。

```tsx
import { Dialog } from '../components/dialog';

// 确认模式
<Dialog
  message="确定要退出吗？"
  onConfirm={() => { ... }}
  onCancel={() => { ... }}
/>

// 提示模式
<Dialog message="操作成功" />
```

### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `message` | `string` | 对话框消息 |
| `onConfirm` | `() => void` | 确认回调 |
| `onCancel` | `() => void` | 取消回调（存在时显示两个按钮） |

对话框包含模糊背景效果（`<backdrop>`）和缩放进出动画。

---

## Notification — 通知

全局通知组件，在 `Main` 组件中已挂载。通过 `uiActions.notify()` 触发。

```typescript
import { uiActions } from '../state/ui';

uiActions.notify('保存成功');
uiActions.notify('操作完成', {
  duration: 3000,       // 显示时长（毫秒）
  fadeInDuration: 300,  // 淡入时长
  fadeOutDuration: 300, // 淡出时长
});
```

通知会自动堆叠显示并在超时后淡出。

---

## FrameAnimation — 帧动画

基于精灵表（sprite sheet）的帧动画组件。

```tsx
import { FrameAnimation } from '../components/frame';

<FrameAnimation
  src="effects/explosion.png"
  direction="horizontal"
  frameCount={8}
  interval={100}
  loop={true}
  loopMode="always"
/>
```

### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` | — | 精灵表图片路径 |
| `direction` | `"horizontal" \| "vertical"` | — | 帧排列方向 |
| `frameCount` | `number` | — | 总帧数 |
| `interval` | `number` | — | 帧间隔（毫秒） |
| `loop` | `boolean \| number` | `false` | 是否循环（或循环次数） |
| `loopMode` | `"none" \| "always" \| "bounce" \| "reverse"` | `"none"` | 循环模式 |

循环模式说明：
- `"none"` — 不循环，播放一次后停止
- `"always"` — 无限循环
- `"bounce"` — 来回播放（1→N→1→N...）
- `"reverse"` — 反向循环（N→1→N→1...）

---

## 使用 react-spring 动画

`@momoyu-ink/kit` 内置了 [react-spring](https://react-spring.dev/) 动画库。你可以在任何组件中使用它：

```tsx
import { animated, useSpring, useTransition } from '@momoyu-ink/kit';

// 基础弹簧动画
function FadeInSprite() {
  const styles = useSpring({
    opacity: 1,
    x: 100,
    from: { opacity: 0, x: 0 },
  });

  return <animated.sprite src="image.png" opacity={styles.opacity} x={styles.x} />;
}

// 列表过渡动画
function AnimatedList({ items }: { items: string[] }) {
  const transitions = useTransition(items, {
    keys: (item) => item,
    from: { opacity: 0, y: 50 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 0, y: -50 },
  });

  return (
    <container>
      {transitions((style, item) => (
        <animated.text text={item} opacity={style.opacity} y={style.y} />
      ))}
    </container>
  );
}
```

支持的 `animated` 基础元素：`animated.container`, `animated.sprite`, `animated.text`, `animated.clip`, `animated.filter`, `animated.backdrop`, `animated.animation`。
