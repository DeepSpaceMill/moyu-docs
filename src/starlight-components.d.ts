// Starlight resolves these override entrypoints at build time; its public declarations omit them.
declare module 'virtual:starlight/components/LanguageSelect' {
  const component: typeof import('@astrojs/starlight/components/LanguageSelect.astro').default;
  export default component;
}
declare module 'virtual:starlight/components/Search' {
  const component: typeof import('@astrojs/starlight/components/Search.astro').default;
  export default component;
}
declare module 'virtual:starlight/components/SiteTitle' {
  const component: typeof import('@astrojs/starlight/components/SiteTitle.astro').default;
  export default component;
}
declare module 'virtual:starlight/components/SocialIcons' {
  const component: typeof import('@astrojs/starlight/components/SocialIcons.astro').default;
  export default component;
}
declare module 'virtual:starlight/components/ThemeSelect' {
  const component: typeof import('@astrojs/starlight/components/ThemeSelect.astro').default;
  export default component;
}
