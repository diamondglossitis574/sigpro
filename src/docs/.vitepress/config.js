import { defineConfig } from 'vitepress'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  title: "SigPro",
  description: "Minimalist Reactive Library",
  outDir: '../../docs',
  base: isDev ? '/absproxy/5174/sigpro/' : '/sigpro/',

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
      { text: 'Install', link: '/install' },
      { text: 'Api', link: '/api/quick' },
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Installation', link: '/install' },
          { text: 'Vite Plugin', link: '/vite/plugin' },
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
          { text: 'Custom', link: '/plugins/custom' },
        ]
      },
      {
        text: 'Examples',
        items: [
          { text: 'Demo Core', link: '/examples' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/natxocc/sigpro' }
    ]
  }
})