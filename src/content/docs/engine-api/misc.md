---
title: 手柄与其他 API
sidebar:
  order: 7
---

## 手柄 API

引擎通过 `executePluginCommand('gamepad', ...)` 提供手柄支持，API 遵循 [W3C Gamepad 规范](https://www.w3.org/TR/gamepad/)。

### getGamepads — 获取手柄列表

```typescript
const gamepads = executePluginCommand('gamepad', {
  subCommand: 'getGamepads',
});
```

返回一个稀疏数组，每个已连接的手柄对象格式如下：

```typescript
interface Gamepad {
  id: string;              // 设备标识
  index: number;           // 在数组中的索引
  connected: boolean;      // 是否已连接
  mapping: 'standard';     // 映射类型
  timestamp: number;       // 最后更新时间
  buttons: GamepadButton[]; // 按钮状态数组（17 个）
  axes: number[];          // 摇杆轴值数组（4 个，-1~1）
}

interface GamepadButton {
  pressed: boolean;
  touched: boolean;
  value: number;           // 0~1（模拟按键压力）
}
```

### playEffect — 震动反馈

```typescript
executePluginCommand('gamepad', {
  subCommand: 'playEffect',
  index: 0,                // 手柄索引
  effect: 'dual-rumble',   // 效果类型
  params: {
    duration: 200,         // 持续时长（毫秒）
    startDelay: 0,         // 延迟开始（毫秒）
    weakMagnitude: 0.5,    // 弱震动强度（0~1）
    strongMagnitude: 1.0,  // 强震动强度（0~1）
  },
});
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `index` | `number` | 手柄索引 |
| `effect` | `string` | 效果类型（`'dual-rumble'`） |
| `params.duration` | `number` | 持续时长（毫秒） |
| `params.startDelay` | `number` | 延迟开始（毫秒） |
| `params.weakMagnitude` | `number` | 弱电机强度（0~1） |
| `params.strongMagnitude` | `number` | 强电机强度（0~1） |

## QuickJS 运行时说明

在原生平台上，JavaScript 运行在 QuickJS 沙盒中而非浏览器或 Node.js。需要注意以下限制：

### 不可用的 API

- `fetch` / `XMLHttpRequest` — 无网络访问
- `require` / 动态 `import()` — 所有依赖由构建工具打包
- `localStorage` / `sessionStorage` — 使用引擎的变量系统代替
- `document` / `window` — 无 DOM 环境

### Polyfill

Kit SDK 内置了以下 polyfill：

- `requestAnimationFrame` / `cancelAnimationFrame` — 映射到引擎的帧循环
- `console.log` / `warn` / `error` — 映射到引擎日志

### Web 平台差异

在 Web（WASM）平台运行时，JavaScript 运行在浏览器环境中，上述浏览器 API 均可用。编写跨平台代码时请注意兼容性。
