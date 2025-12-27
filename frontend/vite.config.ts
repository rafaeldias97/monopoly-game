import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'mask-icon.svg', 'icon.svg', 'pwa-192x192.png', 'pwa-512x512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Monopoly Pay',
        short_name: 'MPay',
        description: 'Jogo de Monopoly',
        theme_color: '#6366F1', // Roxo estilo Nubank
        background_color: '#6366F1', // Roxo estilo Nubank
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        skipWaiting: false, // Não atualizar automaticamente, esperar confirmação do usuário
        clientsClaim: false, // Não assumir controle imediatamente
        // ESSENCIAL: Fallback para index.html para suportar rotas SPA
        // Sem isso, o Service Worker retorna 404 ao atualizar páginas em rotas como /salas
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/, /^\/api/],
        // Não limpar caches antigos automaticamente (preserva localStorage)
        cleanupOutdatedCaches: false,
        runtimeCaching: [
          {
            // HTML sempre busca da rede primeiro para evitar problemas com localStorage
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 0, // Sempre verificar rede primeiro
              },
            },
          },
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

