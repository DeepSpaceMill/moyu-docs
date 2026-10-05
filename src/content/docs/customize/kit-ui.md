---
title: UI 组件库（Kit）
sidebar:
  order: 8.5
---

`@momoyu-ink/kit` 提供一组 UI 组件与配套 Hook，覆盖按钮、表单控件、滚动视图与常用动画工具。它们只负责布局、交互状态与事件，视觉资源全部由调用方通过 sprite 配置传入，可以在任何项目里使用。

标准框架在这些组件之上固定了素材与配色，并补充了页面级组件，见[内置组件](/customize/components/)。

## 通用概念

### 视觉资源由调用方传入

组件的外观来自 sprite 类属性。以 Button 为例：

```tsx
import { Button } from '@momoyu-ink/kit';

<Button
  sprite={{
    src: ['ui/button.png', 'ui/button_hover.png', 'ui/button_press.png'],
    mode: 'nineslice',
    bounds: [0.25, 0.25, 0.25, 0.25],
    tint: '#54688c',
    targetWidth: 280,
    targetHeight: 56,
  }}
  text="开始游戏"
/>
```

`sprite` 接受 Sprite 元素的全部属性（`src` 的取值见下节），组件在此基础上补充自己的字段。

### 状态取值：ControlStateValue

需要区分交互状态的组件使用 `ControlStateValue<T>` 描述每个状态用哪份素材或哪组样式：

```typescript
type ControlState = 'idle' | 'hover' | 'press' | 'disabled';
type ControlStateValue<T> = T | readonly [idle: T, hover?: T, press?: T, disabled?: T];
```

传入单个值时所有状态共用；传入数组时按 idle、hover、press、disabled 的顺序取值，缺少的项回退到 idle。

状态由组件内部维护：指针移入为 hover，按下为 press，禁用为 disabled。Button 的 `lockOn` 可以把状态固定在某一项。

### 尺寸与九宫格

绘制尺寸由 sprite 配置里的 `targetWidth` / `targetHeight` 决定。按钮、面板这类可拉伸素材建议使用 `mode: 'nineslice'`；`bounds` 用 0~1 比例描述四边边距，拉伸时四角不变形。九宫格当前按 stretch 方式绘制，`repeat` / `mirror` / `blank` 尚未实现。

### 素材与着色

引擎的 `tint` 与纹素相乘。把素材做成中性灰度（白到灰），用 `tint` 提供颜色，同一份素材就能适配任意配色；需要固定颜色的素材直接上色，省略 `tint`。

### 交互语义

- 按下视觉由指针事件驱动：指针按下后移出组件时，视觉复位；
- 动作由 `onPress` 触发，对应引擎的点击手势，在同一目标上按下并抬起才算激活；
- `disabled` 停止 hover / press 更新，并把节点设为不可交互。

## Button

按钮组件，支持多态素材、可选文字与状态锁定。

```tsx
<Button
  sprite={{ src: 'ui/button.png', tint: '#54688c', targetWidth: 240, targetHeight: 56 }}
  text="确认"
  onPress={() => console.log('pressed')}
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `sprite` | `ControlSpriteProps` | 必填 | 按钮素材，`src` 支持四态数组 |
| `onPress` | `(event: MouseEvent) => void` | — | 点击手势触发 |
| `disabled` | `boolean` | `false` | 禁用 |
| `lockOn` | `'idle' \| 'hover' \| 'press'` | — | 强制显示某个状态 |
| `text` | `string` | — | 按钮文字 |
| `textStyle` | `ControlStateValue<ControlTextStyle>` | — | 文字样式，支持四态 |
| `textOffsetX` / `textOffsetY` | `number` | `0` | 文字偏移 |
| `textAlign` | `'left' \| 'center' \| 'right'` | `'center'` | 文字对齐 |

`children` 渲染在素材内部，可以放任意节点。

素材启用 `alphaHitTest` 后，贴图的透明位置不再接收命中，点击会落到后面的节点。

## Checkbox

复选框，支持受控与非受控用法。

```tsx
<Checkbox
  checked={accepted}
  onCheckedChange={setAccepted}
  uncheckedSprite={{ src: 'ui/unchecked.png', tint: '#54688c' }}
  checkedSprite={{ src: 'ui/checked.png', tint: '#54688c' }}
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `checked` | `boolean` | — | 受控选中状态 |
| `defaultChecked` | `boolean` | `false` | 非受控初始状态 |
| `onCheckedChange` | `(checked: boolean) => void` | — | 选中状态变化 |
| `uncheckedSprite` | `ControlSpriteProps` | 必填 | 未选中素材 |
| `checkedSprite` | `ControlSpriteProps` | 必填 | 选中素材 |

