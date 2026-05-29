---
title: 文本前导与对话表现
sidebar:
  order: 7.5
---

剧本中的每一行普通文本都可以携带一段「前导」（leading），用于声明这一行的说话人、语音以及头像变体。框架在 `handleTextLine` 中解析前导，并据此驱动姓名框、语音播放、文本框头像，以及立绘的自动变暗效果。

本页讲解前导语法的三个槽位，以及它们各自驱动的对话表现。

## 文本前导语法

在 `.sixu` 剧本中，文本行的前导写在方括号里，使用 `|` 分隔最多三个槽位：

```sixu
[说话人|语音|头像名] 这是一行对话。
```

| 顺序 | 槽位 | 作用 | 可省略 |
| ---- | ---- | ---- | ------ |
| 1 | 说话人 | 写入姓名框、决定当前发言角色 | 可（旁白） |
| 2 | 语音 | 自动播放 `voice/<语音>.opus` | 可 |
| 3 | 头像名 | 选择文本框头像的变体 | 可 |

省略中间槽位时仍需保留分隔符，例如只指定说话人和头像名：

```sixu
[墨语||happy] 今天天气不错呢。
```

框架使用 `parseTextLeading` 解析前导：

```typescript title="src/commands/handlers.ts"
function parseTextLeading(leading: string | null | undefined) {
  const parts = leading?.split('|').map((part) => part.trim()) ?? [];

  return {
    speaker: parts[0] ?? '',
    voice: parts[1] ?? '',
    avatarName: parts[2] ?? '',
  };
}
```

解析结果分别写入：

```typescript
gameState.character.currentSpeaker = speaker || undefined;
gameState.textbox.name = speaker;
gameState.textbox.avatarName = avatarName;
```

## 说话人槽位

说话人会同时写入 `gameState.textbox.name`（姓名框显示文本）与 `gameState.character.currentSpeaker`（当前发言角色标识）。后者是立绘自动变暗的判定依据，见下文。

旁白行省略说话人即可（前导留空或整体省略），此时姓名框不显示、且没有角色被视为发言者。

## 语音槽位

第二个槽位指定语音文件名（不含扩展名），框架会自动转换为 `voice/<语音>.opus` 并在文本显示前播放：

```typescript title="src/commands/handlers.ts"
if (voice) {
  handleVoice(
    { command: 'voice', src: `voice/${voice}.opus`, name: speaker, volume: 1, waitForEnd: false },
    control,
  );
}
```

语音还会被写入 backlog 记录，供历史回顾中重听。

## 立绘自动变暗

当存在「当前发言角色」时，框架会让非发言角色的立绘自动变暗，以突出说话者。该行为由 `CharacterState` 的两个字段驱动：

```typescript
interface CharacterState {
  // ...
  currentSpeaker?: string;   // 当前发言角色（由前导说话人写入）
  autoTintEnabled: boolean;  // 是否启用自动变暗（默认 true）
  autoTint: string;          // 非发言角色的色调（默认 '#666'）
}
```

`CharacterActor` 在渲染每个立绘时，对比立绘名与当前发言者来决定色调：

```typescript title="src/actors/character.tsx"
const currentTint = autoTintEnabled && !isCurrentSpeaker ? autoTint : character.tint;
const tintFadeTime = autoTintEnabled && !isCurrentSpeaker ? 200 : character.fadeTime;
```

- 当前发言角色保持各自的 `tint`（通常为正常颜色）。
- 其他角色统一应用 `autoTint`，并以 200ms 过渡平滑变暗。

### `@charAutoTint` 命令

通过 `charAutoTint` 命令可在运行时开关自动变暗、或调整变暗色调：

```sixu
@charAutoTint enabled=true tint="#666"
```

| 参数 | 说明 |
| ---- | ---- |
| `enabled` | 是否启用自动变暗（省略则保持当前值） |
| `tint` | 非发言角色的色调颜色（省略则保持当前值） |

```typescript title="src/commands/handlers.ts"
export const handleCharAutoTint: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'charAutoTint') return;
  gameState.character.autoTintEnabled = cmd.enabled ?? gameState.character.autoTintEnabled;
  gameState.character.autoTint = cmd.tint ?? gameState.character.autoTint;
};
```

## 文本框头像

文本框头像（avatar）是显示在对话框一侧的角色头像图。它独立于立绘系统，配置存放在 `TextBoxState` 中：

