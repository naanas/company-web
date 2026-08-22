import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/services/:slug',
      name: 'service',
      component: () => import('../views/ServiceView.vue'),
    },
  ],
  // Every route change here is a genuine new page (home <-> a service
  // detail), never an in-page anchor swap — those are still handled by
  // useSmoothAnchorScroll's Lenis-driven scroll, not vue-router. So the only
  // job left for scrollBehavior is the plain "start at the top" a real page
  // navigation implies.
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
