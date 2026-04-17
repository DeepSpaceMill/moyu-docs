---
title: 命令列表
sidebar:
  order: 10
---

标准框架内置了一系列命令，用于在剧本中控制文本显示、背景切换、角色管理、音频播放和流程控制等。命令在剧本（`.sixu`）中以 `@` 开头调用：

```sixu
@命令名 参数1=值1 参数2=值2
```

字符串值需要用引号包裹，数字和布尔值直接书写，数组使用方括号：

```sixu
@charEnter name="Alice" src="characters/alice.png" scale=0.8 pivot=[0.5,1]
```

未提供的可选参数将使用默认值，仅设置你需要更改的字段即可。

## 命令一览

### 文本

| 命令 | 说明 |
| --- | --- |
| [text](#text) | 显示对话或旁白文本 |
| [textClear](#textclear) | 清空文本框内容 |
| [textBox](#textbox) | 配置文本框样式 |
| [textBoxShow](#textboxshow) | 显示文本框 |
| [textBoxHide](#textboxhide) | 隐藏文本框 |

### 背景

| 命令 | 说明 |
| --- | --- |
| [bg](#bg) | 切换背景图片 |
| [bgTint](#bgtint) | 设置背景色调 |

### 角色

| 命令 | 说明 |
| --- | --- |
| [charEnter](#charenter) | 添加角色到舞台 |
| [charAction](#charaction) | 修改舞台上角色的属性 |
| [charLeave](#charleave) | 从舞台移除角色 |
| [charClear](#charclear) | 清除舞台上所有角色 |
| [charName](#charname) | 修改角色的显示名称 |
| [charPreset](#charpreset) | 定义或修改角色预设 |
| [charAutoTint](#charautotint) | 设置非说话角色的自动色调 |

### 音频

| 命令 | 说明 |
| --- | --- |
| [bgm](#bgm) | 播放背景音乐 |
| [bgmStop](#bgmstop) | 停止背景音乐 |
| [sfx](#sfx) | 播放音效 |
| [sfxStop](#sfxstop) | 停止所有音效 |
| [voice](#voice) | 播放角色语音 |
| [voiceStop](#voicestop) | 停止语音播放 |
| [sound](#sound) | 在指定通道播放音频 |
| [soundStop](#soundstop) | 停止指定通道音频 |

### 流程控制

| 命令 | 说明 |
| --- | --- |
| [wait](#wait) | 等待指定时间 |
| [waitClick](#waitclick) | 等待玩家点击 |
| [leaveStage](#leavestage) | 离开舞台并跳转页面 |

### 其他

| 命令 | 说明 |
| --- | --- |
| [title](#title) | 设置故事标题 |

---

## 文本

### 对话语法

在实际编写剧本时，你很少会直接使用 `text` 命令。剧本引擎提供了更自然的**对话语法**来显示文本：

```sixu
::entry {
    // 旁白（无说话人）
    这是一段旁白。

    // 带说话人的对话
    [Alice] "你好，很高兴认识你。"

    // 省略引号也可以
    [Alice] 你好，很高兴认识你。
}
```

对话语法本质上是 `text` 命令的简写形式，方括号中的角色名会被设置为说话人名称。

#### 尾标修饰符

在一行**引号包裹的**文本末尾以 `#` 开头可以添加修饰符来控制文本的显示行为：

| 修饰符 | 效果 | 等效参数 |
| --- | --- | --- |
| `+` | 不清空已有文本，追加显示 | `clear=false` |
| `&` | 不在文本前换行 | `newline=false` |
| `!` | 显示后自动推进，不等待点击 | — |

```sixu
::entry {
    // 仍旧会等待点击
    [Alice] "这是第一段话。" #&+

    // 下面这段文本将直接追加在上面文本的末尾，而不是换行显示
    [Alice] "接着说的内容……"

    // 直接显示文本并自动推进到下一行，适合描述连续的动作或环境音效
    "窗外传来一阵风声。" #!

    @wait time=1000

    [Alice] "听，" #+&!

    // 相当于直接和上面一行写在一起
    [Alice] "这是什么声音？" 
}
```

---

### text

显示一段文本。执行后脚本将暂停，等待玩家点击继续。

:::note
此命令会阻塞脚本执行，直到玩家点击继续。通常建议使用[对话语法](#对话语法)代替直接调用此命令。
:::

```sixu
@text content="你好，欢迎来到这个世界。" name="Alice"
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `content` | `string` | *必填* | 要显示的文本内容 |
| `name` | `string` | — | 说话人名称，显示在文本框的名称区域 |
| `newline` | `boolean` | `true` | 在文本前插入换行符 |
| `clear` | `boolean` | `true` | 显示前清空已有文本 |
| `skippable` | `boolean` | `true` | 是否允许快进跳过 |

---

### textClear

清空文本框中的所有内容，同时清除说话人名称。

```sixu
@textClear
```

此命令没有参数。

---

### textBox

配置文本框的显示样式和排版属性。仅更新显式提供的字段，未指定的字段保持不变。

基本用法——设置打字机模式和文字颜色：

```sixu
@textBox printMode="typewriter" printSpeed=30 fillColor="#f0f0f0"
```

设置文本框位置和排版：

```sixu
@textBox position=[100,600] lineHeight=1.8 indent=64
```

启用文字描边效果：

```sixu
@textBox stroke=true strokeColor="#000000" strokeWidth=2
```

启用文字阴影效果：

```sixu
@textBox shadow=true shadowColor="#000000" shadowOffsetX=2 shadowOffsetY=2 shadowBlur=4
```

#### 参数

**`position`** `[number, number]`
文本框的 x, y 坐标。

**`printMode`** `"instant" | "typewriter" | "printer"`
文本打印模式。`instant` 立即显示全部文本；`typewriter` 按字逐字显示；`printer` 按行逐行显示。

**`printSpeed`** `number`
打印速度。`typewriter` 模式下为每秒字符数，`printer` 模式下为每秒行数。

**`fillColor`** `string`
文字颜色，支持十六进制颜色值如 `"#f0f0f0"`。

**`lineHeight`** `number`
行高倍数。

**`indent`** `number`
每段首行缩进的像素数。

**`stroke`** `boolean`
是否启用文字描边。

**`strokeColor`** `string`
描边颜色。

**`strokeWidth`** `number`
描边宽度（像素）。

**`shadow`** `boolean`
是否启用文字阴影。

**`shadowColor`** `string`
阴影颜色。

**`shadowOffsetX`** `number`
阴影 X 方向偏移（像素）。

**`shadowOffsetY`** `number`
阴影 Y 方向偏移（像素）。

**`shadowBlur`** `number`
阴影模糊半径（像素）。

**`shadowWidth`** `number`
阴影宽度（像素），仅在 `shadow=true` 时生效。

---

### textBoxShow

显示文本框。文本框默认是可见的，通常在使用 `textBoxHide` 隐藏后需要重新显示时调用。

```sixu
@textBoxShow
```

此命令没有参数。

---

### textBoxHide

隐藏文本框。常用于展示全屏 CG 或过场动画时临时隐藏文本框。

```sixu
@textBoxHide
```

此命令没有参数。

---

## 背景

### bg

切换背景图片，支持渐变过渡效果。执行后脚本将等待渐变完成。

:::note
此命令默认会阻塞脚本执行，等待 `fadeTime` 结束后才继续。设置 `noWait=true` 可以跳过等待，实现与后续命令并行执行。如果 `skippable=true`，玩家可以点击跳过等待。
:::

```sixu
@bg src="bg/classroom.png"
```

带自定义渐变时间：

```sixu
@bg src="bg/sunset.png" fadeTime=2000
```

允许玩家跳过渐变：

```sixu
@bg src="bg/night.png" fadeTime=1500 skippable=true
```

不等待渐变完成，立即执行后续命令：

```sixu
@bg src="bg/night.png" fadeTime=1500 noWait=true
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | *必填* | 背景图片的素材路径（相对于 `assets/`） |
| `fadeTime` | `number` | `1000` | 渐变过渡时间（毫秒） |
| `skippable` | `boolean` | `false` | 是否允许玩家点击跳过渐变 |
| `noWait` | `boolean` | `false` | 是否跳过等待过渡完成，设为 `true` 可与后续命令并行执行 |

---

### bgTint

设置背景的色调叠加。可用于营造氛围变化，如夕阳色调或暗色滤镜。执行后脚本将等待渐变完成。

:::note
此命令默认会阻塞脚本执行，等待 `fadeTime` 结束后才继续。设置 `noWait=true` 可以跳过等待，实现与后续命令并行执行。如果 `skippable=true`，玩家可以点击跳过等待。
:::

```sixu
// 添加暖色调
@bgTint tint="#ffcccc"

// 带自定义渐变时间
@bgTint tint="#000033" fadeTime=2000

// 允许玩家跳过渐变
@bgTint tint="#ff9900" fadeTime=1500 skippable=true

// 移除色调
@bgTint tint="off"
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `tint` | `string` | *必填* | 色调颜色值，设为 `"off"` 或 `"none"` 取消色调 |
| `fadeTime` | `number` | `1000` | 渐变过渡时间（毫秒） |
| `skippable` | `boolean` | `false` | 是否允许玩家点击跳过渐变 |
| `noWait` | `boolean` | `false` | 是否跳过等待过渡完成，设为 `true` 可与后续命令并行执行 |

---

## 角色

角色命令用于管理舞台上的立绘。每个角色通过 `name` 参数标识，同名角色的后续命令会修改已存在的角色而不是创建新的。

角色坐标系以画面底部中心为原点，X 轴向右为正，Y 轴向上为负。角色支持三个内置位置预设：`left`（左侧）、`center`（居中）和 `right`（右侧），也可以通过 `x`/`y` 手动指定坐标。

### charEnter

添加一个角色到舞台。如果同名角色已存在，则更新其属性。

```sixu
// 使用位置预设
@charEnter name="Alice" src="characters/alice/normal.png" preset="center" fadeTime=500
```

手动指定坐标和缩放：

```sixu
@charEnter name="Alice" src="characters/alice/normal.png" x=0 y=0 scale=0.8 pivot=[0.5,1]
```

初始不可见，稍后再显示：

```sixu
@charEnter name="Alice" src="characters/alice/normal.png" preset="left" visible=false
@charAction name="Alice" visible=true fadeTime=300
```

等待淡入完成后才继续：

```sixu
@charEnter name="Alice" src="characters/alice/normal.png" preset="center" noWait=false
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | *必填* | 角色立绘的素材路径 |
| `name` | `string` | — | 角色标识名称，用于后续修改或移除 |
| `preset` | `"left" \| "center" \| "right"` | — | 位置预设 |
| `x` | `number` | `0` | X 坐标（提供 `preset` 时会被预设值覆盖，除非同时指定 `x`） |
| `y` | `number` | `0` | Y 坐标 |
| `scale` | `number` | `1` | 缩放比例 |
| `tint` | `string` | `"#fff"` | 着色，可用于让非活跃角色变暗 |
| `pivot` | `[number, number]` | `[0.5, 1]` | 旋转和定位的锚点 |
| `visible` | `boolean` | `true` | 是否可见 |
| `fadeTime` | `number` | `500` | 淡入动画时间（毫秒） |
| `skippable` | `boolean` | `false` | 是否允许玩家点击跳过动画等待 |
| `noWait` | `boolean` | `true` | 是否跳过等待动画完成，设为 `false` 可等待淡入结束 |

---

### charAction

修改舞台上已有角色的属性。仅更新显式提供的字段，可用于切换立绘、移动位置、改变色调等。

切换立绘：

```sixu
@charAction name="Alice" src="characters/alice/smile.png"
```

移动到新位置并改变色调：

```sixu
@charAction name="Alice" preset="right" tint="#999" fadeTime=300
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | — | 要修改的角色标识名称 |
| `src` | `string` | — | 新的立绘素材路径 |
| `preset` | `"left" \| "center" \| "right"` | — | 位置预设 |
| `x` | `number` | — | X 坐标 |
| `y` | `number` | — | Y 坐标 |
| `scale` | `number` | — | 缩放比例 |
| `tint` | `string` | — | 着色 |
| `pivot` | `[number, number]` | — | 锚点 |
| `visible` | `boolean` | — | 是否可见 |
| `fadeTime` | `number` | `500` | 动画过渡时间（毫秒） |
| `skippable` | `boolean` | `false` | 是否允许玩家点击跳过动画等待 |
| `noWait` | `boolean` | `true` | 是否跳过等待动画完成，设为 `false` 可等待过渡结束 |

---

### charLeave

从舞台移除指定角色。

```sixu
@charLeave name="Alice" fadeTime=300
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | — | 要移除的角色标识名称 |
| `fadeTime` | `number` | `500` | 淡出动画时间（毫秒） |
| `skippable` | `boolean` | `false` | 是否允许玩家点击跳过动画等待 |
| `noWait` | `boolean` | `true` | 是否跳过等待动画完成，设为 `false` 可等待淡出结束 |

---

### charClear

清除舞台上的所有角色。

```sixu
@charClear fadeTime=500
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `fadeTime` | `number` | `500` | 淡出动画时间（毫秒） |
| `skippable` | `boolean` | `false` | 是否允许玩家点击跳过动画等待 |
| `noWait` | `boolean` | `true` | 是否跳过等待动画完成，设为 `false` 可等待淡出结束 |

---

### charName

:::caution[尚未实现]
此命令已定义但尚未实现，调用后不会产生实际效果。
:::

修改角色的显示名称。可以将角色的内部标识名映射为另一个显示名。

```sixu
@charName name="Alice" to="爱丽丝"
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | — | 角色的内部标识名 |
| `to` | `string` | *必填* | 要显示的新名称 |

---

### charPreset

定义或修改一个角色预设。内置预设有 `left`（-560, 0）、`center`（0, 0）和 `right`（560, 0），你可以用此命令覆盖它们或创建新的预设。预设支持设置所有角色属性，不仅仅是位置。

```sixu
// 创建一个新预设，包含位置和缩放
@charPreset preset="far-left" x=-700 y=0 scale=0.8

// 修改已有预设的部分属性（未提供的字段保持不变）
@charPreset preset="left" scale=0.9 tint="#cccccc"
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `preset` | `string` | *必填* | 预设名称 |
| `x` | `number` | — | X 坐标 |
| `y` | `number` | — | Y 坐标 |
| `scale` | `number` | — | 缩放比例 |
| `tint` | `string` | — | 着色 |
| `pivot` | `[number, number]` | — | 锚点 |
| `visible` | `boolean` | — | 是否可见 |
| `fadeTime` | `number` | — | 动画过渡时间（毫秒） |

---

### charAutoTint

设置非当前说话角色的自动色调。当有多个角色在舞台上时，非当前说话者的立绘会自动应用此色调，默认为 `#666`。

```sixu
// 设置更深的变暗效果
@charAutoTint tint="#555555"

// 设置较浅的变暗效果
@charAutoTint tint="#aaaaaa"
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `tint` | `string` | *必填* | 非说话角色的色调颜色值 |

---

## 音频

标准框架提供四种音频通道，各有不同用途：

| 通道 | 命令 | 特性 |
| --- | --- | --- |
| **BGM**（背景音乐） | `bgm` / `bgmStop` | 全局单通道，默认循环播放，通过 state 管理 |
| **SFX**（音效） | `sfx` / `sfxStop` | 一次性播放，快进模式下会被跳过以避免音频重叠 |
| **Voice**（语音） | `voice` / `voiceStop` | 角色语音，可按角色名分通道 |
| **Sound**（自定义） | `sound` / `soundStop` | 自定义命名通道，用于需要独立控制的音频（如环境音） |

### bgm

播放背景音乐。同一时间只能有一首背景音乐，调用新的 `bgm` 会替换当前播放的。

```sixu
@bgm src="audio/bgm/theme.opus"
```

自定义音量和渐入时间：

```sixu
@bgm src="audio/bgm/battle.opus" volume=0.8 fadeTime=1000
```

不循环播放：

```sixu
@bgm src="audio/bgm/ending.opus" loop=false
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | *必填* | 音频文件的素材路径 |
| `loop` | `boolean` | `true` | 是否循环播放 |
| `volume` | `number` | `1` | 音量，范围 0 ~ 1 |
| `fadeTime` | `number` | `600` | 渐入时间（毫秒） |
| `skippable` | `boolean` | `false` | 是否允许玩家点击跳过等待 |
| `noWait` | `boolean` | `true` | 是否跳过等待过渡完成，设为 `false` 可等待渐入结束 |

---

### bgmStop

停止当前播放的背景音乐。

```sixu
@bgmStop
```

缓慢淡出：

```sixu
@bgmStop fadeTime=2000
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `fadeTime` | `number` | `600` | 淡出时间（毫秒） |
| `skippable` | `boolean` | `false` | 是否允许玩家点击跳过等待 |
| `noWait` | `boolean` | `true` | 是否跳过等待过渡完成，设为 `false` 可等待淡出结束 |

---

### sfx

播放一次音效。每次调用会创建一个独立的音效实例，多个音效可以同时播放。

:::tip
快进模式下，音效会被自动跳过以避免大量音效重叠。自动播放模式下，音效会正常播放但不影响推进时序。
:::

```sixu
@sfx src="audio/sfx/door_open.opus"
```

循环音效：

```sixu
@sfx src="audio/sfx/rain.opus" loop=true volume=0.5
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | *必填* | 音频文件的素材路径 |
| `loop` | `boolean` | `false` | 是否循环播放 |
| `volume` | `number` | `1` | 音量，范围 0 ~ 1 |
| `fadeTime` | `number` | `600` | 渐入时间（毫秒） |
| `skippable` | `boolean` | `false` | 是否允许玩家点击跳过等待 |
| `noWait` | `boolean` | `true` | 是否跳过等待过渡完成，设为 `false` 可等待渐入结束 |

---

### sfxStop

停止所有正在播放的音效。

```sixu
@sfxStop
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `fadeTime` | `number` | `600` | 淡出时间（毫秒） |
| `skippable` | `boolean` | `false` | 是否允许玩家点击跳过等待 |
| `noWait` | `boolean` | `true` | 是否跳过等待过渡完成，设为 `false` 可等待淡出结束 |

---

### voice

播放角色语音。可以通过 `name` 参数将语音绑定到特定角色通道，方便后续单独停止。

:::tip
在自动播放模式下，如果 `@voice` 后面紧跟一行文本，标准框架会同时等待“语音播放完成”和“文本打印完成”后再推进，不会只按文字时间翻页。
:::

```sixu
@voice src="audio/voice/alice_001.opus" name="Alice"
```

不指定角色名（使用默认通道）：

```sixu
@voice src="audio/voice/narrator_001.opus"
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | *必填* | 语音文件的素材路径 |
| `name` | `string` | — | 角色名称，用于标识语音通道 |
| `volume` | `number` | `1` | 音量，范围 0 ~ 1 |

---

### voiceStop

停止语音播放。可以停止指定角色的语音，或停止默认通道的语音。

```sixu
// 停止指定角色的语音
@voiceStop name="Alice"

// 停止默认通道语音
@voiceStop
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | — | 角色名称，省略时停止默认通道 |

---

### sound

在指定的命名通道上播放音频。适用于需要独立管理的长时间音频，如环境音、雨声等。

:::tip
与 `sfx` 类似，快进模式下 `sound` 也会被自动跳过。自动播放模式下正常播放但不影响推进时序。
:::

```sixu
@sound channel="rain" src="audio/sfx/rain_loop.opus" loop=true volume=0.3
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `channel` | `string` | *必填* | 通道名称，用于后续停止控制 |
| `src` | `string` | *必填* | 音频文件的素材路径 |
| `loop` | `boolean` | `false` | 是否循环播放 |
| `volume` | `number` | `1` | 音量，范围 0 ~ 1 |
| `fadeTime` | `number` | `600` | 渐入时间（毫秒） |
| `skippable` | `boolean` | `false` | 是否允许玩家点击跳过等待 |
| `noWait` | `boolean` | `true` | 是否跳过等待过渡完成，设为 `false` 可等待渐入结束 |

---

### soundStop

停止指定通道上的音频播放。

```sixu
@soundStop channel="rain" fadeTime=1000
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `channel` | `string` | *必填* | 要停止的通道名称 |
| `fadeTime` | `number` | `600` | 淡出时间（毫秒） |
| `skippable` | `boolean` | `false` | 是否允许玩家点击跳过等待 |
| `noWait` | `boolean` | `true` | 是否跳过等待过渡完成，设为 `false` 可等待淡出结束 |

---

## 流程控制

### wait

暂停脚本执行指定的时间。

:::note
此命令会阻塞脚本执行。如果 `skippable=true`，玩家可以点击跳过等待。
:::

:::tip
在自动播放模式下，`wait` 仍然会生效。即使没有任何 Actor 参与，它也会至少等待 `time` 指定的时长后再推进。
:::

```sixu
// 等待 2 秒
@wait time=2000

// 可跳过的等待
@wait time=3000 skippable=true
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `time` | `number` | *必填* | 等待时间（毫秒） |
| `skippable` | `boolean` | `false` | 是否允许玩家点击跳过 |

---

### waitClick

暂停脚本执行，等待玩家点击后继续。

:::note
此命令会阻塞脚本执行，直到玩家点击。
:::

:::tip
在自动播放模式下，`waitClick` 默认会被直接越过，因为它只打开一个 `hold` 屏障而没有额外票据参与。
:::

```sixu
@waitClick
```

此命令没有参数。

---

### leaveStage

离开当前舞台并跳转到指定页面。此命令会重置游戏状态，且不可被快进跳过。

:::note
此命令会终止脚本执行，跳转到指定页面后不会继续执行后续命令。
:::

```sixu
@leaveStage gotoPage="title"
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `gotoPage` | `string` | *必填* | 要跳转到的页面名称（如 `"title"`） |

---

## 其他

### title

设置当前故事的标题。通常在剧本开头使用，用于在存档等界面显示当前章节名。

```sixu
@title text="第一章 相遇"
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `text` | `string` | *必填* | 故事标题文本 |
