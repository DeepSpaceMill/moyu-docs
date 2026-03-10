---
title: 项目结构
sidebar:
  order: 2
---

了解项目的文件组织方式，是进行定制开发的第一步。

## 目录结构

```
my-vn-project/
├── assets/                 # 游戏资源（图片、音频、剧本等）
│   ├── audio/              # 音频文件
│   ├── bg/                 # 背景图片
│   ├── characters/         # 角色立绘
│   ├── fonts/              # 字体文件
│   ├── scenario/           # 剧本文件（.sixu）
│   └── ui/                 # UI 素材
├── src/                    # 源代码
│   ├── index.tsx           # 应用入口
│   ├── router.ts           # 路由配置
│   ├── error.tsx           # 错误边界
│   ├── actors/             # 图层组件（舞台上的视觉表现）
│   │   ├── background.tsx  # 背景图层
│   │   ├── character.tsx   # 角色图层
│   │   ├── textbox.tsx     # 文本框图层
│   │   └── bgm.tsx         # BGM 图层（无视觉）
│   ├── commands/           # 命令系统
│   │   ├── commands.ts     # 命令 Schema 定义（Zod）
│   │   └── handlers.ts     # 命令处理函数
│   ├── components/         # 可复用 UI 组件
│   │   ├── button.tsx      # 按钮
│   │   ├── slider.tsx      # 滑动条
│   │   ├── select.tsx      # 下拉选择
│   │   ├── checkbox.tsx    # 复选框
│   │   ├── dialog.tsx      # 对话框
│   │   ├── notification.tsx # 通知
│   │   └── frame.tsx       # 帧动画
│   ├── hooks/              # 自定义 Hook
│   │   ├── useButton.ts    # 按钮状态管理
│   │   └── useSaveLoad.ts  # 存档/读档
│   ├── pages/              # 页面组件
│   │   ├── title.tsx       # 标题画面
│   │   ├── stage.tsx       # 游戏舞台（核心）
│   │   ├── menu.tsx        # 游戏内菜单
│   │   ├── saveload.tsx    # 存档/读取界面
│   │   └── settings.tsx    # 设置界面
│   ├── state/              # 状态管理
│   │   ├── game.ts         # 游戏状态（背景、角色、文本等）
│   │   ├── settings.ts     # 设置状态（音量、窗口等）
│   │   └── ui.ts           # UI 状态（通知、确认框等）
│   └── utils/              # 工具函数
├── index.json              # 引擎配置
├── package.json            # 项目依赖
├── rspack.config.js        # 构建配置
└── tsconfig.json           # TypeScript 配置
```

## 入口文件

应用从 `src/index.tsx` 开始：

```typescript title="src/index.tsx"
import { addEventListener, createRoot } from '@momoyu-ink/kit';
import React from 'react';
import { Navigation } from './router';
import { Notification } from './components/notification';

function Main() {
  return (
    <>
      <Navigation />
      <Notification />
    </>
  );
}

addEventListener('ready', () => {
  const root = createRoot();
  root.render(<Main />);
});
```

关键流程：

1. 引擎发出 `ready` 事件，表示初始化完成
2. 调用 `createRoot()` 创建 React 渲染根节点
3. 渲染 `<Main />` 组件，其中包含路由导航和全局通知

:::tip
`createRoot()` 对应的是 `@momoyu-ink/kit` 提供的方法，而非 `react-dom`。末语使用自定义的 React Reconciler 将 React 组件树映射到引擎的节点树上。
:::

## 构建工具

框架使用 [Rspack](https://rspack.dev/) 进行构建，这是一个高性能的 Webpack 兼容打包工具。

### 常用命令

```bash
# 开发模式（启动开发服务器，支持热更新）
npm run dev

# 构建生产版本
npm run build

# 使用引擎预览（原生窗口）
npm run engine:native

# 使用引擎预览（浏览器）
npm run engine:web

# 更新引擎版本
npm run engine:update
```

### 开发流程

推荐的开发流程：

1. 在一个终端运行 `npm run dev` 启动开发服务器
2. 在另一个终端运行 `npm run engine:native`（或 `engine:web`）启动引擎
3. 修改代码后，引擎会自动热更新

## 核心模块速览

以下是各核心模块的职责，后续章节会逐一详细介绍：

| 模块 | 职责 | 详情 |
|------|------|------|
| **路由** (`router.ts`) | 页面导航和浮层管理 | [路由与页面](/customize/routing) |
| **状态** (`state/`) | 游戏运行时数据管理 | [状态管理](/customize/state) |
| **命令** (`commands/`) | 剧本命令的定义和执行 | [命令与剧本引擎](/customize/commands) |
| **图层** (`actors/`) | 舞台上的视觉元素 | [图层系统](/customize/actors) |
| **页面** (`pages/`) | 各个界面 | [路由与页面](/customize/routing) |
| **组件** (`components/`) | 可复用的 UI 控件 | [内置组件](/customize/components) |
