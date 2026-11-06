import { useRef, type ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { copy } from '@/data/site-copy';
import type { Locale } from '@/data/site-nav';

interface Props {
  locale: Locale;
  /** Screenshots are rendered by Astro and passed through named slots. */
  script?: ReactNode;
  assets?: ReactNode;
  preview?: ReactNode;
  ui?: ReactNode;
  voice?: ReactNode;
}

export default function EditorFeatureTabs({ locale, script, assets, preview, ui, voice }: Props) {
  const t = copy[locale];
  const root = useRef<HTMLDivElement>(null);
  const media = [script, preview, ui, assets, voice];

  return (
    <Tabs
      ref={root}
      defaultValue={0}
      onValueChange={() => root.current?.querySelectorAll('video').forEach(video => video.pause())}
      className="gap-0"
    >
      <TabsList activateOnFocus aria-label={t.editorFeatureTitle} className="h-auto! w-full justify-start gap-2 overflow-x-auto rounded-none border-b border-border bg-transparent px-0 pt-0 pb-3 max-md:gap-1">
        {t.editorTabs.map((title, index) => (
          <TabsTrigger
            key={title}
            value={index}
            className="h-11! flex-none rounded-lg px-4 text-base text-muted-foreground hover:text-foreground data-active:bg-accent! data-active:text-accent-foreground! max-md:px-3"
          >
            {title}
          </TabsTrigger>
        ))}
      </TabsList>
      {t.editorHeadings.map((heading, index) => (
        <TabsContent key={heading} value={index} keepMounted className="min-w-0 pt-6">
          <h3 className="mb-5 max-w-[760px] text-lg font-normal leading-7">{heading}</h3>
          {media[index] && (
            <div
              data-feature-media
              className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-muted p-3 max-md:p-2 [&_astro-slot]:contents [&_figure]:h-full [&_figure]:w-full [&_video]:block [&_video]:h-full [&_video]:w-full [&_video]:object-contain"
            >
              {media[index]}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
