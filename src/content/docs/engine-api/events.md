---
title: 事件系统
sidebar:
  order: 2
---

末语的事件系统连接了 Rust 引擎层和 JavaScript 层。事件从引擎底层产生，经过 Kit SDK 的封装后，分发到你的组件中。

## 事件注册

### 全局事件监听

使用 `addEventListener` 监听全局事件：

```typescript
import { addEventListener } from '@momoyu-ink/kit';

// 注册监听器，返回清理函数
const cleanup = addEventListener('keydown', (e) => {
  console.log(e.key, e.code);
});

// 通常在 React 的 useEffect 中使用
useEffect(() => {
  return addEventListener('keydown', handler);
}, []);
```

### JSX 事件 Props

在元素上直接绑定事件处理函数：

```tsx
<sprite
  src="ui/button.png"
  onClick={(e) => console.log('clicked at', e.x, e.y)}
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
/>
```

:::tip
设置了事件处理 props 后，元素的 `interactive` 属性会被自动启用。
:::

## 鼠标事件

### 冒泡事件（JSX Props）

在元素上通过 props 绑定，事件会沿节点树向上冒泡。

| 事件 | 触发时机 |
|------|---------|
| `onClick` | 鼠标点击 |
| `onMouseDown` | 鼠标按下 |
| `onMouseUp` | 鼠标抬起 |
| `onMouseMove` | 鼠标移动 |
| `onMouseEnter` | 鼠标进入（不冒泡） |
| `onMouseLeave` | 鼠标离开（不冒泡） |

### MouseEvent 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `x` | `number` | 舞台坐标 X |
| `y` | `number` | 舞台坐标 Y |
| `button` | `number` | 鼠标按键（0=左, 1=中, 2=右） |
| `ctrlKey` | `boolean` | Ctrl 键是否按下 |
| `shiftKey` | `boolean` | Shift 键是否按下 |
| `altKey` | `boolean` | Alt 键是否按下 |
| `metaKey` | `boolean` | Meta 键是否按下 |

### 全局鼠标事件

```typescript
addEventListener('click', (e: MouseEvent) => { ... });
addEventListener('mousedown', (e: MouseEvent) => { ... });
addEventListener('mouseup', (e: MouseEvent) => { ... });
addEventListener('mousemove', (e: MouseEvent) => { ... });
addEventListener('contextmenu', (e: MouseEvent) => { ... });
addEventListener('doubleclick', (e: MouseEvent) => { ... });
```

## 键盘事件

### JSX Props

```tsx
<container onKeyDown={(e) => { ... }} onKeyUp={(e) => { ... }} />
```

### KeyboardEvent 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `key` | `string` | 按键名称（如 `"Enter"`, `"a"`, `"Escape"`） |
| `code` | `string` | 物理按键代码（如 `"KeyA"`, `"Space"`） |
| `ctrlKey` | `boolean` | Ctrl 键是否按下 |
| `shiftKey` | `boolean` | Shift 键是否按下 |
| `altKey` | `boolean` | Alt 键是否按下 |
| `metaKey` | `boolean` | Meta 键是否按下 |
| `repeat` | `boolean` | 是否为重复按键 |

### 全局键盘事件

```typescript
addEventListener('keydown', (e: KeyboardEvent) => { ... });
addEventListener('keyup', (e: KeyboardEvent) => { ... });
```

## 触摸事件

### JSX Props

```tsx
<sprite
  src="ui/touch_area.png"
  onTouchStart={(e) => { ... }}
  onTouchMove={(e) => { ... }}
  onTouchEnd={(e) => { ... }}
  onTouchCancel={(e) => { ... }}
/>
```

### TouchEvent 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `id` | `number` | 触摸点 ID |
| `x` | `number` | 舞台坐标 X |
| `y` | `number` | 舞台坐标 Y |
| `force` | `number` | 压力（如果支持） |

## 冒泡机制

冒泡事件（鼠标和触摸事件的大部分类型）会从目标节点向上传播到根节点。你可以在事件对象上调用方法来控制传播：

```tsx
<container onClick={(e) => {
  // 阻止事件继续冒泡
  e.stopPropagation();
}}>
  <sprite onClick={(e) => {
    // 阻止默认行为
    e.preventDefault();
  }} />
</container>
```

### BubbleEvent 属性

| 属性/方法 | 类型 | 说明 |
|----------|------|------|
| `targetId` | `number` | 事件目标节点 ID |
| `currentTargetId` | `number` | 当前处理节点 ID |
| `bubbles` | `boolean` | 是否冒泡 |
| `defaultPrevented` | `boolean` | 默认行为是否被阻止 |
| `stopPropagation()` | `() => void` | 停止冒泡 |
| `preventDefault()` | `() => void` | 阻止默认行为 |

## 特殊事件

以下事件只能通过 `addEventListener` 监听：

### ready — 引擎就绪

```typescript
addEventListener('ready', () => {
  // 引擎初始化完成，可以开始渲染
});
```

### beforeunload — 关闭前确认

```typescript
addEventListener('beforeunload', () => {
  // 用户尝试关闭窗口
  // 可以在此弹出确认对话框
  uiActions.confirm('确定要退出吗？', () => {
    executePluginCommand('system', { subCommand: 'quit' });
  });
});
```

### resize — 窗口大小变化

```typescript
addEventListener('resize', (e) => {
  console.log('New size:', e.width, e.height);
});
```

### fullscreen — 全屏状态变化

```typescript
addEventListener('fullscreen', (e) => {
  console.log('Fullscreen:', e.fullscreen);
});
```

### focus — 焦点变化

```typescript
addEventListener('focus', (e) => {
  console.log('Focused:', e.focused);
});
```

### wheel — 滚轮事件

```typescript
addEventListener('wheel', (e) => {
  console.log('Scroll delta:', e.deltaX, e.deltaY);
});
```

## 剧本引擎事件

这些事件在剧本执行过程中被触发，通常由框架内部（Stage）处理：

| 事件 | 说明 | 使用场景 |
|------|------|---------|
| `scenariocommandline` | 剧本命令行 | Stage 命令分发 |
| `scenariotext` | 剧本文本行 | Stage 文本处理 |
| `scenariowaiting` | 进入等待状态 | 调试信息 |
| `scenariowaitingcancelled` | 等待取消（超时或跳过） | Skip 回调触发 |

:::note
剧本引擎事件通常不需要直接监听——它们已经在 `createStage` / `StageContextProvider` 中被处理。只有在完全自定义舞台逻辑时才需要关注。
:::

## requestAnimationFrame

末语在 QuickJS 环境中提供了 `requestAnimationFrame` polyfill：

```typescript
function animate() {
  // 每帧执行
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

这在需要逐帧更新的场景（如粒子效果、自定义动画）中很有用。但大多数情况下，使用 react-spring 的声明式动画更为合适。
