import { services, getServiceBySlug } from './data/services'

// Must match the canonical host actually served. If the site moves domain,
// this is the one place to change it — sitemap generation reads it too.
export const SITE_URL = 'https://veltera.cloud'
export const SITE_NAME = 'VELTECH'
export const LEGAL_NAME = 'PT Veltera Digital Technologies'

const DEFAULT_DESCRIPTION =
  'VELTECH (PT Veltera Digital Technologies) builds custom systems for operations that can’t afford to break — ERP, dashboards, and the integrations holding them together.'

/**
 * Title and description per route.
 *
 * Every route previously inherited index.html's single title, description and
 * canonical, so /pricing and each /services/:slug announced themselves to
 * search engines as the home page. The canonical was the damaging part: a
 * fixed `href="/"` on every page tells Google those pages are duplicates of
 * the home page and should not be indexed in their own right.
 */
export function metaForRoute(route) {
  if (route.name === 'pricing') {
    return {
      title: `Pricing — ${SITE_NAME}`,
      description:
        'Starting prices for IT consulting, custom ERP, web and mobile development, and data work. Domain and hosting billed at cost, with a fixed quote agreed before work starts.',
      path: '/pricing',
    }
  }

  if (route.name === 'service') {
    const service = getServiceBySlug(route.params.slug)
    if (service) {
      return {
        title: `${service.title} — ${SITE_NAME}`,
        description: service.summary,
        path: `/services/${service.slug}`,
      }
    }
  }

  return {
    title: `${SITE_NAME} — Custom Systems for Operations That Can’t Afford to Break`,
    description: DEFAULT_DESCRIPTION,
    path: '/',
  }
}

function setTag(selector, attr, value) {
  const el = document.head.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

/** Applies a route's metadata to the live document head. */
export function applyRouteMeta(route) {
  const { title, description, path } = metaForRoute(route)
  const url = `${SITE_URL}${path}`

  document.title = title
  setTag('meta[name="description"]', 'content', description)
  setTag('link[rel="canonical"]', 'href', url)

  setTag('meta[property="og:title"]', 'content', title)
  setTag('meta[property="og:description"]', 'content', description)
  setTag('meta[property="og:url"]', 'content', url)
  setTag('meta[name="twitter:title"]', 'content', title)
  setTag('meta[name="twitter:description"]', 'content', description)
}

/** Every indexable URL on the site — used to build sitemap.xml at build time. */
export function allRoutePaths() {
  return ['/', '/pricing', ...services.map((s) => `/services/${s.slug}`)]
}
