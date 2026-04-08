import { defineConfig } from 'vite'

export default defineConfig({
  base: '/fantochememo/',
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
