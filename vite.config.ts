import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/*.png', 'soundscapes/*.mp3'],
        manifest: {
          name: 'MoodCanvas',
          short_name: 'MoodCanvas',
          description: 'AI Emotion-Responsive Art Board',
          theme_color: '#8b5cf6',
          background_color: '#1e293b',
          display: 'standalone',
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
       
      })
    ],
    
   
    build: {
      rollupOptions: {
        input: isProduction ? 'index.production.html' : 'index.html'
      }
    },
    
    server: {
      headers: {}
    }
  }
})