其余属性与 Button 相同（`sprite` 与 `lockOn` 除外）。

## Radio 与 RadioGroup

单选组，`RadioGroup` 维护当前值，`Radio` 声明各个选项。

```tsx
<RadioGroup defaultValue="a" onValueChange={setChoice}>
  <Radio value="a" uncheckedSprite={{ src: 'ui/radio.png' }} checkedSprite={{ src: 'ui/radio_on.png' }} />
  <Radio value="b" uncheckedSprite={{ src: 'ui/radio.png' }} checkedSprite={{ src: 'ui/radio_on.png' }} />
</RadioGroup>
```

`RadioGroup` 属性：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `string` | — | 受控当前值 |
| `defaultValue` | `string` | — | 非受控初始值 |
| `onValueChange` | `(value: string) => void` | — | 选中值变化 |

`Radio` 属性：

| 属性 | 类型 | 说明 |
|------|------|------|
| `value` | `string` | 该项的值，必填 |
| `uncheckedSprite` / `checkedSprite` | `ControlSpriteProps` | 两种状态的素材 |

`Radio` 必须放在 `RadioGroup` 内部，其余属性与 Button 相同（`sprite` 与 `lockOn` 除外）。

## Select

下拉选择，展开的选项列表挂在触发按钮下方。

```tsx
<Select
  value={quality}
  onValueChange={setQuality}
  options={[
    { text: '720p', value: '720' },
    { text: '1080p', value: '1080' },
  ]}
  trigger={{ src: 'ui/dropdown.png', targetWidth: 360, targetHeight: 56 }}
  list={{ src: 'ui/dropdown_list.png', targetWidth: 360, paddingX: 4, paddingY: 4 }}
  option={{ src: 'ui/dropdown_item.png', targetWidth: 352, targetHeight: 48 }}
  textStyle={{ fontSize: 22, fillColor: '#ffffff' }}
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `string` | — | 受控当前值 |
| `defaultValue` | `string` | — | 非受控初始值 |
| `onValueChange` | `(value: string, option: SelectOption) => void` | — | 选中项变化 |
| `onPress` | `(event: PressEvent) => void` | — | 按下触发按钮 |
| `disabled` | `boolean` | `false` | 禁用 |
| `options` | `readonly SelectOption[]` | 必填 | 选项列表，每项为 `{ text, value }` |
| `trigger` | `ControlSpriteProps` | 必填 | 触发按钮素材 |
| `list` | `SelectListProps` | 必填 | 展开列表素材，另含 `paddingX` / `paddingY` / `gap` / `offsetX` / `offsetY` |
| `option` | `SelectOptionSpriteProps` | 必填 | 单个选项素材，`targetHeight` 必填 |
| `textStyle` | `ControlStateValue<ControlTextStyle>` | — | 文字样式 |
| `textOffsetX` / `textOffsetY` | `number` | `0` | 文字偏移 |
| `textAlign` | `'left' \| 'center' \| 'right'` | `'center'` | 文字对齐 |

选中同一个值时不会重复触发 `onValueChange`。

## Slider

水平滑动条，值域为 0~1。

```tsx
<Slider
  value={volume}
  onValueChange={setVolume}
  onValueCommit={(value) => save(value)}
  track={{ src: 'ui/slider_track.png', targetWidth: 400, targetHeight: 12 }}
  thumb={{ src: 'ui/slider_handle.png', targetWidth: 24, targetHeight: 24 }}
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `number` | — | 受控当前值（0~1） |
| `defaultValue` | `number` | `0` | 非受控初始值 |
| `onValueChange` | `(value: number) => void` | — | 拖动过程中持续触发 |
| `onValueCommit` | `(value: number) => void` | — | 指针松开后触发一次 |
| `onPress` | `(event: PressEvent) => void` | — | 按下轨道时触发 |
| `disabled` | `boolean` | `false` | 禁用 |
| `track` | `SliderTrackProps` | 必填 | 轨道素材，`targetWidth` 必填 |
| `thumb` | `SliderThumbProps` | 必填 | 滑块素材，`targetWidth` 必填 |

