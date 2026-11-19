import { copy } from './site-copy';

export const locales = ['zh', 'en', 'ja'] as const;
export type Locale = (typeof locales)[number];
export type MarketingPage = 'home' | 'editor' | 'showcase';

/** Top-level site sections, in header order. */
export type SiteSection = MarketingPage | 'docs';

export const localeLabels: Record<Locale, string> = { zh: '简体中文', en: 'English', ja: '日本語' };

/**
 * Normalise a Starlight route locale to a supported site locale.
 *
 * Starlight types the route locale as an optional plain string because locales
 * are user configuration. This is the only place that narrows it, so adding a
 * locale means extending `locales` and this guard together. The root locale is
 * the default, which matches Starlight's own `defaultLocale: 'root'`.
 */
export const toLocale = (routeLocale: string | undefined): Locale =>
  locales.find((value) => value === routeLocale) ?? 'zh';

export const prefixFor = (locale: Locale) => (locale === 'zh' ? '' : `/${locale}`);

/** Documentation lives under the locale prefix; marketing pages use their own paths. */
export const docPath = (locale: Locale, path: string) => `${prefixFor(locale)}${path}`;

export const marketingPageFor = (pathname: string): MarketingPage | undefined => {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  if (/^\/(?:en\/|ja\/)?$/.test(path)) return 'home';
  if (/^\/(?:en\/|ja\/)?editor\/$/.test(path)) return 'editor';
  if (/^\/(?:en\/|ja\/)?showcase\/$/.test(path)) return 'showcase';
  return undefined;
};

export const marketingPath = (locale: Locale, page: MarketingPage) =>
  `${prefixFor(locale)}${page === 'home' ? '/' : `/${page}/`}`;

/** Locale home path, used by the logo link. */
export const homeHref = (locale: Locale) => prefixFor(locale) || '/';

/** Section path for any top-level section, including documentation. */
export const sectionPath = (locale: Locale, section: SiteSection) =>
  section === 'docs' ? docPath(locale, '/start/intro/') : marketingPath(locale, section);

export interface SiteNavLink {
  href: string;
  label: string;
  active: boolean;
}

/**
 * The four top-level links. Shared by the header navigation, the middle-width
 * site navigation menu and the documentation mobile menu, so that all three
 * always list the same sections.
 */
export const mainNav = (locale: Locale, current?: SiteSection): SiteNavLink[] => {
  const t = copy[locale];
  return (['home', 'editor', 'showcase', 'docs'] as const).map((section) => ({
    href: sectionPath(locale, section),
    label: t[section],
    active: current === section,
  }));
};

/**
 * Equivalent path in another locale.
 *
 * Marketing pages map onto their own routes. Documentation keeps the current
 * path and only swaps the locale prefix, which also covers untranslated pages:
 * the English and Japanese trees currently contain no source files, so those
 * routes serve the Chinese content through Starlight's fallback.
 */
export const localeSwitchTarget = (pathname: string, target: Locale): string => {
  const path = pathname.replace(/^\/(?:en|ja)(?=\/|$)/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const marketing = marketingPageFor(normalized);
  if (marketing) return marketingPath(target, marketing);
  return docPath(target, normalized);
};

/** Accessible names that differ per locale. */
export const navLabels = (locale: Locale) => {
  const t = copy[locale];
  return { nav: t.nav, site: t.siteNav };
};
