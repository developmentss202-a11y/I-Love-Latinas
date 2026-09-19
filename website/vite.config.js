import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: [
        '**/*.zip',
        '**/dist.zip',
        '**/*.mp4',
        '**/Hotels Videos and Images/**',
      ],
    },
  },
})
