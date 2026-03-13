---
title: 状态管理
sidebar:
  order: 6
---

末语框架使用 [Valtio](https://valtio.dev/) 进行状态管理。游戏运行时的所有数据——背景、角色、文本、BGM、设置等——都存储在响应式状态对象中。

## 核心概念

Valtio 的工作方式非常直观：

```typescript
import { proxy, useSnapshot } from 'valtio';

// 创建可变的代理状态
const state = proxy({ count: 0 });

// 在任意位置直接修改
state.count++;

// 在 React 组件中读取（只读快照，自动触发重渲染）
function MyComponent() {
  const snap = useSnapshot(state);
  return <text text={`${snap.count}`} />;
}
```

- **`proxy()`** — 创建一个可变的响应式对象
- **`useSnapshot()`** — 在组件中获取只读快照，当数据变化时自动重渲染
- **直接赋值** — 在组件外（如命令处理函数中）直接修改 proxy 对象即可

## 游戏状态 (`gameState`)

`gameState` 管理所有与游戏进程相关的数据。定义在 `src/state/game.ts` 中。

```typescript
import { gameState } from '../state/game';
```

### 结构总览

```typescript
gameState.story        // 故事信息
gameState.background   // 背景状态
gameState.character    // 角色状态
gameState.textbox      // 文本框状态
gameState.bgm          // 背景音乐状态
```

### story — 故事信息

```typescript
interface StoryState {
  title: string;     // 当前章节标题（用于存档界面显示）
}
```

### background — 背景

```typescript
interface BackgroundState {
  src: string;          // 图片路径
  fadeTime: number;     // 渐变时长（毫秒）
  tint?: string;        // 着色（CSS 颜色值）
  skippable: boolean;   // 渐变是否可跳过
}
```

### character — 角色

```typescript
interface CharacterState {
  presets: Record<string, { x: number; y: number }>;  // 位置预设
  characters: Character[];    // 当前舞台上的角色列表
  currentSpeaker?: string;    // 当前说话者的名字
}

interface Character {
  name?: string;              // 角色名（标识符）
  src: string;                // 立绘路径
  x: number; y: number;      // 位置
  scale: number;              // 缩放
  tint: string;               // 着色
  visible: boolean;           // 是否可见
  pivot: [number, number];    // 旋转中心
  fadeTime: number;           // 动画时长
}
```

### textbox — 文本框

```typescript
interface TextBoxState {
  name: string;              // 说话者名字
  text: string;              // 文本内容
  visible: boolean;          // 文本框是否可见
  shouldClear?: boolean;     // 下次显示文本前是否清空
  shouldAddNewline?: boolean; // 是否添加换行

  // 文本渲染配置（通过 @textBox 命令设置）
  printMode: 'instant' | 'typewriter' | 'printer';
  printSpeed: number;
  fillColor: string;
  lineHeight: number;
  indent: number;
  stroke: boolean;
  strokeColor: string;
  strokeWidth: number;
  shadow: boolean;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  shadowWidth: number;
}
```

### bgm — 背景音乐

```typescript
interface BGMState {
  src: string;        // 音乐路径
  loop: boolean;      // 是否循环
  volume?: number;    // 音量
  fadeTime?: number;  // 渐变时长
}
```

### 重置游戏状态

```typescript
import { resetGameState } from '../state/game';

// 重置为默认值（回到主菜单时使用）
resetGameState();
```

## 设置状态 (`settingsState`)

`settingsState` 管理用户偏好设置，自动持久化到引擎的永久变量中。定义在 `src/state/settings.ts` 中。

```typescript
import { settingsState } from '../state/settings';
```

### 结构

```typescript
interface SettingsData {
  display: string;        // 显示模式：'720' | '1080' | 'fullscreen'
  volume_bgm: number;     // BGM 音量（0~1）
  volume_se: number;      // 音效音量（0~1）
  volume_voice: number;   // 语音音量（0~1）
  text_speed: number;     // 文字速度（倍率）
  auto_interval: number;  // 自动播放间隔（秒）
  skip_voice: boolean;    // 快进时是否跳过语音
}
```

### 特性

- **自动持久化** — 修改 `settingsState` 后，会自动防抖保存（300ms）到引擎的永久变量中
- **自动应用显示设置** — 修改 `display` 值后，会自动调用系统 API 调整窗口大小或切换全屏
- **启动时恢复** — 引擎启动时，自动从永久变量中加载上次保存的设置

```typescript
// 直接修改即可，会自动保存
settingsState.volume_bgm = 0.5;
settingsState.display = 'fullscreen';
```

## UI 状态 (`uiState`)

`uiState` 管理临时的 UI 交互状态。定义在 `src/state/ui.ts` 中。

```typescript
import { uiState, uiActions } from '../state/ui';
```

### 通知

```typescript
// 显示通知
uiActions.notify('操作成功');
uiActions.notify('保存完成', { duration: 3000 });

// 清除所有通知
uiActions.clearNotifications();
```

### 确认对话框

```typescript
// 弹出确认框
uiActions.confirm(
  '确定要退出吗？',
  () => { /* 确认回调 */ },
  () => { /* 取消回调（可选） */ }
);
```

### 截图

```typescript
// 截取当前画面（用于存档缩略图）
await uiActions.takeSnapshot(320, 180);
```

## 添加自定义状态

如果你需要管理额外的游戏数据，可以创建新的状态模块：

```typescript title="src/state/custom.ts"
import { proxy } from 'valtio';

export interface CustomState {
  favorability: Record<string, number>;   // 角色好感度
  flags: Record<string, boolean>;         // 剧情标记
  inventory: string[];                    // 物品栏
}

export const customState = proxy<CustomState>({
  favorability: {},
  flags: {},
  inventory: [],
});
```

然后在组件或命令处理函数中使用：

```typescript
import { customState } from '../state/custom';
import { useSnapshot } from 'valtio';

// 在命令处理函数中修改
customState.favorability['Alice'] = (customState.favorability['Alice'] ?? 0) + 10;

// 在组件中读取
function StatusPanel() {
  const snap = useSnapshot(customState);
  return (
    <text text={`Alice 好感度: ${snap.favorability['Alice'] ?? 0}`} />
  );
}
```

:::caution[存档兼容]
自定义状态默认不会包含在存档中。如果需要持久化，你需要将其作为 `gameState` 的一部分，或在存档/读档逻辑中手动处理，详见[存档系统](/customize/save-load)。
:::
