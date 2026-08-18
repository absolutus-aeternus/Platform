import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-algolia': ['algoliasearch'],
          'vendor-i18n': ['vue-i18n'],
        },
      },
    },
    // Asset optimization
    assetsInlineLimit: 4096, // 4KB - inline small assets as base64
    cssCodeSplit: true,      // Split CSS per chunk
    target: 'es2020',        // Modern browsers only, smaller output
  },
  css: {
    // CSS minification handled by esbuild (default)
    devSourcemap: false,
  },
})
