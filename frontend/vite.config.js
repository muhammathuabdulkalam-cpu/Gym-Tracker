import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'Tranzio Gym',
        short_name: 'Tranzio',
        description: 'Gym Tracking App',
        theme_color: '#ff4e5b',
        background_color: '#000000',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/tranzio_logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/tranzio_logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})