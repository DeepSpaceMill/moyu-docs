// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import Icons from 'unplugin-icons/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://momoyu.ink',
  integrations: [
    starlight({
      title: {
        'zh-CN': '末语 - 视觉小说引擎',
        ja: '末語 - ノベルゲームエンジン',
        en: 'MoYu - Visual Novel Engine',
      },
      favicon: '/favicon.ico',
      logo: {
        dark: './public/logo_dark.png',
        light: './public/logo.png',
        replacesTitle: true,
      },
      defaultLocale: 'root',
      locales: {
        root: {
          lang: 'zh-CN',
          label: '简体中文',
        },
        ja: {
          lang: 'ja',
          label: '日本語',
        },
        en: {
          lang: 'en',
          label: 'English',
        },
      },
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            href: '/icon-64.png',
            sizes: '64x64',
            type: 'image/png',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            href: '/icon-128.png',
            sizes: '128x128',
            type: 'image/png',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            href: '/icon-256.png',
            sizes: '256x256',
            type: 'image/png',
          },
        },
      ],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/DeepSpaceMill' },
        { icon: 'discord', label: 'Discord', href: 'https://discord.gg/wmTekCNarG' },
      ],
      sidebar: [
        {
          label: '开始',
          autogenerate: { directory: 'start' },
        },
        {
          label: '教程 - 基本',
          autogenerate: { directory: 'tutorial-basics' },
        },
        {
          label: '教程 - 进阶',
          autogenerate: { directory: 'tutorial-advanced' },
        },
        {
          label: '更多',
          autogenerate: { directory: 'more' },
        },
      ],
      lastUpdated: true,
      editLink: {
        baseUrl: 'https://github.com/DeepSpaceMill/moyu-docs/edit/master/',
      },
      customCss: ['./src/styles/custom.css'],
      components: {
        SocialIcons: './src/components/SocialIcons.astro',
      },
    }),
  ],
  vite: {
    plugins: [Icons({ compiler: 'astro' })],
  },
});
