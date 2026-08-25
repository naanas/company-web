import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { SITE_URL, allRoutePaths, metaForPath } from './src/seo.js'

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
          (routePath) =>
            `  <url>\n` +
            `    <loc>${SITE_URL}${routePath}</loc>\n` +
            `    <lastmod>${today}</lastmod>\n` +
            `    <changefreq>monthly</changefreq>\n` +
            `    <priority>${routePath === '/' ? '1.0' : '0.8'}</priority>\n` +
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

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Emits one static HTML file per route with that route's metadata already in
 * the head.
 *
 * Googlebot crawls in two passes: HTML first, JavaScript later — and "later"
 * can be days. src/seo.js sets each route's title, description and canonical
 * at runtime, which only helps on that second pass. Until then every URL
 * served the index.html defaults, so /pricing and all four service pages
 * announced the home page's title AND a canonical pointing at "/", which
 * reads as "this is a duplicate, don't index it". That is what was actually
 * slowing indexing down; no robots.txt directive can influence it, since
 * Google ignores crawl-delay entirely.
 *
 * This is metadata only, not a rendered app — the same Vue bundle still boots
 * and takes over. The `#app` fallback holds the heading and description the
 * route genuinely shows plus links to the other routes, so a first-pass crawl
 * sees real, matching content and a path onward rather than an empty div.
 * Keeping it identical to what renders is what separates pre-rendering from
 * cloaking.
 *
 * Requires the server to try `$uri.html` before falling back to index.html —
 * see deploy/nginx.conf.example.
 */
function prerenderRouteHtml() {
  return {
    name: 'veltech-prerender-head',
    apply: 'build',
    writeBundle(options) {
      const outDir = options.dir ?? 'dist'
      const template = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8')

      for (const routePath of allRoutePaths()) {
        const meta = metaForPath(routePath)
        const url = `${SITE_URL}${routePath}`
        const title = escapeHtml(meta.title)
        const description = escapeHtml(meta.description)

        const others = allRoutePaths()
          .filter((p) => p !== routePath)
          .map((p) => `<li><a href="${p}">${escapeHtml(metaForPath(p).heading)}</a></li>`)
          .join('')

        const fallback =
          `<h1>${escapeHtml(meta.heading)}</h1>` +
          `<p>${description}</p>` +
          `<nav aria-label="Site"><ul>${others}</ul></nav>`

        const html = template
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
          .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${description}$2`)
          .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
          .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
          .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${description}$2`)
          .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
          .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
          .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${description}$2`)
          .replace('<div id="app"></div>', `<div id="app">${fallback}</div>`)

        const file = routePath === '/' ? 'index.html' : `${routePath.replace(/^\//, '')}.html`
        const dest = path.join(outDir, file)
        fs.mkdirSync(path.dirname(dest), { recursive: true })
        fs.writeFileSync(dest, html)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // The `isCustomElement` rule that used to live here existed only for
  // TresJS's <Tres*>/<primitive> tags. That renderer went away with
  // ServiceMonolith — the remaining Three.js work (useDarkClusterV) drives
  // the scene imperatively, so no custom tags reach the template compiler.
  plugins: [vue(), tailwindcss(), sitemap(), prerenderRouteHtml()],
})
