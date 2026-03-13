---
title: 流程控制指令
sidebar:
  order: 11
---

在思绪（Sixu）脚本中，以 `#` 开头的行是**系统调用指令**，用于控制剧本的执行流程。与 `@` 开头的命令（由框架定义）不同，系统调用指令是由思绪运行时内置提供的，在所有框架中通用。

```sixu
// 系统调用的两种写法
#goto paragraph="next_scene"
#goto(paragraph="next_scene")
```

此外，思绪还提供了 `#[...]` 形式的**属性**，用于为紧随其后的内容添加条件判断或循环逻辑。

## 高级剧本语法

在正式介绍流程控制指令之前，需要先了解思绪脚本中两种特殊的语法结构：**普通块**和**脚本块**。它们在流程控制中被广泛使用。

### 普通块

用一对花括号 `{...}` 包裹的多行内容称为**普通块**。它将块内的所有内容视为一个整体单元，最常见的用途是配合 `#[if]`、`#[while]`、`#[loop]` 等属性，将多行内容一起纳入条件或循环的控制范围。

```sixu
// 不使用块：属性只作用于紧随的一行
#[if("has_key")]
@changebg src="bg/secret_room.png"   // 仅此行受条件控制
[Alice] "门开了。"                    // 这行始终会执行

// 使用块：属性作用于整个块
#[if("has_key")]
{
    @changebg src="bg/secret_room.png"
    [Alice] "门开了。"               // 这行也受条件控制
}
```

块也可以单独使用，形成一个局部作用域，配合 `#leave` 可以提前退出：

```sixu
::entry {
    {
        [Alice] "进入内层块。"
        #leave              // 仅退出这个内层块，不影响外层
        [Alice] "这行不会执行。"
    }
    [Alice] "回到外层了。"  // 这行正常执行
}
```

块可以任意嵌套。

---

### 脚本块

**脚本块**用于在思绪脚本中内联执行 JavaScript 代码，适合读写游戏变量、执行逻辑计算等。

**单行脚本**：使用 `@{...}` 或 `## ... ##` 语法，在一行内执行一个 JavaScript 表达式：

```sixu
// 修改游戏变量
@{affinity += 10}
@{route = 'library'}
## foo = 'bar' ##

// 可以执行任意 JavaScript 表达式
@{dialogIndex = Math.min(dialogIndex + 1, 5)}
```

**多行脚本**：使用 `@{...}` 或 `## ... ##` 语法，可以编写多行 JavaScript 代码：

```sixu
::entry {
    [Alice] "让我来记录一下今天的进度。"

    ##
        day += 1;
        if (day === 1) {
            route = 'library';
        }
        visitedRooms.push('classroom');
    ##

    // 或
    @{
        day += 1;
        if (day === 1) {
            route = 'library';
        }
        visitedRooms.push('classroom');
    }

    [Alice] `今天是第 ${day} 天。`
}
```

:::note
脚本块中的变量是全局游戏状态的一部分，在存档读档时会被保存和恢复。单行脚本与多行脚本在功能上完全等价，选择哪种形式取决于代码的复杂程度。
:::

---

## 指令一览

### 跳转与调用

