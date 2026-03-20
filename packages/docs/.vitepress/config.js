import { defineConfig } from 'vitepress'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  title: "SigPro",
  description: "Minimalist Reactive Library",
  outDir: '../../docs',
  base: isDev ? '/absproxy/5174/sigpro/' : '/sigpro/',
  
  // CONFIGURACIÓN DE VITE (Motor interno)
  vite: {
    outDir: '../../docs',
    base: isDev ? '/absproxy/5174/sigpro/' : '/sigpro/',
    server: {
      allowedHosts: true,
      port: 5174,
    }
  },

  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Api', link: '/api/quick' },
      { text: 'UI', link: '/ui/intro' },
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is SigPro?', link: '/' },
          { text: 'Why', link: '/guide/why' },
          { text: 'Guide', link: '/guide/getting-started' },
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Quick Start', link: '/api/quick' },
          { text: 'Signals', link: '/api/signals' },
          { text: 'Effects', link: '/api/effects' },
          { text: 'Storage', link: '/api/storage' },
          { text: 'Fetch', link: '/api/fetch' },
          { text: 'Pages', link: '/api/pages' },
          { text: 'Components', link: '/api/components' },
          { text: 'Routing', link: '/api/routing' },
        ]
      },
      {
        text: 'SigPro UI',
        items: [
          { text: 'Intro', link: '/ui/intro' },
        ]
      },
      {
        text: 'Vite Router Plugin',
        items: [
          { text: 'Vite Plugin', link: '/vite/plugin' },
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/natxocc/sigpro' }
    ]
  }
})