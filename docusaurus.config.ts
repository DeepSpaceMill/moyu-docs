import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: '末语 - 视觉小说引擎',
  tagline: '使用 Rust 编写，全端跨平台，现代化的开发定制能力',
  favicon: 'img/favicon.ico',
  // Set the production url of your site here
  url: 'https://momoyu.ink',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        href: 'img/icon-64.png',
        sizes: '64x64',
        type: 'image/png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        href: 'img/icon-128.png',
        sizes: '128x128',
        type: 'image/png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        href: 'img/icon-256.png',
        sizes: '256x256',
        type: 'image/png',
      },
    },
  ],

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'DeepSpaceMill', // Usually your GitHub org/user name.
  projectName: 'moyu-docs', // Usually your repo name.
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: {
          showReadingTime: true,
          blogTitle: '末语 - 视觉小说引擎 - 博客',
          blogDescription: '记录末语视觉小说引擎的开发过程',
          postsPerPage: 'ALL',
        },
        theme: {
          customCss: ['./src/css/custom.css', './src/css/fontawesome.css', './src/css/brands.css'],
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/icon-256.png',
    navbar: {
      // title: '末语 - 视觉小说引擎',
      logo: {
        alt: 'Site Logo',
        src: 'img/logo.png',
        srcDark: 'img/logo_dark.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: '文档',
        },
        { to: '/blog', label: '博客', position: 'left' },
        {
          href: 'http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=dcB58s03NbyIENYYtp0IHa8aTcUzlBF4&authKey=cgKWlgzqOhczlLbJbGo%2F1wLiUzH%2FMXNSTxz%2BNhDjMufuw0egSin7eqZKoRD7vF4l&noverify=0&group_code=293602841',
          className: 'navbar-icon navbar-icon-qq fa-brands fa-qq',
          'aria-label': 'QQ',
          // label: 'QQ',
          position: 'right',
        },
        {
          href: 'https://discord.gg/wmTekCNarG',
          className: 'navbar-icon navbar-icon-discord fa-brands fa-discord',
          'aria-label': 'Discord',
          // label: 'Discord',
          position: 'right',
        },
        {
          href: 'https://github.com/DeepSpaceMill',
          className: 'navbar-icon fa-brands fa-github',
          'aria-label': 'GitHub',
          // label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '文档',
          items: [
            {
              label: '文档',
              to: '/docs/intro',
            },
            {
              label: '关于',
              to: '/docs/about',
            },
          ],
        },
        // {
        //   title: 'Community',
        //   items: [
        //     {
        //       label: 'Stack Overflow',
        //       href: 'https://stackoverflow.com/questions/tagged/docusaurus',
        //     },
        //     {
        //       label: 'Discord',
        //       href: 'https://discordapp.com/invite/docusaurus',
        //     },
        //     {
        //       label: 'Twitter',
        //       href: 'https://twitter.com/docusaurus',
        //     },
        //   ],
        // },
        {
          title: '更多',
          items: [
            {
              label: '博客',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/DeepSpaceMill',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Icemic. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
