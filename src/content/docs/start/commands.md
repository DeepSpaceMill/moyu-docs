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
@addchar name="Alice" src="characters/alice.png" scale=0.8 pivot=[0.5,1]
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
| [changebg](#changebg) | 切换背景图片 |
| [setBgTint](#setbgtint) | 设置背景色调 |

### 角色

| 命令 | 说明 |
| --- | --- |
| [addchar](#addchar) | 添加角色到舞台 |
| [charchange](#charchange) | 修改舞台上角色的属性 |
| [charremove](#charremove) | 从舞台移除角色 |
| [charclear](#charclear) | 清除舞台上所有角色 |
| [charname](#charname) | 修改角色的显示名称 |
| [charpreset](#charpreset) | 定义或修改角色位置预设 |

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
| [waitclick](#waitclick) | 等待玩家点击 |
| [leaveStage](#leavestage) | 离开舞台并跳转页面 |

### 其他

| 命令 | 说明 |
| --- | --- |
| [setTitle](#settitle) | 设置故事标题 |

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

在一行文本末尾可以添加修饰符来控制文本的显示行为：

| 修饰符 | 效果 | 等效参数 |
| --- | --- | --- |
| `+` | 不清空已有文本，追加显示 | `clear=false` |
| `&` | 不在文本前换行 | `newline=false` |
| `!` | 显示后自动推进，不等待点击 | — |

```sixu
::entry {
    [Alice] 这是第一段话。

    // 追加文本，不清空前文（+），不换行（&）
    [Alice] 接着说的内容……+&

    // 旁白，自动推进不等待点击（!）
    窗外传来一阵风声。!

    // 可以组合使用
    [Alice] 她快速地补充道！+&!
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

### changebg

切换背景图片，支持渐变过渡效果。执行后脚本将等待渐变完成。

:::note
此命令会阻塞脚本执行，等待 `fadeTime` 结束后才继续。如果 `skippable=true`，玩家可以点击跳过等待。
:::

```sixu
@changebg src="bg/classroom.png"
```

带自定义渐变时间：

```sixu
@changebg src="bg/sunset.png" fadeTime=2000
```

允许玩家跳过渐变：

```sixu
@changebg src="bg/night.png" fadeTime=1500 skippable=true
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | *必填* | 背景图片的素材路径（相对于 `assets/`） |
| `fadeTime` | `number` | `1000` | 渐变过渡时间（毫秒） |
| `skippable` | `boolean` | `false` | 是否允许玩家点击跳过渐变 |

---

### setBgTint

设置背景的色调叠加。可用于营造氛围变化，如夕阳色调或暗色滤镜。

```sixu
// 添加暖色调
@setBgTint tint="#ffcccc"

// 移除色调
@setBgTint tint="off"
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `tint` | `string` | *必填* | 色调颜色值，设为 `"off"` 或 `"none"` 取消色调 |

---

## 角色

角色命令用于管理舞台上的立绘。每个角色通过 `name` 参数标识，同名角色的后续命令会修改已存在的角色而不是创建新的。

角色支持三个内置位置预设：`left`（左侧）、`center`（居中）和 `right`（右侧），也可以通过 `x`/`y` 手动指定坐标。

### addchar

添加一个角色到舞台。如果同名角色已存在，则更新其属性。

```sixu
// 使用位置预设
@addchar name="Alice" src="characters/alice/normal.png" preset="center" fadeTime=500
```

手动指定坐标和缩放：

```sixu
@addchar name="Alice" src="characters/alice/normal.png" x=960 y=1080 scale=0.8 pivot=[0.5,1]
```

初始不可见，稍后再显示：

```sixu
@addchar name="Alice" src="characters/alice/normal.png" preset="left" visible=false
@charchange name="Alice" visible=true fadeTime=300
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

---

### charchange

修改舞台上已有角色的属性。仅更新显式提供的字段，可用于切换立绘、移动位置、改变色调等。

切换立绘：

```sixu
@charchange name="Alice" src="characters/alice/smile.png"
```

移动到新位置并改变色调：

```sixu
@charchange name="Alice" preset="right" tint="#999" fadeTime=300
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
| `fadeTime` | `number` | — | 动画过渡时间（毫秒） |

---

### charremove

从舞台移除指定角色。

```sixu
@charremove name="Alice" fadeTime=300
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | — | 要移除的角色标识名称 |
| `fadeTime` | `number` | — | 淡出动画时间（毫秒） |

---

### charclear

清除舞台上的所有角色。

```sixu
@charclear fadeTime=500
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `fadeTime` | `number` | — | 淡出动画时间（毫秒） |

---

### charname

:::caution[尚未实现]
此命令已定义但尚未实现，调用后不会产生实际效果。
:::

修改角色的显示名称。可以将角色的内部标识名映射为另一个显示名。

```sixu
@charname name="Alice" to="爱丽丝"
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | — | 角色的内部标识名 |
| `to` | `string` | *必填* | 要显示的新名称 |

---

### charpreset

定义或修改一个角色位置预设。内置预设有 `left`（400, 800）、`center`（960, 800）和 `right`（1520, 800），你可以用此命令覆盖它们或创建新的预设。

```sixu
@charpreset preset="far-left" x=200 y=800
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `preset` | `string` | *必填* | 预设名称 |
| `x` | `number` | *必填* | 预设的 X 坐标 |
| `y` | `number` | *必填* | 预设的 Y 坐标 |

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

---

### sfx

播放一次音效。每次调用会创建一个独立的音效实例，多个音效可以同时播放。

:::tip
快进模式下，音效会被自动跳过以避免大量音效重叠。
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

---

### sfxStop

停止所有正在播放的音效。

```sixu
@sfxStop
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `fadeTime` | `number` | `600` | 淡出时间（毫秒） |

---

### voice

播放角色语音。可以通过 `name` 参数将语音绑定到特定角色通道，方便后续单独停止。

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
与 `sfx` 类似，快进模式下 `sound` 也会被自动跳过。
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

---

## 流程控制

### wait

暂停脚本执行指定的时间。

:::note
此命令会阻塞脚本执行。如果 `skippable=true`，玩家可以点击跳过等待。
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

### waitclick

暂停脚本执行，等待玩家点击后继续。

:::note
此命令会阻塞脚本执行，直到玩家点击。
:::

```sixu
@waitclick
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

### setTitle

设置当前故事的标题。通常在剧本开头使用，用于在存档等界面显示当前章节名。

```sixu
@setTitle text="第一章 相遇"
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `text` | `string` | *必填* | 故事标题文本 |
