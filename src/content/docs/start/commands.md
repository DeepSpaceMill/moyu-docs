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
| [avatar](#avatar) | 配置文本框全局默认头像 |
| [avatarFor](#avatarfor) | 为特定角色 / 头像变体配置文本框头像 |

### 背景

| 命令 | 说明 |
| --- | --- |
| [bg](#bg) | 切换背景图片 |
| [bgTint](#bgtint) | 设置背景色调 |
| [bgTransEffect](#bgtranseffect) | 设置背景切换使用的转场效果 |

### 镜头

| 命令 | 说明 |
| --- | --- |
| [camera](#camera) | 设置镜头焦点、推近、景深和背景模糊 |

### 场景转场

| 命令 | 说明 |
| --- | --- |
| [transPrepare](#transprepare) | 准备一次全画面转场 |
| [transPerform](#transperform) | 执行一次已准备好的全画面转场 |

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
| [charTransEffect](#chartranseffect) | 设置立绘切换使用的转场效果 |

### 自由精灵

| 命令 | 说明 |
| --- | --- |
| [sprite](#sprite) | 创建或更新自由精灵节点 |
| [spriteChange](#spritechange) | 修改已有精灵节点的属性 |
| [spriteRemove](#spriteremove) | 移除精灵节点及其子树 |
| [spriteMove](#spritemove) | 移动精灵节点到新的父节点或根层 |
| [spriteTransEffect](#spritetranseffect) | 设置精灵切换使用的转场效果 |
| [spriteTransEffectReset](#spritetranseffectreset) | 重置精灵转场效果配置 |

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

### 视频

| 命令 | 说明 |
| --- | --- |
| [video](#video) | 播放全屏视频 |

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

前导内容也可以用 `|` 分隔多个片段。第一个片段仍然是说话人名称，第二个片段会被当作语音文件名，并自动映射到 `voice/<文件名>.opus` 后在文本打印前播放，第三个片段是头像变体名，用于选择[文本框头像](#avatarfor)的具体变体。

```sixu
[Alice|alice_001] "你好，很高兴认识你。"
```

上面的写法等价于先执行：

```sixu
@voice src="voice/alice_001.opus"
@text name="Alice" content="你好，很高兴认识你。"
```

省略中间片段时仍需保留分隔符。例如只指定说话人和头像变体名：

```sixu
[Alice||happy] "今天心情真好！"
```

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

### avatar

配置文本框的全局默认头像。当某一行没有匹配到更具体的角色头像配置（见 [avatarFor](#avatarfor)）时，使用这个默认头像。

头像可见时，文本区与姓名框会整体向右退让 `spacing` 像素，为头像腾出空间。

```sixu
// 设置默认头像并退让 150 像素
@avatar src="avatar/default.png" spacing=150

// 临时隐藏头像
@avatar enable=false
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | — | 头像图片的素材路径；设置后默认自动启用 |
| `enable` | `boolean` | — | 是否显示头像；设置 `src` 时默认为 `true` |
| `offsetX` | `number` | — | 相对默认摆放位置的水平偏移（像素） |
| `offsetY` | `number` | — | 相对默认摆放位置的垂直偏移（像素） |
| `spacing` | `number` | — | 头像可见时，文本区与姓名框的水平退让尺寸（像素） |

---

### avatarFor

为特定角色（以及可选的头像变体）配置文本框头像。`character` 与当前说话人匹配时优先于全局默认头像；`name` 对应[对话前导](#对话语法)的第三个片段，用于切换同一角色的不同头像变体。

未指定 `name` 的条目作为该角色的默认头像；指定 `name` 的条目作为该角色在对应变体下的头像。

```sixu
// 角色默认头像
@avatarFor character="Alice" src="avatar/alice-neutral.png" spacing=150

// 角色的 happy 变体头像
@avatarFor character="Alice" name="happy" src="avatar/alice-happy.png" spacing=150
```

配合对话前导切换变体：

```sixu
[Alice] "普通表情。"
[Alice||happy] "开心表情！"
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `character` | `string` | *必填* | 适用的角色名（与说话人匹配） |
| `name` | `string` | — | 头像变体名，对应对话前导第三个片段 |
| `src` | `string` | — | 头像图片的素材路径；设置后默认自动启用 |
| `enable` | `boolean` | — | 是否显示头像；设置 `src` 时默认为 `true` |
| `offsetX` | `number` | — | 相对默认摆放位置的水平偏移（像素） |
| `offsetY` | `number` | — | 相对默认摆放位置的垂直偏移（像素） |
| `spacing` | `number` | — | 头像可见时，文本区与姓名框的水平退让尺寸（像素） |

#### 头像解析优先级

框架按以下顺序为当前行决定使用哪个头像：

1. 当前行没有说话人 → 使用全局默认头像（`@avatar` 启用时），否则不显示。
2. 在 `avatarFor` 中查找「角色匹配且变体名匹配前导第三片段」的条目（命名变体优先）。
3. 无命名变体命中时，回退到「角色匹配且未指定变体名」的默认条目。
4. 命中条目若被禁用（`enable=false`），回退到全局默认头像。

---

## 背景

### bg

切换背景图片，支持渐变过渡效果。执行后脚本将等待渐变完成。

当 `src` 的后缀为 `.mp4` 或 `.webm` 时，背景会以**循环播放的视频**形式显示，并且静音播放。视频背景同样支持 `fadeTime` 渐变和 `bgTint` 色调叠加。

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

使用循环视频作为背景：

```sixu
@bg src="bg/rain.webm"
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | *必填* | 背景的素材路径（相对于 `assets/`）；后缀为 `.mp4` 或 `.webm` 时以循环静音视频显示，其他情况按图片处理 |
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

### bgTransEffect

设置后续背景切换使用的转场效果。它会影响之后的 [`bg`](#bg) 命令，但不会影响 [`bgTint`](#bgtint) 的色调渐变。默认效果为 `crossfade`。

```sixu
@bgTransEffect effect="wipe" direction="left" softness=0.08
```

使用 fade 效果：

```sixu
@bgTransEffect effect="fade" out=0.25 hold=0.5 in=0.25 color="#000"
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `effect` | `string` | `crossfade` | 转场效果名称 |

其余参数随 `effect` 而变化，含义与 [`transPerform`](#transperform) 完全一致，但这里不包含 `fadeTime`、`skippable` 和 `noWait`。

---

## 镜头

### camera

设置景深镜头。该命令用于控制镜头焦点、推近程度、背景视差和背景模糊。默认情况下，脚本会等待镜头过渡完成后再继续执行。

:::note
此命令默认会阻塞脚本执行，等待 `fadeTime` 结束后才继续。设置 `noWait=true` 可以跳过等待，实现与后续命令并行执行。如果 `skippable=true`，玩家可以点击跳过等待。
:::

使用预设：

```sixu
@camera preset="close-right"
```

显式指定镜头参数：

```sixu
@camera x=180 y=-60 zoom=1.16 depth=0.5 blur=3 fadeTime=700
```

重置镜头：

```sixu
@camera preset="reset"
```

不等待镜头过渡完成：

```sixu
@camera preset="dramatic-center" fadeTime=900 noWait=true
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `preset` | `"reset" \| "close-center" \| "close-left" \| "close-right" \| "dramatic-center"` | — | 内建镜头预设 |
| `x` | `number` | `0` | 焦点 X，坐标系以画面中心为原点，向右为正 |
| `y` | `number` | `0` | 焦点 Y，坐标系以画面中心为原点，向下为正 |
| `zoom` | `number` | `1` | 镜头推近倍数 |
| `depth` | `number` | `0` | 背景相对角色层的落后程度 |
| `blur` | `number` | `0` | 背景模糊半径 |
| `fadeTime` | `number` | `600` | 镜头过渡时间（毫秒） |
| `skippable` | `boolean` | `false` | 是否允许玩家点击跳过镜头等待 |
| `noWait` | `boolean` | `false` | 是否跳过等待过渡完成，设为 `true` 可与后续命令并行执行 |

解析规则如下：

- 指定 `preset` 时，先展开预设值，再用显式字段覆写。
- 未填写的字段回落到预设值或中性默认值，不沿用当前镜头状态。

当前内建预设为 `reset`、`close-center`、`close-left`、`close-right` 和 `dramatic-center`。关于镜头层的运行时结构和两层视差计算，见 [景深镜头](/customize/camera/)。

---

## 场景转场

场景转场用于在整个舞台层级之间执行一次统一过渡。标准流程分为两步：先用 `transPrepare` 固定旧画面与新画面的输入，再用 `transPerform` 选择效果并开始播放。

### transPrepare

准备一次全画面转场，但不会立刻开始播放。通常在更新下一帧场景内容前调用一次，随后修改背景、角色或其他舞台状态，最后再执行 `transPerform`。

```sixu
@transPrepare retain="static"
@bg src="bg/night.png" noWait=true
@charClear
@charEnter src="characters/alice.png" name="Alice" preset="center"
@transPerform effect="crossfade" fadeTime=1000
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `retain` | `"static" \| "live"` | `static` | 旧画面的保留方式。`static` 会在准备时固定一张快照；`live` 会让旧画面在真正开始转场前继续保持实时更新 |

### transPerform

执行一次已准备好的全画面转场。默认会等待 `fadeTime` 结束后再继续脚本；如果设置了 `noWait=true`，则会立即执行后续命令。

```sixu
@transPerform effect="wipe" direction="left" softness=0.08 fadeTime=900
```

使用遮罩转场：

```sixu
@transPerform effect="mask" rule="non-free/MVNLines1.png" softness=0.0625 fadeTime=1200
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `effect` | `string` | `crossfade` | 转场效果名称 |
| `fadeTime` | `number` | `1000` | 转场播放时间（毫秒） |
| `skippable` | `boolean` | `false` | 是否允许玩家点击跳过等待 |
| `noWait` | `boolean` | `false` | 是否跳过等待转场完成，设为 `true` 可与后续命令并行执行 |

#### 内建效果参数

| `effect` | 额外参数 |
| --- | --- |
| `crossfade` | 无 |
| `wipe` | `direction` 擦除方向，默认 `left`；`softness` 边缘羽化程度，范围 `0~1`，默认 `0` |
| `push` | `direction` 推入方向，默认 `left` |
| `slideaway` | `direction` 旧画面滑走方向，默认 `left` |
| `fade` | `out`、`hold`、`in` 为三个阶段的时长占比，预期都在 `0~1` 且总和必须为 `1`；`color` 为中间纯色，默认 `#000` |
| `zoom` | `startScale` 起始缩放，默认 `0`；`endScale` 结束缩放，默认 `1`；`origin` 为按屏幕归一化的缩放原点，默认 `[0.5, 0.5]` |
| `pixellate` | `steps` 为像素块大小的 2 次幂指数，默认 `4`，即 `16x16` 像素块 |
| `mask` | `rule` 为遮罩规则图资源；`softness` 边缘羽化程度，范围 `0~1`，默认 `0.0625`；`reverse` 是否反转黑白出现顺序，默认 `false` |

其中 `mask` 会读取规则图的红色通道值，按“黑色先出现，白色后出现”的顺序从旧画面过渡到新画面。与 Kirikiri2 的规则一致而与 Ren'py 的规则相反。你可以通过 `reverse=true` 来反转出现顺序，或直接在规则图中反转黑白来达到同样效果。

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

设置非当前说话角色的自动色调，并可开关该效果。当有多个角色在舞台上时，非当前说话者的立绘会自动应用此色调，默认启用、色调为 `#666`。

```sixu
// 设置更深的变暗效果
@charAutoTint tint="#555555"

// 设置较浅的变暗效果
@charAutoTint tint="#aaaaaa"

// 关闭自动变暗
@charAutoTint enabled=false
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `enabled` | `boolean` | — | 是否启用自动变暗；省略时保持当前值 |
| `tint` | `string` | — | 非说话角色的色调颜色值；省略时保持当前值 |

---

### charTransEffect

设置后续立绘切换使用的转场效果。它会影响角色的入场、退场、清空，以及更换立绘图片时的切换方式；单纯的位置移动、缩放或色调变化仍然沿用原有动画。默认效果为 `crossfade`。

```sixu
@charTransEffect effect="push" direction="right"
```

使用放大切换：

```sixu
@charTransEffect effect="zoom" startScale=0.6 endScale=1 origin=[0.5,0.8]
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `effect` | `string` | `crossfade` | 转场效果名称 |

其余参数随 `effect` 而变化，含义与 [`transPerform`](#transperform) 完全一致，但这里不包含 `fadeTime`、`skippable` 和 `noWait`。

---

## 自由精灵

自由精灵是标准框架提供的一个独立显示层，用于在舞台上放置图片、视频和帧动画。与角色立绘不同，自由精灵不参与自动色调和说话人逻辑，适合用于横幅、自定义显示内容等。

自由精灵支持**父子节点树**结构——每个节点可以挂载子节点，子节点跟随父节点一起移动、缩放和旋转。节点按 `zIndex` 在**同层级内**排序，不设置则按创建顺序排列（新创建的在上）。

所有涉及变换的属性（位置、缩放、旋转、斜切、透明度、色调）都支持**补间动画**，通过 `fadeTime` 控制过渡时长。补间曲线为 `easeInOutCubic`，与角色动画一致。快进和快速定位时会瞬间落到目标值。

精灵的资源类型通过 `kind` 参数指定，省略时自动推断：后缀为 `.mp4` / `.webm` 的视频文件按视频处理，`.apng` / `.webp` 按动画处理，其余按图片处理。

:::tip[坐标系]
自由精灵使用**屏幕坐标系**：原点在画面左上角，X 轴向右为正，Y 轴向下为正。这与角色坐标系（原点为底部中心，Y 轴向上）不同。
:::

### sprite

创建一个自由精灵节点。如果同名节点已存在，则按局部更新处理——仅更新显式提供的字段，未指定的保持不变。

:::note
此命令默认不阻塞脚本执行（`noWait=true`）。设置 `noWait=false` 可以等待入场动画完成后才继续。
:::

```sixu
@sprite name="mySprite" src="ui/panel.png" x=960 y=540 anchor=[0.5,0.5] fadeTime=400 noWait=false
```

创建子节点（挂载到已有节点下方）：

```sixu
@sprite name="myBadge" src="ui/badge.png" parent="mySprite" x=100 y=-50 scaleX=0.5 scaleY=0.5
```

创建动画精灵：

```sixu
@sprite name="myAnim" src="effects/sparkle.apng" kind="animation" animationFormat="apng" x=200 y=300
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | *必填* | 节点名称，全局唯一 |
| `src` | `string` | *必填* | 精灵的资源路径（相对于 `assets/`） |
| `kind` | `"image" \| "video" \| "animation"` | 自动推断 | 资源类型；省略时根据文件后缀自动识别 |
| `animationFormat` | `"apng" \| "webp"` | `"apng"` | 动画格式，仅在 `kind="animation"` 时有效 |
| `parent` | `string` | — | 父节点名称；省略时挂载到根层 |
| `x` | `number` | `0` | X 坐标（屏幕坐标系，原点为左上角） |
| `y` | `number` | `0` | Y 坐标（屏幕坐标系，原点为左上角） |
| `scaleX` | `number` | `1` | 横向缩放系数 |
| `scaleY` | `number` | `1` | 纵向缩放系数 |
| `rotation` | `number` | `0` | 旋转角度（弧度） |
| `skewX` | `number` | `0` | 横向斜切角度（弧度） |
| `skewY` | `number` | `0` | 纵向斜切角度（弧度） |
| `anchor` | `[number, number]` | `[0, 0]` | 锚点坐标，按节点自身归一化，范围 0 到 1 |
| `pivot` | `[number, number]` | `[0, 0]` | 旋转和缩放的中心点（像素） |
| `opacity` | `number` | `1` | 透明度，范围 0 到 1 |
| `visible` | `boolean` | `true` | 是否可见 |
| `tint` | `string` | — | 色调颜色值，如 `"#ffcc00"` |
| `interactive` | `boolean` | `false` | 是否标记为可交互节点 |
| `zIndex` | `number` | `0` | 同一父节点下的层级顺序 |
| `fadeTime` | `number` | `500` | 入场动画时间（毫秒） |
| `skippable` | `boolean` | `false` | 是否允许玩家点击跳过等待 |
| `noWait` | `boolean` | `true` | 是否跳过等待动画完成，设为 `false` 可等待入场结束 |

---

### spriteChange

修改一个已有精灵节点的属性。仅更新显式提供的字段，未指定的保持不变。常用于移动、缩放、变色或更换资源。

:::note
此命令默认不阻塞脚本执行（`noWait=true`）。设置 `noWait=false` 可以等待补间动画完成后才继续。
:::

```sixu
@spriteChange name="mySprite" x=1200 y=300 tint="#ffcc88" fadeTime=800 noWait=false
```

更换资源（图片切换会触发转场效果，同时属性也会补间）：

```sixu
@spriteChange name="mySprite" src="ui/panel_highlighted.png" fadeTime=600
```

连续更新（`noWait=true` 时从当前插值位置平滑衔接到新目标）：

```sixu
@spriteChange name="mySprite" x=400 rotation=0.5 fadeTime=1000 noWait=true
@wait time=300
@spriteChange name="mySprite" x=800 rotation=-0.3 fadeTime=800 noWait=false
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | *必填* | 要修改的节点名称 |
| `src` | `string` | — | 新的资源路径；更换图片时会触发转场效果 |
| `kind` | `"image" \| "video" \| "animation"` | — | 新的资源类型 |
| `animationFormat` | `"apng" \| "webp"` | — | 新的动画格式 |
| `x` | `number` | — | X 坐标 |
| `y` | `number` | — | Y 坐标 |
| `scaleX` | `number` | — | 横向缩放系数 |
| `scaleY` | `number` | — | 纵向缩放系数 |
| `rotation` | `number` | — | 旋转角度（弧度） |
| `skewX` | `number` | — | 横向斜切角度（弧度） |
| `skewY` | `number` | — | 纵向斜切角度（弧度） |
| `anchor` | `[number, number]` | — | 锚点坐标 |
| `pivot` | `[number, number]` | — | 旋转和缩放中心点 |
| `opacity` | `number` | — | 透明度 |
| `visible` | `boolean` | — | 是否可见 |
| `tint` | `string` | — | 色调颜色值 |
| `interactive` | `boolean` | — | 是否可交互 |
| `zIndex` | `number` | — | 层级顺序 |
| `fadeTime` | `number` | `500` | 补间动画时间（毫秒） |
| `skippable` | `boolean` | `false` | 是否允许玩家点击跳过等待 |
| `noWait` | `boolean` | `true` | 是否跳过等待动画完成 |

---

### spriteRemove

移除一个精灵节点及其所有子孙节点。节点会先执行离场动画，动画结束后从场景中删除。

```sixu
@spriteRemove name="mySprite" fadeTime=300
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | *必填* | 要移除的节点名称 |
| `fadeTime` | `number` | `500` | 离场动画时间（毫秒） |
| `skippable` | `boolean` | `false` | 是否允许玩家点击跳过等待 |
| `noWait` | `boolean` | `true` | 是否跳过等待离场完成 |

---

### spriteMove

将一个精灵节点移动到新的父节点下，或移动到根层。也可以仅调整 `zIndex` 层级顺序。

```sixu
// 移动到根层
@spriteMove name="myBadge"

// 挂载到另一个父节点并调整层级
@spriteMove name="myBadge" toParent="mySprite" zIndex=5
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | *必填* | 要移动的节点名称 |
| `toParent` | `string` | — | 目标父节点名称；省略时移动到根层 |
| `zIndex` | `number` | — | 新的层级顺序 |

---

### spriteTransEffect

设置自由精灵层或单个精灵节点使用的转场效果。影响后续的精灵资源切换（`sprite` 或 `spriteChange` 更换 `src` 时）。

省略 `name` 时设置层的默认转场，所有未单独配置的节点都会使用此效果。指定 `name` 时仅为该节点设置，不影响其他节点。默认效果为 `crossfade`。

```sixu
// 为整层设置擦除转场
@spriteTransEffect effect="wipe" direction="right" softness=0.1

// 为特定节点设置放大转场
@spriteTransEffect name="mySprite" effect="zoom" startScale=0.8 endScale=1
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `effect` | `string` | `"crossfade"` | 转场效果名称 |
| `name` | `string` | — | 节点名称；省略时设置层的默认转场 |

其余参数随 `effect` 而变化，含义与 [`transPerform`](#transperform) 完全一致，但这里不包含 `fadeTime`、`skippable` 和 `noWait`。

---

### spriteTransEffectReset

重置自由精灵层或单个节点的转场效果配置。省略 `name` 时重置层的默认转场为 `crossfade`；指定 `name` 时清除该节点的独立转场设置，使其回退到层的默认值。

```sixu
// 重置特定节点的转场
@spriteTransEffectReset name="mySprite"

// 重置整层为默认
@spriteTransEffectReset
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | — | 节点名称；省略时重置层的默认转场 |

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
@bgm src="bgm/theme.opus"
```

自定义音量和渐入时间：

```sixu
@bgm src="bgm/battle.opus" volume=0.8 fadeTime=1000
```

不循环播放：

```sixu
@bgm src="bgm/ending.opus" loop=false
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | *必填* | 音频文件的素材路径 |
| `loop` | `boolean` | `true` | 是否循环播放 |
| `volume` | `number` | `1` | 音量，范围 0 ~ 1 |
| `waitForEnd` | `boolean` | `false` | 是否阻塞剧情直到音频自然播放完毕 |
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
@sfx src="sfx/door_open.opus"
```

循环音效：

```sixu
@sfx src="sfx/rain.opus" loop=true volume=0.5
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | *必填* | 音频文件的素材路径 |
| `loop` | `boolean` | `false` | 是否循环播放 |
| `volume` | `number` | `1` | 音量，范围 0 ~ 1 |
| `waitForEnd` | `boolean` | `false` | 是否阻塞剧情直到音频自然播放完毕 |
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
:::tip
如果语音与某句对话一一对应，可以使用[对话前导语法](#对话语法)中的 `|` 分隔符来替代单独的 `@voice` 命令，写法更简洁：

```sixu
[Alice|alice_001] "你好，很高兴认识你。"
```

等价于先执行 `@voice src="voice/alice_001.opus" name="Alice"`，再显示文本。
:::
```sixu
@voice src="voice/alice_001.opus" name="Alice"
```

不指定角色名（使用默认通道）：

```sixu
@voice src="voice/narrator_001.opus"
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | *必填* | 语音文件的素材路径 |
| `name` | `string` | — | 角色名称，用于标识语音通道 |
| `volume` | `number` | `1` | 音量，范围 0 ~ 1 |
| `waitForEnd` | `boolean` | `false` | 是否阻塞剧情直到语音自然播放完毕（与自动播放模式的等待相互独立） |

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
@sound channel="rain" src="sfx/rain_loop.opus" loop=true volume=0.3
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `channel` | `string` | *必填* | 通道名称，用于后续停止控制 |
| `src` | `string` | *必填* | 音频文件的素材路径 |
| `loop` | `boolean` | `false` | 是否循环播放 |
| `volume` | `number` | `1` | 音量，范围 0 ~ 1 |
| `waitForEnd` | `boolean` | `false` | 是否阻塞剧情直到音频自然播放完毕 |
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

## 视频

### video

播放一段全屏视频。视频出现在所有舞台元素之上，期间剧情推进、文本框按钮、滚轮打开记忆以及 ESC 切换文本框等输入都会被拦截，BGM / 语音 / 音效 / 名称通道音频不会被中断，可与视频同时播放。

:::note
此命令会阻塞剧情，直到视频播放完毕（或被玩家确认跳过）后才会推进到下一条命令。视频期间会自动停止快进和自动播放模式，且期间无法重新开启。
:::
    
```sixu
// 不可跳过的开场动画
@video src="video/opening.mp4"

// 带淡入淡出动画的过场动画
@video src="video/cutscene.mp4" fadeTime=600

// 允许玩家跳过
@video src="video/recap.mp4" skippable=true
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | *必填* | 视频文件的素材路径（相对于 `assets/`） |
| `fadeTime` | `number` | `0` | 视频出现与退场的淡入淡出时间（毫秒） |
| `skippable` | `boolean` | `false` | 是否允许玩家跳过视频 |

#### 跳过行为

- `skippable=false`（默认）：点击、触摸、回车、空格等推进输入都会被拦截，玩家只能等待视频自然播放完成。
- `skippable=true`：玩家输入会暂停视频并弹出二次确认对话框，选择取消后视频从原位置继续播放，选择确认后视频按 `fadeTime` 淡出并推进剧情。
- 无论是否可跳过，视频期间都无法手动开启快进 / 自动播放。

:::caution
视频状态不会产生 backlog 条目，也不会被存档。请不要依赖读档后从视频当中恢复进度，如需重看全屏视频，请在剧本中为其设计入口。
:::

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
