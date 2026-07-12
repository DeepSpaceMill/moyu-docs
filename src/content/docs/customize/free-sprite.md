---
title: 自由精灵
sidebar:
  order: 12
---

自由精灵是标准框架提供的一个独立的 2D 显示层，用于在舞台上放置图片、视频和帧动画。它介于背景层和角色层之间，适合实现横幅、自定义显示内容等。

## 与角色立绘的区别

角色立绘有固定的语义（说话人检测、自动色调、预设位置等），而自由精灵是一个更底层、更灵活的节点系统：

| | 角色立绘 | 自由精灵 |
| --- | --- | --- |
| 坐标系 | 底部中心为原点，Y 轴向上 | 屏幕坐标系，原点左上角，Y 轴向下 |
| 自动色调 | 支持 | 不参与 |
| 说话人逻辑 | 参与 | 不参与 |
| 父子层级 | 不支持 | 支持任意深度的父子树 |
| 资源类型 | 仅图片 | 图片、视频、帧动画 |
| 存档恢复 | 是 | 是 |

## 坐标系

自由精灵使用**屏幕坐标系**：原点 `(0, 0)` 位于画面左上角，X 轴向右为正，Y 轴向下为正。这与角色坐标系不同，后者以画面底部中心为原点。

例如，在 1920×1080 的画面上，将精灵放置在画面中央：

```sixu
@sprite name="centerIcon" src="ui/icon.png" x=960 y=540 anchor=[0.5,0.5] pivot=[0.5,0.5]
```

### anchor 与 pivot

- **`anchor`**：节点的对齐基准点，按节点自身尺寸归一化（0 到 1）。`[0, 0]` 为左上角，`[1, 1]` 为右下角，`[0.5, 0.5]` 为节点中心。
- **`pivot`**：节点的旋转与缩放中心，单位为像素，相对于 `anchor` 点。`[0, 0]` 表示以 `anchor` 点自身为旋转中心。

`anchor` + `pivot` 共同决定了节点在其 `(x, y)` 位置上的摆放方式。

## 节点树

自由精灵支持**父子节点树**——每个节点可以挂载任意数量的子节点，形成任意深度的层级结构。

- 通过 `parent` 参数指定父节点名称；省略时节点挂载到根层。
- 子节点继承父节点的变换：移动、缩放、旋转父节点时，子节点会同步变化。
- 同一父节点下的兄弟节点按 `zIndex` 排序（小的在下），`zIndex` 相同时按创建顺序排列。

### 移动与重组

`spriteMove` 命令可以在运行时改变节点的父子关系：

```sixu
// 将节点移动到根层
@spriteMove name="childIcon"

// 将节点挂载到另一个父节点下
@spriteMove name="childIcon" toParent="otherParent" zIndex=3
```

移入自身或自己的子孙节点会报错并被忽略。

### 移除

`spriteRemove` 会移除指定节点及其整棵子树。移除前节点先执行离场动画。

```sixu
@spriteRemove name="parentIcon" fadeTime=300 noWait=false
```

## 变换属性与补间动画

自由精灵支持以下变换属性，其中标有 ◆ 的属性支持补间动画：

| 属性 | 补间 | 说明 |
| --- | --- | --- |
| `x` | ◆ | 水平位置 |
| `y` | ◆ | 垂直位置 |
| `scaleX` | ◆ | 横向缩放 |
| `scaleY` | ◆ | 纵向缩放 |
| `rotation` | ◆ | 旋转角度（弧度） |
| `skewX` | ◆ | 横向斜切（弧度） |
| `skewY` | ◆ | 纵向斜切（弧度） |
| `opacity` | ◆ | 透明度（0 到 1） |
| `tint` | ◆ | 色调 |
| `anchor` | | 对齐基准点 |
| `pivot` | | 旋转与缩放中心 |
| `visible` | | 可见性 |
| `interactive` | | 是否可交互 |
| `zIndex` | | 层级顺序 |

补间动画使用固定时长的 `easeInOutCubic` 缓动曲线，时长由 `fadeTime` 参数控制。每当通过 `sprite`（同名更新）或 `spriteChange` 修改属性时，当前值会平滑过渡到目标值。

快进和快速定位时，补间动画会瞬时完成，视觉上直接落到目标值。

### 并行行为

- 属性补间与资源切换（shader 转场）可以同时进行，两者共用同一个 `fadeTime`。
- `noWait=true` 时命令不阻塞脚本，后续命令立即执行；如果后续命令也修改了同一节点的属性，则从**当前插值位置**平滑转向新目标。`noWait=false` 时脚本会等待补间完成后才继续。

