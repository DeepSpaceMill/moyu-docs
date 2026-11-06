import { useEffect, useRef, useState } from 'react';
import { Languages, Menu, SunMoon, X } from 'lucide-react';
import githubIcon from '@/assets/brands/github.svg?url';
import discordIcon from '@/assets/brands/discord.svg?url';
import qqIcon from '@/assets/brands/qq.svg?url';
import weiboIcon from '@/assets/brands/sinaweibo.svg?url';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from 'cn';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { copy } from '@/data/site-copy';
import { docPath, locales, localeLabels, marketingPath, prefixFor, type Locale } from '@/data/site-nav';

type Page = 'home' | 'editor';
type ThemePreference = 'auto' | 'light' | 'dark';

interface Props {
  locale: Locale;
  current: Page;
}

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com/Icemic/moyu', icon: githubIcon },
  { name: 'Discord', href: 'https://discord.gg/wmTekCNarG', icon: discordIcon },
  { name: 'QQ', href: 'http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=dcB58s03NbyIENYYtp0IHa8aTcUzlBF4&authKey=cgKWlgzqOhczlLbJbGo%2F1wLiUzH%2FMXNSTxz%2BNhDjMufuw0egSin7eqZKoRD7vF4l&noverify=0&group_code=293602841', icon: qqIcon },
  { name: 'Weibo', href: 'https://weibo.com/u/7954002249', icon: weiboIcon },
];

