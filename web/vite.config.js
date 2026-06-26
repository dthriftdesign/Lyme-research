import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base is '' so the build works when served from a subpath (e.g. GitHub Pages).
export default defineConfig({
  plugins: [react()],
  base: './',
  assetsInclude: ['**/*.md'],
})
