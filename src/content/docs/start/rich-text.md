---
title: 富文本
sidebar:
  order: 6
---

富文本用于在一段文字中改变局部的外观或行为，例如把关键词显示为金色、把警告文字加粗、为文字添加阴影、给一段文字加上背景或下划线，或让一小段文字可以点击。

它可用于 JSX 的 `<text>` 节点，也可直接写在 Sixu 剧本的对话中。标签写法接近 HTML：开始标签包住文字，结束标签恢复原来的样式。

```text
<color=#E7931C>金色文字</color>
<bold>粗体文字</bold>
<shadow color=#0008 offsetX=1 offsetY=2 blur=4>带阴影的文字</shadow>
```

## 从这里开始

将下面内容直接复制到 JSX 的 `<text>` 节点：

```tsx
<text
  text={
    '普通文字，<color=#E7931C>金色文字</color>，' +
    '<bold>加粗文字</bold>，' +
    '<shadow color=#0008 offsetX=1 offsetY=2 blur=4>带阴影的文字</shadow>。'
  }
  fontSize={30}
  fillColor="#FFFFFF"
/>
```

在 Sixu 剧本中，直接把同样的标签写进对话文本：

```sixu
[Alice] "欢迎，<color=#E7931C>旅行者</color>。<bold>请仔细阅读。</bold>"
```

富文本标签使用 `<` 和 `>`。标签可以嵌套，内层标签只影响它包住的文字：

```text
<span size=28 color=white><color=#E7931C>金色</color>白色</span>
```

这与 HTML 中的 `<span>` 嵌套 CSS 样式相似。结束标签必须与开始标签对应，例如 `<bold>内容</bold>`。

## 常用效果

### 颜色与字号

`color` 和 `fillColor` 都用于改变文字颜色，效果相当于 HTML/CSS 的 `color`。`size` 用于改变字号，类似 CSS 的 `font-size`。

```text
<color=#E7931C>金色标题</color>
<fillColor=rgb(96, 165, 250)>蓝色提示</fillColor>
<size=40>大号文字</size>
<span color="#F97316" size=32>橙色大标题</span>
```

颜色使用 CSS 颜色写法，例如 `red`、`#E7931C`、`#0008`、`rgb(96, 165, 250)`。`span` 是通用样式标签，适合一次设置颜色、字号、描边和阴影等多个效果。

### 粗体、斜体与字体

`bold` 和 `weight` 用于字重，类似 HTML 的 `<strong>` 或 CSS 的 `font-weight`；`italic` 用于斜体，类似 HTML 的 `<em>` 或 CSS 的 `font-style: italic`。

```text
<bold>重点内容</bold>
<weight=500>中等字重</weight>
<weight=800>更粗的标题</weight>
<italic>旁白或外语</italic>
```

