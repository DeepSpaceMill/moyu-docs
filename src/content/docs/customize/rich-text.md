---
title: 富文本语法
sidebar:
  order: 4.1
---

`<text>` 的 `text` 属性支持富文本。它适合在一段文字内调整局部字体、颜色、描边和阴影，也定义了链接、注音、装饰与行内对象等扩展写法。

末语固定使用 `<`、`>` 作为富文本标签符号。

## 当前支持范围

| 状态     | 含义                                                     |
| -------- | -------------------------------------------------------- |
| 已支持   | 当前版本可以直接使用。                                   |
| 文字排版 | 当前版本会影响文字的排列方式，但不会额外绘制独立的装饰。 |
| 开发中   | 已预留语法；当前版本不要依赖其产生可见效果。             |

当前可直接使用的是局部文字样式，以及带 `id` 的链接交互。背景、下划线、删除线、注音、CLREQ 装饰和行内对象仍处于开发中。`<br />` 的多段文档写法也处于开发中：当前版本只显示第一段文字。

## 快速开始

```tsx
<text
  text={
    '普通文字，<color=#F59E0B>金色文字</color>，' +
    '<bold>粗体</bold>，' +
    '<shadow color=#0008 offsetX=1 offsetY=2 blur=4>阴影</shadow>。'
  }
  fontSize={30}
  fillColor="#FFFFFF"
/>
```

标签可以嵌套。内层只覆盖自己的内容，结束标签后自动恢复外层样式：

```text
<span size=28 color=red>外层<span color=blue>内层</span>外层</span>
```

若要显示字面量 `<`、`>`，分别写成 `<<`、`>>`：

```text
2 << 3，3 >> 2
```

也可以对整个文本关闭富文本：

```tsx
<text text="<bold>不会被解析</bold>" parseMarkup={false} />
```

## 标签写法

### 成对标签

开始和结束标签必须名称相同，并以正确顺序嵌套：

```text
<tag>内容</tag>
<tag=value>内容</tag>
<tag key=value key2="带空格的值">内容</tag>
```

标签名和属性名区分大小写，例如 `lineThrough`、`fillColor`、`shadowOffsetX` 必须按此拼写。

`<tag=value>` 是单值简写。不同标签会把这个值映射到自己的主属性，例如 `<color=red>` 等同于 `<color color=red>`，`<link=/guide>` 等同于 `<link target=/guide>`。

### 自闭合标签

```text
<tag />
<tag key=value />
<tag/>
<tag key=value/>
```

当前只有 `<br />` 与 `<object />` 具有语义。其他自闭合标签会被忽略并记录警告。

### 属性值

未加引号的属性值不能包含空白、`<`、`>`、`=`、`/` 或引号：

```text
<span size=24 locale=zh-Hans>文本</span>
```

包含空白或特殊字符时使用单引号或双引号：

```text
<font family="Source Han Sans SC, Inter">混排文字</font>
<ruby text='tí qiàn'>提椠</ruby>
```

双引号值中可使用 `\"` 和 `\\`，单引号值中可使用 `\'` 和 `\\`。同一标签重复写入同一个可识别属性时，后写的值生效：

```text
<span size=20 size=28 color=red color=blue>最终为 28 号蓝色文字</span>
```

无效属性、无效值和未知成对标签不会中止整段文字处理；可识别的子内容会继续保留。错配或未闭合的标签头会按普通文本显示。

## 文字样式

这些标签直接影响其中的文字。`<span>` 可以组合全部文字样式属性；其他标签只处理自身适用的属性。

| 标签                 | 属性与取值                                                     | 当前状态 |
| -------------------- | -------------------------------------------------------------- | -------- |
| `span`               | 下表全部样式属性                                               | 已支持   |
| `size`               | `size`：字号，浮点数                                           | 已支持   |
| `color`、`fillColor` | `color`：CSS 颜色字符串                                        | 已支持   |
| `stroke`             | `color`、`width`；单值可写为颜色、宽度或 `颜色 宽度`           | 已支持   |
| `strokeColor`        | `color` 或单值颜色                                             | 已支持   |
| `strokeWidth`        | `width` 或单值宽度                                             | 已支持   |
| `shadow`             | `color`、`offsetX`、`offsetY`、`blur`、`width`                 | 已支持   |
| `shadowColor`        | `color` 或单值颜色                                             | 已支持   |
| `shadowOffsetX`      | `offsetX` 或单值偏移                                           | 已支持   |
| `shadowOffsetY`      | `offsetY` 或单值偏移                                           | 已支持   |
| `shadowBlur`         | `blur` 或单值半径                                              | 已支持   |
| `shadowWidth`        | `width` 或单值扩张半径                                         | 已支持   |
| `font`               | `family` 或单值字体族列表                                      | 已支持   |
| `weight`             | `weight` 或单值字重，布局时限制为 `1..=1000`                   | 已支持   |
| `bold`               | 无属性时为 `700`；也可写 `weight`                              | 已支持   |
| `italic`             | 无属性时启用；可写 `italic=true/false` 或 `enabled=true/false` | 已支持   |
| `fontSynthesis`      | `none`、`weight`、`style`、`all`                               | 已支持   |
| `locale`             | BCP 47 locale，例如 `zh-Hans`、`ja`                            | 已支持   |
| `baseline`           | 基线偏移；负值向上                                             | 已支持   |
| `attach`             | `none`、`previous`                                             | 已支持   |