| 指令 | 说明 |
| --- | --- |
| [#goto](#goto) | 跳转到指定段落，不会返回 |
| [#call](#call) | 调用指定段落，执行完毕后返回 |
| [#replace](#replace) | 用目标段落替换当前段落 |
| [#leave](#leave) | 离开当前代码块 |
| [#finish](#finish) | 结束整个故事的执行 |

### 循环控制

| 指令 | 说明 |
| --- | --- |
| [#break](#break) | 跳出当前循环 |
| [#continue](#continue) | 跳过本次迭代，进入下一轮循环 |

### 属性（条件与循环）

| 属性 | 说明 |
| --- | --- |
| [#\[cond\] / #\[if\]](#condif--条件执行) | 条件为真时才执行 |
| [#\[while\]](#while--条件循环) | 条件为真时重复执行 |
| [#\[loop\]](#loop--无条件循环) | 无条件重复执行，需配合 `#break` 退出 |

---

## 跳转与调用

思绪的剧本由多个**段落（Paragraph）**组成，段落可以分布在不同的**故事文件（Story）**中。以下三个指令用于在段落之间切换，它们的核心区别在于**执行栈的处理方式**：

| 指令 | 执行栈行为 | 目标段落结束后 |
| --- | --- | --- |
| `#goto` | 清空整个执行栈 | 继续执行目标故事的下一个段落 |
| `#call` | 在栈顶压入新状态 | 返回到调用处，继续执行后续内容 |
| `#replace` | 替换当前段落的栈状态 | 返回到调用当前段落的位置 |

:::tip
如果你熟悉编程概念：`#goto` 类似于 `goto`，`#call` 类似于函数调用，`#replace` 类似于尾调用优化。
:::

### #goto

清空执行栈并跳转到指定段落。跳转后不会返回原位置，适用于章节切换等场景。

```sixu
::chapter1 {
    [Alice] "第一章到此结束。"

    // 跳转到第二章
    #goto paragraph="chapter2"
    // 这一行永远不会被执行
}

::chapter2 {
    [Alice] "欢迎来到第二章！"
}
```

跳转到其他故事文件中的段落：

```sixu
#goto(paragraph="entry", story="chapter2")
```

| 参数 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| `paragraph` | `string` | 是 | 目标段落名称 |
| `story` | `string` | 否 | 目标故事文件名称，省略时为当前故事 |

:::note
如果目标故事尚未加载，运行时会自动加载对应的故事文件。
:::

---

### #call

调用指定段落。目标段落执行完毕后，会自动返回到调用处继续执行后续内容。适用于复用公共剧情片段。

```sixu
::entry {
    [Alice] "让我先自我介绍一下。"

    // 调用自我介绍段落
    #call paragraph="self_introduction"

    // 自我介绍结束后，继续执行这里
    [Alice] "好了，介绍完毕。"
}

::self_introduction {
    [Alice] "我叫 Alice，今年 17 岁。"
    [Alice] "喜欢读书和画画。"
}
```

跨故事文件调用：

```sixu
#call(paragraph="common_dialogue", story="shared")
```

| 参数 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| `paragraph` | `string` | 是 | 目标段落名称 |
| `story` | `string` | 否 | 目标故事文件名称，省略时为当前故事 |

---

### #replace

用目标段落替换当前段落。与 `#call` 类似会跳转到目标段落，但当目标段落结束时，不会返回到 `#replace` 所在的位置，而是返回到**调用当前段落的位置**。

这在需要"转移"到另一个段落但不希望执行栈无限增长时非常有用，常用于实现游戏主循环或章节间的衔接：

```sixu
::entry {
    // 用 #call 调用 chapter1，通常 chapter1 结束后会回到这里
    #call paragraph="chapter1"

    // chapter1 内部使用了 #replace，
    // 所以 chapter2 结束后会直接回到这里，而非先回到 chapter1
    [Alice] "所有章节结束，回到了 entry！"
}

::chapter1 {
    [Alice] "第一章开始。"

    // 使用 #replace 而非 #call：
    // chapter2 结束后，会返回调用 chapter1 的位置（entry），而非 chapter1
    // 若此处改用 #call，chapter2 会先回到 chapter1，再从 chapter1 回到 entry
    #replace paragraph="chapter2"

    // 这一行永远不会被执行
    [Alice] "这行不会被执行到。"
}

::chapter2 {
    [Alice] "第二章开始。"
    // 段落结束，直接返回 entry（而非 chapter1）
}
```

| 参数 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| `paragraph` | `string` | 是 | 目标段落名称 |
| `story` | `string` | 否 | 目标故事文件名称，省略时为当前故事 |

---

### #leave

离开当前代码块，返回到上一层继续执行。如果当前已在段落的最顶层，则效果等同于段落执行完毕。

```sixu
::entry {
    {
        [Alice] "这行会执行。"
        #leave
        [Alice] "这行不会执行。"
    }

    // 退出上面的代码块后，继续执行这里
    [Alice] "回到外层了。"
}
```

此指令没有参数。

---

### #finish

立即结束整个故事的执行，清空执行栈。通常用于游戏的最终结局。

```sixu
::ending {
    [Alice] "故事到此结束，感谢你的阅读。"
    @bgmStop fadeTime=2000
    #finish
}
```

此指令没有参数。

---

## 属性（条件与循环）

属性以 `#[关键字]` 或 `#[关键字("条件表达式")]` 的形式写在内容行之前，为紧随其后的**一个**元素添加控制流逻辑。这个元素可以是一行文本、一条命令、一条系统调用，或一个代码块。

```sixu
// 作用于单条命令
#[if("locked")]
@changebg src="bg/secret_room.png"

// 作用于代码块（块内所有内容作为整体）
#[if("!locked")]
{
    @changebg src="bg/secret_room.png"
    [Alice] "我们进入了密室。"
}
```

:::note
1. 如果同一个元素前有多个属性，仅最后一个生效，其余会被忽略。
2. 条件表达式**必须使用引号包裹**，其内容由引擎在运行时求值，条件表达式使用 JavaScript 语法。
:::


### #[cond]/#[if] — 条件执行

条件为真时执行，否则跳过。`if` 是 `cond` 的别名，二者行为完全相同。

```sixu
::entry {
    // 如果变量 met_alice 为真，则显示这行对话
    #[if("met_alice")]
    [Alice] "我们又见面了！"

    // cond 和 if 完全等价
    #[cond("route === 'A'")]
    {
        [Alice] "你选择了 A 路线。"
        @changebg src="bg/route_a.png"
    }

    // 也可以用单引号包裹条件
    #[if('affinity > 50')]
    [Alice] "谢谢你一直以来的陪伴。"
}
```

---

### #[while] — 条件循环

条件为真时重复执行。每次迭代开始前会重新对条件求值，条件不满足时退出循环。

```sixu
::entry {
    #[while("dialogIndex < 3")]
    {
        @show_next_dialogue
        @{dialogIndex += 1}
    }

    [Alice] "所有对话都展示完了。"
}
```

在循环体内可以使用 `#break` 和 `#continue` 控制循环流程。

---

### #[loop] — 无条件循环

无条件重复执行，必须在循环体内使用 `#break` 退出，否则将无限循环。

```sixu
::entry {
    #[loop]
    {
        @process_event

        #[if("should_exit")]
        #break
    }
}
```

---

## 循环控制

`#break` 和 `#continue` 只能在 `#[while]` 或 `#[loop]` 循环体内使用。

### #break

跳出当前循环，继续执行循环之后的内容。

```sixu
#[loop]
{
    [Alice] "你想继续吗？"

    #[if("player_said_no")]
    #break

    [Alice] "好的，那我们继续。"
}

// #break 后从这里继续
[Alice] "再见！"
```

此指令没有参数。

---

### #continue

跳过当前迭代的剩余内容，立即开始下一轮循环（对于 `#[while]` 循环，会重新求值条件）。

```sixu
#[while("index < 10")]
{
    @{index += 1}

    // 偶数时跳过
    #[if("index % 2 === 0")]
    #continue

    [Alice] `当前是第${index}项`
}
```

此指令没有参数。

---

## 综合示例

以下示例展示了多种流程控制指令的组合使用：

```sixu
::entry {
    @changebg src="bg/school.png"
    @bgm src="audio/bgm/morning.opus"

    [Alice] "新的一天开始了。"

    // 调用公共的早晨对话
    #call paragraph="morning_routine"

    // 根据条件走不同路线
    #[if("route === 'library'")]
    #goto paragraph="library_scene"

    #[if("route === 'garden'")]
    #goto paragraph="garden_scene"

    // 都不满足时的默认路线
    #replace paragraph="classroom_scene"
}

::morning_routine {
    [Alice] "早上好！"

    #[loop]
    {
        // 展示早晨事件直到完成
        @process_morning_event

        #[if("morning_done")]
        #break
    }
    // 段落结束后自动返回 entry 继续执行
}

::library_scene {
    @changebg src="bg/library.png"
    [Alice] "图书馆真安静。"
    #finish
}
```
