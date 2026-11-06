import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { copy } from '@/data/site-copy';
import { docPath, marketingPath, type Locale } from '@/data/site-nav';

/** Documentation header links. Starlight keeps its search, theme and language controls. */
export default function DocsNav({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const navLabel = locale === 'zh' ? '主导航' : 'Navigation';
  const links = [
    { href: marketingPath(locale, 'home'), label: t.home, active: false },
    { href: marketingPath(locale, 'editor'), label: t.editor, active: false },
    { href: docPath(locale, '/start/intro/'), label: t.docs, active: true },
  ];

  return (
    <NavigationMenu aria-label={navLabel} className="site-nav-ui max-w-none flex-none">
      <NavigationMenuList className="m-0 gap-1 p-0">
        {links.map((link) => (
          <NavigationMenuItem key={link.href}>
            <NavigationMenuLink
              href={link.href}
              active={link.active}
              aria-current={link.active ? 'page' : undefined}
              className={`inline-flex h-10 items-center rounded-lg px-3.5 text-base whitespace-nowrap no-underline ${
                link.active
                  ? 'bg-[var(--sl-color-accent-low)] text-[var(--sl-color-text-accent)] hover:bg-[var(--sl-color-accent-low)] hover:text-[var(--sl-color-text-accent)] data-active:bg-[var(--sl-color-accent-low)] data-active:text-[var(--sl-color-text-accent)] data-active:hover:bg-[var(--sl-color-accent-low)] data-active:focus:bg-[var(--sl-color-accent-low)] focus:bg-[var(--sl-color-accent-low)]'
                  : 'text-[var(--sl-color-gray-2)] hover:bg-[var(--sl-color-gray-6)] hover:text-[var(--sl-color-white)] focus:bg-[var(--sl-color-gray-6)]'
              } focus-visible:ring-[var(--sl-color-accent)]`}
            >
              {link.label}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
