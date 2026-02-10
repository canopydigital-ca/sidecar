import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    plugins: [
      tailwindcss(),
      svelte({
        compilerOptions: {
          dev: isDev
        }
      })
    ],
    resolve: {
      dedupe: ['svelte'],
      conditions: ['browser'],
      alias: {
        '@': resolve(__dirname, './src')
      }
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      '__DEV__': JSON.stringify(isDev)
    },
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      // Minify in production, but keeps it readable if user wants (user pref says "Push back if I'm about to ship nonsense" but also "TS by default").
      // Standard is to minify prod.
      minify: !isDev,
      sourcemap: true,
      lib: {
        entry: 'src/entrypoints/content.ts',
        name: 'ChatGPTDockContent',
        fileName: () => 'content.js',
        formats: ['iife']
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
          assetFileNames: 'content-[name][extname]'
        }
      }
    }
  }
})
