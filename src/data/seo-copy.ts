import type { Locale, MarketingPage } from './site-nav';

/** Preserve established search titles independently of visible product names. */
export const seoCopy = {
  zh: {
    homeTitle: '末语 - 视觉小说引擎',
    editorTitle: '末语工坊 - 可视化视觉小说编辑器',
    showcaseTitle: '作品 - 末语',
  },
  en: {
    homeTitle: 'MoYu - Visual Novel Engine',
    editorTitle: 'MOYU Atelier - Visual Novel Editor',
    showcaseTitle: 'Showcase - MOYU',
  },
  ja: {
    homeTitle: '末語(モユ) - ノベルゲームエンジン',
    editorTitle: 'MOYU Atelier - ビジュアルノベルエディター',
    showcaseTitle: '作品 - 末語',
  },
} satisfies Record<Locale, Record<`${MarketingPage}Title`, string>>;
