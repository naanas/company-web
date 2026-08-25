import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { SITE_URL, allRoutePaths } from './src/seo.js'

/**
 * Writes sitemap.xml into the build output.
 *
 * Generated rather than committed as a static file so it cannot drift: the
 * URL list comes from the same route/services data the app renders from, so
 * adding a service to src/data/services.js puts it in the sitemap on the next
 * build instead of leaving a page search engines never hear about.
 */
function sitemap() {
  return {
    name: 'veltech-sitemap',
    apply: 'build',
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10)
      const urls = allRoutePaths()
        .map(
          (path) =>
            `  <url>\n` +
            `    <loc>${SITE_URL}${path}</loc>\n` +
            `    <lastmod>${today}</lastmod>\n` +
            `    <changefreq>monthly</changefreq>\n` +
            `    <priority>${path === '/' ? '1.0' : '0.8'}</priority>\n` +
            `  </url>`
        )
        .join('\n')

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // The `isCustomElement` rule that used to live here existed only for
  // TresJS's <Tres*>/<primitive> tags. That renderer went away with
  // ServiceMonolith — the remaining Three.js work (useDarkClusterV) drives
  // the scene imperatively, so no custom tags reach the template compiler.
  plugins: [vue(), tailwindcss(), sitemap()],
})
