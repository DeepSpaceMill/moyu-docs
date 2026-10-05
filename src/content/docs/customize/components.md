---
title: 内置组件
sidebar:
  order: 9
---

标准框架在 `@momoyu-ink/kit` 的组件之上，固定了项目素材与配色，并补充了对话框、通知、转场等页面级组件。Kit 的通用组件与 Hook 见 [UI 组件库（Kit）](/customize/kit-ui/)。

所有组件从 `../components/` 导入，风格在 `src/theme.ts` 中集中定义。

## Checkbox — 勾选框

固定使用 `ui/unchecked*.png` 与 `ui/checked*.png` 素材的复选框，其余行为与 Kit 的 `Checkbox` 相同。

```tsx
import { Checkbox } from '../components/checkbox';

<Checkbox
  checked={checked}
  onCheckedChange={setChecked}
  text="启用自动阅读"
  textStyle={{ fontSize: 24, fillColor: '#dbe4f3' }}
  targetWidth={48}
  targetHeight={48}
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `targetWidth` / `targetHeight` | `number` | `0` | 素材绘制尺寸 |
| `mode` | `'normal' \| 'nineslice'` | `'normal'` | 绘制模式 |
| `bounds` | `[number, number, number, number]` | 未设置 | 九宫格边距（0~1 比例） |
| `checked` / `defaultChecked` / `onCheckedChange` | — | — | 选中状态，见 Kit 文档 |

## Select — 下拉选择

固定使用 `ui/dropdown*.png` 素材的选择框，配色由 `color` 与 `fontSize` 描述。

```tsx
import { Select } from '../components/select';

<Select
  value={quality}
  onValueChange={setQuality}
  options={[
    { text: '720p', value: '720' },
    { text: '1080p', value: '1080' },
  ]}
  fontSize={22}
  color="#ffffff"
  targetWidth={360}
  targetHeight={56}
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `options` | `{ text: string, value: string }[]` | `[]` | 选项列表 |
| `fontSize` | `number` | 未设置 | 文字字号 |
| `color` | `string \| readonly [string, string?, string?, string?]` | `'black'` | 文字颜色，可按 idle / hover / press / disabled 四态提供 |
| `mode` / `bounds` | — | 未设置 | 触发按钮的绘制模式与九宫格边距 |
| `targetWidth` / `targetHeight` | `number` | `0` | 触发按钮绘制尺寸 |
| `value` / `defaultValue` / `onValueChange` | — | — | 选中值，见 Kit 文档 |

展开列表与选项素材固定，列表宽度跟随 `targetWidth`。

## Slider — 滑动条

固定使用 `ui/slider_track*.png` 与 `ui/slider_handle*.png` 素材的滑动条。

```tsx
import { Slider } from '../components/slider';

<Slider
  value={volume}
  onValueChange={setVolume}
  targetWidth={400}
  targetHeight={12}
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `targetWidth` | `number` | `0` | 轨道宽度 |
| `targetHeight` | `number` | `0` | 轨道高度 |
| `value` / `defaultValue` / `onValueChange` / `onValueCommit` | — | — | 当前值（0~1），见 Kit 文档 |

滑块素材宽度固定为 24。

## Dialog — 对话框

模态确认框，以 overlay 形式打开。通常经由 `uiActions.confirm()` 调用：

```typescript
import { uiActions } from '../state/ui';

uiActions.confirm('确定要退出吗？', () => {
  // 确认后执行
});
```

`confirm` 会插入 `confirm` overlay，参数为：

| 参数 | 类型 | 说明 |
|------|------|------|
| `message` | `string` | 对话框消息 |
| `mode` | `'alert' \| 'confirm'` | 提示框或确认框 |
| `onConfirm` | `() => void` | 确认回调 |
| `onCancel` | `() => void` | 取消回调 |

`Dialog` 组件读取这些导航参数完成渲染，包含对背景应用 blur 滤镜（`<backdrop>`）与缩放进出动画，关闭动画结束后调用对应回调。

## Notification — 通知

全局通知，在 `Main` 中已挂载。通过 `uiActions.notify()` 触发：

```typescript
import { uiActions } from '../state/ui';

uiActions.notify('保存成功');
uiActions.notify('操作完成', {
  duration: 3000,       // 显示时长（毫秒）
  fadeInDuration: 300,  // 淡入时长
  fadeOutDuration: 300, // 淡出时长
});
```

多条通知会纵向堆叠，超时后自动淡出移除。

## TransitionBoundary — 转场边界

基于 `<shader>` / `<shader-slot>` 的转场容器。框架内部的场景转场、背景切换和立绘切换都使用它实现。

```tsx
import { TransitionBoundary } from '../components/transitionBoundary';

<TransitionBoundary
  transitionKey={currentSceneKey}
  effect={{ type: 'builtin', name: 'wipe', direction: 'left', softness: 0.08 }}
  duration={800}
>
  {children}
</TransitionBoundary>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `transitionKey` | `string` | 必填 | 当前显示内容的键值；变化时建立一次新的 from/to 边界 |
| `retain` | `'static' \| 'live'` | `'static'` | 旧内容保留方式；`live` 在转场开始前继续保持实时更新 |
| `effect` | `SceneTransitionEffect` | — | 转场效果对象，与 `@transPerform` 的 `effect` 参数一致 |
| `duration` | `number` | — | 转场时长（毫秒） |
| `performKey` | `string \| number \| null` | `transitionKey` | 区分同一内容键值下的执行轮次，通常无需指定 |
| `label` | `string` | `'Transition Boundary'` | 调试标签 |
| `onFinished` | `() => void` | — | 转场完成时触发 |

跳过剧情时转场会立即结束，不需要额外处理。`components/sprite.tsx` 的 `Sprite` 组件把 `transition` 配置接到这里，为场景内容统一提供转场能力。

## SceneTransitionBoundary — 场景转场边界

读取 `gameState.sceneTransition` 的场景级转场容器，由剧本命令（如 `@transPrepare` / `@transPerform`）驱动，已挂在 Stage 页面上。自定义页面通常不需要直接使用它；需要单次转场时使用 `TransitionBoundary`。

## FrameAnimation — 帧动画

基于精灵表（sprite sheet）的帧动画，通过切换 Sprite 的 `area` 逐帧播放。

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

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` | 必填 | 精灵表的图片路径 |
| `direction` | `'horizontal' \| 'vertical'` | 必填 | 帧排列方向 |
| `frameCount` | `number` | 必填 | 总帧数 |
| `interval` | `number` | 必填 | 帧间隔（毫秒） |
| `loop` | `boolean \| number` | `false` | 是否循环，或循环次数 |
| `loopMode` | `'none' \| 'always' \| 'bounce' \| 'reverse'` | `'none'` | 循环方式 |

循环方式：`none` 播放一次后停止；`always` 从头循环；`bounce` 来回播放；`reverse` 反向循环。

其余 Sprite 属性（`x`、`y`、`scale`、`tint` 等）都可以透传。