指针按下轨道会先跳到对应位置再开始拖动；拖动期间的每帧变化走 `onValueChange`，结束一次拖动时走 `onValueCommit`。

## Input

单行输入框，基于 `editable` 节点，支持 IME 组合输入与光标闪烁。

```tsx
const inputRef = useRef<InputHandle>(null);

<Input
  ref={inputRef}
  width={320}
  height={48}
  paddingX={12}
  placeholder="请输入名字"
  value={name}
  onChange={(state) => setName(state.value)}
  textStyle={{ fontSize: 24, fillColor: '#ffffff' }}
  caret={{ src: 'ui/caret.png', width: 2 }}
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `string` | — | 受控值 |
| `defaultValue` | `string` | `''` | 非受控初始值 |
| `placeholder` | `string` | `''` | 空值提示 |
| `disabled` | `boolean` | `false` | 禁用 |
| `readOnly` | `boolean` | `false` | 只读 |
| `autoFocus` | `boolean` | `false` | 挂载后自动聚焦 |
| `width` / `height` | `number` | 必填 | 输入框尺寸 |
| `paddingX` | `number` | `0` | 文字与光标的水平内边距 |
| `textStyle` | `Text 属性（去掉 text / interactive / children）` | 必填 | 文字样式 |
| `placeholderStyle` | 同上 | — | 提示文字样式，覆盖 `textStyle` 的同名字段 |
| `caret` | `InputCaretStyle` | 必填 | 光标素材，另含 `width` / `height` / `blinkInterval` |
| `background` | `InputBackground` | — | 背景素材，可以是单份，也可以按状态提供 |
| `onInput` | `(state: EditableState) => void` | — | 每次输入触发（含组合输入） |
| `onChange` | `(state, source) => void` | — | 内容提交变化，`source` 表示来源 |
| `onFocus` / `onBlur` | `(state: EditableState) => void` | — | 聚焦状态变化 |
| `onCompositionStart` / `onCompositionUpdate` / `onCompositionEnd` | `(state) => void` | — | IME 组合输入各阶段 |

`EditableState` 包含 `value`（已提交内容）、`isComposing`、`compositionText`（组合中的内容）。

`background` 传入对象时按状态取素材：

```tsx
<Input
  background={{
    idle: { src: 'ui/input.png', mode: 'nineslice', bounds: [0.25, 0.25, 0.25, 0.25] },
    hover: { src: 'ui/input_hover.png', mode: 'nineslice', bounds: [0.25, 0.25, 0.25, 0.25] },
    focused: { src: 'ui/input_focus.png', mode: 'nineslice', bounds: [0.25, 0.25, 0.25, 0.25] },
  }}
