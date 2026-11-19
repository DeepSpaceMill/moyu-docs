import type { ImageMetadata } from 'astro';
import type { Locale } from './site-nav';

import zlzyCover from '../assets/showcase/智利之夜.png';
import xzysCover from '../assets/showcase/箱中轶事.png';
import witchCover from '../assets/showcase/往逝魔女之匣.jpg';
import fishberryCover from '../assets/showcase/FISHBERRY.jpg';

export const showcaseCopy = {
  viewMore: { zh: '查看更多', en: 'View more', ja: 'もっと見る' },
  description: {
    zh: '浏览用末语引擎或末语工坊制作的游戏。',
    en: 'Browse games made with MOYU Engine or MOYU Atelier.',
    ja: '末語エンジンや MOYU Atelier で制作されたゲームを紹介します。',
  },
  empty: {
    zh: '暂无作品。',
    en: 'No games to show yet.',
    ja: '掲載作品はまだありません。',
  },
};

export interface ShowcaseWork {
  title: string;
  author: string;
  tags?: string[];
  translations?: Partial<Record<Locale, { title?: string; author?: string; tags?: string[] }>>;
  cover?: ImageMetadata;
  coverColor?: string;
  href?: string;
}

// List order controls placement; the first two games get the larger gallery covers.
// Import cover images from src/assets. Omit href for works without a public release page.
export const showcaseWorks: ShowcaseWork[] = [
  {
    title: '智利之夜',
    author: '浅红工作室',
    tags: ['同人', '重返未来1999'],
    coverColor: '#F0D4AF',
    cover: zlzyCover,
    translations: { en: { tags: ['Doujin'] }, ja: { tags: ['同人'] } },
    href: 'https://www.bilibili.com/video/BV1ds8d6tESE/',
  },
  {
    title: '往逝魔女之匣',
    author: 'Onuomi Lab',
    tags: ['商业', '百合', '制作中'],
    coverColor: '#958F82',
    cover: witchCover,
    translations: { en: { tags: ['Commercial'] }, ja: { tags: ['商業'] } },
    href: 'https://store.steampowered.com/app/5499170/',
  },
  {
    title: '鱼想吃草莓',
    author: 'Fermentative Iron & Sand Hotel',
    tags: ['商业', '制作中'],
    coverColor: '#9969C0',
    cover: fishberryCover,
    translations: { en: { tags: ['Commercial'] }, ja: { tags: ['商業'] } },
    href: 'https://store.steampowered.com/app/4655140/',
  },
  {
    title: '箱中轶事',
    author: '浅红工作室',
    tags: ['同人', '重返未来1999', '制作中'],
    coverColor: '#9A7C70',
    cover: xzysCover,
    translations: { en: { tags: ['Doujin'] }, ja: { tags: ['同人'] } },
  },
  // {
  //   title: '日落前的最后一班车',
  //   author: '十一月小组',
  //   tags: ['原创'],
  //   coverColor: '#b69a65',
  //   translations: { en: { tags: ['Original'] }, ja: { tags: ['オリジナル'] } },
  // },
  // {
  //   title: '隔壁房间的收音机',
  //   author: '棠梨',
  //   tags: ['商业'],
  //   coverColor: '#7b718b',
  //   translations: { en: { tags: ['Commercial'] }, ja: { tags: ['商業'] } },
  // },
  // {
  //   title: '第九号温室',
  //   author: '玻璃房',
  //   tags: ['同人'],
  //   coverColor: '#6b8576',
  //   translations: { en: { tags: ['Fan game'] }, ja: { tags: ['二次創作'] } },
  // },
];
