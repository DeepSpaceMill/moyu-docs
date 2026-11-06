// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite';
import sixuGrammar from './src/sixu.tmLanguage.json';

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
        { icon: 'github', label: 'GitHub', href: 'https://github.com/Icemic/moyu' },
        { icon: 'discord', label: 'Discord', href: 'https://discord.gg/wmTekCNarG' },
      ],
      sidebar: [
        {
          label: '开始',
          items: [{ autogenerate: { directory: 'start' } }],
        },
        {
          label: '发布与部署',
          items: [{ autogenerate: { directory: 'deploy' } }],
        },
        {
          label: '定制框架',
          items: [{ autogenerate: { directory: 'customize' } }],
        },
        {
          label: '引擎 API',
          items: [{ autogenerate: { directory: 'engine-api' } }],
        },
        {
          label: '深入引擎',
          items: [{ autogenerate: { directory: 'deep-into' } }],
        },
        {
          label: '更多',
          items: [{ autogenerate: { directory: 'more' } }],
        },
      ],
      lastUpdated: true,
      editLink: {
        baseUrl: 'https://github.com/DeepSpaceMill/moyu-docs/edit/master/',
      },
      customCss: ['./src/styles/custom.css', './src/styles/marketing.css'],
      expressiveCode: {
        shiki: {
          langs: [{ ...(sixuGrammar as any), name: 'sixu' }],
        },
      },
      components: {
        SocialIcons: './src/components/SocialIcons.astro',
        Header: './src/components/site/StarlightHeader.astro',
        PageFrame: './src/components/site/StarlightPageFrame.astro',
        ContentPanel: './src/components/site/StarlightContentPanel.astro',
        MarkdownContent: './src/components/site/StarlightMarkdownContent.astro',
        PageTitle: './src/components/site/StarlightPageTitle.astro',
        Footer: './src/components/site/StarlightFooter.astro',
        MobileMenuFooter: './src/components/site/StarlightMobileMenuFooter.astro',
      },
    }),
    react(),
  ],
  vite: {
    optimizeDeps: { include: ['@base-ui/react/tabs'] },
    plugins: [Icons({ compiler: 'astro' }), tailwindcss()],
  },
});