```typescript
interface TextBoxAvatarConfig {
  src: string;       // 头像图片路径
  enable: boolean;   // 是否显示
  offsetX: number;   // 相对默认摆放位置的水平偏移
  offsetY: number;   // 相对默认摆放位置的垂直偏移
  spacing: number;   // 头像可见时，文本区与姓名框的水平退让尺寸
}

interface TextBoxAvatarForConfig extends TextBoxAvatarConfig {
  character: string; // 适用的角色名
  name?: string;     // 可选头像变体名，对应前导第三槽位
}

interface TextBoxState {
  // ...
  avatarName: string;                 // 当前行的头像变体名（来自前导第三槽位）
  avatar: TextBoxAvatarConfig;        // 全局默认头像
  avatarFor: TextBoxAvatarForConfig[]; // 按角色 / 变体配置的头像列表
}
```

### `@avatar` — 全局默认头像

`@avatar` 配置一个全局默认头像，当没有更具体的角色配置命中时使用：

```sixu
@avatar src="avatar/default.png" spacing=150
```

| 参数 | 说明 |
| ---- | ---- |
| `src` | 头像图片路径；设置后默认自动启用 |
| `enable` | 是否显示头像；设置 `src` 时默认 `true` |
| `offsetX` / `offsetY` | 相对默认摆放位置的偏移 |
| `spacing` | 头像可见时，文本区与姓名框的水平退让尺寸 |

### `@avatarFor` — 按角色 / 变体配置

`@avatarFor` 为特定角色（以及可选的头像变体）配置头像。`name` 对应前导的第三个槽位：

```sixu
@avatarFor character="墨语" src="avatar/moyu-neutral.png" spacing=150
@avatarFor character="墨语" name="happy" src="avatar/moyu-happy.png" spacing=150
@avatarFor character="墨语" name="grin" src="avatar/moyu-grin.png" spacing=150
```

| 参数 | 说明 |
| ---- | ---- |
| `character` | 适用的角色名（必填） |
| `name` | 可选头像变体名，对应前导第三槽位 |
| `src` / `enable` / `offsetX` / `offsetY` / `spacing` | 同 `@avatar` |

未指定 `name` 的条目作为该角色的默认头像；指定 `name` 的条目作为该角色在对应变体下的头像。

### 头像解析优先级

框架在 `resolveActiveAvatar` 中按以下顺序为当前行决定使用哪个头像：

1. 若当前行没有说话人 → 使用全局默认头像（启用时），否则不显示。
2. 在 `avatarFor` 中查找「角色匹配且变体名匹配前导第三槽位」的条目（命名变体优先）。
3. 若无命名变体命中，回退到「角色匹配且未指定变体名」的默认条目。
4. 命中的条目若被禁用（`enable=false`），则回退到全局默认头像。

```typescript title="src/actors/textbox.tsx"
function resolveActiveAvatar(textboxState: TextBoxState): TextBoxAvatarConfig | null {
  const character = textboxState.name.trim();
  const avatarName = textboxState.avatarName.trim();
  const globalAvatar = textboxState.avatar.enable ? textboxState.avatar : null;

  if (!character) {
    return globalAvatar;
  }

  // Prefer a named variant match, fall back to the unnamed default for this character
  const matched =
    textboxState.avatarFor.findLast(
      (a) => a.character === character && a.name !== undefined && a.name === avatarName,
    ) ?? textboxState.avatarFor.findLast((a) => a.character === character && a.name === undefined);

  return matched?.enable ? matched : globalAvatar;
}
```

### `spacing` 退让

当头像可见时，文本区与姓名框会整体向右退让 `spacing` 像素，为头像腾出空间；头像不可见时则恢复原始布局：

```typescript title="src/actors/textbox.tsx"
function resolveTextLayout(avatar: TextBoxAvatarConfig | null) {
  if (!avatar) {
    return { textX: TEXTBOX_CONTENT_X, textWidth: TEXTBOX_CONTENT_WIDTH, nameBoxX: NAMEBOX_X };
  }

  return {
    textX: TEXTBOX_CONTENT_X + avatar.spacing,
    textWidth: Math.max(0, TEXTBOX_CONTENT_WIDTH - avatar.spacing),
    nameBoxX: NAMEBOX_X + avatar.spacing,
  };
}
```

## 综合示例

```sixu
// 配置头像
@avatarFor character="墨语" src="avatar/moyu-neutral.png" spacing=150
@avatarFor character="墨语" name="happy" src="avatar/moyu-happy.png" spacing=150

// 启用立绘自动变暗
@charAutoTint enabled=true tint="#666"

// 旁白：无说话人、无头像、所有立绘正常
窗外传来了上课铃声。

// 墨语发言（默认头像 + 播放语音 moyu_001 + 其他角色变暗）
[墨语|moyu_001] 早上好呀。

// 墨语发言并切换到 happy 头像变体
[墨语||happy] 今天也要加油哦！
```
