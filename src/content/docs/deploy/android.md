---
title: Android 打包
sidebar:
  order: 2
---

本文介绍如何构建 Android APK、AAB 或 Android Studio 工程。当前仅支持 `android-aarch64`。

## 准备环境

### 安装 Android SDK

安装 [Android Studio](https://developer.android.com/studio)，并在 SDK Manager 中确认已经安装：

- Android SDK Platform 36
- Android SDK Build-Tools
- Android SDK Platform-Tools

### 安装 OpenJDK

安装 OpenJDK 17。Gradle 构建需要使用 JDK 17 或更高版本。

可以选择以下发行版：

- [Azul Zulu Builds of OpenJDK（推荐）](https://www.azul.com/downloads/?package=jdk#zulu)
- [Microsoft Build of OpenJDK](https://learn.microsoft.com/zh-cn/java/openjdk/download)

### 配置环境变量

将 `ANDROID_HOME` 指向 Android SDK 目录，并将 Android SDK Platform-Tools 和 JDK 的 `bin` 目录加入 `PATH`。建议同时配置 `JAVA_HOME`。

#### macOS / Linux

将以下内容加入 shell 配置文件，例如 `~/.zshrc` 或 `~/.bashrc`：

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export JAVA_HOME="/usr/lib/jvm/zulu17"
export PATH="$ANDROID_HOME/platform-tools:$JAVA_HOME/bin:$PATH"
```

以上为 Linux 示例。macOS 的 Android SDK 常见路径为 `$HOME/Library/Android/sdk`，Azul Zulu JDK 常见路径为 `/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home`。请按实际安装位置调整。

#### Windows

在系统环境变量中新增：

```text
ANDROID_HOME=C:\Users\<用户名>\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Zulu\zulu-17
```

在 `Path` 中新增：

```text
%ANDROID_HOME%\platform-tools
%JAVA_HOME%\bin
```

## 生成签名文件（可选）

发布 Release APK 或 Release AAB 前，需要准备 keystore。keystore 用于保存应用签名密钥。Android 使用该签名确认应用更新来自同一开发者。

```bash
keytool -genkeypair -alias <your_alias_name> -keyalg RSA -keysize 2048 -validity 10000 -keystore android.jks
```

- `alias` 是 keystore 中密钥的名称。
- 密码用于保护 keystore 和密钥。执行 Release 构建时，CLI 会要求输入密码，输入内容不会显示在终端中。

请妥善留存 keystore、alias 和密码。丢失签名密钥后，将无法为已发布应用提供更新。

仅构建 Debug APK 或导出 Android Studio 工程时，可以跳过此步骤。

## 配置项目

在项目根目录的 `moyu.json` 中加入 `android` 字段。图标和 keystore 路径均相对于项目根目录，可以使用 `..`。

```jsonc
{
  "android": {
    // Android 应用 ID。建议使用唯一的反向域名。
    "applicationId": "com.example.game",

    // 显示在设备上的应用名称。
    "appName": "My Visual Novel",

    // Android 用于比较版本的整数编号。
    "versionCode": 1,

    // 显示给用户的版本名称。
    "versionName": "1.0.0",

    // 屏幕方向："landscape"、"portrait" 或 "sensor"。
    "orientation": "landscape",

    "icon": {
      // 相对于项目根目录的 PNG 图标路径。
      "source": "icon.png",

      // Android 自适应图标的背景色。
      "background": {
        "color": "#ffffff"
      },

      // 前景图标留白比例，有效范围为 0 到 0.5。
      "foregroundPadding": 0.18
    },

    "signing": {
      // 相对于项目根目录的 Release keystore 路径。
      "keystorePath": "android.jks",

      // 使用 keytool 创建的密钥 alias。
      "keyAlias": "moyu"
    }
  }
}
```

`signing` 仅在构建 Release APK 或 Release AAB 时必需。密码不会写入 `moyu.json`，请自行保管。

## 执行打包

首次打包前，使用 `yarn run engine:download` 下载 `android-aarch64` 引擎文件。

```bash
yarn run engine:download
```

Android 打包命令格式如下：

```bash
yarn run engine:pack -- --target=android-aarch64 --android-format=<格式> [--output=<路径>]
```

| 参数 | 说明 |
|------|------|
| `--target` | Android 目标固定为 `android-aarch64` |
| `--android-format` | 输出格式，见下表 |
| `--output` | 输出目录，默认为 `.moyu/release/<时间>` |

| 格式 | 说明 |
|------|------|
| `debug-apk` | 构建用于本地调试和安装的 APK |
| `release-apk` | 构建用于发布的 APK，需要输入签名密码 |
| `release-aab` | 构建用于应用商店发布的 AAB，需要输入签名密码 |
| `android-project` | 导出可使用 Android Studio 打开的工程 |

示例：

```bash
# Debug APK
yarn run engine:pack -- --target=android-aarch64 --android-format=debug-apk

# Release APK
yarn run engine:pack -- --target=android-aarch64 --android-format=release-apk

# Release AAB
yarn run engine:pack -- --target=android-aarch64 --android-format=release-aab

# Android Studio 工程
yarn run engine:pack -- --target=android-aarch64 --android-format=android-project
```

Android 目标不支持 `--compress`。

## 在设备上运行（可选）

如需在 Android 设备上安装 Debug APK：

1. 在设备设置中开启开发者模式。
2. 在开发者选项中开启 USB 调试。
3. 使用 USB 连接设备，并在设备上允许调试授权。
4. 运行 `adb devices`，确认设备已经连接。
5. 使用 `adb install` 安装 APK。

```bash
adb devices
# 安装 Debug APK
adb install -r -t /path/to/game-debug-apk.apk
# 安装 Release APK
adb install -r /path/to/game-release-apk.apk
```

安装完成后，可以在设备的应用列表中启动游戏。
