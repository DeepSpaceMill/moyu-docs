import { useEffect, useRef, useState } from 'react';
import { Languages, Menu, SunMoon, X } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from 'cn';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { copy } from '@/data/site-copy';
import { socialLinks } from '@/data/socials';
import { locales, localeLabels, type Locale, type SiteNavLink } from '@/data/site-nav';

type ThemePreference = 'auto' | 'light' | 'dark';

interface Props {
  locale: Locale;
  links: SiteNavLink[];
  /** Server-resolved equivalent path for each locale. */
  localeHrefs: Record<Locale, string>;
  /**
   * `docs` renders only the preference pickers: in-docs navigation comes from
   * the documentation sidebar, and the four site sections are reachable from
   * the marketing pages and from the sidebar menu on narrow viewports.
   * `marketing` also folds those four links into a panel below 1024px.
   */
  variant: 'docs' | 'marketing';
  navLabel: string;
}

const THEME_KEY = 'starlight-theme';
const parseTheme = (value: unknown): ThemePreference =>
  value === 'light' || value === 'dark' || value === 'auto' ? value : 'auto';

export default function SiteHeaderControls({ locale, links, localeHrefs, variant, navLabel }: Props) {
  const t = copy[locale];
  const isDocs = variant === 'docs';
  const [theme, setTheme] = useState<ThemePreference>('auto');
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSelect, setOpenSelect] = useState<'theme' | 'language' | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_KEY);
    } catch {}
    setTheme(parseTheme(stored || 'auto'));
  }, []);

  useEffect(() => {
    const system = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'auto' && system.matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    };
    apply();
    try {
      localStorage.setItem(THEME_KEY, theme === 'auto' ? '' : theme);
    } catch {}
    if (theme !== 'auto') return;
    system.addEventListener('change', apply);
    return () => system.removeEventListener('change', apply);
  }, [theme]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      triggerRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    const onResize = () => setMenuOpen(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const themeItems: { value: ThemePreference; label: string }[] = [
    { value: 'auto', label: t.auto },
    { value: 'light', label: t.light },
    { value: 'dark', label: t.dark },
  ];
  const languageItems = locales.map((value) => ({ value, label: localeLabels[value] }));

  return (
    <div ref={rootRef} className="relative flex shrink-0 items-center gap-3.5 max-xl:gap-2.5 max-md:gap-1.5">
      <div className={cn('items-center gap-0.5', isDocs ? 'hidden md:flex' : 'hidden lg:flex')}>
        {socialLinks.map(({ name, href, icon }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noreferrer me"
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
      <Select
        items={languageItems}
        value={locale}
        open={openSelect === 'language'}
        onOpenChange={(open) => setOpenSelect(open ? 'language' : null)}
        onValueChange={(value) => {
          if (!value || value === locale) return;
          window.location.assign(localeHrefs[value as Locale]);
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
        open={openSelect === 'theme'}
        onOpenChange={(open) => setOpenSelect(open ? 'theme' : null)}
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
      {!isDocs && (
        <>
          <button
            ref={triggerRef}
            type="button"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'size-11 shrink-0 text-muted-foreground lg:hidden'
            )}
            aria-label={menuOpen ? t.close : t.menu}
            aria-expanded={menuOpen}
            aria-controls="site-nav-panel"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          {menuOpen && (
            <div
              id="site-nav-panel"
              className="border-border bg-background absolute top-full right-0 z-50 mt-2 w-80 rounded-lg border shadow-lg"
            >
              <div className="p-2">
                <nav aria-label={navLabel} className="flex flex-col gap-1">
                  {links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      aria-current={link.active ? 'page' : undefined}
                      className={cn(
                        'flex h-11 items-center rounded-lg px-3 text-base',
                        link.active ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-muted'
                      )}
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                  {socialLinks.map(({ name, href, icon }) => (
                    <a
                      key={name}
                      href={href}
                      target="_blank"
                      rel="noreferrer me"
                      className={cn(
                        buttonVariants({ variant: 'ghost' }),
                        'h-11 gap-2 px-2 text-sm text-muted-foreground'
                      )}
                    >
                      <span
                        className="size-5 shrink-0 bg-current"
                        style={{ mask: `url("${icon}") center / contain no-repeat` }}
                        aria-hidden="true"
                      />
                      {name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
