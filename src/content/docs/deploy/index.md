---
title: 构建与发布
sidebar:
  order: 1
---

本文介绍如何将末语游戏项目打包并发布到各个平台。

## 打包命令

使用 `engine:pack` 命令完成从构建到打包的全流程：

```bash
npm run engine:pack -- --target=<平台> [--compress] [--output=<路径>]
```

| 参数 | 说明 |
|------|------|
| `--target` | 目标平台，可选值：`windows`、`linux`、`web` |
| `--compress` | 压缩为 zip 文件（文件名使用 UTF-8 编码） |
| `--output` | 输出目录，默认为 `.moyu/release/<时间>` |

打包脚本会自动完成以下步骤：

1. 运行 Rspack 构建，生成 JS bundle
2. 组合 `assets/`、`index.json`、bundle 文件和引擎文件
3. 输出到目标目录，或压缩为 `game.zip`

:::note
打包前需要先通过 `npm run engine:update` 下载引擎文件。
:::

## Windows / Linux

```bash
# 输出到 .moyu/release/<时间戳>/game/
npm run engine:pack -- --target=windows
npm run engine:pack -- --target=linux

# 压缩为 .moyu/release/<时间戳>/game.zip
npm run engine:pack -- --target=windows --compress
```

打包产物包含：

- `moyu.exe` / `moyu`（引擎可执行文件）
- `index.json`（项目配置）
- `main.js`（游戏 bundle）
- `assets/`（游戏资源）

将整个 `game/` 目录（或解压后的内容）交付给玩家，运行其中的可执行文件即可启动游戏。

## Web

```bash
# 输出到 .moyu/release/<时间戳>/game/
npm run engine:pack -- --target=web

# 压缩为 .moyu/release/<时间戳>/game.zip
npm run engine:pack -- --target=web --compress
```

打包产物包含：

- `index.html`（入口页面）
- 引擎 WASM 文件及 JS 胶水代码
- `index.json`（项目配置）
- `main.js`（游戏 bundle）
- `assets/`（游戏资源）

将 `game/` 目录部署到任意静态文件托管服务即可。

### 发布到 Cloudflare Pages

1. 在 [Cloudflare Dashboard](https://dash.cloudflare.com/) 中创建一个新的 Pages 项目
2. 连接你的 Git 仓库，或选择「直接上传」
3. 若使用直接上传，将 `game/` 目录中的全部文件或单个压缩包上传即可
4. 若通过 Git 集成，在构建设置中填写：
   - **构建命令**：`npm run engine:pack -- --target=web --output=./out`
   - **输出目录**：`out/game`

:::caution
Web 版引擎使用了 `SharedArrayBuffer`，需要页面在安全上下文（HTTPS）下运行，并携带以下响应头：

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

Cloudflare Pages 支持通过根目录下的 `_headers` 文件配置自定义响应头，在 `game/` 目录下创建 `_headers` 文件，内容如下：

```
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
```
:::

### 发布到 itch.io

1. 登录 [itch.io](https://itch.io)，进入你的游戏页面，选择「Edit game」
2. 在「Uploads」部分点击「Upload files」，上传 `game.zip`（使用 `--compress` 参数生成）
3. 勾选上传文件旁的 **「This file will be played in the browser」**
4. 在「Kind of project」中选择 **HTML**
5. 保存并发布

:::caution
与 Cloudflare Pages 相同，itch.io 的 HTML 游戏沙盒默认不携带 `Cross-Origin-Embedder-Policy` 和 `Cross-Origin-Opener-Policy` 响应头，导致 `SharedArrayBuffer` 不可用。

需要在项目设置的「Embed options」中勾选 **「SharedArrayBuffer support (higher quality audio and video, must be opted in to)」** 选项，itch.io 会为你的游戏页面自动添加所需响应头。
:::
