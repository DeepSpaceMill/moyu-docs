import type { Locale } from './site-nav';

/** Preserve established search titles independently of visible product names. */
export const seoCopy = {
  zh: {
    homeTitle: '末语 - 视觉小说引擎',
    editorTitle: '末语工坊 - 可视化视觉小说编辑器',
  },
  en: {
    homeTitle: 'MoYu - Visual Novel Engine',
    editorTitle: 'MOYU Atelier - Visual Novel Editor',
  },
  ja: {
    homeTitle: '末語(モユ) - ノベルゲームエンジン',
    editorTitle: 'MOYU Atelier - ビジュアルノベルエディター',
  },
} satisfies Record<Locale, { homeTitle: string; editorTitle: string }>;
