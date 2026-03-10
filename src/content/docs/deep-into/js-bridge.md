---
title: JS 桥接机制
sidebar:
  order: 5
---

引擎通过 `moyu_ops` crate 将 Rust 功能暴露给 JavaScript 层。本文介绍桥接的内部工作原理。

## 全局对象注入

引擎启动时，`moyu_ops` 在 QuickJS 全局作用域中注入 `moyu` 对象：

```javascript
globalThis.moyu = {
  pushCommand,           // 通用命令（创建节点、更新属性等）
  executeNodeCommand,    // 节点命令
  executePluginCommand,  // 插件命令
};
```

Kit SDK 将这些底层函数封装为用户友好的 API（`createRoot`、`executePluginCommand` 等）。

## 命令分发

### pushCommand

处理节点树操作，支持的命令名：

| 命令 | 功能 |
|------|------|
| `create_instance` | 创建节点实例 |
| `destroy_instance` | 销毁节点 |
| `add_child` | 添加子节点 |
| `insert_child` | 在指定位置插入子节点 |
| `insert_child_before` | 在指定节点前插入 |
| `remove_child` | 移除子节点 |
| `remove_child_at` | 按索引移除子节点 |
| `update_props` | 更新节点属性 |

### executeNodeCommand / executePluginCommand

分别调用节点和插件的 `Command::execute` 方法，传递 JSON payload 并返回结果。

## moyu_bindgen 宏

`#[moyu_bindgen]` 属性宏为 Rust 函数生成 QuickJS 绑定代码：

```rust
#[moyu_bindgen]
pub fn create_instance(
    node_type: String,
    label: Option<String>,
    mut props: JSValue,
) -> Result<u32, String> {
    // Rust implementation
}
```

宏自动生成：
1. QuickJS 的 `RawJSValue` 参数解析
2. Rust 函数调用
3. 返回值到 `JSValue` 的转换
4. 错误处理

在 Web 平台上，同样的函数通过 `#[wasm_bindgen]` 暴露给浏览器 JS。

## 属性更新流程

当 React 组件属性变化时：

```
React Reconciler (commitUpdate)
  → Kit SDK: moyu.pushCommand('update_props', [nodeId, changedProps])
    → Rust ops: update_props(node_id, props)
      → node.base_mut().update_properties(&mut props)  // 通用属性（x, y, scale...）
      → node.update_properties(&mut props)              // 节点专有属性
```

`NodeBase` 处理通用属性（位置、缩放、旋转、可见性等），各节点类型只需处理自己的专有属性。

## 事件传递流程

事件从引擎传递到 JS 的路径：

```
Rust 层事件源（节点、插件、输入系统）
  → dispatch_event_async(CustomEvent { ... })
    → 事件队列
      → __moyu_receive_event(name, payload)  // 注入到 JS 的全局函数
        → Kit SDK 事件分发器
          → React 组件的事件处理器 / addEventListener 回调
```
