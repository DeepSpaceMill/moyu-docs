# Moyu Docs — Agent 指南

本仓库是末语引擎与末语工坊的官网、文档站。修改前阅读本文件、相关迭代文档与对应代码。自然语言交流默认中文，代码注释使用英文。

## 项目与命令

- 页面与构建：Astro 7；文档：Starlight 0.41。
- 页面：`src/pages/`；文档正文：`src/content/docs/`。
- 默认语言为中文，无 URL 前缀；英语 `/en/`，日语 `/ja/`。
- 包管理器：pnpm。`pnpm build` 构建，`pnpm astro --help` 查看 CLI。
- 开发服务器由用户启动；agent 不自行运行 `pnpm dev`。
- 引入组件的目标栈：与 FishFlow 一致的 shadcn `base-nova`、Base UI、ReUI、React、Tailwind CSS 4。当前安装状态以 `package.json` 为准，迁移方案见 `docs/iteration/2026-11/2026-11-05-refactor-component-system.md`。

## 产品与设计约束

- 首页介绍面向代码开发者的末语引擎；`/editor/` 介绍独立可视化工具末语工坊。两者分别可用。
- 保持已确定的首页居中结构、W1 首屏排版、编辑器 B1 大图与横向功能页签。
- 本轮变更范围仅为 header、首页、编辑器页。文档页仅 header 属于范围；正文、侧边栏、目录、搜索及其控件、文档主题不主动修改。文档移动菜单与 footer 保持当前实现。
- 延续当前青色品牌与近中性背景，继承 FishFlow 的小圆角。官网控件尺寸与字号通常比 FishFlow 大一到两档，局部间距使用统一尺度；章节留白按官网的阅读需求设置。
- 文案简洁、客观；新增用户可见文案补齐中、英、日版本，集中维护在 `src/data/`。
- 下载地址、发布产物、平台支持与获取条件必须核实。缺少产物时明确显示暂未提供。
- 截图与短视频公开前核实展示许可；功能展示必须符合实际产品能力。

## 组件分层与依赖

沿用 FishFlow 的 open code 规范，并按官网职责设置业务层：

```text
pages / layouts
      ↓
components/site
      ↓
components/reui + components/ui-ext + components/ui
      ↓
@base-ui/react
```

- `components/ui/`：shadcn Base UI 基础组件的本地镜像，通过 add 引入，尽量接近上游。
- `components/ui-ext/`：上游未覆盖的通用基础能力、必要的本地适配。可依赖 `ui/`、Base UI 与 `lib/`；文件开头用英文注释解释补充原因。
- `components/reui/`：ReUI 高阶模式组件的本地镜像，可依赖 `ui/`、`lib/`。按页面需求引入。
- `components/site/`：官网业务组件与 Starlight 覆盖组件，可组合上述三层、`data/`、`lib/`。
- `pages/`、`layouts/`：路由、页面装配、SEO 与布局。
- `lib/`：无业务语义的共用工具；不反向依赖组件层。

新增组件遵循「现成组件 → 现成组件组合 → 自行实现」的顺序。先查 shadcn 基础件与 ReUI patterns/blocks，能直接使用时直接使用；需要组合时仅在业务层装配。只有现成组件及其组合无法覆盖需求时，才补充自定义实现，并说明原因。缺少的通用能力进 `ui-ext/`，产品语义进 `site/`。底层不能反向依赖页面或业务层。

避免修改 `ui/`、`reui/` 镜像组件的行为与接口。优先组合或在 `ui-ext/` 补充。必要的上游同步单独说明来源与验证结果。不从 FishFlow 引入编辑器业务、状态管理或桌面依赖。

依赖使用 pnpm 安装，shadcn 使用 CLI init/add，ReUI 使用同一 CLI 的 `@reui/*` registry 安装。禁止读过源码后自行默写或直接复制 FishFlow 的上游组件文件。先 dry-run/diff 审阅安装范围，保留 CLI 生成结果与 lockfile；配置和作用域适配按迭代方案精确调整。

## Astro 与 React 的边界

