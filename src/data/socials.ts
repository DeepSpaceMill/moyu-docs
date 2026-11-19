import githubIcon from '@/assets/brands/github.svg?url';
import discordIcon from '@/assets/brands/discord.svg?url';
import qqIcon from '@/assets/brands/qq.svg?url';
import weiboIcon from '@/assets/brands/sinaweibo.svg?url';

export interface SocialLink {
  /** Brand name, used as the accessible label and the tooltip. */
  name: string;
  href: string;
  /** Masked icon URL; the icon is painted with currentColor so it follows the theme. */
  icon: string;
}

/**
 * Single source for the social links. They are rendered with rel="me" so that
 * the site keeps its IndieAuth profile links.
 */
export const socialLinks: SocialLink[] = [
  { name: 'GitHub', href: 'https://github.com/Icemic/moyu', icon: githubIcon },
  { name: 'Discord', href: 'https://discord.gg/wmTekCNarG', icon: discordIcon },
  {
    name: 'QQ',
    href: 'http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=dcB58s03NbyIENYYtp0IHa8aTcUzlBF4&authKey=cgKWlgzqOhczlLbJbGo%2F1wLiUzH%2FMXNSTxz%2BNhDjMufuw0egSin7eqZKoRD7vF4l&noverify=0&group_code=293602841',
    icon: qqIcon,
  },
  { name: 'Weibo', href: 'https://weibo.com/u/7954002249', icon: weiboIcon },
];