颜色使用 CSS 颜色格式。描边宽度、`shadowBlur` 和阴影扩张半径必须为非负数；阴影的横纵偏移可以为负数。

```text
<span size=28 color="#F59E0B" shadowColor="#0008" shadowOffsetX=1 shadowOffsetY=2 shadowBlur=4>警告</span>
<font="Source Han Sans SC, Inter"><weight=700>中英混排</weight></font>
<fontSynthesis=none>仅使用可用的字体样式</fontSynthesis>
<italic>斜体文字</italic>
<stroke color=white width=2>描边文字</stroke>
<baseline=-4>上标位置</baseline>
```

`font` 的字体族列表以逗号分隔。它只能从项目已配置的字体中选择，不能通过标签加载新的字体文件。`fontSynthesis` 控制缺少匹配字重或斜体时是否允许仿粗、仿斜，默认值为 `all`。

## 范围与装饰

范围标签覆盖一段子内容。它们可以与文字样式任意嵌套。

### 背景、下划线和删除线

| 标签          | 属性                                                                                                                | 当前状态 |
| ------------- | ------------------------------------------------------------------------------------------------------------------- | -------- |
| `background`  | `color`、`strokeColor`、`strokeWidth`、`shadowColor`、`shadowOffsetX`、`shadowOffsetY`、`shadowBlur`、`shadowWidth` | 开发中   |
|               | `paddingX`、`paddingY`、`radius`、`continuationRadius`、`clearance`、`metricPolicy`                                 | 开发中   |
| `underline`   | `color`、描边与阴影属性、`thickness`、`clearance`                                                                   | 开发中   |
|               | `pattern`：`solid`、`dashed`、`dotted`；`dashLength`、`gapLength`                                                   | 开发中   |
| `lineThrough` | 与 `underline` 相同                                                                                                 | 开发中   |

`background` 默认黑色；`metricPolicy` 可为 `markedFaces`、`uniformTextStyle` 或 `uniformParagraphStyle`。下划线和删除线默认黑色实线，默认 `thickness=1`、`clearance=0`，虚线或点线未指定长度时默认 `dashLength=1`、`gapLength=1`。

```text
<background color="#FFF3BF" paddingX=6 paddingY=2 radius=4>提示</background>
<underline color="#1677FF" thickness=1 pattern=dashed dashLength=3 gapLength=2>链接文字</underline>
<lineThrough color="#666" thickness=1>过期内容</lineThrough>
```

当前版本不会显示背景、线条及其描边、阴影。

### 注音与 CLREQ 装饰

| 标签         | 属性                               | 当前状态 |
| ------------ | ---------------------------------- | -------- |
| `ruby`       | 必填 `text`；可选 `font`、`locale` | 开发中   |
| `bopomofo`   | 必填 `text`；可选 `font`、`locale` | 开发中   |
| `emphasis`   | 无                                 | 开发中   |
| `mourning`   | 无                                 | 开发中   |
| `properNoun` | 无                                 | 开发中   |
| `bookTitle`  | 无                                 | 开发中   |

`ruby` 为拼音注音，`bopomofo` 为注音符号；二者的 `text` 不能为空。`emphasis`、`mourning`、`properNoun`、`bookTitle` 分别表达着重号、示亡号、专名号、书名号语义。

```text
<ruby text="ti2 qian4">提椠</ruby>
<bopomofo text="ㄊㄧˊ ㄑㄧㄢˋ">提椠</bopomofo>
<emphasis>需要强调</emphasis>
```

### 链接、代码和排版范围

| 标签          | 属性                                 | 当前状态                   |
| ------------- | ------------------------------------ | -------------------------- |
| `link`        | 必填 `target`；可选 `id`             | 已支持交互                 |
| `technical`   | 无                                   | 已支持                     |
| `noAutoSpace` | 无                                   | 已支持                     |
| `box`         | `start`、`end`、`spacing`            | 已支持                     |
| `code`        | 同时接受文字样式与 `background` 属性 | 文字样式已支持；背景开发中 |

