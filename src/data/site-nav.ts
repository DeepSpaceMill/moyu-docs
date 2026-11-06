export const locales = ['zh', 'en', 'ja'] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = { zh: '简体中文', en: 'English', ja: '日本語' };

export const prefixFor = (locale: Locale) => (locale === 'zh' ? '' : `/${locale}`);

/** Documentation lives under the locale prefix; marketing pages use their own paths. */
export const docPath = (locale: Locale, path: string) => `${prefixFor(locale)}${path}`;

export const marketingPageFor = (pathname: string): 'home' | 'editor' | undefined => {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  if (/^\/(?:en\/|ja\/)?$/.test(path)) return 'home';
  if (/^\/(?:en\/|ja\/)?editor\/$/.test(path)) return 'editor';
  return undefined;
};

export const marketingPath = (locale: Locale, page: 'home' | 'editor') =>
  `${prefixFor(locale)}${page === 'editor' ? '/editor/' : '/'}`;
