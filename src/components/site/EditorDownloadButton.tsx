import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { copy } from '@/data/site-copy';
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

const platformNames: Record<Platform, string> = {
  windows: 'Windows', macos: 'macOS', linux: 'Linux', android: 'Android',
};

export default function EditorDownloadButton({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setPlatform(detectDownloadPlatform(navigator.userAgent, navigator.maxTouchPoints));
    setReady(true);
  }, []);
  const className = 'h-11 gap-2.5 px-5 text-base max-sm:px-3 max-sm:text-sm';

  if (!platform) {
    return <Button disabled className={className}>{ready ? t.downloadUnsupported : t.downloadDetecting}</Button>;
  }
  return (
    <a
      href={`https://atelier.momoyu.ink/get/latest?platform=${platform}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants(), className, 'hover:bg-primary-hover')}
    >
      {t.downloadFor.replace('{platform}', platformNames[platform])}
      <Download className="size-[18px]" aria-hidden="true" />
    </a>
  );
}
