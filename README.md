# VELTECH — PT Veltera Digital Technologies

Marketing site for VELTECH, built with Vue 3 (`<script setup>`), Vite, Tailwind
CSS v4, GSAP/ScrollTrigger, Lenis, and Three.js (WebGPU) for the hero.

## Local development

```bash
npm install
npm run dev      # dev server
npm run build    # production build into dist/
npm run preview  # serve the built dist/ locally
```

## Deploying to the VPS

Build locally or on the server, then serve the contents of `dist/`.

```bash
npm ci
npm run build
# copy dist/ to the server, e.g.
rsync -av --delete dist/ user@host:/var/www/veltech/dist/
```

Two pieces of server config are **required** — reference files live in
`deploy/` (`nginx.conf.example`, `apache-htaccess.example`):

**1. SPA fallback.** vue-router runs in HTML5 history mode, so `/pricing` and
`/services/:slug` are resolved by the client and have no matching directory on
disk. The server must fall back to `index.html` for unknown paths
(`try_files $uri $uri/ /index.html;` on Nginx). Without it, clicking through
from the home page works — that never reaches the server — while opening
`/pricing` directly, refreshing on it, or following a shared pricing link
returns 404.

**2. Never cache `index.html`.** Vite fingerprints everything under `/assets`,
so those files can be cached forever. `index.html` is the file that names which
bundle to load: if a browser caches it, that device keeps loading the previous
build after a deploy, which looks like the deploy silently failed — usually on
exactly one phone, while a fresh device sees the new version straight away.

### Checking which build is live

If a change appears missing after deploying, compare the bundle filename the
page is actually loading against the one in your latest `dist/`:

```bash
grep -o 'assets/index-[^"]*\.js' dist/index.html      # what you just built
curl -s https://veltera.cloud/ | grep -o 'assets/index-[^"]*\.js'   # what is live
```

Different hashes mean the browser or the server is holding an old
`index.html` — hard-reload the page, and check the cache headers above.

## Getting indexed by Google

The technical side is in place: `robots.txt`, a `sitemap.xml` generated at
build time from the route list, per-route `<title>`/description/canonical
(`src/seo.js`, applied in the router's `afterEach`), and Organization
structured data in `index.html`.

The rest needs a Google account and cannot be done from the repo:

1. Add the property at [search.google.com/search-console](https://search.google.com/search-console)
   and verify ownership — the DNS TXT record method is easiest on a VPS.
2. Submit `https://veltera.cloud/sitemap.xml` under Sitemaps.
3. Use URL Inspection → "Request indexing" on the home page to get a first
   crawl rather than waiting to be discovered.

Expect days to weeks before anything appears, and longer to rank for anything
competitive. Searching `site:veltera.cloud` shows what is currently indexed.

### Why there is a static file per route

The build emits `pricing.html`, `services/ai-data.html` and so on alongside
`index.html`, each with that route's title, description and canonical already
in the head.

Googlebot crawls in two passes: HTML first, JavaScript later — and "later" can
be days. `src/seo.js` sets metadata at runtime, which only helps on that second
pass. Until then every URL served index.html's defaults, so all six pages
announced the home page's title *and* a canonical pointing at `/` — which reads
as "this is a duplicate, don't index it separately".

**The server must try `$uri.html` before falling back to index.html** or these
files are never served and the problem comes straight back. See the `try_files`
line in `deploy/nginx.conf.example`.

The `#app` div in those files holds the heading, description and links the
route genuinely shows. Vue replaces it on mount. Keeping it identical to what
renders is what separates pre-rendering from cloaking — do not put content
there that the app does not actually display.

### What cannot be sped up

`robots.txt` only grants permission; it has no lever for crawl speed. Google
ignores `Crawl-delay` outright. Nothing written there will make indexing
faster, and no setting in this repo can promise a ranking — being indexed means
being *findable*, while ranking depends on content, links and competition.

## Still to fill in before launch

- Real business email and phone in `src/components/ContactSection.vue` — the
  contact form composes a `mailto:` to that address, so it must be a live inbox
- Real social URLs in the same file (the block hides while they are `null`)
- Confirm the rates in `src/data/pricing.js`; they are market-benchmarked
  starting points, not figures anyone has signed off on
- Replace the `XX+` stats and partner placeholders in `StatsSection.vue`, and
  the placeholder quotes in `TestimonialSection.vue`
- Settle the domain: `index.html` uses `veltera.cloud` for canonical/OG while
  the published contact address is `@veltech.co.id`
