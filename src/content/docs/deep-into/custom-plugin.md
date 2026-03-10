---
title: 自定义插件
sidebar:
  order: 4
---

插件用于扩展引擎功能，可以在每帧更新中执行逻辑，并接收来自 JS 层的命令。

## Plugin Trait

```rust
pub trait Plugin: PluginBaseTrait + Send + Sync {
    /// 插件名称标识，如 "audio"、"scenario"
    fn plugin_name(&self) -> &'static str;

    /// 每帧调用，vsync=true 表示重绘帧，false 表示空闲帧
    fn update(&mut self, vsync: bool) { }

    /// 如果插件接受命令，返回 Command 引用
    fn as_command(&mut self) -> Option<&mut dyn Command> { None }
}
```

## 基本实现

```rust
use moyu_macros::Plugin;
use moyu_core::traits::{Plugin, Command};

#[derive(Plugin)]
pub struct MyPlugin {
    counter: u32,
}

impl Plugin for MyPlugin {
    fn plugin_name(&self) -> &'static str {
        "my_plugin"
    }

    fn update(&mut self, vsync: bool) {
        if vsync {
            self.counter += 1;
        }
    }

    fn as_command(&mut self) -> Option<&mut dyn Command> {
        Some(self)
    }
}

impl Command for MyPlugin {
    fn execute(&mut self, payload: &mut JSValue) -> Result<Option<JSValue>> {
        let sub = payload["subCommand"].as_str().unwrap_or_default();
        match sub {
            "getCount" => Ok(Some(json!(self.counter))),
            "reset" => {
                self.counter = 0;
                Ok(None)
            }
            _ => Ok(None),
        }
    }
}
```

`#[derive(Plugin)]` 宏自动实现 `PluginBaseTrait`（`as_any` 等方法）。

## 注册插件

在 `entry.rs` 中注册：

```rust
core.register_plugin(
    "my_plugin",
    Arc::new(Mutex::new(MyPlugin { counter: 0 })),
);
```

注册后，JS 层即可调用：

```typescript
const count = executePluginCommand('my_plugin', {
  subCommand: 'getCount',
});
```

## 发送事件到 JS

插件可以通过 `PluginEventSource` trait 向 JS 层发送自定义事件：

```rust
use moyu_core::traits::{PluginEventSource, Event};

#[derive(Serialize, TS)]
pub struct MyEvent {
    pub message: String,
}

impl Event for MyEvent {
    fn name(&self) -> &'static str {
        "my_custom_event"
    }
}

impl PluginEventSource for MyPlugin {
    type Event = MyEvent;
}

// In plugin logic:
self.send_event(MyEvent { message: "hello".into() });
```

JS 层通过 `addEventListener` 接收：

```typescript
addEventListener('my_custom_event', (event) => {
  console.log(event.message);
});
```

## 内置插件参考

| 插件 | 所在 crate | 功能 |
|------|-----------|------|
| `system` | `core` | 窗口管理、截图、退出 |
| `audio` | `audio` | 音频加载与播放 |
| `scenario` | `scenario` | 剧情执行、存档、变量 |
| `gamepad` | `gamepad` | 手柄输入和震动 |

阅读这些内置插件的源码是学习插件开发的最佳方式。