`link` 必须提供 `target`；`target=""` 仍是有效写法。需要从 `<text onInteraction>` 接收事件时，额外提供非空 `id`：

```tsx
<text
  text={'查看<link id="manual" target="/customize/rich-text/">富文本语法</link>'}
  interactive
  onInteraction={({ id, kind }) => {
    if (kind === 'click' && id === 'manual') {
      // 由应用执行跳转或其他行为
    }
  }}
/>
```

`onInteraction` 会提供 `id` 和 `kind`。`kind` 为 `over`、`enter`、`leave`、`down`、`up` 或 `click`。链接没有 `id` 时仍参与排版，但不会触发这个回调。

`technical` 标记技术文本的断行范围，`noAutoSpace` 抑制自动间距。`box` 在两端附加空间；`spacing` 可为 `narrow` 或 `source`，默认 `narrow`。`code` 将同一组属性同时应用到代码文字和代码背景：

```text
<code font="monospace" color="#1E1E23" paddingX=4 paddingY=2 radius=3>cargo test</code>
```

上例中的文字颜色与字体当前生效，代码背景仍处于开发中。

## 段落与行内对象

### 换段 `<br />`

`<br />` 结束当前逻辑段落。它可以为后续段落设置样式：

| 属性                           | 说明                            |
| ------------------------------ | ------------------------------- |
| `indent`                       | 首行缩进，`f32`。               |
| `lineHeight`                   | 绝对行高，`f32`。               |
| `blockIndent`                  | 每一行的起始缩进，`f32`。       |
| `align`                        | `start`、`center`、`end`。      |
| `lineLengthGrid`               | 布尔值。                        |
| `rubyLineHeightMode`           | `perLine`、`uniformParagraph`。 |
| `inlineObjectMinimumClearance` | 行内对象最小净空，`f32`。       |
| `emphasisDotGap`               | 着重号间距，`f32`。             |

```text
第一段<br indent=2 lineHeight=36 blockIndent=1 />第二段
```

**开发中：** 当前版本只显示 `<br />` 前的第一段文字。不要在同一个 `<text>` 中依赖 `<br />` 显示多段内容；请暂时使用多个 `<text>` 节点或换行文本。

### 行内对象 `<object />`

`object` 在文字中预留一个行内对象的位置：

| 属性      | 说明                                     |
| --------- | ---------------------------------------- |
| `id`      | 可选对象识别符；非空时用于 interaction。 |
| `alt`     | 必填且非空的替代文本。                   |
| `width`   | 必填 advance，`f32`。                    |
| `ascent`  | 必填 ascent，`f32`。                     |
| `descent` | 必填 descent，`f32`。                    |

```text
<object id="portrait-42" alt="角色头像" width=32 ascent=26 descent=6 />
```

**开发中：** 当前版本不会显示对象。对象资源、加载和点击后的行为由应用负责。

## 自定义标签预设

自定义成对标签可以对应一组文字样式。例如定义 `warning` 后，可写 `<warning>警告</warning>`。

**开发中：** 当前版本尚不能在项目中定义自定义标签样式。未知成对标签会保留其中的文字，不会自动应用样式；未知自闭合标签会被忽略。

## 解析与恢复规则

富文本会按文本顺序读取。常见异常输入的显示结果如下：

| 输入情况             | 结果                                                                 |
| -------------------- | -------------------------------------------------------------------- |
| 未知成对标签         | 保留子内容，并继续处理其中可识别的标签。                             |
| 未知自闭合标签       | 忽略该标签。                                                         |
| 错配结束标签         | 结束标签按普通文字显示。                                             |
| 未闭合外层标签       | 外层开始标签及已收集文字按普通文本显示；完整闭合的内层标签仍可保留。 |
| 标签头缺少属性名或值 | 无法构成标签头的部分按普通文字显示。                                 |
| 引号未闭合或转义无效 | 当前标签头到输入末尾按普通文字显示。                                 |

例如：

```text
<a>前<bold>后</bold>
```

会将 `<a>前` 显示为普通文字，同时仍会处理完整闭合的 `<bold>后</bold>`。

## 使用建议

1. 在 JSX 字符串中使用 `text={'...'}` 或模板字符串，避免标签中的引号与 JSX 属性引号冲突。
2. 需要普通 `<`、`>` 时优先使用 `<<`、`>>`；整段无需解析时使用 `parseMarkup={false}`。
3. 链接交互始终同时提供 `id` 与 `target`，并在 `onInteraction` 中根据 `kind` 维护悬停、按下和点击行为。
4. 对标记为开发中的标签，不要依赖当前版本产生可见效果；可在功能上线后再启用。
