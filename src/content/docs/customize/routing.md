---
title: 路由与页面
sidebar:
  order: 5
---

末语框架使用**栈式导航**系统管理页面和浮层。你可以在页面之间跳转，也可以在当前页面上方叠加浮层（如设置界面、存档界面）。

## 路由配置

路由在 `src/router.ts` 中定义：

```typescript title="src/router.ts"
import { createStackNavigator, createStaticNavigation, RegisterNavigator } from '@momoyu-ink/kit';
import { Title } from './pages/title';
import { Stage } from './pages/stage';
import { SaveLoad } from './pages/saveload';
import { Settings } from './pages/settings';
import { Menu } from './pages/menu';
import { Dialog } from './components/dialog';

export const navigator = createStackNavigator({
  initialPage: 'title',
  pages: {
    title: Title,
    stage: {
      component: Stage,
    },
    cg: () => null,
    bgm: () => null,
    credits: () => null,
  },
  overlays: {
    saveload: {
      component: SaveLoad,
      requiredParams: ['type'],
    },
    settings: Settings,
    menu: Menu,
    history: () => null,
    confirm: {
      component: Dialog,
      requiredParams: ['message'],
    },
  },
});

export const Navigation = createStaticNavigation(navigator);

// Register types for type-safe navigation
declare module '@momoyu-ink/kit' {
  interface RootNavigatorList extends RegisterNavigator<typeof navigator> {}
}
```

### 页面 vs 浮层

| 概念 | 说明 | 场景 |
|------|------|------|
| **页面（Page）** | 占据整个舞台的全屏界面，一次只显示一个 | 标题画面、游戏舞台 |
| **浮层（Overlay）** | 在当前页面之上的叠加界面，可以多层叠加 | 设置、存档、菜单、对话框 |

## 导航 API

在任何组件中，使用 `getNavigator()` 获取导航器实例：

```typescript
import { getNavigator } from '@momoyu-ink/kit';

const nav = getNavigator();
```

### 页面导航

```typescript
// 跳转到页面（替换当前页面栈）
nav.navigate('stage');

// 跳转并传递参数
nav.navigate('stage', { storyName: 'chapter1' });

// 返回上一页
nav.goBack();
```

### 浮层操作

```typescript
// 打开浮层
nav.pushOverlay('settings');

// 打开浮层并传递参数
nav.pushOverlay('saveload', { type: 'save' });
nav.pushOverlay('confirm', { message: '确定要退出吗？', onConfirm: () => { ... } });

// 关闭最顶层浮层
nav.popOverlay();
```

### 在组件中接收参数

页面和浮层组件通过 props 接收导航参数：

```typescript
interface SaveLoadProps {
  type: 'save' | 'load';
}

function SaveLoad({ type }: SaveLoadProps) {
  // type 来自 nav.pushOverlay('saveload', { type: 'save' })
  return (
    <container>
      <text text={type === 'save' ? '保存游戏' : '读取游戏'} />
    </container>
  );
}
```

## 内置页面

标准框架提供了以下页面：

### 标题画面 (`title`)

初始页面，包含"开始游戏"、"读取存档"、"设置"、"退出"按钮。

### 游戏舞台 (`stage`)

核心页面，承载所有游戏内容。包含背景、角色、文本框等演员组件，以及命令处理系统。详见[命令与剧本引擎](/customize/commands)和[演员系统](/customize/actors)。

### 游戏菜单 (`menu`)

浮层形式，在游戏舞台上方显示。提供"继续"、"设置"、"回到主菜单"、"退出"选项。

### 存档/读取 (`saveload`)

浮层形式，支持保存和读取两种模式。分页显示最多 50 个存档槽位。详见[存档系统](/customize/save-load)。

### 设置 (`settings`)

浮层形式，提供音量控制、窗口大小、文字速度等选项。

## 添加新页面

### 1. 创建页面组件

```typescript title="src/pages/gallery.tsx"
import React from 'react';

export function Gallery() {
  return (
    <container label="画廊">
      <sprite src="ui/gallery_bg.png" />
      <text text="CG 鉴赏" x={100} y={50} fontSize={48} fillColor="#FFFFFF" />
      {/* ... 你的画廊内容 ... */}
    </container>
  );
}
```

### 2. 注册到路由

```typescript title="src/router.ts"
import { Gallery } from './pages/gallery';

export const navigator = createStackNavigator({
  initialPage: 'title',
  pages: {
    title: Title,
    stage: { component: Stage },
    gallery: Gallery,          // 添加新页面
    // ...
  },
  overlays: { ... },
});
```

### 3. 添加导航入口

```typescript
// 从标题画面按钮跳转
nav.navigate('gallery');
```

### 添加新浮层

浮层的添加方式类似：

```typescript title="src/router.ts"
overlays: {
  // ...
  myoverlay: {
    component: MyOverlayComponent,
    requiredParams: ['someParam'],   // 声明必需的参数（可选）
  },
},
```

```typescript
// 打开浮层
nav.pushOverlay('myoverlay', { someParam: 'value' });
```
