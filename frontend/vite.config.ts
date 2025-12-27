import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'mask-icon.svg'],
      manifest: {
        name: 'Monopoly',
        short_name: 'Monopoly',
        description: 'Jogo de Monopoly',
        theme_color: '#6366F1', // Roxo estilo Nubank
        background_color: '#6366F1', // Roxo estilo Nubank
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'vite.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        skipWaiting: false, // Não atualizar automaticamente, esperar confirmação do usuário
        clientsClaim: false, // Não assumir controle imediatamente
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
              },
            },
          },
        ],
      },
      // Configurar para detectar atualizações
      devOptions: {
        enabled: true,
        type: 'module',
      },
    })
  ],
  server: {
    port: 3000,
    host: true
  }
})

