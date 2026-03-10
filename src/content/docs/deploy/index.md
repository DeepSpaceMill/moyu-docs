---
title: 构建与部署
sidebar:
  order: 1
---

本文介绍如何构建和打包你的末语游戏项目。

:::note
部署打包功能正在设计中，目前仅介绍开发构建相关内容。完整的平台打包文档即将推出。
:::

## 开发构建

项目使用 Rspack 作为构建工具。开发时通过引擎直接加载：

```bash
# 安装依赖
npm install

# 开发构建（监听模式）
npm run dev
```

构建产物输出到 `dist/` 目录，引擎启动时自动加载其中的 `index.js`。

## 项目配置

### index.json

项目根目录的 `index.json` 是引擎的项目配置文件：

```json
{
  "name": "my-game",
  "displayName": "我的游戏",
  "version": "0.1.0",
  "stage": {
    "width": 1920,
    "height": 1080
  }
}
```

| 字段 | 说明 |
|------|------|
| `name` | 项目标识名 |
| `displayName` | 显示名称（窗口标题等） |
| `version` | 版本号 |
| `stage.width` | 舞台逻辑宽度 |
| `stage.height` | 舞台逻辑高度 |

### rspack.config.js

Rspack 构建配置，负责将 TypeScript + React 代码打包为引擎可加载的 JavaScript bundle。默认配置已满足大部分场景，通常无需修改。

## 资源目录

`assets/` 目录中的所有文件会在运行时对引擎可见：

```
assets/
├── audio/        # 音频文件（推荐 .opus 格式）
├── fonts/        # 字体文件
├── scenario/     # 剧情脚本（编译后的 .json）
└── ui/           # UI 图片资源
```

在代码中引用资源时使用相对于 `assets/` 的路径：

```tsx
<sprite src="ui/button.png" />
```

## 平台目标

末语引擎支持以下平台：

| 平台 | 状态 | 说明 |
|------|------|------|
| Windows | ✅ | 主要开发平台 |
| macOS | ✅ | |
| Linux | ✅ | |
| Web (WASM) | ✅ | 浏览器运行 |
| Android | 🚧 | 开发中 |
| iOS | 🚧 | 开发中 |

各平台的打包和分发流程将在后续版本中完善。
