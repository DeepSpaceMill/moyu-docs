---
title: 参与贡献
sidebar:
  order: 6
---

欢迎参与末语引擎的开发！本文介绍贡献流程和开发环境配置。

## 开发环境

| 工具 | 版本要求 |
|------|---------|
| Rust | 最新 stable |
| Node.js | 22.x LTS |
| Clang | 18+ |
| lld（Linux） | 最新版 |

Linux 还需安装 `libsound2-dev`。

## 构建

```bash
# 桌面 Debug
cargo build

# Release
cargo build --release

# WASM
cargo build --target wasm32-unknown-unknown

# Android
cargo build --target aarch64-linux-android
```

## 代码规范

- **Rust**：遵循 [Rust API 指南](https://rust-lang.github.io/api-guidelines/)，使用 `cargo fmt` 格式化
- **JavaScript/TypeScript**：使用 ESLint + Biome 进行检查和格式化
- **提交信息**：遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范

## 贡献流程

1. 在 Issues 中搜索是否已有相关讨论
2. Fork 仓库，创建功能分支（如 `feat/audio-xxx`、`fix/some-problem`）
3. 编写代码并确保通过 CI
4. 创建 Pull Request，关联相关 Issue
5. 通过代码审查后合并

## 项目结构导航

- 添加新节点类型 → 参考[自定义节点](/deep-into/custom-node)
- 添加新插件 → 参考[自定义插件](/deep-into/custom-plugin)
- 修改 JS 桥接 → 参考 [JS 桥接机制](/deep-into/js-bridge)
- 修改渲染管线 → `crates/core/src/core/render.rs`
- 修改事件系统 → `crates/core/src/core/event.rs`
