import { defineConfig } from 'vite'

// GitHub Pages 專案網址：https://<user>.github.io/taipei-current/
export default defineConfig({
  base: '/taipei-current/',
  build: { target: 'es2022' },
})