- Astro 负责页面结构、正文、图片优化、SEO 和静态内容输出。
- React 负责需要客户端状态的控件，如功能页签、菜单与选择器；使用 Base UI 承接焦点、键盘、ARIA 和弹层行为。
- 组件默认服务端输出，按交互需要设置 `client:*`；优先保证首屏内容在 HTML 中可读，避免整页客户端渲染。
- 多个独立 island 之间不默认共享 React context；有关联的交互收在同一业务组件中。
- 使用带有效 `href` 的链接表达跳转，使用按钮表达操作；静态链接与按钮样式也复用统一 variants。
- Starlight 继续负责文档搜索、侧边栏、目录、正文和代码高亮；header 使用公开组件覆盖入口，保留其中的 Starlight 搜索等现有控件。文档移动菜单与 footer 不列入本轮迁移。

## 样式规范

- shadcn 配置采用 FishFlow 的 `base-nova`、neutral 基底、CSS variables、`@/` aliases 与 `@reui` registry。品牌色通过语义 token 定义。
- 图标配置 `iconLibrary: "lucide"`，安装 `lucide-react`；通用图标具名导入 Lucide。营销页 header 的品牌图标使用从 Simple Icons 下载的本地 SVG，来源与许可记录在 `src/assets/brands/README.md`，不以通用图标替代品牌。Starlight 原生控件保持现状。
- 使用语义 token：`background`、`foreground`、`primary`、`muted`、`border`、`ring` 等。主操作品牌色映射到 `primary`；`muted` 表示背景，次要文字使用 `muted-foreground`。
- 以 `--radius: 0.25rem` 为基础，派生圆角规则与 FishFlow 一致。镜像组件保留上游 size API；官网通过调用处的标准 utility 或重复使用的 `ui-ext/` 尺寸 variants 放大一到两档，不修改镜像默认值。
- 官网首选控件高度 40–44px、文字 16px，图标 18–20px；正文通常 16–18px。W1 首屏保持已选字号与层级，其他尺寸以响应式预览确认。移动端独立触控目标优先至少 44px。
- 局部间距优先使用 Tailwind 标准尺度，卡片 padding 先以 24–32px 为基准；避免将官网压缩为编辑器密度。
- 新语义 token 仅在营销页面根容器与 header 的组件作用域内提供，弹层 portal 使用对应容器或带相同作用域的根节点。保留文档 `--sl-*` 与现有全局主题变量。
- 暗色选择器与 Starlight 的 `data-theme` 对齐，主题偏好继续使用 `starlight-theme`，保留自动跟随系统。
- Tailwind 工具类和组件基础规则仅服务于 header、首页、编辑器页；不向文档注入全局 Preflight 或通用元素 reset。接入前检查 CSS 层级，避免改变文档正文、Expressive Code、搜索弹层及 Starlight 控件。
- 避免宽泛的 `svg`、`a`、`button` 全局规则覆盖组件。组件视觉变体集中管理，页面样式负责排版。
- 保持可见焦点、键盘导航、对比度与 reduced-motion 支持。

## 工作流程与验证

1. 先阅读相关代码和最新迭代文档，明确范围；必要的设计决策写入 `docs/iteration/<YYYY-MM>/` 后实施。
2. 最小化改动，从问题来源处理；重大需求歧义先讨论。既有未提交改动需要保留。
3. 完成后检查构建、类型与相关交互；按需更新 `docs/todo.md` 和迭代记录。
4. UI 验证覆盖中英日、明暗/系统主题、桌面与窄屏；涉及菜单或页签时检查键盘与焦点行为。
5. 涉及全局样式时回归文档正文、搜索、侧边栏、目录与代码高亮；检查横向溢出、图片加载和内部链接。
6. 运行 `git diff --check`。不启动无关重构，不全仓格式化，不为低影响的样式替换添加重复实现的测试。

参考：ReUI <https://reui.io/llms.txt>；Base UI <https://base-ui.com/llms.txt>；Astro React 集成 <https://docs.astro.build/en/guides/integrations-guide/react/>。
