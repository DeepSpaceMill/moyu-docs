import type { Locale } from './site-nav';

type FeatureId = 'platforms' | 'interface' | 'progressive' | 'typography' | 'effects' | 'integrations' | 'publishing' | 'tools' | 'license';
interface FeatureCopy {
  id: FeatureId;
  title: string;
  text: string;
  links: { label: string; href: string }[];
}
interface EngineHomeCopy {
  description: string;
  browseDocs: string;
  title: string;
  intro: string;
  strip: string;
  features: FeatureCopy[];
  developerTitle: string;
  developerText: string;
  framework: string;
  architecture: string;
  exampleHeading: string;
  exampleImageAlt: string;
}

export const engineHomeCopy = {
  zh: {
    description: '开源的跨平台视觉小说引擎。',
    browseDocs: '浏览文档',
    title: '各种功能 应有尽有',
    intro: '',
    strip: '特性介绍',
    features: [
      {
        id: 'platforms',
        title: '一致的跨平台体验',
        text: '桌面、移动和 Web 全端跨平台。\n免除兼容性和移植的烦恼。',
        links: [{ label: '平台支持', href: '/start/intro/' }],
      },
      {
        id: 'interface',
        title: '高度自定义的界面',
        text: '用 TypeScript 与 React 定制所需的任何界面和系统。',
        links: [{ label: '界面开发', href: '/customize/overview/' }],
      },
      {
        id: 'progressive',
        title: '渐进式和灵活性',
        text: '为不同的用户提供不同的使用方式，从简单的模板到完全自定义。',
        links: [{ label: '引擎架构', href: '/deep-into/architecture/' }],
      },
      {
        id: 'typography',
        title: '文本排版与富文本',
        text: '完善的中文排版和富文本支持。',
        links: [{ label: '文字与排版', href: '/start/rich-text/' }],
      },
      {
        id: 'effects',
        title: '转场与 Shader 特效',
        text: '从内置转场到自定义 WGSL 特效，创作贴合故事的画面演出。',
        links: [{ label: '转场与着色器', href: '/engine-api/shader/' }],
      },
      {
        id: 'integrations',
        title: 'Live2D、Spine 与 Steam',
        text: '丰富角色表现，接入成就、统计乃至创意工坊。',
        links: [
          { label: 'Live2D', href: '/engine-api/live2d/' },
          { label: 'Spine', href: '/engine-api/spine/' },
          { label: 'Steam', href: '/engine-api/steam/' },
        ],
      },
      {
        id: 'publishing',
        title: '快速构建与发布',
        text: '提供构建工具链，一行命令将作品构建为各平台游戏包。',
        links: [{ label: '构建与发布', href: '/deploy/' }],
      },
      {
        id: 'tools',
        title: 'AI 开发与调试',
        text: '内建 MCP 与 Headless 运行能力，支持 AI 自动化开发和测试。',
        links: [{ label: '了解引擎架构', href: '/deep-into/architecture/' }],
      },
      {
        id: 'license',
        title: '开源且商业友好',
        text: '基于 MPL-2.0 开源，可用于商业用途。',
        links: [{ label: '阅读 MPL-2.0', href: 'https://www.mozilla.org/en-US/MPL/2.0/' }],
      },
    ],
    developerTitle: '定制框架，\n获得自己的专属引擎。',
    developerText: '从标准框架开始，逐步定制界面与逻辑。\n开发新的游戏系统和命令，实现你想要的玩法。',
    framework: '了解 React 开发方式',
    architecture: '了解引擎架构',
    exampleHeading: 'React 组件与游戏画面',
    exampleImageAlt: '游戏画面：室内背景、角色立绘与底部显示中文对白的文字框。',
  },
  en: {
    description: 'An open-source, cross-platform visual novel engine.',
    browseDocs: 'Browse documentation',
    title: 'All the features you need',
    intro: '',
    strip: 'Features',
    features: [
      {
        id: 'platforms',
        title: 'A consistent cross-platform experience',
        text: 'Across desktop, mobile and web.\nLeave compatibility and porting hassles behind.',
        links: [{ label: 'Platform support', href: '/start/intro/' }],
      },
      {
        id: 'interface',
        title: 'Highly customizable interfaces',
        text: 'Customize any interface or system you need with TypeScript and React.',
        links: [{ label: 'Interface development', href: '/customize/overview/' }],
      },
      {
        id: 'progressive',
        title: 'Progressive and flexible',
        text: 'Choose the approach that suits you, from simple templates to full customization.',
        links: [{ label: 'Engine architecture', href: '/deep-into/architecture/' }],
      },
      {
        id: 'typography',
        title: 'Typography and rich text',
        text: 'Comprehensive Chinese typography and rich text support.',
        links: [{ label: 'Text and typography', href: '/start/rich-text/' }],
      },
      {
        id: 'effects',
        title: 'Transitions and shader effects',
        text: 'From built-in transitions to custom WGSL effects, create visuals that fit your story.',
        links: [{ label: 'Transitions and shaders', href: '/engine-api/shader/' }],
      },
      {
        id: 'integrations',
        title: 'Live2D, Spine and Steam',
        text: 'Bring characters to life and connect achievements, statistics and even Steam Workshop.',
        links: [
          { label: 'Live2D', href: '/engine-api/live2d/' },
          { label: 'Spine', href: '/engine-api/spine/' },
          { label: 'Steam', href: '/engine-api/steam/' },
        ],
      },
      {
        id: 'publishing',
        title: 'Fast builds and releases',
        text: 'A complete build toolchain packages your game for each platform with a single command.',
        links: [{ label: 'Build and release', href: '/deploy/' }],
      },
      {
        id: 'tools',
        title: 'AI development and debugging',
        text: 'Built-in MCP and headless execution support AI-driven development and automated testing.',
        links: [{ label: 'Explore the architecture', href: '/deep-into/architecture/' }],
      },
      {
        id: 'license',
        title: 'Open source, commercial use welcome',
        text: 'Open source under MPL-2.0 and available for commercial use.',
        links: [{ label: 'Read MPL-2.0', href: 'https://www.mozilla.org/en-US/MPL/2.0/' }],
      },
    ],
    developerTitle: 'Customize the framework.\nMake the engine your own.',
    developerText:
      'Start with the standard framework and gradually customize interfaces and logic.\nDevelop new game systems and commands to create the gameplay you envision.',
    framework: 'Develop with React',
    architecture: 'Engine architecture',
    exampleHeading: 'React components and game scene',
    exampleImageAlt: 'Game scene with a room background, a character sprite and a dialogue box displaying Chinese text along the bottom.',
  },
  ja: {
    description: 'オープンソースのクロスプラットフォーム・ノベルゲームエンジン。',
    browseDocs: 'ドキュメントを読む',
    title: '必要な機能がひと通りそろう',
    intro: '',
    strip: '機能紹介',
    features: [
      {
        id: 'platforms',
        title: '一貫したクロスプラットフォーム体験',
        text: 'デスクトップ、モバイル、Web に対応。\n互換性や移植の悩みから解放されます。',
        links: [{ label: '対応プラットフォーム', href: '/start/intro/' }],
      },
      {
        id: 'interface',
        title: '自由度の高い画面カスタマイズ',
        text: 'TypeScript と React で、必要な画面やシステムを自在にカスタマイズできます。',
        links: [{ label: '画面の開発', href: '/customize/overview/' }],
      },
      {
        id: 'progressive',
        title: '段階的で柔軟な開発',
        text: 'シンプルなテンプレートから完全なカスタマイズまで、自分に合う使い方を選べます。',
        links: [{ label: 'エンジンの構造', href: '/deep-into/architecture/' }],
      },
      {
        id: 'typography',
        title: '文字組みとリッチテキスト',
        text: '中国語の文字組みとリッチテキストを幅広くサポート。',
        links: [{ label: '文字と組版', href: '/start/rich-text/' }],
      },
      {
        id: 'effects',
        title: 'トランジションとシェーダー',
        text: '標準トランジションから独自の WGSL エフェクトまで、物語に合う画面演出を制作できます。',
        links: [{ label: 'トランジションとシェーダー', href: '/engine-api/shader/' }],
      },
      {
        id: 'integrations',
        title: 'Live2D・Spine・Steam 連携',
        text: 'キャラクターの表現を豊かにし、実績、統計、Steam ワークショップとも連携できます。',
        links: [
          { label: 'Live2D', href: '/engine-api/live2d/' },
          { label: 'Spine', href: '/engine-api/spine/' },
          { label: 'Steam', href: '/engine-api/steam/' },
        ],
      },
      {
        id: 'publishing',
        title: 'すばやくビルドして配布',
        text: 'ビルドツールチェーンを用意。コマンドひとつで、各プラットフォーム向けのゲームパッケージを作成できます。',
        links: [{ label: 'ビルドと配布', href: '/deploy/' }],
      },
      {
        id: 'tools',
        title: 'AI による開発とデバッグ',
        text: 'MCP とヘッドレス実行を標準搭載し、AI による開発の自動化とテストに対応します。',
        links: [{ label: 'エンジンの構造を読む', href: '/deep-into/architecture/' }],
      },
      {
        id: 'license',
        title: 'オープンソースで商用利用も可能',
        text: 'MPL-2.0 のオープンソースで、商用利用も可能です。',
        links: [{ label: 'MPL-2.0 を読む', href: 'https://www.mozilla.org/en-US/MPL/2.0/' }],
      },
    ],
    developerTitle: 'フレームワークを変えて、\n自分だけのエンジンに。',
    developerText:
      '標準フレームワークから始め、画面とロジックを少しずつカスタマイズ。\n新たなゲームシステムやコマンドを開発し、思い描くゲームプレイを実現できます。',
    framework: 'React での開発',
    architecture: 'エンジンの構造',
    exampleHeading: 'React コンポーネントとゲーム画面',
    exampleImageAlt: '室内の背景、キャラクターの立ち絵、画面下部に中国語の台詞を表示するテキストウィンドウ。',
  },
} satisfies Record<Locale, EngineHomeCopy>;
