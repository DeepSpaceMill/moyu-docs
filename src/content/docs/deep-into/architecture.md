---
title: 引擎架构概览
sidebar:
  order: 2
---

本章面向希望深入了解甚至参与末语引擎 Rust 层开发的读者。阅读前，建议先了解 [为什么采用这种架构](/deep-into/why-use-this-architecture)。

## Crate 结构

```
crates/
├── moyu/          # 主入口 crate，整合所有模块
├── core/          # 核心引擎：渲染循环、事件、节点树、插件系统
├── nodes/         # 内置节点类型（Sprite、Text、Animation 等）
├── runtime/       # QuickJS VM 封装
├── ops/           # JS ↔ Rust 桥接操作
├── resource/      # 资源加载与管理（纹理、字体等）
├── audio/         # 音频系统（Kira + Symphonia）
├── platform/      # 平台抽象层（文件系统、日志、时间等）
├── scenario/      # 剧情脚本执行器
├── gamepad/       # 手柄输入
├── macros/        # 过程宏（#[derive(Node)]、#[derive(Plugin)] 等）
└── run_wasm/      # WASM 构建与开发服务器
```

## 启动流程

引擎启动经历以下阶段：

1. **平台入口** — 桌面使用 `main()` + tokio，移动端和 Web 使用 `moyu_init()`
2. **事件循环创建** — 使用 winit 的 `EventLoop`
3. **`ApplicationHandler::resumed`** — 创建窗口和 `Core` 实例
4. **多阶段初始化**（通过 `ApplicationInitEvent`）：
   - `Start` — 初始化资源管理器
   - `Graphic` — 创建 wgpu 图形管线和内置渲染器
   - `Plugin` — 注册节点类型、插件和渲染器
   - `LoadUserScript` — 启动 QuickJS VM 并加载用户脚本
   - `ShowAndStart` — 显示窗口，分发 `GameEvent::Ready`

## 核心数据结构

```rust
pub struct Core {
    pub window: Arc<Window>,
    pub graphics: ArcSwapOption<Graphics>,
    pub node_factories: DashMap<String, NodeFactory>,   // 节点工厂注册表
    pub plugins: DashMap<String, PluginLock>,           // 插件注册表
    pub node_map: NodeMap,            // 所有活跃节点（DashMap<u32, NodeLock>）
    pub stage_size: Arc<RwLock<SurfaceSize>>,  // 逻辑舞台尺寸
    // ...
}
```

## 渲染循环

每帧执行的核心流程：

1. **插件更新** — 遍历所有插件调用 `plugin.update(vsync)`
2. **节点树遍历** — 以深度优先遍历节点树
   - **进入回调**：更新变换矩阵、判断可见性、调用 `renderer.update()`
   - **退出回调**：计算内容边界、调用 `renderer.collect_commands()`
3. **渲染命令提交** — 渲染器通过 `RenderCommandSender` 发送渲染命令到 GPU 线程
4. **GPU 绘制** — 渲染线程消费命令队列，执行 wgpu 绘制

## 事件系统

引擎内部事件通过 `dispatch_event_async()` 分发：

```rust
pub trait Event: Serialize + TS + Send + 'static {
    fn name(&self) -> &'static str;
}
```

- **节点事件**：通过 `NodeEventSource` trait 从节点发送
- **插件事件**：通过 `PluginEventSource` trait 从插件发送
- 事件最终通过 `__moyu_receive_event` 传递到 JS 层

## 条件编译

```rust
#[cfg(native)]    // 桌面 + 移动原生平台
#[cfg(web)]       // WebAssembly 平台
#[cfg(desktop)]   // 仅桌面
#[cfg(mobile)]    // 仅移动端
```