字重范围为 `1` 到 `1000`。`bold` 默认使用 `700`。使用可变字体时，`weight` 和 `italic` 会优先使用字体文件中已有的字重和斜体样式；字体设置见[舞台与全局设置](/customize/settings/#可变字体)。

`font` 用于在已配置字体中选择字体族，类似 CSS 的 `font-family`。多个字体族以逗号分隔，先写首选字体：

```text
<font="Source Han Sans SC, Inter">中英混排文字</font>
<font family="Source Han Sans SC, Inter">同样的写法</font>
```

字体名称可以用字体本身的名称，也可以用配置时设置的别名。设置多个字体时，使用逗号分隔。

标签不会加载新的字体文件。请先在 `index.json` 的 `fontFile` 中配置字体。

### 描边与阴影

`stroke` 为文字添加描边，类似 CSS 的 `-webkit-text-stroke`；`shadow` 添加阴影，类似 CSS 的 `text-shadow`。

```text
<stroke color=black width=2>描边文字</stroke>
<shadow color="#0008" offsetX=2 offsetY=3 blur=4>阴影文字</shadow>
<span strokeColor=black strokeWidth=2 shadowColor="#0008" shadowOffsetX=2 shadowOffsetY=3 shadowBlur=4>组合效果</span>
```

描边和阴影都可以使用专用标签，也可以在 `span` 中设置。`offsetX` 和 `offsetY` 是阴影偏移量；正值向右、向下，负值向左、向上。`blur` 控制阴影的柔化程度。描边宽度和阴影柔化程度必须为非负数。

### 基线与语言

`baseline` 上下移动局部文字，适合上标、下标或微调文字位置；它接近 CSS 的 `vertical-align`，数值为负时向上移动。

```text
E = mc<baseline=-8 size=18>2</baseline>
<baseline=4 size=18>下移文字</baseline>
```

`locale` 标记文字使用的语言区域，适合中日文混排或需要指定断行习惯的文本。它使用 BCP 47 语言标签：

```text
<locale=zh-Hans>简体中文</locale>
<locale=ja>日本語</locale>
```

### 控制仿粗与仿斜

当字体没有所需字重或斜体时，`fontSynthesis` 决定是否允许补出近似效果，作用类似 CSS 的 `font-synthesis`。

```text
<fontSynthesis=none>只使用字体文件已有的样式</fontSynthesis>
<fontSynthesis=weight><bold>允许补出粗体</bold></fontSynthesis>
<fontSynthesis=style><italic>允许补出斜体</italic></fontSynthesis>
```

可用值为：

| 值 | 效果 |
| --- | --- |
| `none` | 只使用字体文件中已有的字重和斜体样式。 |
| `weight` | 允许补出粗体。 |
| `style` | 允许补出斜体。 |
| `all` | 同时允许补出粗体和斜体，默认值。 |

## 背景、线条与装饰

这些标签为一段文字添加装饰，作用接近 CSS 的 `background` 和 `text-decoration`，都只影响自己包住的文字。

```text
<background color="#FFF3BF" paddingX=6 paddingY=2 radius=6>提示</background>
<underline color="#1677FF" thickness=2>下划线</underline>
<lineThrough color="#666666" thickness=2>删除线</lineThrough>
<emphasis>着重号</emphasis>
<mourning>示亡号</mourning>
<properNoun>专名号</properNoun>
<bookTitle>书名号</bookTitle>
```

`background` 的常用属性：

| 属性 | 说明 |
| --- | --- |
| `color` | 背景填充色，默认黑色。 |
| `paddingX`、`paddingY` | 背景在文字四周留出的水平、垂直留白。 |
| `radius` | 背景圆角半径。 |
| `strokeColor`、`strokeWidth` | 可选背景描边。 |
| `shadowColor`、`shadowOffsetX`、`shadowOffsetY`、`shadowBlur`、`shadowWidth` | 可选背景阴影。 |

`underline` 和 `lineThrough` 的常用属性：

| 属性 | 说明 |
| --- | --- |
| `color` | 线条颜色，默认黑色。 |
| `thickness` | 线条粗细，默认 `1`。 |
| `pattern` | `solid`、`dashed` 或 `dotted`，默认 `solid`。 |
| `dashLength`、`gapLength` | 虚线与点线的长度。 |
| `clearance` | 线条与文字之间的净空。 |
| `strokeColor`、`strokeWidth`、`shadowColor`、`shadowOffsetX`、`shadowOffsetY`、`shadowBlur`、`shadowWidth` | 可选线条描边与阴影。 |

```text
<underline color="#1677FF" pattern=dashed dashLength=3 gapLength=2>可点击的链接文字</underline>
```

`emphasis`、`mourning`、`properNoun` 和 `bookTitle` 不需要属性，分别给内容加上着重号、示亡号、专名号和书名号。

## 注音

`ruby` 在文字旁添加拼音等注音，`bopomofo` 添加注音符号，概念上接近 HTML 的 `<ruby>`。

```text
<ruby text="tí qiàn">提椠</ruby>
<bopomofo text="ㄓㄨˋ ㄧㄣ">注音</bopomofo>
```

两个标签都必须给出非空的 `text` 属性，也可以写成简写形式 `<ruby=text>`。`font` 和 `locale` 用于单独指定注音文字的字体和语言区域。

## 行内代码

`code` 为一段文字应用等宽字体和背景，类似 HTML 的 `<code>`。

```text
<code font="monospace" paddingX=4 paddingY=2 radius=3>cargo test</code>
```

`code` 的属性同时作用于代码文字和它的背景：`font`、`weight` 等文字样式属性按 `span` 的规则处理，`paddingX`、`paddingY`、`radius` 等背景属性按 `background` 的规则处理。因此 `color` 会同时决定代码文字和背景的颜色；需要两者不同色时，在 `code` 内部再嵌套 `<color>` 之类的文字样式标签。

## 分段文字

`<br />` 结束当前段落并开始下一段，各段独立排版：

```text
第一段文字<br />第二段文字
```

`<br />` 可以带属性设置下一段的排版，未指定的字段继承上一段：

```text
这是自动换行的长段落。<br indent=2 align=center lineHeight=54 />下一段使用首行缩进、居中的结束行和更大的行高。
```

| 属性 | 说明 |
| --- | --- |
| `indent` | 下一段的首行缩进。 |
| `lineHeight` | 下一段的行高，直接写像素值，与 `<text>` 的 `lineHeight` 倍数写法不同。 |
| `blockIndent` | 下一段所有行的起始缩进。 |
| `align` | `start`、`center` 或 `end`。 |

连续写多个 `<br />` 会产生空段落，空段落占一行高度但不显示内容。

## 可点击文字

`link` 为一段文字定义链接区域，概念上接近 HTML 的 `<a>`。它必须包含 `target`；若要在 JSX 中接收事件，再添加非空的 `id`。

```tsx
<text
  text={'阅读<link id="guide" target="/start/rich-text/">富文本手册</link>'}
  interactive
  cursor="pointer"
  onInteraction={({ id, kind }) => {
    if (id === 'guide' && kind === 'click') {
      // 在这里执行跳转、打开面板或其他操作
    }
  }}
/>
```

`target` 表示链接目标，由你的应用决定如何使用；`id` 是回调中收到的识别符。`onInteraction` 会提供以下 `kind`：

| `kind` | 触发时机 |
| --- | --- |
| `over` | 指针位于链接文字上。 |
| `enter` | 指针进入链接文字。 |
| `leave` | 指针离开链接文字。 |
| `down` | 指针按下。 |
| `up` | 指针抬起。 |
| `click` | 完成点击。 |

## 书写规则

### 标签与属性

成对标签的写法如下：

```text
<tag>内容</tag>
<tag=value>内容</tag>
<tag key=value key2="带空格的值">内容</tag>
```

`<tag=value>` 是简写。例如 `<color=red>` 等同于 `<color color=red>`，`<font="Inter">` 等同于 `<font family="Inter">`。

属性名和标签名区分大小写。请使用 `fillColor`、`shadowOffsetX`、`lineThrough` 这样的准确拼写。

### 引号与转义

不含空格和特殊字符的值可以不加引号：

```text
<span size=24 locale=zh-Hans>文本</span>
```

字体族、带空格的文字和复杂颜色值应使用单引号或双引号：

```text
<font family="Source Han Sans SC, Inter">混排文字</font>
<color="rgb(96, 165, 250)">蓝色文字</color>
```

双引号值中可写 `\"` 和 `\\`；单引号值中可写 `\'` 和 `\\`。

### 显示尖括号

需要显示普通的 `<` 或 `>` 时，分别写 `<<` 或 `>>`：

```text
2 << 3，3 >> 2
```

整段文字都不需要富文本时，可关闭 `<text>` 的解析：

```tsx
<text text="<bold>原样显示</bold>" parseMarkup={false} />
```

## 标签参考

下表列出当前可直接产生可见效果的标签。优先从前面的例子复制，再按需要替换颜色、字号或文字内容。

| 标签 | 用途 | 常用写法 |
| --- | --- | --- |
| `span` | 同时设置多个局部样式。 | `<span color=red size=32>文字</span>` |
| `size` | 改变字号。 | `<size=32>文字</size>` |
| `color`、`fillColor` | 改变文字颜色。 | `<color=#E7931C>文字</color>` |
| `bold` | 加粗文字。 | `<bold>文字</bold>` |
| `weight` | 指定字重。 | `<weight=600>文字</weight>` |
| `italic` | 显示斜体。 | `<italic>文字</italic>` |
| `font` | 选择已配置字体。 | `<font="Inter">Text</font>` |
| `stroke` | 添加描边。 | `<stroke color=black width=2>文字</stroke>` |
| `shadow` | 添加阴影。 | `<shadow color=#0008 offsetX=2 offsetY=3 blur=4>文字</shadow>` |
| `baseline` | 上下移动局部文字。 | `<baseline=-6>文字</baseline>` |
| `locale` | 指定语言区域。 | `<locale=ja>日本語</locale>` |
| `fontSynthesis` | 控制仿粗和仿斜。 | `<fontSynthesis=none>文字</fontSynthesis>` |
| `background` | 添加背景色、圆角和内边距。 | `<background color=#FFF3BF radius=6>文字</background>` |
| `underline` | 添加下划线。 | `<underline color=#1677FF thickness=2>文字</underline>` |
| `lineThrough` | 添加删除线。 | `<lineThrough color=#666666>文字</lineThrough>` |
| `ruby` | 添加拼音等注音。 | `<ruby text="tí qiàn">提椠</ruby>` |
| `bopomofo` | 添加注音符号。 | `<bopomofo text="ㄓㄨˋ ㄧㄣ">注音</bopomofo>` |
| `emphasis` | 添加着重号。 | `<emphasis>文字</emphasis>` |
| `mourning` | 添加示亡号。 | `<mourning>文字</mourning>` |
| `properNoun` | 添加专名号。 | `<properNoun>文字</properNoun>` |
| `bookTitle` | 添加书名号。 | `<bookTitle>书名</bookTitle>` |
| `code` | 应用等宽字体与背景。 | `<code paddingX=4 radius=3>cargo test</code>` |
| `link` | 定义可交互链接文字。 | `<link id="guide" target="/guide">文字</link>` |
| `br /` | 结束当前段落并开始下一段。 | `第一段<br />第二段` |

`span` 还可使用以下属性：`strokeColor`、`strokeWidth`、`shadowColor`、`shadowOffsetX`、`shadowOffsetY`、`shadowBlur`、`shadowWidth`、`font`、`weight`、`italic`、`fontSynthesis`、`locale`、`baseline` 和 `attach`。

## 尚未生效的标签

下列标签的写法已经确定，但当前版本不应依赖它们产生可见效果。它们保留在这里，便于项目升级后查阅。

| 标签 | 未来用途 | 当前情况 |
| --- | --- | --- |
| `object /` | 在文字中放置图像或其他对象。 | 会占用排版空间，但不绘制内容。 |

`technical`、`noAutoSpace` 和 `box` 是排版控制标签，当前已经可用，但主要用于需要精细控制断行、自动间距或文字两侧空间的排版场景。普通对话和 UI 文案通常不需要使用它们。

## 常见问题

### 标签没有生效

检查开始标签和结束标签是否成对，并确认大小写一致：

```text
<bold>正确</bold>
<bold>缺少结束标签
<Bold>大小写错误</Bold>
```

未知成对标签会保留其中的文字；未知自闭合标签会被忽略。属性值无效、引号未闭合或标签嵌套错误时，无法识别的部分会按普通文字显示，其余已闭合的标签仍会继续生效。

### JSX 字符串中的引号冲突

推荐把 `text` 写成 JavaScript 字符串表达式，再在富文本标签内使用双引号：

```tsx
<text text={'<color="#E7931C">金色文字</color>'} />
```

也可以使用模板字符串：

```tsx
<text text={`<font family="Source Han Sans SC">文字</font>`} />
```

### 需要分段文字

用 `<br />` 分段，各段会独立排版：

```text
第一段文字<br />第二段文字
```

也可以使用多个 `<text>` 节点，让每段各自控制位置和样式。
