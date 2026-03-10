---
title: 存档系统
sidebar:
  order: 10
---

标准框架提供了完整的存档/读档功能，基于引擎的 `scenario` 插件实现。

## 工作原理

存档系统的数据流：

```
保存：gameState → 引擎变量 → 引擎存档文件 → 磁盘
读取：磁盘 → 引擎存档文件 → 引擎变量 → gameState
```

引擎的 scenario 插件负责实际的文件读写，同时保存剧本的执行位置。框架层通过 `useSaveLoad` Hook 封装了完整的存档交互。

## useSaveLoad Hook

```typescript
import { useSaveLoad } from '../hooks/useSaveLoad';

function SaveLoadPage() {
  const {
    slots,              // Map<string, GameSave> — 所有存档槽位
    saveToSlot,         // (slotId: string) => Promise<void>
    loadFromSlot,       // (slotId: string) => Promise<boolean>
    refreshSlots,       // () => Promise<void>
    deleteSaveSlot,     // (slotId: string) => Promise<void>
    checkAutoSaveExists // () => Promise<boolean>
  } = useSaveLoad();
}
```

### API 参考

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `saveToSlot(slotId)` | `Promise<void>` | 保存当前游戏状态到指定槽位 |
| `loadFromSlot(slotId)` | `Promise<boolean>` | 从指定槽位读取，成功返回 `true` |
| `refreshSlots()` | `Promise<void>` | 刷新槽位列表 |
| `deleteSaveSlot(slotId)` | `Promise<void>` | 删除指定存档 |
| `checkAutoSaveExists()` | `Promise<boolean>` | 检查快速存档是否存在 |

### 存档数据结构

```typescript
interface GameSave {
  name: string;           // 槽位名称
  snapshot: string;       // 截图（data: 或 saves: 协议）
  metadata: {
    edition: number;      // 存档版本
    saveByVersion: string; // 引擎版本
    timestamp: number;    // 时间戳
  };
  extra?: {
    text: string;         // 文本预览
  };
}
```

## 存档流程详解

### 保存

`saveToSlot` 内部执行以下步骤：

1. 获取当前 `gameState` 的快照（`snapshot`）
2. 将游戏状态写入引擎变量（`setVariables`）
3. 调用引擎的 `saveGame` 命令保存到文件
4. 自动刷新槽位列表

```typescript
const saveToSlot = async (slotId: string) => {
  const currentGameState = snapshot(gameState);

  // Save game state to engine variables
  await executePluginCommand('scenario', {
    subCommand: 'setVariables',
    variables: { gameState: currentGameState },
  });

  // Save to file
  await executePluginCommand('scenario', {
    subCommand: 'saveGame',
    name: slotId,
    extra: { text: currentGameState.textbox.text },
  });

  refreshSlots();
};
```

### 读取

`loadFromSlot` 内部执行以下步骤：

1. 调用引擎的 `loadGame` 恢复剧本执行位置
2. 从引擎变量中读取游戏状态
3. 用读取的数据覆盖当前 `gameState`

```typescript
const loadFromSlot = async (slotId: string) => {
  // Restore scenario state
  await executePluginCommand('scenario', {
    subCommand: 'loadGame',
    name: slotId,
    overwrite: true,
  });

  // Restore game state
  const loadedState = await executePluginCommand('scenario', {
    subCommand: 'getVariable',
    name: 'gameState',
  });

  if (loadedState) {
    Object.assign(gameState, loadedState);
  }
};
```

## 快速存档

标准框架使用特殊的槽位名 `'auto-save'` 作为快速存档：

```typescript
// 快速保存（Ctrl+S）
await saveToSlot('auto-save');

// 快速读取（Ctrl+L）
const exists = await checkAutoSaveExists();
if (exists) {
  await loadFromSlot('auto-save');
}
```

在 Stage 中，快速存档默认绑定到 Ctrl+S 和 Ctrl+L 快捷键。

## 存档槽位命名规范

标准框架使用以下命名规范：

| 槽位名 | 用途 |
|--------|------|
| `auto-save` | 快速存档 |
| `save-1` ~ `save-50` | 普通存档 |

你可以根据需要自定义槽位命名。`refreshSlots` 使用 glob 模式 `{auto-save,save-*}` 来查询所有存档。

## 截图

存档界面需要显示存档缩略图。截图在保存前通过 `uiActions.takeSnapshot()` 获取：

```typescript
// Take a screenshot before saving
await uiActions.takeSnapshot(320, 180);
await saveToSlot('save-1');
```

截图由引擎自动关联到存档文件，读取存档列表时通过 `save.snapshot` 字段获取。

## 自定义存档数据

如果你添加了自定义状态并需要包含在存档中，在保存和读取时需要额外处理：

```typescript
// 保存时
await executePluginCommand('scenario', {
  subCommand: 'setVariables',
  variables: {
    gameState: snapshot(gameState),
    customState: snapshot(customState), // 自定义状态
  },
});

// 读取时
const loadedCustom = await executePluginCommand('scenario', {
  subCommand: 'getVariable',
  name: 'customState',
});
if (loadedCustom) {
  Object.assign(customState, loadedCustom);
}
```