## 资源类型

精灵的资源类型通过 `kind` 参数指定。省略时，框架会根据文件后缀自动推断：

| 后缀 | 自动识别为 |
| --- | --- |
| `.mp4`、`.webm` | `video` |
| `.apng` | `animation`（`animationFormat` 自动设为 `"apng"`） |
| `.webp` | `animation`（`animationFormat` 自动设为 `"webp"`） |
| 其他 | `image` |

显式指定 `kind` 可以覆盖自动推断的结果：

```sixu
// 明确以图片模式加载某个 .apng 文件（不会播放动画）
@sprite name="stillFrame" src="effects/frame.apng" kind="image"
```

视频精灵会循环静音播放。动画精灵的播放格式可通过 `animationFormat` 指定（`"apng"` 或 `"webp"`）。

## 转场效果

自由精灵支持与背景和角色相同的 shader 转场效果，在资源（`src`）发生切换时触发。

转场效果的配置有三个层级：

1. **层默认**：`@spriteTransEffect`（不指定 `name`）设置所有节点的默认转场，初始为 `crossfade`。
2. **节点覆盖**：`@spriteTransEffect name="..."` 为单个节点设置独立的转场效果。
3. **重置**：`@spriteTransEffectReset`（不指定 `name`）重置层默认；`@spriteTransEffectReset name="..."` 清除节点的独立配置，使其回退到层默认。

```sixu
// 层默认使用擦除效果
@spriteTransEffect effect="wipe" direction="left" softness=0.08

// 某个节点使用放大效果
@spriteTransEffect name="specialSprite" effect="zoom" startScale=0.6 endScale=1

// 更换资源时触发转场
@spriteChange name="specialSprite" src="ui/new_image.png" fadeTime=600

// 重置节点配置，使其回退到层默认
@spriteTransEffectReset name="specialSprite"

// 重置整层为 crossfade
@spriteTransEffectReset
```

支持的效果与参数和 [`transPerform`](/start/commands#transperform) 相同，但 `spriteTransEffect` 不包含 `fadeTime`、`skippable` 和 `noWait`。

## 状态与存档

自由精灵的完整状态保存在 `gameState.freeSprite` 中，会随存档一起序列化和恢复。状态结构大致如下：

```
gameState.freeSprite
├── nodes: Record<name, FreeSpriteNode>  // 所有节点
│   ├── name: string                     // 节点名称
│   ├── parent?: string                  // 父节点
│   ├── x, y, scaleX, scaleY, ...       // 变换属性
│   ├── zIndex: number                   // 层级
│   ├── order: number                    // 全局创建序号
│   ├── presence: enum                   // 'entering' | 'present' | 'leaving'
│   ├── fadeTime: number                 // 当前动画时长
│   ├── resource: { src, kind?, ... }   // 资源信息
│   └── transitionEffect?                // 节点独立转场
├── defaultTransitionEffect              // 层默认转场
└── nextOrder: number                    // 自增序号
```

存档恢复时，`nextOrder` 会从已保存的最大 `order` 值继续递增，确保恢复后新创建的节点不会与历史序号冲突。

## 架构

自由精灵层的实现遵循标准的双层架构：

- **Command handler**（`src/commands/handlers.ts`）：`handleSprite`、`handleSpriteChange` 等函数负责验证输入、更新 `gameState.freeSprite`、处理父节点关系检查、子树离场标记和流程控制。
- **Actor**（`src/actors/freeSprite.tsx`）：`FreeSpriteActor` 订阅 `gameState.freeSprite`，构建父子映射、渲染节点树、驱动属性补间动画和 shader 转场效果。

节点的入场和出场采用两阶段模式：

1. Handler 将新节点设为 `presence='entering', visible=false`
2. Actor 在下一帧检测到 `entering` 状态，将节点提升为 `presence='present', visible=true`，触发入场动画

这种模式确保了动画系统有正确的初始状态，避免了视觉跳变。

### 定制入口

如果你需要修改自由精灵的行为，主要涉及以下文件：

| 文件 | 作用 |
| --- | --- |
| `src/commands/commands.ts` | 命令 Schema 定义 |
| `src/commands/handlers.ts` | 命令处理逻辑 |
| `src/actors/freeSprite.tsx` | 渲染、父子树、补间动画、转场 |
| `src/state/game.ts` | `FreeSpriteNode` 类型与状态结构 |