/>
```

可用状态为 `idle`、`hover`、`press`、`focused`、`readOnly`、`disabled`，缺少的状态按 `readOnly` / `disabled` / `press` / `focused` / `hover` / `idle` 的顺序回退。

通过 ref 调用 `InputHandle`：

| 方法 | 说明 |
|------|------|
| `focus()` | 聚焦输入框 |
| `blur()` | 取消聚焦 |
| `getState()` | 读取当前 `EditableState` |

## ScrollView 与 useScrollView

`useScrollView` 维护滚动位置与边界，`ScrollView` 把它接到 `clip` 视口与内容容器上。

```tsx
import { ScrollView, useScrollView } from '@momoyu-ink/kit';

function List() {
  const controller = useScrollView({ viewportHeight: 600 });

  return (
    <ScrollView width={400} height={600} controller={controller}>
      {/* 任意高度的内容 */}
    </ScrollView>
  );
}
```

`useScrollView` 选项：

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `viewportHeight` | `number` | 必填 | 视口高度 |
| `initialPosition` | `'start' \| 'end'` | `'start'` | 首次布局后的初始位置 |
| `wheelStep` | `number` | `72` | 单次滚轮的滚动距离 |

返回的 controller：

| 字段 | 类型 | 说明 |
|------|------|------|
| `scrollOffset` | `SpringValue<number>` | 当前滚动位置，用于动画 |
| `contentHeight` / `maxScroll` | `number` | 内容高度与最大滚动距离 |
| `scrollTo(offset, immediate?)` | `(number, boolean?) => void` | 滚动到指定位置 |
| `scrollToRatio(ratio, immediate?)` | `(number, boolean?) => void` | 按 0~1 比例滚动 |
| `handleWheel` / `handleTouchStart` / `handleTouchMove` / `handleTouchEnd` | 事件处理器 | 交给 `ScrollView` 内部绑定 |
| `handleContentLayout` | `(event: LayoutEvent) => void` | 交给 `ScrollView` 内部绑定 |

`immediate` 为 `true` 时跳过弹簧动画直接定位。

## 淡入淡出：useFadeInOut 系列

三个 Hook 返回相同结构 `[style, api, skip]`：`style` 是 `{ opacity }` 的弹簧值，`api` 是动画控制器，`skip` 跳过动画直接停在终态。

| Hook | 参数 | 行为 |
|------|------|------|
| `useFadeIn(inTime, pause?, onFinished?)` | 淡入时长 | 从 0 淡入到 1 |
| `useFadeOut(outTime, pause?, onFinished?)` | 淡出时长 | 从 1 淡出到 0 |
| `useFadeInOut(inTime, keepTime, outTime, pause?, onFinished?)` | 淡入 / 保持 / 淡出 | 淡入后保持，再淡出 |

```tsx
const [style, , skip] = useFadeInOut(300, 1000, 300, false, () => {
  console.log('finished');
});

return <animated.sprite src="ui/logo.png" opacity={style.opacity} />;
```

## useSoundEffect

加载音效并返回播放函数，组件卸载时释放资源。

```tsx
const playConfirm = useSoundEffect('audio/confirm.opus');

<Button sprite={...} onPress={playConfirm} />
```

## useTouchInput

返回当前输入是否来自触摸设备。鼠标悬停显隐类 UI 可以据此保持常显。

```tsx
const touchInput = useTouchInput();
const buttonsVisible = touchInput || hovered;
```

## react-spring 动画

kit 重新导出了 [react-spring](https://react-spring.dev/) 的常用 API，可以直接用于任何节点：

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

支持的 `animated` 元素：`animated.container`、`animated.vbox`、`animated.hbox`、`animated.sprite`、`animated.text`、`animated.clip`、`animated.filter`、`animated.backdrop`、`animated.animation`、`animated.video`。

弹簧值来自 valtio 快照或组件状态时，把值直接写进 `useSpring({...})`，由 react-spring 在渲染时应用；由交互或时序触发的动画（按钮点击、跳过动画等）改用 `useSpringRef()`，在回调里调用 `ref.start(...)` / `ref.set(...)`。同一处动画混用两种方式时容易与高频重渲染产生时序问题，选一种即可。
