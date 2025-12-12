import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || '')
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Musiknoten Viewer',
        short_name: 'Noten',
        description: 'Digitale Musiknoten-Verwaltung und -Anzeige',
        theme_color: '#1a1a1a',
        background_color: '#ffffff',
        display: 'fullscreen',
        orientation: 'landscape',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/scores$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-scores',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 5 // 5 Minuten
              }
            }
          },
          {
            urlPattern: /^https?:\/\/.*\/api\/scores\/.*\/file$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pdf-files',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 Tage
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 4173
  }
});
