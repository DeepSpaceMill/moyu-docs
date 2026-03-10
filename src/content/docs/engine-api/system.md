---
title: 系统 API
sidebar:
  order: 6
---

系统 API 通过 `executePluginCommand('system', ...)` 调用，提供窗口管理、截图和应用控制等能力。

## 窗口管理

### setWindowSize — 设置窗口大小

```typescript
executePluginCommand('system', {
  subCommand: 'setWindowSize',
  width: 1920,
  height: 1080,
  factor: 1.0,          // 可选：缩放因子
});
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `width` | `number` | 窗口宽度（像素） |
| `height` | `number` | 窗口高度（像素） |
| `factor` | `number` | 可选，缩放因子（DPI 缩放） |

### setWindowState — 设置窗口状态

```typescript
executePluginCommand('system', {
  subCommand: 'setWindowState',
  state: 'fullscreen',   // 'maximized' | 'minimized' | 'fullscreen' | 'normal'
});
```

### getWindowState — 获取窗口状态

```typescript
const state = executePluginCommand('system', {
  subCommand: 'getWindowState',
});
// 返回 'maximized' | 'minimized' | 'fullscreen' | 'normal'
```

### setTitle — 设置窗口标题

```typescript
executePluginCommand('system', {
  subCommand: 'setTitle',
  title: '末语 — 第一章',
});
```

### getWindowInnerPosition — 获取窗口内部位置

返回窗口内容区域左上角相对于屏幕的坐标。

```typescript
const pos = executePluginCommand('system', {
  subCommand: 'getWindowInnerPosition',
});
// 返回 { x: number, y: number }
```

### getWindowInnerSize — 获取窗口内部尺寸

返回窗口内容区域的实际像素尺寸。

```typescript
const size = executePluginCommand('system', {
  subCommand: 'getWindowInnerSize',
});
// 返回 { width: number, height: number }
```

## 舞台

### getStageSize — 获取舞台尺寸

返回引擎渲染区域的逻辑尺寸（与 `index.json` 中的配置对应）。

```typescript
const size = executePluginCommand('system', {
  subCommand: 'getStageSize',
});
// 返回 { width: number, height: number }
```

:::tip
`getStageSize` 返回的是逻辑尺寸（设计分辨率），`getWindowInnerSize` 返回的是实际物理像素尺寸。布局时应以 `getStageSize` 为依据。
:::

## 截图

### takeSnapshot — 截取当前画面

截取当前渲染帧的画面。截图会存储在引擎内部，可用于存档等用途。

```typescript
executePluginCommand('system', {
  subCommand: 'takeSnapshot',
  width: 640,             // 可选：缩放宽度
  height: 360,            // 可选：缩放高度
  keepAspectRatio: true,  // 可选：保持宽高比
});
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `width` | `number` | 可选，截图宽度 |
| `height` | `number` | 可选，截图高度 |
| `keepAspectRatio` | `boolean` | 可选，是否保持宽高比 |

## 应用控制

### quit — 退出应用

```typescript
executePluginCommand('system', {
  subCommand: 'quit',
});
```

:::caution
此命令会立即关闭应用，请确保在调用前已保存用户数据。
:::
