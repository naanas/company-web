import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        // TresJS elements (<TresMesh>, <TresPerspectiveCamera>, ...) are
        // resolved by its own custom renderer, not Vue's component system.
        compilerOptions: {
          // TresCanvas is a real component (imported from @tresjs/core) and
          // must still go through normal resolution — only the elements
          // TresJS maps onto Three.js classes internally are custom tags.
          isCustomElement: (tag) => tag.startsWith('Tres') && tag !== 'TresCanvas',
        },
      },
    }),
    tailwindcss(),
  ],
})
