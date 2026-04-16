---
title: 流程控制与变量
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

在正式介绍流程控制与变量之前，需要先了解思绪脚本中两种特殊的语法结构：**普通块**和**脚本块**。它们在流程控制和变量操作中被广泛使用。

### 普通块

用一对花括号 `{...}` 包裹的多行内容称为**普通块**。它将块内的所有内容视为一个整体单元，最常见的用途是配合 `#[if]`、`#[while]`、`#[loop]` 等属性，将多行内容一起纳入条件或循环的控制范围。

```sixu
// 不使用块：属性只作用于紧随的一行
#[if("has_key")]
@bg src="bg/secret_room.png"   // 仅此行受条件控制
[Alice] "门开了。"                    // 这行始终会执行

// 使用块：属性作用于整个块
#[if("has_key")]
{
    @bg src="bg/secret_room.png"
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
// 修改存档变量
@{ARCHIVE.affinity += 10}
@{ARCHIVE.route = 'library'}
## ARCHIVE.foo = 'bar' ##

// 可以执行任意 JavaScript 表达式
@{ARCHIVE.dialogIndex = Math.min(ARCHIVE.dialogIndex + 1, 5)}
```

**多行脚本**：使用 `@{...}` 或 `## ... ##` 语法，可以编写多行 JavaScript 代码：

```sixu
::entry {
    [Alice] "让我来记录一下今天的进度。"

    ##
        ARCHIVE.day += 1;
        if (ARCHIVE.day === 1) {
            ARCHIVE.route = 'library';
        }
    ##

    // 或
    @{
        ARCHIVE.day += 1;
        if (ARCHIVE.day === 1) {
            ARCHIVE.route = 'library';
        }
    }

    [Alice] `今天是第 ${day} 天。`
}
```

:::note
单行脚本与多行脚本在功能上完全等价，选择哪种形式取决于代码的复杂程度。脚本块中可以使用完整的 JavaScript 语法，但**脚本块中的局部变量不会在不同脚本块之间共享**。要持久化数据，请使用下文介绍的存档变量（`ARCHIVE`）或全局持久变量（`GLOBAL`）。
:::

---

## 变量系统

思绪提供了两种持久化变量：**存档变量（ARCHIVE）**和**全局持久变量（GLOBAL）**，用于存储游戏状态和跨存档的永久数据。

### 存档变量（ARCHIVE）

存档变量与当前存档绑定，随存档一起保存和读取。适合存储当前游戏进度中的状态，如好感度、已解锁的剧情标记、选项结果等。

在脚本块中通过 `ARCHIVE` 对象访问：

```sixu
##
    // 设置存档变量
    ARCHIVE.affinity = 50;
    ARCHIVE.route = 'library';
    ARCHIVE.met_alice = true;

    // 读取存档变量
    console.log(ARCHIVE.affinity);  // 50

    // 运算
    ARCHIVE.affinity += 10;
##
```

存档变量在以下情况会被清除：
- 开始新游戏时
- 故事执行结束时（`#finish`）

存档变量在读档时会被恢复到存档时的状态。

---

### 全局持久变量（GLOBAL）

全局持久变量**跨存档永久保存**，不随任何单个存档的生命周期变化。适合存储全局性的游戏进度，如已通关的路线、CG 解锁记录、成就等。

在脚本块中通过 `GLOBAL` 对象访问：

```sixu
##
    // 标记路线已通关
    GLOBAL.route_a_cleared = true;

    // 记录通关次数
    GLOBAL.clear_count = (GLOBAL.clear_count || 0) + 1;

    // 读取全局变量
    console.log(GLOBAL.route_a_cleared);  // true
##
```

与存档变量不同，全局持久变量**不会**因为开始新游戏、读档或故事结束而清除，它们会被持久保存在独立的全局存储中。

---

### 对比

| | 存档变量（ARCHIVE） | 全局持久变量（GLOBAL） |
| --- | --- | --- |
| 访问方式 | `ARCHIVE.name` | `GLOBAL.name` |
| 生命周期 | 跟随当前存档 | 永久保存 |
| 存档/读档 | 随存档保存和恢复 | 独立于存档，始终保留 |
| 新游戏时 | 清空 | 保留 |
| 典型用途 | 好感度、路线标记、剧情状态 | 通关记录、CG 解锁、成就 |

---

### 在文本中引用变量

使用反引号（`` ` ``）包裹文本，即可用 `${变量名}` 语法插入变量值。引擎会依次从存档变量、全局持久变量中查找对应的变量名：

```sixu
::entry {
    ##
        ARCHIVE.player_name = '小明';
        ARCHIVE.day = 3;
    ##

    // 使用模板语法引用变量（注意使用反引号）
    [Alice] `${player_name}，欢迎回来！`
    `今天是第 ${day} 天。`

    // 也可以在带说话人的文本中使用
    [Alice] `${player_name}，你今天想去哪里？`
}
```

:::note
模板语法 `${name}` 中的变量名不需要加 `ARCHIVE.` 或 `GLOBAL.` 前缀，引擎会自动从存档变量中查找，找不到时再从全局持久变量中查找。
:::

普通引号或无引号的文本不支持变量插值，`${...}` 会被原样输出：

```sixu
// ✅ 使用反引号，变量会被替换
[Alice] `你好，${player_name}。`

