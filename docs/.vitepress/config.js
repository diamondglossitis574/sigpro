import { defineConfig } from 'vitepress'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  title: "SigPro",
  description: "Minimalist Reactive Library",
  base: isDev ? '/absproxy/5173/sigpro/' : '/sigpro/',
  
  // CONFIGURACIÓN DE NIVEL SUPERIOR (Prioridad VitePress)
  server: {
    host: '0.0.0.0', // Forzamos escucha total
    port: 5174,
    // @ts-ignore - VitePress a veces no reconoce el tipo pero lo pasa a Vite
    allowedHosts: ['code.natxocc.com', '.natxocc.com'],
    strictPort: true
  },

  // CONFIGURACIÓN DE VITE (Motor interno)
  vite: {
    server: {
      allowedHosts: true, // Permitir todo en el motor interno
      hmr: {
        host: 'code.natxocc.com',
        protocol: 'wss'
      }
    }
  },

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' }
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is SigPro?', link: '/' },
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
        text: 'Vite Router Plugin',
        items: [
          { text: 'Vite Plugin', link: '/vite/router' },
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/natxocc/sigpro' }
    ]
  }
})