---
title: Cloudflare / itch.io
sidebar:
  order: 2
---

Web 版游戏可以发布到支持静态文件托管的平台，如 Cloudflare Pages、GitHub Pages、Netlify、Vercel 等，或专门的 HTML5 游戏平台如 itch.io。

在阅读以下指南前，请确保已经使用 `npm run engine:pack -- --target=web --compress` 命令打包了 Web 版本游戏。

## 发布到 Cloudflare Pages

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

## 发布到 itch.io

1. 登录 [itch.io](https://itch.io)，进入你的游戏页面，选择「Edit game」
2. 在「Uploads」部分点击「Upload files」，上传 `game.zip`（使用 `--compress` 参数生成）
3. 勾选上传文件旁的 **「This file will be played in the browser」**
4. 在「Kind of project」中选择 **HTML**
5. 保存并发布

:::caution
与 Cloudflare Pages 相同，itch.io 的 HTML 游戏沙盒默认不携带 `Cross-Origin-Embedder-Policy` 和 `Cross-Origin-Opener-Policy` 响应头，导致 `SharedArrayBuffer` 不可用。

需要在项目设置的「Embed options」中勾选 **「SharedArrayBuffer support (higher quality audio and video, must be opted in to)」** 选项，itch.io 会为你的游戏页面自动添加所需响应头。
:::

## 相关链接

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [itch.io Uploading HTML Games](https://itch.io/docs/creators/html5)