export default function MarketingHeader({ locale, current }: Props) {
  const t = copy[locale];
  const [theme, setTheme] = useState<ThemePreference>('auto');
  const [themeReady, setThemeReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem('starlight-theme');
    } catch {}
    const initial: ThemePreference =
      stored === 'light' || stored === 'dark' || stored === 'auto' ? stored : 'auto';
    setTheme(initial);
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    const system = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (preference: ThemePreference) => {
      const dark = preference === 'dark' || (preference === 'auto' && system.matches);
      document.documentElement.dataset.preference = preference;
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    };
    apply(theme);
    try {
      localStorage.setItem('starlight-theme', theme === 'auto' ? '' : theme);
    } catch {}
    if (theme !== 'auto') return;
    const onChange = () => apply('auto');
    system.addEventListener('change', onChange);
    return () => system.removeEventListener('change', onChange);
  }, [theme, themeReady]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      triggerRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const onChange = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    desktop.addEventListener('change', onChange);
    return () => desktop.removeEventListener('change', onChange);
  }, []);

  const navLabel = locale === 'zh' ? '主导航' : 'Navigation';
  const links = [
    { href: marketingPath(locale, 'home'), label: t.home, active: current === 'home' },
    { href: marketingPath(locale, 'editor'), label: t.editor, active: current === 'editor' },
    { href: docPath(locale, '/start/intro/'), label: t.docs, active: false },
  ];
  const themeItems: { value: ThemePreference; label: string }[] = [
    { value: 'auto', label: t.auto },
    { value: 'light', label: t.light },
    { value: 'dark', label: t.dark },
  ];
  const languageItems = locales.map((value) => ({ value, label: localeLabels[value] }));

  return (
    <Collapsible open={menuOpen} onOpenChange={setMenuOpen}>
      <header ref={headerRef} className="relative z-10 border-b border-border bg-background">
        <div className="mx-auto flex min-h-[76px] max-w-[1376px] items-center gap-7 px-8 max-xl:gap-4 max-xl:px-6 max-lg:min-h-[72px] max-lg:gap-[18px] max-md:min-h-[68px] max-md:gap-2.5 max-md:px-[18px] max-[359px]:gap-[7px] max-[359px]:px-3">
          <a className="block shrink-0" href={prefixFor(locale) || '/'} aria-label={t.engineName}>
            <img
              className="block h-10 w-30 object-contain max-xl:w-[120px] max-md:h-[30px] max-md:w-[87px] max-[359px]:w-[72px] dark:hidden"
              src="/logo.png"
              width="116"
              height="37"
              alt={t.engineName}
            />
            <img
              className="hidden h-10 w-30 object-contain max-xl:w-[120px] max-md:h-[30px] max-md:w-[87px] max-[359px]:w-[72px] dark:block"
              src="/logo_dark.png"
              width="116"
              height="37"
              alt={t.engineName}
            />
          </a>
          <NavigationMenu
            align="start"
            aria-label={navLabel}
            className="ml-[26px] max-w-none flex-none max-xl:ml-2 max-lg:hidden"
          >
            <NavigationMenuList className="m-0 gap-2 p-0 max-xl:gap-1">
              {links.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink
                    href={link.href}
                    active={link.active}
                    aria-current={link.active ? 'page' : undefined}
                    className={`inline-flex h-11 items-center rounded-lg px-4 text-base whitespace-nowrap no-underline ${
                      link.active
                        ? 'bg-accent text-accent-foreground hover:bg-accent! focus:bg-accent! data-active:bg-accent! data-active:text-accent-foreground!'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {link.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          <div className="ml-auto hidden items-center gap-0.5 lg:flex">
            {socialLinks.map(({ name, href, icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-11 text-muted-foreground')}
                aria-label={name}
                title={name}
              >
                <span
                  className="size-5 shrink-0 bg-current"
                  style={{ mask: `url("${icon}") center / contain no-repeat` }}
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>
          <div className="flex min-w-0 items-center gap-3.5 max-xl:gap-2.5 max-lg:ml-auto max-md:gap-1.5">
            <Select
              items={languageItems}
              value={locale}
              onValueChange={(value) => {
                if (value) window.location.assign(marketingPath(value, current));
              }}
            >
              <SelectTrigger
                aria-label={t.language}
                className="h-11! min-w-0 gap-1.5 rounded-lg border-0 bg-transparent px-2.5 text-base text-muted-foreground hover:bg-muted hover:text-foreground max-md:max-w-[7.5rem] max-md:px-1.5"
              >
                <Languages className="size-[18px] max-md:hidden" aria-hidden="true" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="site-ui z-50 min-w-[9rem]">
                {languageItems.map((item) => (
                  <SelectItem key={item.value} value={item.value} className="py-2 text-base">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              items={themeItems}
              value={theme}
              onValueChange={(value) => {
                if (value) setTheme(value);
              }}
            >
              <SelectTrigger
                aria-label={t.theme}
                className="h-11! gap-2 rounded-lg border-0 bg-transparent px-2.5 text-base text-muted-foreground hover:bg-muted hover:text-foreground max-md:size-11 max-md:justify-center max-md:p-0 max-md:[&>svg:last-child]:hidden"
              >
                <SunMoon className="size-[18px]" aria-hidden="true" />
                <SelectValue className="max-md:sr-only" />
              </SelectTrigger>
              <SelectContent className="site-ui z-50 min-w-[8rem]">
                {themeItems.map((item) => (
                  <SelectItem key={item.value} value={item.value} className="py-2 text-base">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CollapsibleTrigger
              render={
                <Button
                  ref={triggerRef}
                  variant="ghost"
                  size="icon"
                  className="size-11 text-muted-foreground lg:hidden"
                  aria-label={menuOpen ? t.close : t.menu}
                />
              }
            >
              {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent keepMounted className="lg:hidden">
          <div className="border-t border-border bg-background px-6 pt-2.5 pb-6 max-md:px-[18px]">
            <nav aria-label={navLabel} className="flex flex-col gap-1">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={link.active ? 'page' : undefined}
                  className={`flex h-11 items-center rounded-lg px-3 text-base max-md:text-[15px] ${
                    link.active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-4 flex flex-wrap gap-2.5 border-t border-border pt-4">
              {socialLinks.map(({ name, href, icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: 'ghost' }), 'h-11 gap-2 px-2 text-sm text-muted-foreground')}
                >
                  <span
                    className="size-5 shrink-0 bg-current"
                    style={{ mask: `url("${icon}") center / contain no-repeat` }}
                    aria-hidden="true"
                  />{name}
                </a>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </header>
    </Collapsible>
  );
}
