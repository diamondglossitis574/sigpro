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
          { text: '$', link: '/api/$' },
          { text: '$.html', link: '/api/html' },
          { text: '$.mount', link: '/api/mount' },
          { text: 'Tags', link: '/api/tags' },
        ]
      },
      {
        text: 'Plugins',
        items: [
          { text: 'Quick Start', link: '/plugins/quick' },
          { text: '@core Router Plugin', link: '/plugins/core.router' },
          { text: '@core UI Plugin', link: '/plugins/core.ui' },
          { text: '@core UI Fetch', link: '/plugins/core.fetch' },
          { text: '@core UI Storage', link: '/plugins/core.storage' },
          { text: '@core UI Debug', link: '/plugins/core.debug' },
          { text: 'Custom', link: '/plugins/custom' },
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