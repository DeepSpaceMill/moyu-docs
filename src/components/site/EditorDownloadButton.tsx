import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, ChevronDown, Download } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from 'cn';
import { copy } from '@/data/site-copy';
import type { Copy } from '@/data/site-copy';
import type { Locale } from '@/data/site-nav';

type Platform = 'windows' | 'macos' | 'linux' | 'android';

/** Android and unsupported Linux/macOS-like user agents must be handled first. */
export function detectDownloadPlatform(userAgent: string, maxTouchPoints = 0): Platform | null {
  if (/iPhone|iPad|iPod|CrOS/i.test(userAgent) || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1)) return null;
  if (/Android/i.test(userAgent)) return 'android';
  if (/Windows NT/i.test(userAgent)) return 'windows';
  if (/Macintosh|Mac OS X/i.test(userAgent)) return 'macos';
  if (/Linux/i.test(userAgent)) return 'linux';
  return null;
}

const platforms: Platform[] = ['windows', 'macos', 'linux', 'android'];

const platformNames: Record<Platform, string> = {
  windows: 'Windows', macos: 'macOS', linux: 'Linux', android: 'Android',
};

const downloadHref = (platform: Platform) => `https://atelier.momoyu.ink/get/latest?platform=${platform}`;

/**
 * The platform list stays reachable from every device, including the ones that
 * detection rejects, so a desktop build can still be fetched from a phone.
 */
function PlatformMenu({
  t,
  platform,
  triggerClassName,
  children,
}: {
  t: Copy;
  platform: Platform | null;
  triggerClassName: string;
  children: ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button aria-label={t.downloadPickPlatform} className={triggerClassName} />}
      >
        {children}
      </DropdownMenuTrigger>
      {/*
        The portal renders outside the .site-ui frame, so the menu carries the scope
        itself. `w-auto` replaces the trigger-width default because the platform
        labels are wider than the 44px trigger.
      */}
      <DropdownMenuContent align="end" sideOffset={6} className="site-ui w-auto min-w-52">
        {platforms.map((item) => (
          <DropdownMenuItem
            key={item}
            render={<a href={downloadHref(item)} target="_blank" rel="noopener noreferrer" />}
            aria-current={item === platform ? 'true' : undefined}
            className="px-2 py-2.5 text-base"
          >
            <span className="flex-1 whitespace-nowrap">
              {t.downloadVersion.replace('{platform}', platformNames[item])}
            </span>
            {item === platform ? (
              <>
                <Check className="size-[18px] text-primary" aria-hidden="true" />
                <span className="sr-only">{t.downloadCurrent}</span>
              </>
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function EditorDownloadButton({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setPlatform(detectDownloadPlatform(navigator.userAgent, navigator.maxTouchPoints));
    setReady(true);
  }, []);

  if (!platform) {
    return (
      <PlatformMenu t={t} platform={null} triggerClassName="h-11 gap-2 px-5 text-base hover:bg-primary-hover max-sm:text-sm">
        {ready ? t.downloadPickPlatform : t.downloadDetecting}
        <ChevronDown className="size-[18px]" aria-hidden="true" />
      </PlatformMenu>
    );
  }

  return (
    <ButtonGroup aria-label={t.downloadOptions}>
      {/*
        Base UI keeps `role="button"` on the Button component, so the download
        link is a real anchor styled with the same variants instead.
      */}
      <a
        href={downloadHref(platform)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          buttonVariants(),
          // The mirror paints with `bg-clip-padding`, which leaves its 1px transparent
          // border unpainted and shows the page through the seam. Paint to the border
          // box so the neighbours meet the separator with no gap.
          'h-11 gap-2 rounded-r-none bg-clip-border px-5 text-base hover:bg-primary-hover max-sm:px-3 max-sm:text-sm'
        )}
      >
        {t.downloadFor.replace('{platform}', platformNames[platform])}
        <Download className="size-[18px]" aria-hidden="true" />
      </a>
      {/*
        `bg-primary-hover` keeps the divider in the brand family; `my-0` removes the
        separator's 1px inset, which would otherwise expose the page at both ends.
      */}
      <ButtonGroupSeparator className="bg-primary-hover data-vertical:my-0" />
      <PlatformMenu
        t={t}
        platform={platform}
        triggerClassName="h-11 w-11 bg-clip-border px-0 hover:bg-primary-hover max-sm:w-10"
      >
        <ChevronDown className="size-[18px]" aria-hidden="true" />
      </PlatformMenu>
    </ButtonGroup>
  );
}
