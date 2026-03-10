---
title: 自定义节点
sidebar:
  order: 3
---

节点是引擎渲染树中的基本元素。每种节点类型都需要实现 `Node` trait，并搭配一个 `Renderer` 来定义渲染方式。

## Node Trait

```rust
pub trait Node: NodeBaseTrait + Debug + Send + Sync {
    /// 工厂方法，从 JS 调用 create_instance 时触发
    fn create_instance(label: Option<String>) -> Result<Box<dyn Node>>;

    /// 节点类型标识，如 "sprite"、"text"
    fn node_type(&self) -> &'static str;

    /// 渲染器类型，默认等于 node_type
    fn renderer_type(&self) -> &'static str { self.node_type() }

    /// 处理 JS 层传来的属性更新
    fn update_properties(&mut self, _props: &mut JSValue) { }

    /// 如果节点可交互，返回 Focusable 引用
    fn as_focusable(&self) -> Option<&dyn Focusable> { None }

    /// 如果节点接受命令，返回 Command 引用
    fn as_command(&mut self) -> Option<&mut dyn Command> { None }
}
```

## 最小实现

以容器节点为例：

```rust
use moyu_macros::Node;
use moyu_core::nodes::NodeBase;
use moyu_core::traits::Node;

#[derive(Debug, Default, Node)]
pub struct MyContainer {
    #[base]
    node_base: NodeBase,
}

impl Node for MyContainer {
    fn create_instance(label: Option<String>) -> Result<Box<dyn Node>> {
        Ok(Box::new(Self {
            node_base: NodeBase::new(label.unwrap_or_default()),
        }))
    }

    fn node_type(&self) -> &'static str {
        "my_container"
    }
}
```

`#[derive(Node)]` 宏会自动为标记了 `#[base]` 的字段实现 `NodeBaseTrait`（`as_any`、`base`、`base_mut` 等方法）。

## 处理属性更新

当 JS 层调用 `updateProps` 时，引擎会依次调用 `base_mut().update_properties()` 和 `node.update_properties()`。你只需处理自定义属性：

```rust
#[derive(Debug, Default, Deserialize)]
struct MySpriteProps {
    src: Option<String>,
    mode: Option<String>,
}

impl Node for MySprite {
    fn update_properties(&mut self, props: &mut JSValue) {
        if let Ok(p) = serde_json::from_value::<MySpriteProps>(props.take()) {
            if let Some(src) = p.src {
                self.load_texture(&src);
            }
            if let Some(mode) = p.mode {
                self.mode = mode.parse().unwrap_or_default();
            }
        }
    }
    // ...
}
```

## 实现交互

实现 `Focusable` trait 使节点响应鼠标/触摸事件：

```rust
impl Focusable for MySprite {
    fn contains(&self, x: f32, y: f32, _: &FocusablePayload) -> bool {
        self.base().content_bounds().contains(x, y)
    }
}

impl Node for MySprite {
    fn as_focusable(&self) -> Option<&dyn Focusable> {
        Some(self)
    }
    // ...
}
```

## 实现命令

实现 `Command` trait 使节点接受 `executeNodeCommand` 调用：

```rust
impl Command for MyText {
    fn execute(&mut self, payload: &mut JSValue) -> Result<Option<JSValue>> {
        let sub = payload["subCommand"].as_str().unwrap_or_default();
        match sub {
            "setText" => { /* ... */ Ok(None) }
            "getLength" => Ok(Some(json!(self.text.len()))),
            _ => Ok(None),
        }
    }
}
```

## 注册与使用

在 `entry.rs` 中注册节点类型和渲染器：

```rust
core.register_node_type::<MySprite>("my_sprite");
graphics.register_renderer("my_sprite", Box::new(MySpriteRenderer::new(&device)));
```

注册后，JS 层即可创建该节点：

```tsx
<my_sprite src="image.png" />
```

同时需要在 Kit SDK 的 `declaration.ts` 中添加对应的 JSX 类型声明。

## Renderer Trait

每个节点类型通常搭配一个 Renderer：

```rust
pub trait Renderer {
    fn name(&self) -> &'static str;
    fn render_pipeline(&self) -> &RenderPipeline;
    fn bind_group_layout(&self) -> &BindGroupLayout;
    fn update(&mut self, node: &mut dyn Node, device: &Device, queue: &Queue,
              render_queue: &RenderCommandSender, payload: &RendererUpdatePayload);
    fn collect_commands(&self, node: &dyn Node, render_queue: &RenderCommandSender);
}
```

- `update` — 在节点树遍历时调用，用于更新 GPU 资源（纹理、顶点缓冲等）
- `collect_commands` — 收集渲染命令到渲染队列
