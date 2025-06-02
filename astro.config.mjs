// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import Icons from 'unplugin-icons/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://momoyu.ink',
  integrations: [
    starlight({
      title: '末语 - 视觉小说引擎',
      description: '使用 Rust 编写，全端跨平台，现代化的开发定制能力',
      favicon: '/favicon.ico',
      logo: {
        dark: './public/logo_dark.png',
        light: './public/logo.png',
        replacesTitle: true,
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
        { icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' },
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
      customCss: [
        './src/styles/custom.css',
      ],
      components: {
        SocialIcons: './src/components/SocialIcons.astro',
      },
    }),
  ],
  vite: {
    plugins: [Icons({ compiler: 'astro' })],
  },
});
