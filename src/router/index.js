import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { applyRouteMeta } from '../seo'

// Matches the offset useSmoothAnchorScroll applies to same-page anchors, so
// a section lands in the same place whether it was reached from this page or
// from another one.
const NAV_OFFSET = 76

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/services/:slug',
      name: 'service',
      component: () => import('../views/ServiceView.vue'),
    },
    {
      path: '/pricing',
      name: 'pricing',
      component: () => import('../views/PricingView.vue'),
    },
  ],
  // Route changes here are genuine new pages (home <-> a service detail <->
  // pricing), never an in-page anchor swap — same-page anchors are still
  // handled by useSmoothAnchorScroll's Lenis-driven scroll and never reach
  // this function, since those links start with "#" and are intercepted
  // before vue-router sees them.
  //
  // A cross-page link can still carry a hash, though: each service page
  // deep-links into its own section on /pricing. That lands here as a real
  // navigation with a hash, so it needs an explicit offset — the navbar is
  // fixed, and without it the target section sits underneath the bar.
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, top: NAV_OFFSET }
    return { top: 0 }
  },
})

// Search engines read the head of whatever the page settles on, so this has
// to run on every navigation — not just the first load. Without it each route
// kept index.html's single title, description and canonical, and that fixed
// canonical pointed every page at "/", telling Google the pricing and service
// pages were duplicates of the home page.
router.afterEach((to) => {
  applyRouteMeta(to)
})

export default router