// ❌ 使用双引号，${player_name} 会原样显示
[Alice] "你好，${player_name}。"
```

---

### 在命令参数中引用变量

在命令参数中，**不加引号**的标识符会被视为变量引用，引擎会自动将其解析为对应变量的值后再传递给命令处理器：

```sixu
##
    ARCHIVE.selected_bg = 'bg/library.png';
    ARCHIVE.char_name = 'Alice';
##

// 不加引号 → 引用变量的值
@bg src=selected_bg          // 等同于 src="bg/library.png"
@charName name=char_name displayName="小红"

// 加引号 → 字符串字面量
@bg src="bg/library.png"     // 直接使用字符串值
```

具体规则如下：

| 写法 | 类型 | 示例 |
| --- | --- | --- |
| `param="value"` | 字符串字面量 | `src="bg/library.png"` |
| `param=123` | 数字字面量 | `fadeTime=500` |
| `param=true` | 布尔字面量 | `visible=true` |
| `param=[1,2]` | 数组字面量 | `pivot=[0.5,1]` |
| `param=name` | **变量引用** | `src=selected_bg` |

一个常见的用法是配合选项系统，将玩家的选择结果传递给后续命令：

```sixu
@optionAdd text="路线A" value="route_a"
@optionAdd text="路线B" value="route_b"
@optionShow saveTo="chosen_route"

// chosen_route 现在保存了玩家的选择
// 在后续命令中直接引用
@start_route route=chosen_route
```

---

### 在条件表达式中使用变量

流程控制的条件表达式（`#[if]`、`#[while]` 等）使用 JavaScript 语法求值，可以通过 `ARCHIVE` 和 `GLOBAL` 对象访问变量：

```sixu
// 检查存档变量
#[if("ARCHIVE.met_alice")]
[Alice] "我们又见面了！"

// 比较存档变量的值
#[cond("ARCHIVE.route === 'library'")]
{
    @bg src="bg/library.png"
    [Alice] "图书馆到了。"
}

// 使用全局变量判断是否二周目
#[if("GLOBAL.route_a_cleared")]
[Alice] "这次要不要试试别的选择？"

// 组合条件
#[if("ARCHIVE.affinity > 50 && ARCHIVE.met_alice")]
[Alice] "谢谢你一直以来的陪伴。"

// 在循环条件中使用
#[while("ARCHIVE.counter < 3")]
{
    [Alice] `这是第 ${counter} 次循环。`
    @{ARCHIVE.counter += 1}
}
```

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
@bg src="bg/secret_room.png"

// 作用于代码块（块内所有内容作为整体）
#[if("!locked")]
{
    @bg src="bg/secret_room.png"
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
        @bg src="bg/route_a.png"
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

以下示例展示了变量系统与流程控制指令的综合使用，模拟了一个简单的多日游戏循环：

```sixu
::entry {
    // 初始化游戏状态
    ##
        ARCHIVE.day = 1;
        ARCHIVE.affinity = 0;
        ARCHIVE.route = '';
    ##

    @bg src="bg/school.png"
    @bgm src="audio/bgm/morning.opus"

    [Alice] "新的一天开始了。"

    // 二周目时显示额外对话
    #[if("GLOBAL.has_cleared")]
    [Alice] "……总觉得这一切似曾相识。"

    // 调用公共的早晨对话
    #call paragraph="morning_routine"

    // 根据选择的路线跳转
    #[if("ARCHIVE.route === 'library'")]
    #goto paragraph="library_scene"

    #[if("ARCHIVE.route === 'garden'")]
    #goto paragraph="garden_scene"

    // 都不满足时的默认路线
    #replace paragraph="classroom_scene"
}

::morning_routine {
    [Alice] `早上好！今天是第 ${day} 天。`

    // 让玩家选择今天的去处
    @optionAdd text="去图书馆" value="library"
    @optionAdd text="去花园" value="garden"
    @optionAdd text="去教室" value="classroom"
    @optionShow saveTo="route"

    `你选择了${route}。`

    // 好感度随天数增长
    @{ARCHIVE.affinity += ARCHIVE.day * 5}
}

::library_scene {
    @bg src="bg/library.png"

    #[if("ARCHIVE.affinity > 20")]
    {
        [Alice] "你经常来图书馆呢，我很开心。"
        @{ARCHIVE.affinity += 10}
    }

    [Alice] "图书馆真安静。"

    // 标记通关并保存全局记录
    ##
        GLOBAL.has_cleared = true;
        GLOBAL.clear_count = (GLOBAL.clear_count || 0) + 1;
    ##

    [Alice] "故事到此结束，感谢你的陪伴。"
    #finish
}
```
