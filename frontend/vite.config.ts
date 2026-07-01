import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served from https://<user>.github.io/stellar-level-3-challenge/ on GitHub Pages.
  base: process.env.GITHUB_PAGES ? '/stellar-level-3-challenge/' : '/',
})
