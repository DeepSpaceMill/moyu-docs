---
title: 介绍
sidebar:
  order: 1
---

接下来你将了解末语视觉小说引擎的设计思想和主要功能。

## 设计思想

在设计初期，我们有两个目标：

- 支持尽可能多的平台
- 引擎的使用应是简单的、渐进的

将其展开，问题很容易变成：

- 如何让引擎本身的开发维护成本足够低，且对未来的扩展不构成障碍
- 用户以何种方式简单地使用我们的引擎、拥有什么样的功能；当用户需要更多功能时，如何让他们能够深入进来，我们又如何提供这些功能

最终确立了当前的架构：

它使用 [Rust](https://www.rust-lang.org/) 编写，基于 [winit](https://github.com/rust-windowing/winit) 和 [wgpu](https://github.com/gfx-rs/wgpu) 提供了跨平台的图形渲染能力，我们在此基础上编写了图形渲染、音频播放、事件处理等模块。它是一个 native 的程序，这最大限度保证了我们对特性的掌控，同时也能够在未来支持更多的平台。所有实际的引擎功能都会在这一层去实现，所以自然也提供了可插拔的渲染器和插件系统。

在其之上，我们引入了 JavaScript 作为脚本语言，使用 [QuickJS](https://github.com/Icemic/quickjs-rusty) 作为解释器，这样我们可以在引擎内部提供一个 JavaScript 运行环境。当然，这是一个有意做得受限的环境——它并不是一个类似 NodeJS 那样的全方位的运行平台，而仅是纯粹的 JavaScript 运行时。像是引入外部模块或是访问网络这样的事情是无法去做的，一方面是为了安全性，一方面也是希望它以后也能保持是一个轻量的环境。

我们通过 [QuickJS](https://github.com/Icemic/quickjs-rusty) 向运行时环境暴露了引擎层的各种 API，所以运行时这一层才是真正的用户接口。用户可以通过编写 JavaScript 脚本来控制引擎的行为，这样就可以实现各种各样的功能。

不过，只提供一些简单的命令式的 API 还不足以让引擎变得好用，于是我们引入了 [React](https://react.dev/)。是的，我们在一个非浏览器环境中使用 [React](https://react.dev/)。这并不是这里的独创，我们从 AVG.js 项目中吸取了经验和教训，重新实现了这一特性。有了 [React](https://react.dev/)，我们可以提供一个更加声明式的 API，用户可以通过组件化的方式来构建视觉小说的界面，这样就可以更加方便地组织代码和实现功能。这也包括去利用 [React](https://react.dev/) 现有生态中的很多东西，比如路由、状态管理等等。

如果你是一个有经验的开发者，可能会觉得这个架构有些奇怪。但是我们相信这样的架构是有意义的，这帮助我们更好地分层——这里不是指软件架构中的分层，而是指功能和用户接口的分层。这样的架构使得我们可以在引擎层提供更多的功能，同时又不会让用户感到困扰。

因而，对于初次接触本引擎或缺少经验的用户，我们更推荐首先使用我们提供的模板，专注于视觉小说的内容和交互，而不是去深入了解引擎的底层。在过程中根据需要去学习如何定制化和扩展引擎，这样会更加容易上手。

而对于有经验的开发者，我们提供了更多的自定义能力，从调用额外的 JS API 到从头自己实现一套模板，甚至于开发可插拔的渲染器和插件，我们提供了一个渐进式的连续体，让你可以根据自己的需求和预算来选择。

## 主要特性

末语视觉小说引擎提供了以下主要特性：

- **一致的跨平台能力**：支持 Windows、macOS、Linux 等桌面平台，Android、iOS 等移动平台和 Web。“一次编写，各处运行”。
- **高度自定义的界面**：使用 React 开发你想要的任何界面。
- **渐进式和灵活性**：对于不同的用户，提供不同的使用方式，从简单的模板到完全自定义。
- **开源且商业友好**：基于 MPL-2.0 开源协议，可以免费使用，更可以用于商业用途。

## 下一步

接下来你可以查看[快速开始](quick-start)来了解如何使用末语视觉小说引擎。
