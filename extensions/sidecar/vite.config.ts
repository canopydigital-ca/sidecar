import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte({
      compilerOptions: {
        customElement: false
      }
    })
  ],
  resolve: {
    dedupe: ['svelte'],
    conditions: ['browser']
  },
  build: {
    emptyOutDir: false,
    minify: false,
    sourcemap: true,
    lib: {
      entry: 'src/ui/index.ts',
      name: 'ChatGPTDockUI',
      fileName: (format) => `chatgpt-dock-ui.${format}.js`,
      formats: ['es', 'umd', 'iife']
    },
    rollupOptions: {
      // Ensure nothing is externalized
      external: [],
      output: {
        // No globals needed as we bundle everything
        globals: {}
      }
    }
  }
})
