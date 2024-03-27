import { defineConfig } from 'astro/config'

// integrations
import svelte from '@astrojs/svelte'

// for path aliases
import { resolve } from 'node:path'
const __dirname = new URL('.', import.meta.url).pathname

// https://astro.build/config
export default defineConfig({
  /** @type {import('astro').AstroUserConfig} */
  vite: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  },
  integrations: [svelte()],
})
