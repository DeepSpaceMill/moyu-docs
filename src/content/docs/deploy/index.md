---
title: 构建与发布
sidebar:
  order: 1
---

本文介绍如何将末语游戏项目打包并发布到各个平台。

## 打包命令

使用 `engine:pack` 命令完成从构建到打包的全流程：

```bash
yarn run engine:pack -- --target=<平台> [--compress] [--output=<路径>]
```

| 参数 | 说明 |
|------|------|
| `--target` | 目标平台，如 `windows-amd64`、`linux-amd64`、`web-universal`、`android-aarch64` |
| `--compress` | 压缩为 zip 文件（文件名使用 UTF-8 编码） |
| `--output` | 输出目录，默认为 `.moyu/release/<时间>` |

打包脚本会自动完成以下步骤：

1. 运行 Rspack 构建，生成 JS bundle
2. 组合 `assets/`、`index.json`、bundle 文件和引擎文件
3. 输出到目标目录，或压缩为 `game.zip`

:::note
打包前需要先通过 `yarn run engine:update` 下载引擎文件。
:::

## Windows / Linux

```bash
# 输出到 .moyu/release/<时间戳>/game/
yarn run engine:pack -- --target=windows-amd64
yarn run engine:pack -- --target=linux-amd64

# 压缩为 .moyu/release/<时间戳>/game.zip
yarn run engine:pack -- --target=windows-amd64 --compress
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
yarn run engine:pack -- --target=web-universal

# 压缩为 .moyu/release/<时间戳>/game.zip
yarn run engine:pack -- --target=web-universal --compress
```

打包产物包含：

- `index.html`（入口页面）
- 引擎 WASM 文件及 JS 胶水代码
- `index.json`（项目配置）
- `main.js`（游戏 bundle）
- `assets/`（游戏资源）

将 `game/` 目录部署到任意静态文件托管服务即可，或者[发布到 itch.io 等游戏平台](./upload-to-platforms)。

## Android

Android 打包需要额外安装 Android SDK 和 OpenJDK。支持输出 Debug APK、Release APK、Release AAB 和 Android Studio 工程：

```bash
yarn run engine:pack -- --target=android-aarch64 --android-format=debug-apk
```

Android 目标不支持 `--compress`。完整的环境配置、签名和设备调试步骤见 [Android 打包](./android)。
