import { defineConfig } from 'vitepress'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  title: "SigPro",
  description: "Minimalist Reactive Library",
  outDir: '../../docs',
  base: isDev ? '/absproxy/5174/sigpro/' : '/sigpro/',
  
  // AÑADIDO: Head para estilos
  head: [
    ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/daisyui@5/dist/full.css' }]
  ],
  
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
      // AÑADIDO: UI en nav
      { text: 'UI', link: '/ui/introduction' },
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
          { text: '$.router', link: '/api/router' },
          { text: '$.mount', link: '/api/mount' },
          { text: 'Tags', link: '/api/tags' },
        ]
      },
      {
        text: 'Plugins',
        items: [
          { text: 'Quick Start', link: '/plugins/quick' },
          { text: '@core UI Plugin', link: '/plugins/core.ui' },
          { text: '@core Debug', link: '/plugins/core.debug' },
          { text: 'Custom', link: '/plugins/custom' },
        ]
      },
      {
        text: 'Vite Router Plugin',
        items: [
          { text: 'Vite Plugin', link: '/vite/plugin' },
        ]
      },
      {
        text: 'UI Components',
        items: [
          { text: 'Introduction', link: '/ui/introduction' },
          { text: 'Installation', link: '/ui/installation' },
          { text: 'Button', link: '/ui/button' },
          { text: 'Input', link: '/ui/input' },
          { text: 'Form Components', link: '/ui/form' },
          { text: 'Modal & Drawer', link: '/ui/modal' },
          { text: 'Navigation', link: '/ui/navigation' },
          { text: 'Layout', link: '/ui/layout' },
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/natxocc/sigpro' }
    ]
  }
})