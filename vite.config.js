import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // The `isCustomElement` rule that used to live here existed only for
  // TresJS's <Tres*>/<primitive> tags. That renderer went away with
  // ServiceMonolith — the remaining Three.js work (useDarkClusterV) drives
  // the scene imperatively, so no custom tags reach the template compiler.
  plugins: [vue(), tailwindcss()],
})
